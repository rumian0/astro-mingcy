export interface LinkItem {
  name: string
  url: string
  avatar?: string
  desc?: string
}

export interface LinkCategory {
  title: string
  links: LinkItem[]
}

// 友链数据：按分组展示。示例数据请替换成你自己的友链。
// 新增友链可直接跑 `pnpm new-friend`，脚本会同时写入本文件与 public/js/friend.json。
export const friendLinks: LinkCategory[] = [
  {
    title: '示例分组一',
    links: [
      {
        name: '示例博客 A',
        url: 'https://example.com/a',
        avatar: '/image/avatar-placeholder-a.svg',
        desc: '一句话介绍这个站点。',
      },
      {
        name: '示例博客 B',
        url: 'https://example.com/b',
        avatar: '/image/avatar-placeholder-b.svg',
        desc: '一句话介绍这个站点。',
      },
    ],
  },
  {
    title: '示例分组二',
    links: [
      {
        name: '示例博客 C',
        url: 'https://example.com/c',
        avatar: '/image/avatar-placeholder-c.svg',
        desc: '一句话介绍这个站点。',
      },
    ],
  },
]
