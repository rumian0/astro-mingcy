import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// 部署脚本：把 dist/ 构建产物推送到静态托管仓库。
//
// 用法：
//   DEPLOY_REMOTE_URL=https://github.com/yourname/your-astro.git pnpm deploy
//   # 可选：走代理推送（本机已有代理时）
//   DEPLOY_PROXY='C:\\Program Files\\Git\\mingw64\\bin\\connect.exe -S 127.0.0.1:10808 -5 %h %p' pnpm deploy

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')

const REMOTE_URL = process.env.DEPLOY_REMOTE_URL || 'https://github.com/yourname/your-astro.git'
const TARGET_BRANCH = process.env.DEPLOY_BRANCH || 'main'
const PROXY_CMD = process.env.DEPLOY_PROXY || ''

console.log('📂 工作目录：', distDir)
if (!fs.existsSync(distDir)) {
  console.error('❌ 未找到 dist/，请先运行 pnpm build')
  process.exit(1)
}
process.chdir(distDir)

fs.rmSync('.git', { recursive: true, force: true })

console.log('\n📦 git init')
execSync('git init', { stdio: 'inherit' })

console.log('\n📦 git add -A')
execSync('git add -A', { stdio: 'inherit' })

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}`
const commitMsg = `chore: deploy ${dateStr}`

console.log(`\n📝 提交信息：${commitMsg}`)
try {
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' })
} catch {
  console.log('ℹ️ 无文件变更，部署终止')
  process.exit(0)
}

console.log('\n🔗 添加远程仓库', REMOTE_URL)
execSync(`git remote add origin ${REMOTE_URL}`, { stdio: 'inherit' })

console.log(`\n🔀 设置默认分支 ${TARGET_BRANCH}`)
execSync(`git branch -M ${TARGET_BRANCH}`, { stdio: 'inherit' })

const env = PROXY_CMD ? { ...process.env, GIT_PROXY_COMMAND: PROXY_CMD } : process.env
console.log('\n🚀 开始推送')
execSync(`git push -f origin ${TARGET_BRANCH}`, { stdio: 'inherit', env })

console.log('\n🎉 部署任务完成！')
