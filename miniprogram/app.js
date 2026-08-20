App({
  async onLaunch() {
    this.globalData = {
      //记录使用者的openid
      _openidA: 'onsgK5XqCMLbYXudVgh3xjV4kgWw',
      _openidB: 'onsgK5Zc7t-bFdnFk3_krqdIRZYY',

      //记录使用者的名字
      userA: '卡比',
      userB: '瓦豆',

      //用于存储待办记录的集合名称
      collectionMissionList: 'MissionList',
      collectionMarketList: 'MarketList',
      collectionStorageList: 'StorageList',
      collectionUserList: 'UserList',

      //最多单次交易积分
      maxCredit: 500,
    }

    await this.initcloud()
  },

  flag: false,

  /**
   * 初始化云开发环境
   */
  async initcloud() {
    const envListConfig = require('./envList.js').envList || [] // 读取 envlist 文件
    let envId = null
    if (typeof envListConfig === 'string') {
      envId = envListConfig
    } else if (Array.isArray(envListConfig) && envListConfig.length != 0 && envListConfig[0].envId != null) {
      envId = envListConfig[0].envId
    }

    if (envId != null) { // 如果文件中 envlist 存在
      wx.cloud.init({ // 初始化云开发环境
        traceUser: true,
        env: envId
      })
      // 装载云函数操作对象返回方法
      this.cloud = () => {
        return wx.cloud // 直接返回 wx.cloud
      }
    } else { // 如果文件中 envlist 不存在，提示要配置环境
      this.cloud = () => {
        wx.showModal({
          content: '无云开发环境', 
          showCancel: false
        })
        throw new Error('无云开发环境')
      }
    }
  },

  // 获取云数据库实例
  async database() {
    return (await this.cloud()).database()
  },
})