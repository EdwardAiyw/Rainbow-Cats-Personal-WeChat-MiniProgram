const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const openId = cloud.getWXContext().OPENID
  await db.runTransaction(async transaction => {
    const mission = await transaction.collection('MissionList').doc(event.id).get()
    if (!mission.data || mission.data.spaceId === undefined) throw new Error('任务不存在')
    const member = await transaction.collection('Memberships').where({ _openid: openId, spaceId: mission.data.spaceId }).limit(1).get()
    if (!member.data.length) throw new Error('无权操作该任务')
    if (mission.data._openid === openId) throw new Error('不能完成自己发布的任务')
    if (!mission.data.available) throw new Error('任务已经完成')
    await transaction.collection('MissionList').doc(event.id).update({ data: { available: false, completedAt: db.serverDate(), completedBy: openId } })
    await transaction.collection('Memberships').where({ _openid: mission.data._openid, spaceId: mission.data.spaceId }).update({ data: { credit: db.command.inc(mission.data.credit) } })
  })
  return { ok: true }
}
