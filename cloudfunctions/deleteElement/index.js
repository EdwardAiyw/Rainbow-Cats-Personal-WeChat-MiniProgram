// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (context) => {
  const allowed = ['MissionList', 'MarketList', 'StorageList', 'RecipeList']
  if (!allowed.includes(context.list)) return { error: '不支持的数据集合' }
  const openId = cloud.getWXContext().OPENID
  const member = await db.collection('Memberships').where({ _openid: openId }).limit(1).get()
  if (!member.data.length) return { error: '请先创建或加入双人空间' }
  const result = await db.collection(context.list).where({ _id: context._id, _openid: openId, spaceId: member.data[0].spaceId }).remove()
  if (!result.stats.removed) return { error: '无权操作或记录不存在' }
  return result
}
