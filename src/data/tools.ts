export interface Tool {
  id: number
  title: string
  description: string
  url: string
  tags?: string[]
}

export const tools: Tool[] = [
  // ── 图片 ──
  {
    id: 1,
    title: '三合一收款码在线生成',
    description: '在线生成专业二维码，支持静态码和可修改动态二维码',
    url: 'https://www.rocschool.com/tool/qr/',
    tags: ['图片'],
  },
  {
    id: 2,
    title: 'BgSub - 消除或替换图像背景',
    description: '无需上传图像的在线 AI 去背景工具',
    url: 'https://zh.bgsub.com/webapp/',
    tags: ['图片'],
  },
  {
    id: 3,
    title: 'waifu2x 无损放大',
    description: '使用卷积神经网络对图片进行无损放大',
    url: 'https://www.waifu2x.net/',
    tags: ['图片'],
  },
  {
    id: 4,
    title: '一键改图',
    description: '简单好用的在线图片处理工具，支持压缩、裁剪、格式转换等',
    url: 'https://yijiangaitu.com',
    tags: ['图片'],
  },
  {
    id: 5,
    title: 'WatermarkRemover - 水印去除',
    description: 'AI 驱动的水印去除工具，保留画质无需注册',
    url: 'https://www.watermarkremover.io/zh',
    tags: ['图片'],
  },
  {
    id: 6,
    title: '草料二维码解码器',
    description: '免费在线二维码解码，支持上传图片或摄像头扫描',
    url: 'https://cli.im/deqr',
    tags: ['图片'],
  },
  {
    id: 7,
    title: 'Erase.bg - 免费去背景',
    description: '在线抠图，对人、动物、物体图像去除背景',
    url: 'https://www.erase.bg/zh',
    tags: ['图片'],
  },
  {
    id: 8,
    title: 'docsmall 在线图片压缩',
    description: '压缩 PNG/JPG 格式图片，不牺牲视觉质量',
    url: 'https://docsmall.com/image-compress',
    tags: ['图片'],
  },
  {
    id: 9,
    title: 'VeryPixel 批量图片压缩',
    description: '浏览器本地处理的批量图片压缩与格式转换',
    url: 'https://pixel.veryjack.com/',
    tags: ['图片'],
  },
  {
    id: 10,
    title: 'favicon 制作 - 在线工具',
    description: '在线制作网站 favicon 图标',
    url: 'https://tool.lu/favicon',
    tags: ['图片'],
  },

  // ── 办公 ──
  {
    id: 11,
    title: 'VideoFk - 在线视频下载',
    description: '免费在线视频解析下载工具',
    url: 'https://www.videofk.com/',
    tags: ['办公'],
  },
  {
    id: 12,
    title: 'Parsevideo - 在线视频解析下载',
    description: '免费在线视频解析下载网站',
    url: 'https://pv.vlogdownloader.com/',
    tags: ['办公'],
  },
  {
    id: 13,
    title: 'uTools 新一代工具平台',
    description: '插件应用生态与 AI 生成工具，打造你的专属趁手工具箱',
    url: 'https://www.u-tools.cn/index.html',
    tags: ['办公'],
  },
  {
    id: 14,
    title: 'Crx搜搜 - 扩展应用商店',
    description: '一键搜索下载 Chrome/Edge/Firefox 等浏览器扩展',
    url: 'https://www.crxsoso.com/',
    tags: ['办公'],
  },
  {
    id: 15,
    title: 'IT Dog - 在线 Ping',
    description: '多地多线路持续 Ping，网络延迟测试',
    url: 'https://www.itdog.cn/ping/',
    tags: ['办公'],
  },
  {
    id: 16,
    title: '福兮 Forxi 应用工具箱',
    description: '文件预览、图片处理、OCR、IT 开发等 12 款免费工具',
    url: 'https://forxi.cn/hub/',
    tags: ['办公'],
  },

  // ── 文本 ──
  {
    id: 17,
    title: 'Diffchecker 文本比较',
    description: '在线比较文本，找出两个文件之间的差异',
    url: 'https://www.diffchecker.com/zh-Hans/',
    tags: ['文本'],
  },

  // ── 托管 ──
  {
    id: 18,
    title: 'Railway',
    description: '全栈云平台，一键部署 Web 应用、服务器和数据库',
    url: 'https://railway.com/',
    tags: ['托管'],
  },
  {
    id: 19,
    title: 'Render',
    description: '从 Git 自动部署应用和网站，免费 SSL 与全球 CDN',
    url: 'https://render.com/',
    tags: ['托管'],
  },
  {
    id: 20,
    title: 'Netlify',
    description: '快速构建和部署现代 Web 项目',
    url: 'https://app.netlify.com/',
    tags: ['托管'],
  },
  {
    id: 21,
    title: 'Koyeb',
    description: '开发者友好的 Serverless 全球部署平台',
    url: 'https://app.koyeb.com/',
    tags: ['托管'],
  },
  {
    id: 22,
    title: 'Vercel',
    description: '前端部署平台，支持静态网站和 Serverless 函数',
    url: 'https://vercel.com/',
    tags: ['托管'],
  },
  {
    id: 23,
    title: 'Zeabur',
    description: '一键部署服务的云平台',
    url: 'https://zeabur.com/',
    tags: ['托管'],
  },

  // ── 转换 ──
  {
    id: 24,
    title: 'Convertio 文件转换',
    description: '支持 309+ 种文档、图片、音视频格式在线转换',
    url: 'https://convertio.co/zh/',
    tags: ['转换'],
  },
  {
    id: 25,
    title: 'Aconvert 在线转换',
    description: '免费在线转换文档、电子书、图片、音视频等文件',
    url: 'https://www.aconvert.com/',
    tags: ['转换'],
  },
  {
    id: 26,
    title: 'CloudConvert MP4 转 GIF',
    description: '免费快速地将 MP4 视频转换为 GIF 动图',
    url: 'https://cloudconvert.com/mp4-to-gif',
    tags: ['转换'],
  },
  {
    id: 27,
    title: 'docsmall PDF 合并',
    description: '在线免费合并多个 PDF 文件为一个',
    url: 'https://docsmall.com/pdf-merge',
    tags: ['转换'],
  },

  // ── 有趣 ──
  {
    id: 28,
    title: 'Pointer Pointer',
    description: '鼠标指针指向哪里，就显示对应指向的照片',
    url: 'https://pointerpointer.com/',
    tags: ['有趣'],
  },
  {
    id: 29,
    title: 'This Person Does Not Exist',
    description: 'AI 生成的随机人脸，每次刷新都不存在的人',
    url: 'https://thispersondoesnotexist.com/',
    tags: ['有趣'],
  },
  {
    id: 30,
    title: 'Poki - 免费在线游戏',
    description: '海量免费在线游戏，即点即玩',
    url: 'https://poki.cn/',
    tags: ['有趣'],
  },
  {
    id: 31,
    title: '隔离食用手册',
    description: '根据食材推荐菜谱，今天我们来做菜',
    url: 'https://cook.yunyoujun.cn/',
    tags: ['有趣'],
  },

  // ── 壁纸 ──
  {
    id: 32,
    title: 'Wallhaven',
    description: '高质量壁纸社区，海量精美壁纸',
    url: 'https://wallhaven.cc/',
    tags: ['壁纸'],
  },
  {
    id: 33,
    title: 'Pixiv',
    description: '全球最大插画·漫画·小说作品交流社区',
    url: 'https://www.pixiv.net/',
    tags: ['壁纸'],
  },
  {
    id: 34,
    title: '哲风壁纸',
    description: '免费 4K-8K 高清电脑/手机壁纸下载',
    url: 'https://haowallpaper.com/',
    tags: ['壁纸'],
  },

  // ── 导航 ──
  {
    id: 35,
    title: 'ACGN导航',
    description: '二次元资源导航站，收录动漫、漫画、美图等站点',
    url: 'https://nav.danhao.wang/',
    tags: ['导航'],
  },
  {
    id: 36,
    title: '刘明野的工具箱',
    description: '好用易用的在线工具集合',
    url: 'https://tool.liumingye.cn/',
    tags: ['导航'],
  },

  // ── PC 软件仓 ──
  {
    id: 37,
    title: '奇迹秀工具箱',
    description: '设计师必备工具及设计辅助神器集合',
    url: 'https://www.qijishow.com/down/index.html',
    tags: ['PC软件'],
  },
  {
    id: 38,
    title: 'MSDN, 我告诉你',
    description: '安静的工具站，提供原版系统镜像和软件资源',
    url: 'https://msdn.itellyou.cn/#wangzhikucom',
    tags: ['PC软件'],
  },
  {
    id: 39,
    title: '软仓',
    description: '软件资源仓库',
    url: 'https://www.ruancang.net/#/sim',
    tags: ['PC软件'],
  },
]
