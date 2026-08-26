const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const openId = cloud.getWXContext().OPENID
  const memberResult = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (!memberResult.data.length) return { openId, space: null, membership: null, members: [] }
  const membership = memberResult.data[0]
  const [spaceResult, membersResult] = await Promise.all([
    db.collection('Spaces').doc(membership.spaceId).get(),
    db.collection('Memberships').where({ spaceId: membership.spaceId }).get()
  ])
  return { openId, space: spaceResult.data, membership, members: membersResult.data }
}
