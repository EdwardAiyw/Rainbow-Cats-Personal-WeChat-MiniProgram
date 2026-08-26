const { call, message } = require('../../utils/cloud')

const flavorOptions = ['家常', '香辣', '下饭', '清淡', '快手']
const difficultyOptions = ['简单', '中等', '费工夫']
const presets = [
  { name: '不使用模板', title: '', desc: '', ingredients: '', steps: '', flavor: '家常', difficulty: '简单', minutes: 30 },
  { name: '辣椒炒肉', title: '辣椒炒肉', desc: '香辣下饭的家常菜。', ingredients: '猪肉、青椒、蒜、生抽、盐', steps: '1. 猪肉切片，青椒切段。\n2. 肉片煸香。\n3. 下青椒和蒜大火翻炒。\n4. 调味后出锅。', flavor: '香辣', difficulty: '简单', minutes: 20 },
  { name: '鲫鱼豆腐汤', title: '鲫鱼豆腐汤', desc: '清鲜暖胃的淡水鱼做法。', ingredients: '鲫鱼、豆腐、姜、葱、盐、料酒', steps: '1. 鲫鱼处理干净。\n2. 煎鱼后加开水炖煮。\n3. 放入豆腐和姜片。\n4. 最后加盐和葱花。', flavor: '清淡', difficulty: '中等', minutes: 40 },
  { name: '西红柿炒蛋', title: '西红柿炒蛋', desc: '最稳的家常菜。', ingredients: '西红柿、鸡蛋、葱、盐、糖', steps: '1. 鸡蛋炒熟盛出。\n2. 西红柿炒出汁。\n3. 倒回鸡蛋翻炒。\n4. 加盐和少许糖。', flavor: '家常', difficulty: '简单', minutes: 15 },
  { name: '青椒土豆丝', title: '青椒土豆丝', desc: '便宜快手，配饭很顺。', ingredients: '土豆、青椒、蒜、醋、盐', steps: '1. 土豆切丝后泡水。\n2. 热锅下蒜末和土豆丝。\n3. 加青椒一起翻炒。\n4. 出锅前加醋和盐。', flavor: '快手', difficulty: '简单', minutes: 12 },
  { name: '冬瓜排骨汤', title: '冬瓜排骨汤', desc: '适合想喝汤的时候。', ingredients: '排骨、冬瓜、姜、盐、葱', steps: '1. 排骨焯水洗净。\n2. 加姜片和清水炖煮。\n3. 冬瓜切块后下锅。\n4. 炖到冬瓜透明后加盐。', flavor: '清淡', difficulty: '中等', minutes: 60 }
]

Page({
  data: {
    title: '',
    desc: '',
    ingredients: '',
    steps: '',
    flavor: '家常',
    difficulty: '简单',
    minutes: 30,
    flavorOptions,
    difficultyOptions,
    presetIndex: 0,
    presets,
    submitting: false,
    copy: {
      pageTitle: '添加一道菜',
      hint: '优先记录你们真的会做、愿意反复吃的家常菜。',
      preset: '快速选择',
      title: '菜名',
      desc: '简介',
      ingredients: '食材',
      steps: '步骤',
      flavor: '口味',
      difficulty: '难度',
      minutes: '预计耗时',
      reset: '重置',
      save: '保存菜谱'
    },
    titlePlaceholder: '例如：辣椒炒肉',
    descPlaceholder: '这道菜适合什么时候吃',
    ingredientsPlaceholder: '例如：猪肉、青椒、蒜、生抽',
    stepsPlaceholder: '按 1、2、3 写下做法'
  },
  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onDescInput(e) { this.setData({ desc: e.detail.value }) },
  onIngredientsInput(e) { this.setData({ ingredients: e.detail.value }) },
  onStepsInput(e) { this.setData({ steps: e.detail.value }) },
  onMinutesInput(e) { this.setData({ minutes: e.detail.value }) },
  onFlavorChange(e) { this.setData({ flavor: flavorOptions[e.detail.value] }) },
  onDifficultyChange(e) { this.setData({ difficulty: difficultyOptions[e.detail.value] }) },
  onPresetChange(e) {
    const p = presets[e.detail.value]
    this.setData({
      presetIndex: Number(e.detail.value),
      title: p.title,
      desc: p.desc,
      ingredients: p.ingredients,
      steps: p.steps,
      flavor: p.flavor,
      difficulty: p.difficulty,
      minutes: p.minutes
    })
  },
  async saveRecipe() {
    if (this.data.submitting) return
    const { title, desc, ingredients, steps, flavor, difficulty, minutes } = this.data
    const cost = Number(minutes)
    if (!title.trim() || title.length > 16 || desc.length > 80 || ingredients.length > 200 || !steps.trim() || steps.length > 500 || !Number.isFinite(cost) || cost < 1 || cost > 180) {
      return message(new Error('请检查菜谱内容'))
    }
    this.setData({ submitting: true })
    try {
      const result = await call('addElement', {
        list: 'RecipeList',
        title: title.trim(),
        desc: desc.trim(),
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        flavor,
        difficulty,
        minutes: cost
      })
      if (result.error) throw new Error(result.error)
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 700)
    } catch (_) {} finally {
      this.setData({ submitting: false })
    }
  },
  resetRecipe() {
    this.setData({ title: '', desc: '', ingredients: '', steps: '', flavor: '家常', difficulty: '简单', minutes: 30, presetIndex: 0 })
  }
})
