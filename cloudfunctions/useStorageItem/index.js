const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const openId = cloud.getWXContext().OPENID
  const result = await db.collection('StorageList').where({ _id: event.id, _openid: openId, available: true }).update({ data: { available: false, usedAt: db.serverDate() } })
  if (!result.stats.updated) return { error: '物品不存在、已使用或无权操作' }
  return { ok: true }
}
