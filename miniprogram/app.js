App({
  async onLaunch() {
    const config = require('./config.js')
    this.globalData = { envId: config.envId, notificationTemplateId: config.notificationTemplateId, collectionMissionList: 'MissionList', collectionMarketList: 'MarketList', collectionStorageList: 'StorageList', maxCredit: config.maxCredit || 500, space: null, currentOpenId: '', members: [] }
    await this.initcloud()
  },
  async initcloud() {
    if (!this.globalData.envId) { this.cloud = () => { throw new Error('请先在 miniprogram/config.js 配置 envId') }; return }
    wx.cloud.init({ traceUser: true, env: this.globalData.envId }); this.cloud = () => wx.cloud
  },
  async refreshSpace() {
    const result = await wx.cloud.callFunction({ name: 'getCurrentSpace' }); const data = result.result || {}
    this.globalData.space = data.space || null; this.globalData.currentOpenId = data.openId || ''; this.globalData.members = data.members || []; return this.globalData.space
  }
})
