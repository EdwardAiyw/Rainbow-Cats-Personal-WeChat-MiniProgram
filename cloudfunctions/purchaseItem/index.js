const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const openId = cloud.getWXContext().OPENID
  await db.runTransaction(async transaction => {
    const item = await transaction.collection('MarketList').doc(event.id).get()
    if (!item.data || item.data.spaceId === undefined) throw new Error('商品不存在')
    const buyer = await transaction.collection('Memberships').where({ _openid: openId, spaceId: item.data.spaceId }).limit(1).get()
    if (!buyer.data.length) throw new Error('无权购买该商品')
    if (item.data._openid === openId) throw new Error('不能购买自己发布的商品')
    if (!item.data.available) throw new Error('商品已下架')
    if (Number(buyer.data[0].credit) < Number(item.data.credit)) throw new Error('积分不足')
    await transaction.collection('MarketList').doc(event.id).update({ data: { available: false, purchasedAt: db.serverDate(), purchasedBy: openId } })
    await transaction.collection('Memberships').doc(buyer.data[0]._id).update({ data: { credit: db.command.inc(-Number(item.data.credit)) } })
    await transaction.collection('StorageList').add({ data: { _openid: openId, spaceId: item.data.spaceId, sourceItemId: item.data._id, sellerOpenId: item.data._openid, date: db.serverDate(), credit: Number(item.data.credit), title: item.data.title, desc: item.data.desc, available: true, star: false } })
  })
  return { ok: true }
}
