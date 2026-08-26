const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const openId = cloud.getWXContext().OPENID
  const result = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (!result.data.length) return { error: '当前没有成员资料' }
  const membership = result.data[0]
  await db.runTransaction(async transaction => {
    for (const collection of ['MissionList', 'MarketList', 'StorageList', 'RecipeList']) {
      await transaction.collection(collection).where({ _openid: openId, spaceId: membership.spaceId }).remove()
    }
    await transaction.collection('Memberships').doc(membership._id).remove()
    await transaction.collection('Spaces').doc(membership.spaceId).update({
      data: { memberOpenIds: db.command.pull(openId) }
    })
  })
  return { deleted: true, spaceId: membership.spaceId }
}
