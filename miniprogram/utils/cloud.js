function readableError(err, functionName) {
  const raw = String(err && (err.errMsg || err.message || err) || '')
  const lower = raw.toLowerCase()
  if (lower.includes('function') && (lower.includes('not found') || lower.includes('not exist'))) return `云函数未部署：${functionName}`
  if (lower.includes('collection') && (lower.includes('not exist') || lower.includes('not found'))) return '数据库集合未创建或没有访问权限'
  if (lower.includes('env') || lower.includes('environment')) return '云环境不可用，请检查 envId 配置'
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('fail')) return '网络或云服务连接失败，请稍后重试'
  return raw || '操作失败，请稍后重试'
}

function message(err, fallback = '操作失败，请稍后重试') {
  const text = err && (err.userMessage || err.errMsg || err.message || String(err)) || fallback
  wx.showToast({ title: text.slice(0, 20), icon: 'none' })
}

async function call(name, data) {
  try {
    const result = await wx.cloud.callFunction({ name, data })
    if (result.result && result.result.error) throw new Error(result.result.error)
    return result.result || {}
  } catch (err) { err.userMessage = readableError(err, name); console.error(name, err); message(err); throw err }
}

module.exports = { call, message, readableError }
