const { call, message, readableError } = require('../../utils/cloud')

Page({
  data: { space: null, members: [], displayName: '', inviteCode: '', createCode: '', configured: true, notificationConfigured: false, loading: true, submitting: false, loadError: '', namePlaceholder: '\u4f60\u7684\u6635\u79f0', codePlaceholder: '\u8f93\u5165\u5bf9\u65b9\u7684\u9080\u8bf7\u7801', errorTitle: '\u8fde\u63a5\u4e91\u5f00\u53d1\u5931\u8d25', retryText: '\u91cd\u65b0\u8fde\u63a5', checkTitle: '\u9996\u6b21\u4f7f\u7528\u8bf7\u786e\u8ba4', checkOne: '1. \u5df2\u521b\u5efa\u6570\u636e\u5e93\u96c6\u5408', checkTwo: '2. \u5df2\u90e8\u7f72\u5fc5\u8981\u4e91\u51fd\u6570', checkThree: '3. \u4e91\u73af\u5883\u4e0e config.js \u4e00\u81f4', setupTitle: '\u5f00\u59cb\u524d\u7684\u4e09\u6b65', setupOne: '1. \u5728\u4e91\u5f00\u53d1\u63a7\u5236\u53f0\u521b\u5efa 5 \u4e2a\u6570\u636e\u5e93\u96c6\u5408', setupTwo: '2. \u4e0a\u4f20\u5e76\u90e8\u7f72\u4e91\u51fd\u6570', setupThree: '3. \u521b\u5efa\u7a7a\u95f4\u5e76\u5206\u4eab\u9080\u8bf7\u7801',
    copy: { eyebrow: '\u65e5\u5e38 \u00b7 \u53ea\u5c5e\u4e8e\u6211\u4eec\u7684\u5c0f\u7a7a\u95f4', heroTitle: '\u628a\u5e73\u51e1\u65e5\u5e38\u8fc7\u6210\u5c0f\u5c0f\u60ca\u559c', heroSubtitle: '\u4e00\u8d77\u5b8c\u6210\u5fc3\u613f\uff0c\u4e00\u8d77\u8bb0\u5f55\u7f8e\u597d\u3002', configure: '\u8bf7\u5148\u914d\u7f6e config.js \u4e2d\u7684\u4e91\u73af\u5883 ID\u3002', loading: '\u6b63\u5728\u8fde\u63a5\u6211\u4eec\u7684\u7a7a\u95f4\u2026', createTitle: '\u521b\u5efa\u4f60\u4eec\u7684\u53cc\u4eba\u7a7a\u95f4', createHint: '\u8bbe\u7f6e\u6635\u79f0\u540e\u521b\u5efa\uff0c\u6216\u8f93\u5165\u9080\u8bf7\u7801\u52a0\u5165\u3002', namePlaceholder: '\u4f60\u7684\u6635\u79f0', create: '\u521b\u5efa\u7a7a\u95f4', invite: '\u9080\u8bf7\u7801\uff1a', codePlaceholder: '\u8f93\u5165\u5bf9\u65b9\u7684\u9080\u8bf7\u7801', join: '\u52a0\u5165\u7a7a\u95f4', points: '\u6211\u4eec\u7684\u79ef\u5206', pointUnit: '\u5206', connected: '\u53cc\u4eba\u7a7a\u95f4\u5df2\u8fde\u63a5', copyCode: '\u590d\u5236\u9080\u8bf7\u7801', notify: '\u5f00\u542f\u4efb\u52a1\u63d0\u9192', notifyHint: '\u914d\u7f6e\u8ba2\u9605\u6d88\u606f\u6a21\u677f\u540e\uff0c\u53ef\u63a5\u6536\u4efb\u52a1\u63d0\u9192\u3002' } },
  async onShow() {
    const app = getApp()
    if (!app.globalData.envId) return this.setData({ configured: false, loading: false })
    this.setData({ loading: true, loadError: '' })
    try {
      const result = await call('getCurrentSpace')
      app.globalData.space = result.space || null; app.globalData.currentOpenId = result.openId || ''; app.globalData.members = result.members || []
      this.setData({ configured: true, loading: false, space: result.space || null, members: result.members || [], notificationConfigured: Boolean(app.globalData.notificationTemplateId) })
    } catch (err) { this.setData({ loading: false, loadError: readableError(err, 'getCurrentSpace') }) }
  },
  onNameInput(e) { this.setData({ displayName: e.detail.value }) },
  onCodeInput(e) { this.setData({ inviteCode: e.detail.value }) },
  editDisplayName() {
    const openId = getApp().globalData.currentOpenId
    const member = this.data.members.find(item => item._openid === openId)
    const oldName = member ? member.displayName : ''
    wx.showModal({ title: '修改昵称', editable: true, placeholderText: '输入新的昵称', content: oldName, success: async result => {
      if (!result.confirm) return
      const displayName = String(result.content || '').trim()
      if (!displayName) return message(new Error('昵称不能为空'))
      if (displayName.length > 12) return message(new Error('昵称不能超过12个字'))
      try { await call('updateDisplayName', { displayName }); wx.showToast({ title: '修改成功', icon: 'success' }); await this.onShow() } catch (_) {}
    } })
  },
  editDisplayNameInline() {
    const openId = getApp().globalData.currentOpenId
    const member = this.data.members.find(item => item._openid === openId)
    this.setData({ editingName: true, editingNameValue: member ? member.displayName : '', nameInputFocus: false })
    setTimeout(() => this.setData({ nameInputFocus: true }), 80)
  },
  onEditingNameInput(e) { this.setData({ editingNameValue: e.detail.value }) },
  cancelEditDisplayNameInline() { this.setData({ editingName: false, editingNameValue: '', nameInputFocus: false }) },
  async saveDisplayNameInline() {
    const displayName = String(this.data.editingNameValue || '').trim()
    if (!displayName) return message(new Error('昵称不能为空'))
    if (displayName.length > 12) return message(new Error('昵称不能超过12个字'))
    try {
      await call('updateDisplayName', { displayName })
      this.setData({ editingName: false, editingNameValue: '', nameInputFocus: false })
      wx.showToast({ title: '修改成功', icon: 'success' })
      await this.onShow()
    } catch (_) {}
  },
  async createSpace() {
    if (!this.data.displayName.trim()) return message(new Error('请先填写你的昵称'))
    this.setData({ submitting: true })
    try { const result = await call('createSpace', { displayName: this.data.displayName.trim() }); if (result.error) throw new Error(result.error); this.setData({ createCode: result.inviteCode }); wx.showToast({ title: '空间创建成功', icon: 'success' }); await this.onShow() } catch (_) {} finally { this.setData({ submitting: false }) }
  },
  async joinSpace() {
    if (!this.data.displayName.trim() || !this.data.inviteCode.trim()) return message(new Error('请填写昵称和邀请码'))
    this.setData({ submitting: true })
    try { const result = await call('joinSpace', { displayName: this.data.displayName.trim(), inviteCode: this.data.inviteCode.trim() }); if (result.error) throw new Error(result.error); wx.showToast({ title: '加入成功', icon: 'success' }); await this.onShow() } catch (_) {} finally { this.setData({ submitting: false }) }
  },
  copyInviteCode() { if (this.data.space) wx.setClipboardData({ data: this.data.space.inviteCode, success: () => wx.showToast({ title: '已复制', icon: 'success' }) }) },
  deleteProfile() {
    wx.showModal({ title: '删除成员资料', content: '将删除你在本小程序中的昵称、积分、成员资料，以及当前空间中由你创建的历史心愿和礼物记录，并退出当前双人空间。该操作不可恢复，确定继续吗？', confirmColor: '#d84b62', success: async result => {
      if (!result.confirm) return
      try {
        await call('deleteMembership')
        const app = getApp()
        app.globalData.space = null; app.globalData.members = []; app.globalData.currentOpenId = ''
        this.setData({ space: null, members: [], displayName: '', inviteCode: '', createCode: '' })
        wx.showToast({ title: '资料已删除', icon: 'success' })
      } catch (_) {}
    } })
  },
  retryLoad() { this.onShow() },
  requestSubscribeMessage() {
    const templateId = getApp().globalData.notificationTemplateId
    if (!templateId) return message(new Error('请先在 config.js 配置订阅消息模板 ID'))
    wx.requestSubscribeMessage({ tmplIds: [templateId], success: () => wx.showToast({ title: '提醒已开启', icon: 'success' }), fail: err => message(err, '授权失败') })
  }
})
