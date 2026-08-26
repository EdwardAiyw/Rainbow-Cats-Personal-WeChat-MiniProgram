const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const API_HOST = 'apis.tianapi.com'
const LIST_PATH = '/caipu/index'
const DETAIL_PATH = '/caipu/detail'
const USAGE_COLLECTION = 'ApiUsage'
const USAGE_SERVICE = 'tianapiRecipe'
const DAILY_LIMIT = 95
const LIMIT_MESSAGE = '那就吃我吧'
const db = cloud.database()
const _ = db.command

function getDateKey(date = new Date()) {
  const chinaTime = date.getTime() + 8 * 60 * 60 * 1000
  return new Date(chinaTime).toISOString().slice(0, 10)
}

function isNotFoundError(error) {
  const text = String(error && (error.errMsg || error.message || error) || '').toLowerCase()
  return text.includes('not exist') || text.includes('not found') || text.includes('document does not exist')
}

async function getUsageDoc(collection, docId) {
  try {
    return await collection.doc(docId).get()
  } catch (error) {
    if (isNotFoundError(error)) return null
    throw error
  }
}

async function reserveTianApiUsage(action) {
  const dateKey = getDateKey()
  const docId = `${USAGE_SERVICE}_${dateKey.replace(/-/g, '')}`
  const collection = db.collection(USAGE_COLLECTION)
  const actionKey = `actions.${action}`
  const usageBase = {
    service: USAGE_SERVICE,
    date: dateKey,
    limit: DAILY_LIMIT
  }

  const updated = await collection.where({ _id: docId, count: _.lt(DAILY_LIMIT) }).update({
    data: {
      count: _.inc(1),
      [actionKey]: _.inc(1),
      updatedAt: db.serverDate()
    }
  })
  if (updated.stats && updated.stats.updated > 0) {
    const latest = await getUsageDoc(collection, docId)
    return {
      limited: false,
      count: latest && latest.data ? latest.data.count : null,
      limit: DAILY_LIMIT,
      date: dateKey
    }
  }

  const existing = await getUsageDoc(collection, docId)
  if (existing && existing.data) {
    const count = Number(existing.data.count || 0)
    return {
      limited: count >= DAILY_LIMIT,
      count,
      limit: DAILY_LIMIT,
      date: dateKey,
      message: count >= DAILY_LIMIT ? LIMIT_MESSAGE : ''
    }
  }

  try {
    await collection.doc(docId).set({
      data: {
        ...usageBase,
        count: 1,
        actions: { [action]: 1 },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
    return { limited: false, count: 1, limit: DAILY_LIMIT, date: dateKey }
  } catch (error) {
    if (isNotFoundError(error)) throw error
    return reserveTianApiUsage(action)
  }
}

async function guardTianApiUsage(action) {
  const usage = await reserveTianApiUsage(action)
  if (usage.limited) return { limited: true, error: LIMIT_MESSAGE, usage }
  return { limited: false, usage }
}

function requestJson(path, params) {
  const query = new URLSearchParams(params).toString()
  const options = {
    hostname: API_HOST,
    path: `${path}?${query}`,
    method: 'GET',
    timeout: 8000
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`TianAPI HTTP ${res.statusCode}`))
            return
          }
          resolve(parsed)
        } catch (error) {
          reject(new Error(`TianAPI 返回解析失败：${error.message}`))
        }
      })
    })
    req.on('timeout', () => {
      req.destroy(new Error('TianAPI 请求超时'))
    })
    req.on('error', reject)
    req.end()
  })
}

function normalizeListItem(item) {
  return {
    _id: `tianapi-${item.id}`,
    source: 'tianapi',
    apiId: item.id,
    title: item.cp_name || item.title || '未命名菜谱',
    desc: item.des || item.texing || item.tishi || '',
    ingredients: item.yuanliao || '',
    flavor: item.type_name || '菜谱',
    difficulty: '参考',
    minutes: item.cookingtime || item.time || '',
    cuisine: item.type_name || '菜谱',
    isPreset: false,
    isApi: true,
    available: true,
    star: false
  }
}

function normalizeDetail(item) {
  return {
    _id: `tianapi-${item.id}`,
    source: 'tianapi',
    apiId: item.id,
    title: item.cp_name || item.title || '未命名菜谱',
    desc: item.des || item.texing || item.tishi || '',
    ingredients: item.yuanliao || '',
    seasoning: item.tiaoliao || '',
    steps: item.zuofa || item.steps || '',
    feature: item.texing || '',
    tip: item.tishi || '',
    flavor: item.type_name || '菜谱',
    difficulty: '参考',
    minutes: item.cookingtime || item.time || '',
    cuisine: item.type_name || '菜谱',
    isApi: true
  }
}

function getSearchWords(word) {
  if (!word || word.length < 3) return [word]
  return [...new Set([word, word.slice(0, 2), word.slice(-2), word.slice(0, 1)])]
}

function getRecipeList(result) {
  if (!result) return []
  const list = result.list || result.newslist || result.data || result.records || result
  if (Array.isArray(list)) return list
  return list && typeof list === 'object' && list.id ? [list] : []
}

exports.main = async (event = {}) => {
  const key = process.env.TIANAPI_KEY
  if (!key) return { error: '未配置 TIANAPI_KEY' }

  const action = event.action || 'list'
  try {
    if (action === 'detail') {
      const id = Number(event.id)
      if (!Number.isFinite(id) || id <= 0) return { error: '菜谱 ID 不合法' }
      const usage = await guardTianApiUsage('detail')
      if (usage.limited) return usage
      const data = await requestJson(DETAIL_PATH, { key, id })
      if (data.code !== 200) return { error: data.msg || 'TianAPI 菜谱详情失败' }
      return { data: normalizeDetail(data.result || {}), usage: usage.usage }
    }

    const word = String(event.word || '').trim()
    // 关键词通常只有少量结果，搜索时固定从第一页开始，避免随机页命中空结果。
    const page = Number(event.page || (word ? 1 : Math.floor(Math.random() * 20) + 1))
    const num = Math.min(Math.max(Number(event.num || 10), 1), 20)
    let lastData
    let lastUsage
    const searchWords = getSearchWords(word)
    for (const searchWord of searchWords) {
      const params = { key, num, page: searchWord ? 1 : page }
      if (searchWord) params.word = searchWord
      const usage = await guardTianApiUsage('list')
      if (usage.limited) return usage
      const data = await requestJson(LIST_PATH, params)
      lastData = data
      lastUsage = usage.usage
      if (data.code !== 200) {
        if (data.code !== 250 || searchWord === searchWords[searchWords.length - 1]) {
          return { error: data.msg || 'TianAPI 菜谱查询失败' }
        }
        continue
      }
      const list = getRecipeList(data.result)
      if (list.length) {
        return { data: list.map(normalizeListItem), usage: usage.usage }
      }
    }
    return { data: [], usage: lastUsage, error: lastData && lastData.msg }
  } catch (error) {
    console.error('TianAPI 请求失败', error)
    return { error: error.message || 'TianAPI 请求失败' }
  }
}
