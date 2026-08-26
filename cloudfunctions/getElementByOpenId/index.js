// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()

// 云函数入口函数
exports.main = async () => {
  // A caller must never be able to enumerate another user's records by openid.
  return { error: '此云函数已废弃，请使用 getCurrentSpace 或 listElements' }
}
