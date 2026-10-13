import { input } from '@inquirer/prompts'
import fs from 'fs'
import path from 'path'
import { isFileNameSafe } from './utils.js'

function getPostDir(fileName) {
  return path.join('./src/content/posts', fileName)
}

function getPostIndexPath(fileName) {
  return path.join(getPostDir(fileName), 'index.md')
}

const fileName = await input({
  message: '请输入文件名称',
  validate: (value) => {
    if (!isFileNameSafe(value)) {
      return '文件名只能包含字母、数字和连字符'
    }
    const fullPath = getPostIndexPath(value)
    if (fs.existsSync(fullPath)) {
      return `${fullPath} 已存在`
    }
    return true
  },
})

const title = await input({
  message: '请输入文章标题',
})

const content = `---
title: ${title}
date: ${new Date().toISOString()}
tags: []
comments: true
draft: false
---
`

const dirPath = getPostDir(fileName)
const fullPath = getPostIndexPath(fileName)
fs.mkdirSync(dirPath, { recursive: true })
fs.writeFileSync(fullPath, content)
console.log(`${fullPath} 创建成功`)
console.log(`图片请放在 ${dirPath}/ 目录下`)
