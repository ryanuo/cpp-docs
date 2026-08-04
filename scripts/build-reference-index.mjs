import { writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..')

const publicRoot = join(root, 'public/reference/zh')

const entries = []

/**
 * 递归遍历目录，为每个 HTML 文件生成一条索引
 */
function walkDir(dir) {
  if (!existsSync(dir)) return

  const items = readdirSync(dir)

  for (const item of items) {
    const fullPath = join(dir, item)

    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      walkDir(fullPath)
    } else if (item.endsWith('.html')) {
      // 计算相对路径（从 public/reference/zh 算起，保留 cpp/ 或 c/ 前缀）
      const relativePath = fullPath.slice(publicRoot.length + 1).replace(/\\\\/g, '/')

      // 如果是 index.html，name 用上级文件夹名；否则用文件名
      const fileName = basename(item, '.html')

      const name = fileName === 'index' ? basename(dir) : fileName

      const letterMatch = name.match(/[a-zA-Z]/)

      const letter = letterMatch ? letterMatch[0].toUpperCase() : '#'

      entries.push({
        name,
        path: relativePath,
        letter
      })
    }
  }
}

/**
 * 主入口
 */

walkDir(join(publicRoot, 'cpp'))

walkDir(join(publicRoot, 'c'))

/**
 * 输出 JSON
 */

const output = {
  generated: new Date().toISOString(),

  count: entries.length,

  entries
}

const outputPath = join(root, 'public/reference-index.json')

const json = JSON.stringify(output, null, 2)

writeFileSync(outputPath, json, 'utf-8')

console.log(`✓ Generated ${entries.length} entries`)

console.log(`Size ${(json.length / 1024).toFixed(0)}KB`)

const stats = {
  cpp: entries.filter(e => e.path.startsWith('cpp/')).length,

  c: entries.filter(e => e.path.startsWith('c/')).length
}

console.log(stats)
