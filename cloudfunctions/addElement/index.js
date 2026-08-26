// 云函数入口文件
const cloud = require('wx-server-sdk')
const notificationConfig = require('./notification.config.js')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()
const db_date =  db.serverDate()

// 云函数入口函数
exports.main = async (context) => {
  const allowed = ['MissionList', 'MarketList', 'RecipeList']
  if (!allowed.includes(context.list)) return { error: '不支持的数据集合' }
  const openId = cloud.getWXContext().OPENID
  const member = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (!member.data.length) return { error: '请先创建或加入双人空间' }
  const title = String(context.title || '').trim()
  const desc = String(context.desc || '').trim()
  if (context.list === 'RecipeList') {
    const ingredients = String(context.ingredients || '').trim()
    const steps = String(context.steps || '').trim()
    const flavor = String(context.flavor || '家常').trim()
    const difficulty = String(context.difficulty || '简单').trim()
    const minutes = Number(context.minutes)
    const flavors = ['家常', '香辣', '下饭', '清淡', '快手']
    const difficulties = ['简单', '中等', '费工夫']
    if (!title || title.length > 16 || desc.length > 80 || ingredients.length > 200 || !steps || steps.length > 500 || !flavors.includes(flavor) || !difficulties.includes(difficulty) || !Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
      return { error: '请检查菜谱内容' }
    }
    return await db.collection('RecipeList').add({
      data: {
        _openid: openId,
        spaceId: member.data[0].spaceId,
        date: db_date,
        title,
        desc,
        ingredients,
        steps,
        flavor,
        difficulty,
        minutes,
        cuisine: '江西菜',
        isPreset: false,
        available: true,
        star: false
      }
    })
  }
  const credit = Number(context.credit)
  if (!title || title.length > 12 || desc.length > 100 || !Number.isFinite(credit) || credit <= 0 || credit > 500) {
    return { error: '输入内容不合法' }
  }
  const created = await db.collection(context.list).add({
    data: {
      _openid: openId,
      spaceId: member.data[0].spaceId,

      date: db_date,
      credit,
      
      title,
      desc,

      available: true,
      star: false
    }
  })

  // 通知属于创建后的附加动作；授权、模板配置或发送失败都不能影响心愿落库。
  if (context.list === 'MissionList' && notificationConfig.templateId) {
    try {
      const members = await db.collection('Memberships').where({ spaceId: member.data[0].spaceId }).get()
      const partner = members.data.find(item => item._openid !== openId)
      if (!partner) return { ...created, notification: { sent: false, reason: '尚未有另一位成员' } }

      const data = {}
      data[notificationConfig.taskField] = { value: title.slice(0, 20) }
      data[notificationConfig.noteField] = { value: String(notificationConfig.note || '').slice(0, 20) }
      await cloud.openapi.subscribeMessage.send({
        touser: partner._openid,
        templateId: notificationConfig.templateId,
        data,
        miniprogramState: notificationConfig.miniprogramState || 'developer',
        page: 'pages/Mission/index'
      })
      return { ...created, notification: { sent: true } }
    } catch (error) {
      console.error('发送心愿通知失败', error)
      return { ...created, notification: { sent: false, reason: '通知发送失败' } }
    }
  }

  return { ...created, notification: { sent: false, reason: '未配置订阅消息模板' } }
}
