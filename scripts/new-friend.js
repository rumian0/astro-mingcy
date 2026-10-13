import { input, select } from '@inquirer/prompts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const linksFile = path.resolve(__dirname, '../src/data/links.ts')
const friendJsonFile = path.resolve(__dirname, '../public/js/friend.json')

const name = await input({
  message: '请输入友链名称',
  validate: (v) => (v.trim() ? true : '名称不能为空'),
})

const description = await input({
  message: '请输入描述',
})

const link = await input({
  message: '请输入地址',
  validate: (v) => (v.startsWith('http') ? true : '请输入有效的 URL'),
})

const avatar = await input({
  message: '请输入头像地址',
})

const category = await select({
  message: '请选择分类',
  choices: [
    { name: '大佬们', value: '大佬们' },
    { name: '朋友们', value: '朋友们' },
    { name: 'Link3', value: 'Link3' },
    { name: '软件阁', value: '软件阁' },
    { name: '大家庭', value: '大家庭' },
  ],
})

let content = fs.readFileSync(linksFile, 'utf-8')

// Find the target category and insert before the closing bracket of its links array
const categoryRegex = new RegExp(`(title: '${category}'[\\s\\S]*?links: \\[)([\\s\\S]*?)(\\])`)
const match = content.match(categoryRegex)

if (match) {
  const newEntry = `      { name: '${name}', url: '${link}', avatar: '${avatar}', desc: '${description}' },`
  const existingLinks = match[2].trimEnd()
  const updatedLinks = existingLinks ? `${existingLinks}\n${newEntry}\n` : `\n${newEntry}\n`
  content = content.replace(categoryRegex, `$1${updatedLinks}$3`)
} else {
  console.error(`未找到分类 "${category}"，请在 src/data/links.ts 中手动添加`)
  process.exit(1)
}

fs.writeFileSync(linksFile, content)
console.log(`已在 "${category}" 中添加友链：${name}`)

// 追加到 public/js/friend.json
try {
  const friendJson = JSON.parse(fs.readFileSync(friendJsonFile, 'utf-8'))
  friendJson.friends.push([name, link, avatar])
  fs.writeFileSync(friendJsonFile, JSON.stringify(friendJson, null, 2) + '\n')
  console.log(`已追加到 friend.json：${name}`)
} catch (e) {
  console.error(`写入 friend.json 失败：${e.message}`)
}
