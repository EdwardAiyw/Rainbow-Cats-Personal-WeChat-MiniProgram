const cloud = require('wx-server-sdk')
const config = require('./notification.config.js')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  if (!config.templateId) return { skipped: true, reason: '未配置订阅消息模板' }
  const openId = cloud.getWXContext().OPENID
  const mission = await db.collection('MissionList').doc(event.missionId).get()
  if (!mission.data || mission.data._openid !== openId) return { error: '无权发送该任务通知' }
  const members = await db.collection('Memberships').where({ spaceId: mission.data.spaceId }).get()
  const partner = members.data.find(item => item._openid !== openId)
  if (!partner) return { skipped: true, reason: '尚未有另一位成员' }
  const data = {}
  data[config.taskField] = { value: String(mission.data.title).slice(0, 20) }
  data[config.noteField] = { value: String(config.note || '').slice(0, 20) }
  await cloud.openapi.subscribeMessage.send({ touser: partner._openid, templateId: config.templateId, data, miniprogramState: config.miniprogramState || 'developer', page: 'pages/Mission/index' })
  return { ok: true }
}
