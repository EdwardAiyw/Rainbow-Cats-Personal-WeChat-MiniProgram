const recipes = [
  {
    _id: 'preset-la-jiao-chao-rou',
    title: '辣椒炒肉',
    desc: '青椒和猪肉快火爆炒，香辣下饭。',
    ingredients: '猪前腿肉、青椒、蒜、豆豉、生抽、盐',
    steps: '1. 猪肉切薄片，青椒拍裂切段。\n2. 热锅煸出肉香和油脂。\n3. 下蒜、豆豉、青椒大火翻炒。\n4. 加生抽和盐调味，炒到青椒断生出锅。',
    flavor: '香辣',
    difficulty: '简单',
    minutes: 20
  },
  {
    _id: 'preset-li-hao-chao-la-rou',
    title: '藜蒿炒腊肉',
    desc: '江西家常味，藜蒿清香配腊肉咸香。',
    ingredients: '藜蒿、腊肉、干辣椒、蒜、生抽',
    steps: '1. 腊肉蒸软切片，藜蒿摘段。\n2. 腊肉下锅煸出油。\n3. 放干辣椒和蒜炒香。\n4. 下藜蒿大火翻炒，少量生抽调味。',
    flavor: '下饭',
    difficulty: '简单',
    minutes: 25
  },
  {
    _id: 'preset-san-bei-ji',
    title: '三杯鸡',
    desc: '酱香浓郁，适合认真做一顿。',
    ingredients: '鸡腿肉、姜、蒜、米酒、生抽、麻油、冰糖、九层塔',
    steps: '1. 鸡腿肉切块焯水沥干。\n2. 麻油煸香姜片和蒜粒。\n3. 下鸡块翻炒上色。\n4. 加米酒、生抽、冰糖焖煮收汁，最后放九层塔。',
    flavor: '家常',
    difficulty: '中等',
    minutes: 45
  },
  {
    _id: 'preset-yu-gan-chao-rou',
    title: '余干辣椒炒肉',
    desc: '辣味直接，肉香足，配米饭很稳。',
    ingredients: '余干辣椒、猪肉、蒜、姜、生抽、盐',
    steps: '1. 辣椒切斜段，猪肉切片。\n2. 热锅下肉片炒出香味。\n3. 加姜蒜和辣椒快速翻炒。\n4. 加生抽、盐调味，炒至辣椒起虎皮。',
    flavor: '香辣',
    difficulty: '简单',
    minutes: 20
  },
  {
    _id: 'preset-lian-hua-xue-ya',
    title: '莲花血鸭',
    desc: '赣味代表菜，酸辣鲜香但步骤更讲究。',
    ingredients: '鸭肉、鸭血、米酒、姜蒜、辣椒、陈醋、盐',
    steps: '1. 鸭肉切小块，姜蒜辣椒备好。\n2. 鸭肉煸干水汽并炒出油。\n3. 加米酒、盐和少量水焖熟。\n4. 淋入鸭血和陈醋快速翻匀，收浓出锅。',
    flavor: '香辣',
    difficulty: '费工夫',
    minutes: 60
  },
  {
    _id: 'preset-wa-guan-rou-tang',
    title: '瓦罐肉汤',
    desc: '清润暖胃，适合不想吃太辣的时候。',
    ingredients: '瘦肉、鸡蛋、姜、盐、枸杞',
    steps: '1. 瘦肉剁成肉饼，放入炖盅。\n2. 加姜片和清水，可打入一个鸡蛋。\n3. 隔水慢炖到汤清肉熟。\n4. 加盐和枸杞调味。',
    flavor: '清淡',
    difficulty: '中等',
    minutes: 80
  },
  {
    _id: 'preset-fen-zheng-rou',
    title: '粉蒸肉',
    desc: '软糯咸香，可以提前准备再上锅蒸。',
    ingredients: '五花肉、蒸肉米粉、红薯、生抽、料酒、姜',
    steps: '1. 五花肉切片，用生抽、料酒、姜腌制。\n2. 拌入蒸肉米粉。\n3. 红薯垫底，肉片铺上。\n4. 上锅蒸到肉软糯。',
    flavor: '家常',
    difficulty: '中等',
    minutes: 70
  },
  {
    _id: 'preset-nanchang-banfen',
    title: '南昌拌粉',
    desc: '快手主食，早晚都能吃。',
    ingredients: '米粉、萝卜干、花生米、葱、蒜、生抽、辣椒油',
    steps: '1. 米粉煮熟后过温水沥干。\n2. 调入生抽、蒜末、辣椒油。\n3. 加萝卜干、花生米和葱花。\n4. 拌匀后趁热吃。',
    flavor: '快手',
    difficulty: '简单',
    minutes: 15
  },
  {
    _id: 'preset-yan-sun-chao-rou',
    title: '烟笋炒肉',
    desc: '烟笋脆香，适合想吃重口家常菜。',
    ingredients: '烟笋、猪肉、蒜苗、辣椒、生抽、盐',
    steps: '1. 烟笋泡发切片，猪肉切片。\n2. 肉片入锅煸香。\n3. 下烟笋、辣椒大火翻炒。\n4. 加生抽和盐，最后放蒜苗。',
    flavor: '下饭',
    difficulty: '中等',
    minutes: 35
  },
  {
    _id: 'preset-gan-nan-xiao-chao-rou',
    title: '赣南小炒肉',
    desc: '保留赣南香辣风格的家常做法。',
    ingredients: '猪肉、青红椒、蒜、姜、豆豉、生抽',
    steps: '1. 猪肉切片，青红椒切段。\n2. 猪肉煸到边缘微焦。\n3. 加姜蒜豆豉炒香。\n4. 下辣椒大火翻炒，生抽调味。',
    flavor: '香辣',
    difficulty: '简单',
    minutes: 25
  },
  {
    _id: 'preset-sufe-yu-doufutang',
    title: '鲫鱼豆腐汤',
    desc: '淡水鱼做法，清鲜暖胃。',
    ingredients: '鲫鱼、豆腐、姜、葱、盐、料酒',
    steps: '1. 鲫鱼处理干净，豆腐切块。\n2. 鱼煎至两面微黄。\n3. 加姜片和开水炖煮。\n4. 放入豆腐，最后加盐和葱花。',
    flavor: '清淡',
    difficulty: '中等',
    minutes: 40
  },
  {
    _id: 'preset-xi-hong-shi-chao-dan',
    title: '西红柿炒蛋',
    desc: '最稳的家常菜，酸甜开胃。',
    ingredients: '西红柿、鸡蛋、葱、盐、糖',
    steps: '1. 鸡蛋打散炒熟盛出。\n2. 西红柿切块炒出汁。\n3. 倒回鸡蛋翻炒。\n4. 加盐和少许糖调味。',
    flavor: '家常',
    difficulty: '简单',
    minutes: 15
  },
  {
    _id: 'preset-qing-jiao-tu-dou-si',
    title: '青椒土豆丝',
    desc: '便宜快手，配饭很顺。',
    ingredients: '土豆、青椒、蒜、醋、盐',
    steps: '1. 土豆切丝后泡水。\n2. 热锅下蒜末和土豆丝。\n3. 加青椒一起翻炒。\n4. 出锅前加醋和盐。',
    flavor: '快手',
    difficulty: '简单',
    minutes: 12
  },
  {
    _id: 'preset-suan-rong-kong-xin-cai',
    title: '蒜蓉空心菜',
    desc: '清爽解腻，家里常备青菜。',
    ingredients: '空心菜、蒜、盐、食用油',
    steps: '1. 空心菜洗净切段，蒜切末。\n2. 大火热锅爆香蒜末。\n3. 下空心菜快速翻炒。\n4. 加盐后立刻出锅。',
    flavor: '清淡',
    difficulty: '简单',
    minutes: 10
  },
  {
    _id: 'preset-dong-gua-pai-gu-tang',
    title: '冬瓜排骨汤',
    desc: '适合想喝汤的时候。',
    ingredients: '排骨、冬瓜、姜、盐、葱',
    steps: '1. 排骨焯水洗净。\n2. 加姜片和清水炖煮。\n3. 冬瓜切块后下锅。\n4. 炖到冬瓜透明后加盐。',
    flavor: '清淡',
    difficulty: '中等',
    minutes: 60
  }
]

module.exports = recipes.map(item => ({
  ...item,
  cuisine: '江西菜',
  isPreset: true,
  available: true,
  star: false
}))
