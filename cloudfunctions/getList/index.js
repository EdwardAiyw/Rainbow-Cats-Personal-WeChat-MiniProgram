// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()

// 云函数入口函数
exports.main = async () => {
  // Kept so deploying all historical folders cannot expose every collection.
  // V2 clients use listElements, which scopes records to the caller's space.
  return { error: '此云函数已废弃，请使用 listElements' }
}
