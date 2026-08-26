const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const allowed = ['MissionList', 'MarketList', 'StorageList', 'RecipeList']

exports.main = async (event) => {
  const list = event.list
  if (!allowed.includes(list)) return { error: '不支持的数据集合' }
  const openId = cloud.getWXContext().OPENID
  const member = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (!member.data.length) return { error: '请先创建或加入双人空间' }
  const where = { spaceId: member.data[0].spaceId }
  if (list === 'StorageList') where._openid = openId
  const result = await db.collection(list).where(where).orderBy('date', 'desc').limit(100).get()
  return { data: result.data }
}
