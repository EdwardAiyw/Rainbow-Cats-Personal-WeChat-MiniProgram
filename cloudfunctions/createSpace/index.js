const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const code = () => Math.random().toString(36).slice(2, 8).toUpperCase()

exports.main = async (event) => {
  const openId = cloud.getWXContext().OPENID
  const name = String(event.displayName || '').trim().slice(0, 12)
  if (!name) return { error: '请输入你的昵称' }
  const exists = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (exists.data.length) return { error: '当前账号已加入双人空间' }
  let inviteCode = code()
  for (let i = 0; i < 5; i += 1) {
    const duplicate = await db.collection('Spaces').where({ inviteCode }).limit(1).get()
    if (!duplicate.data.length) break
    inviteCode = code()
  }
  const space = await db.collection('Spaces').add({ data: { inviteCode, ownerOpenId: openId, memberOpenIds: [openId], createdAt: db.serverDate() } })
  await db.collection('Memberships').add({ data: { _openid: openId, spaceId: space._id, displayName: name, credit: 0, createdAt: db.serverDate() } })
  return { spaceId: space._id, inviteCode }
}
