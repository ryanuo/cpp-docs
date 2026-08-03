import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicRoot = join(root, 'public/reference/zh')

function findHtmlFiles(dir, baseDir = dir) {
  const files = []
  if (!existsSync(dir)) return files

  const items = readdirSync(dir)
  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findHtmlFiles(fullPath, baseDir))
    } else if (item.endsWith('.html')) {
      files.push({
        fullPath,
        relativePath: relative(publicRoot, fullPath).split(sep).join('/')
      })
    }
  }
  return files
}

const entries = []

function parseSymbolFile(htmlPath) {
  const html = readFileSync(htmlPath, 'utf-8')

  // 匹配: <a href="xxx" title="xxx"><tt>xxx</tt></a>
  const linkRegex = /<a\s+href="([^"]+)"\s+title="([^"]+)"[^>]*>.*?<tt>(.*?)<\/tt><\/a>/gs
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const [, rawHref, title, rawName] = match

    // 解码 HTML 实体
    const name = rawName
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, '\'')
      .trim()

    if (!name) continue

    // 跳过锚点链接
    if (rawHref.startsWith('#')) continue

    // 从 title 属性提取路径（如 "c/string/multibyte/c16rtomb" 或 "cpp/chrono/duration/abs"）
    let href = title.trim()

    // 清理 title 中的多余空格（如 "c/program/ Exit"）
    if (href.includes(' ')) {
      href = href.substring(0, href.lastIndexOf(' '))
    }

    // 添加 .html 扩展名
    if (!href.endsWith('.html')) {
      href += '.html'
    }

    // 确保路径是 c/ 或 cpp/ 开头
    if (!href.startsWith('c/') && !href.startsWith('cpp/')) {
      continue
    }

    // 分类
    const isFunction = name.includes('()')
    const isTemplate = name.includes('<>')
    const category = isFunction ? 'function' : isTemplate ? 'template' : 'type'

    // 提取首字母
    const letterMatch = name.match(/^[^a-zA-Z]*([a-zA-Z])/)
    const letter = letterMatch ? letterMatch[1].toUpperCase() : '#'

    entries.push({
      name,
      path: href,
      title: title.trim(),
      category,
      letter
    })
  }
}

// 1. 解析 C++ 符号索引
const cppMainIndex = join(publicRoot, 'cpp/symbol_index.html')
if (existsSync(cppMainIndex)) {
  parseSymbolFile(cppMainIndex)
}

const cppSubDir = join(publicRoot, 'cpp/symbol_index')
if (existsSync(cppSubDir)) {
  const subFiles = findHtmlFiles(cppSubDir)
  for (const file of subFiles) {
    parseSymbolFile(file.fullPath)
  }
}

// 2. 解析 C 符号索引
const cMainIndex = join(publicRoot, 'c/symbol_index.html')
if (existsSync(cMainIndex)) {
  parseSymbolFile(cMainIndex)
}

const cFiles = findHtmlFiles(join(publicRoot, 'c'))
for (const file of cFiles) {
  if (file.relativePath === 'c/symbol_index.html') continue
  if (file.relativePath.includes('/') && !file.relativePath.includes('/symbol_index/')) {
    parseSymbolFile(file.fullPath)
  }
}

// 去重：按名字去重，优先保留 path 的 basename 匹配符号名的条目
const groups = new Map()
for (const e of entries) {
  if (!groups.has(e.name)) {
    groups.set(e.name, [])
  }
  groups.get(e.name).push(e)
}

const uniqueEntries = []
for (const [name, group] of groups) {
  if (group.length === 1) {
    uniqueEntries.push(group[0])
    continue
  }

  // 检查是否有 basename 匹配的条目
  const cleanName = name.replace('()', '').replace('<>', '')
  const matching = group.filter((e) => {
    const basename = e.path.split('/').pop()?.replace('.html', '') || ''
    return basename === cleanName || basename.startsWith(cleanName)
  })

  const candidates = matching.length > 0 ? matching : [group[0]]

  // 二阶段去重：同名字+同路径只保留一个
  const seenPaths = new Set()
  for (const e of candidates) {
    const key = `${e.name}-${e.path}`
    if (seenPaths.has(key)) continue
    seenPaths.add(key)
    uniqueEntries.push(e)
  }
}

const outputPath = join(root, 'public/reference-index.json')
const output = {
  generated: new Date().toISOString(),
  count: uniqueEntries.length,
  entries: uniqueEntries
}
const jsonStr = JSON.stringify(output)

writeFileSync(outputPath, jsonStr)
console.log(`✓ Generated ${uniqueEntries.length} entries → reference-index.json`)
console.log(`  Size: ${(jsonStr.length / 1024).toFixed(0)}KB`)

const stats = {
  function: uniqueEntries.filter(e => e.category === 'function').length,
  template: uniqueEntries.filter(e => e.category === 'template').length,
  type: uniqueEntries.filter(e => e.category === 'type').length,
  cpp: uniqueEntries.filter(e => e.path.startsWith('cpp/')).length,
  c: uniqueEntries.filter(e => e.path.startsWith('c/')).length
}
console.log(`  - Function: ${stats.function}`)
console.log(`  - Template: ${stats.template}`)
console.log(`  - Type: ${stats.type}`)
console.log(`  - C++: ${stats.cpp}`)
console.log(`  - C: ${stats.c}`)
