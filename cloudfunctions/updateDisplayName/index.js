const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async event => {
  const openId = cloud.getWXContext().OPENID
  const displayName = String(event.displayName || '').trim().slice(0, 12)
  if (!displayName) return { error: '昵称不能为空' }
  const result = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (!result.data.length) return { error: '请先加入双人空间' }
  await db.collection('Memberships').doc(result.data[0]._id).update({ data: { displayName } })
  return { displayName }
}
