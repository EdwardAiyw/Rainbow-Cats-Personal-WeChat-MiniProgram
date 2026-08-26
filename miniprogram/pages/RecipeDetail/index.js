const { call, readableError, message } = require('../../utils/cloud')
const presetRecipes = require('../Recipe/presets')

function normalizeDisplay(recipe) {
  if (!recipe) return recipe
  return {
    ...recipe,
    displayMinutes: recipe.minutes ? `${recipe.minutes} 分钟` : '参考做法'
  }
}

Page({
  data: {
    _id: '',
    source: '',
    isPreset: false,
    recipe: null,
    errorText: '',
    dateStr: '',
    timeStr: '',
    author: '',
    copy: {
      pageTitle: '菜谱详情',
      title: '菜名',
      profile: '菜谱信息',
      ingredients: '食材',
      seasoning: '调料',
      steps: '步骤',
      feature: '特点',
      tip: '小贴士',
      createdAt: '创建时间',
      author: '记录人',
      notFound: '找不到这道菜谱',
      minutes: '分钟'
    }
  },
  onLoad(options) {
    this.setData({ _id: options.id || '', source: options.source || '', isPreset: options.preset === '1' })
  },
  async onShow() {
    if (!this.data._id) return
    this.setData({ errorText: '' })
    try {
      if (this.data.source === 'tianapi') {
        const result = await call('recipeApi', { action: 'detail', id: this.data._id })
        if (result.error || !result.data) throw new Error(result.error || '菜谱不存在')
        this.setData({ recipe: normalizeDisplay(result.data), author: 'TianAPI 菜谱', dateStr: '-', timeStr: '' })
        return
      }
      if (this.data.isPreset) {
        const recipe = presetRecipes.find(item => item._id === this.data._id)
        if (!recipe) throw new Error('菜谱不存在')
        this.setData({ recipe: normalizeDisplay(recipe), author: '内置江西菜', dateStr: '-', timeStr: '' })
        return
      }
      const [result, state] = await Promise.all([
        call('getElementById', { _id: this.data._id, list: 'RecipeList' }),
        call('getCurrentSpace')
      ])
      const recipe = result.data && result.data[0]
      if (!recipe) throw new Error('菜谱不存在')
      const members = state.members || []
      const author = (members.find(x => x._openid === recipe._openid) || {}).displayName || '搭档'
      const d = new Date(recipe.date)
      this.setData({ recipe: normalizeDisplay(recipe), author, dateStr: d.toLocaleDateString(), timeStr: d.toLocaleTimeString() })
    } catch (err) {
      const errorText = readableError(err, this.data.source === 'tianapi' ? 'recipeApi' : 'getElementById')
      this.setData({ recipe: null, errorText })
      message(errorText)
    }
  }
})
