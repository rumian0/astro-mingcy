export interface Project {
  id: number
  title: string
  description: string
  image: string
  tags: string[]
  demoUrl: string
  codeUrl: string
}

// 项目数据：示例条目，请替换成你自己的项目。
// image 支持本地相对路径（会拼 ProjectList 里的 imageBase）或完整 https 链接。
// 新增项目可直接跑 `pnpm new-project`。
export const projects: Project[] = [
  {
    id: 1,
    title: '示例项目一',
    description: '一句话介绍这个项目的功能与价值。',
    image: 'image/project-cover-1.svg',
    tags: ['Astro', 'React', 'TailwindCSS'],
    demoUrl: 'https://example.com/project-1',
    codeUrl: 'https://github.com/yourname/project-1',
  },
  {
    id: 2,
    title: '示例项目二',
    description: '一句话介绍这个项目的功能与价值。',
    image: 'image/project-cover-2.svg',
    tags: ['Node.js', 'TypeScript'],
    demoUrl: 'https://example.com/project-2',
    codeUrl: '',
  },
  {
    id: 3,
    title: '示例项目三',
    description: '一句话介绍这个项目的功能与价值。',
    image: 'image/project-cover-3.svg',
    tags: ['Open Source', 'CLI'],
    demoUrl: 'https://example.com/project-3',
    codeUrl: 'https://github.com/yourname/project-3',
  },
]
