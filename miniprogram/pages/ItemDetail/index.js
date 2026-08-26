const { call } = require('../../utils/cloud')
Page({
  data: { _id: '', item: null, dateStr: '', timeStr: '', creditPercent: 0, from: '', to: '', maxCredit: getApp().globalData.maxCredit,
    copy: { pageTitle: '\u6536\u85cf\u8be6\u60c5', title: '\u793c\u7269\u540d\u79f0', relation: '\u83b7\u5f97\u65b9\u5f0f', value: '\u793c\u7269\u4ef7\u503c', maximum: '\u6700\u9ad8', receivedAt: '\u5151\u6362\u65f6\u95f4', detail: '\u793c\u7269\u8bf4\u660e', notFound: '\u627e\u4e0d\u5230\u8fd9\u4efd\u6536\u85cf', listed: '\u4e0a\u67b6\uff0c\u7531', exchange: '\u5151\u6362', point: '\u5206' } },
  onLoad(o) { if (o.id) this.setData({ _id: o.id }) },
  async onShow() { if (!this.data._id) return; try { const [result, state] = await Promise.all([call('getElementById', { _id: this.data._id, list: 'StorageList' }), call('getCurrentSpace')]); const item = result.data && result.data[0]; if (!item) throw new Error('收藏不存在'); const members = state.members || []; const from = (members.find(x => x._openid === item.sellerOpenId) || {}).displayName || '搭档'; const to = (members.find(x => x._openid === item._openid) || {}).displayName || '我'; const d = new Date(item.date); this.setData({ item, from, to, dateStr: d.toLocaleDateString(), timeStr: d.toLocaleTimeString(), creditPercent: Math.min(100, item.credit / this.data.maxCredit * 100) }) } catch (_) {} }
})
