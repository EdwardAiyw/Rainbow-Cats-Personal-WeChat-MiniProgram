const { call } = require('../../utils/cloud')

Page({
  data: { deleting: false },
  async deleteUser() {
    if (this.data.deleting) return
    const confirmed = await new Promise(resolve => wx.showModal({
      title: '删除用户资料',
      content: '将永久删除你的昵称、积分、成员资料，以及你创建或拥有的心愿、礼物和收藏记录，确定继续吗？',
      confirmColor: '#d84b62',
      success: result => resolve(result.confirm)
    }))
    if (!confirmed) return
    this.setData({ deleting: true })
    try {
      await call('deleteMembership')
      const app = getApp()
      app.globalData.space = null
      app.globalData.members = []
      app.globalData.currentOpenId = ''
      wx.showToast({ title: '删除成功', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '../MainPage/index' }), 700)
    } catch (_) {
      this.setData({ deleting: false })
    }
  }
})
