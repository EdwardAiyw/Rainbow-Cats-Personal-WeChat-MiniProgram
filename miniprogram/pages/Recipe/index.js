const { call, readableError, message } = require('../../utils/cloud')
const presetRecipes = require('./presets')

function withDisplayFields(items) {
  return items.map(item => ({
    ...item,
    displayMinutes: item.minutes ? `${item.minutes} 分钟` : '参考做法',
    displaySource: item.isApi ? '官方' : (item.isPreset ? '内置' : '自建')
  }))
}

Page({
  data: {
    search: '',
    apiRecipes: [],
    localRecipes: [],
    presetRecipes: withDisplayFields(presetRecipes),
    myRecipes: [],
    randomRecipe: null,
    apiLoading: false,
    loading: true,
    hasSpace: false,
    errorText: '',
    apiError: '',
    l: {
      title: '今天吃什么',
      search: '搜索菜名、食材或口味',
      random: '随机一道菜',
      searchApi: '搜索官方菜谱',
      add: '添加菜谱',
      preset: '内置',
      custom: '自建',
      official: '官方',
      minutes: '分钟',
      empty: '还没有菜谱',
      loading: '正在加载菜谱...',
      apiLoading: '正在找菜...',
      myRecipes: '我的菜谱',
      apiRecipes: '官方菜谱',
      presetRecipes: '常见家常菜',
      noSpaceTitle: '请先创建或加入双人空间',
      noSpaceHint: '空间连接后，你们才能共同维护菜谱。',
      goSpace: '去创建空间',
      errorTitle: '菜谱加载失败',
      retry: '重试',
      delete: '删除'
    }
  },
  async onShow() {
    this.setData({ loading: true, errorText: '' })
    try {
      const space = await getApp().refreshSpace()
      if (!space) return this.setData({ hasSpace: false, loading: false })
      this.setData({ hasSpace: true })
      await Promise.all([this.loadLocal(), this.loadApiRecipes()])
    } catch (err) {
      this.setData({ errorText: readableError(err, 'listElements') })
    } finally {
      this.setData({ loading: false })
    }
  },
  async loadLocal() {
    const r = await call('listElements', { list: 'RecipeList' })
    const openId = getApp().globalData.currentOpenId
    const localRecipes = withDisplayFields((r.data || []).map(item => ({
      ...item,
      source: 'local',
      isPreset: false,
      isApi: false,
      canManage: item._openid === openId
    })))
    this.setData({ localRecipes, myRecipes: localRecipes })
  },
  async loadApiRecipes(word = '') {
    this.setData({ apiLoading: true, apiError: '' })
    try {
      const r = await call('recipeApi', { action: 'list', word, num: 10 })
      if (r.error) throw new Error(r.error)
      this.setData({ apiRecipes: withDisplayFields(r.data || []) })
    } catch (err) {
      this.setData({ apiRecipes: [], apiError: readableError(err, 'recipeApi') })
    } finally {
      this.setData({ apiLoading: false })
    }
  },
  retry() { this.onShow() },
  openSpace() { wx.switchTab({ url: '../MainPage/index' }) },
  onSearch(e) {
    const search = e.detail.value
    this.setData({ search })
    this.filterLocal(search)
  },
  onSearchConfirm() { this.searchApi() },
  async searchApi() {
    await this.loadApiRecipes(this.data.search.trim())
  },
  filterLocal(search) {
    const s = search.trim()
    const myRecipes = s
      ? this.data.localRecipes.filter(item => [item.title, item.desc, item.ingredients, item.flavor].some(value => String(value || '').includes(s)))
      : this.data.localRecipes
    this.setData({ myRecipes })
  },
  async randomPick() {
    this.setData({ apiLoading: true, apiError: '' })
    try {
      const r = await call('recipeApi', { action: 'list', num: 10 })
      if (r.error) throw new Error(r.error)
      const apiRecipes = withDisplayFields(r.data || [])
      const pool = apiRecipes.concat(this.data.localRecipes, this.data.presetRecipes)
      if (!pool.length) return
      this.setData({
        apiRecipes,
        randomRecipe: pool[Math.floor(Math.random() * pool.length)]
      })
    } catch (err) {
      const pool = this.data.localRecipes.concat(this.data.presetRecipes)
      if (pool.length) {
        this.setData({ randomRecipe: pool[Math.floor(Math.random() * pool.length)], apiError: readableError(err, 'recipeApi') })
      } else {
        message(err)
      }
    } finally {
      this.setData({ apiLoading: false })
    }
  },
  openRecipe(recipe) {
    if (!recipe) return
    if (recipe.isApi) {
      wx.navigateTo({ url: '../RecipeDetail/index?source=tianapi&id=' + recipe.apiId })
      return
    }
    wx.navigateTo({ url: '../RecipeDetail/index?id=' + recipe._id + (recipe.isPreset ? '&preset=1' : '') })
  },
  toApiDetail(e) { this.openRecipe(this.data.apiRecipes[e.currentTarget.dataset.index]) },
  toLocalDetail(e) { this.openRecipe(this.data.myRecipes[e.currentTarget.dataset.index]) },
  toPresetDetail(e) { this.openRecipe(this.data.presetRecipes[e.currentTarget.dataset.index]) },
  openRandomDetail() { this.openRecipe(this.data.randomRecipe) },
  toAddPage() { wx.navigateTo({ url: '../RecipeAdd/index' }) },
  async toggleStar(e) {
    const x = this.data.localRecipes.find(v => v._id === e.currentTarget.dataset.id)
    if (!x || !x.canManage) return
    try {
      await call('editStar', { _id: x._id, list: 'RecipeList', value: !x.star })
      await this.loadLocal()
    } catch (_) {}
  },
  async deleteRecipe(e) {
    const id = e.currentTarget.dataset.id
    const x = this.data.localRecipes.find(v => v._id === id)
    if (!x || !x.canManage) return
    const confirmed = await new Promise(resolve => wx.showModal({ title: '删除菜谱', content: '确定删除这道菜谱吗？', success: r => resolve(r.confirm) }))
    if (!confirmed) return
    try {
      await call('deleteElement', { _id: id, list: 'RecipeList' })
      await this.loadLocal()
    } catch (_) {}
  }
})
