// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (context) => {
  const openId = cloud.getWXContext().OPENID
  if (context.list !== 'StorageList') return { error: '请使用专用业务云函数' }
  const result = await db.collection('StorageList').where({
    _id: context._id, _openid: openId
  }).update({
    data: {
      available: context.value
    }
  })
  if (!result.stats.updated) return { error: '无权操作或记录不存在' }
  return result
}
