const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const openId = cloud.getWXContext().OPENID
  const displayName = String(event.displayName || '').trim().slice(0, 12)
  const inviteCode = String(event.inviteCode || '').trim().toUpperCase()
  if (!displayName || !inviteCode) return { error: '请输入昵称和邀请码' }
  const already = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (already.data.length) return { error: '当前账号已加入双人空间' }
  const target = await db.collection('Spaces').where({ inviteCode }).limit(1).get()
  if (!target.data.length) return { error: '邀请码无效' }
  const space = target.data[0]
  if ((space.memberOpenIds || []).length >= 2) return { error: '该双人空间已满' }
  await db.runTransaction(async transaction => {
    const current = await transaction.collection('Spaces').doc(space._id).get()
    if ((current.data.memberOpenIds || []).length >= 2) throw new Error('该双人空间已满')
    await transaction.collection('Spaces').doc(space._id).update({ data: { memberOpenIds: db.command.push(openId) } })
    await transaction.collection('Memberships').add({ data: { _openid: openId, spaceId: space._id, displayName, credit: 0, createdAt: db.serverDate() } })
  })
  return { spaceId: space._id }
}
