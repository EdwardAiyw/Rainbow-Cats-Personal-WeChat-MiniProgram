const { call } = require('../../utils/cloud')
Page({
  data: { _id: '', mission: null, dateStr: '', timeStr: '', creditPercent: 0, from: '', to: '', maxCredit: getApp().globalData.maxCredit,
    copy: { pageTitle: '\u5fc3\u613f\u8be6\u60c5', title: '\u5fc3\u613f\u540d\u79f0', relation: '\u6267\u884c\u5173\u7cfb', reward: '\u5956\u52b1\u79ef\u5206', maximum: '\u6700\u9ad8', createdAt: '\u521b\u5efa\u65f6\u95f4', detail: '\u8be6\u7ec6\u8bf4\u660e', notFound: '\u627e\u4e0d\u5230\u8fd9\u6761\u5fc3\u613f', started: '\u53d1\u8d77\uff0c\u7531', completed: '\u5b8c\u6210', point: '\u5206' } },
  onLoad(o) { if (o.id) this.setData({ _id: o.id }) },
  async onShow() { if (!this.data._id) return; try { const [result, state] = await Promise.all([call('getElementById', { _id: this.data._id, list: 'MissionList' }), call('getCurrentSpace')]); const mission = result.data && result.data[0]; if (!mission) throw new Error('心愿不存在'); const members = state.members || []; const from = (members.find(x => x._openid === mission._openid) || {}).displayName || '搭档'; const to = (members.find(x => x._openid !== mission._openid) || {}).displayName || '搭档'; const d = new Date(mission.date); this.setData({ mission, from, to, dateStr: d.toLocaleDateString(), timeStr: d.toLocaleTimeString(), creditPercent: Math.min(100, mission.credit / this.data.maxCredit * 100) }) } catch (_) {} }
})
