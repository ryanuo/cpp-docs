import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicRoot = join(root, 'public/reference/zh')

const entries = []

// 解析单个 HTML 文件
function parseFile(filePath, prefix) {
  if (!existsSync(filePath)) {
    console.warn(`⚠ File not found: ${filePath}`)
    return
  }

  const html = readFileSync(filePath, 'utf-8')
  const linkRegex = /<a\s+href="([^"]+)"\s+title="([^"]+)"[^>]*>.*?<tt>(.*?)<\/tt><\/a>/gs
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const [, rawHref, title, rawName] = match

    const name = rawName
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, '\'')
      .trim()

    if (!name) continue
    if (rawHref.startsWith('#')) continue

    // 从 title 属性提取路径
    let href = title.trim()

    if (href.includes(' ')) {
      href = href.substring(0, href.lastIndexOf(' '))
    }

    if (!href.endsWith('.html')) {
      href += '.html'
    }

    // 确保前缀
    if (!href.startsWith(`${prefix}/`)) {
      href = `${prefix}/${href}`
    }

    if (!href.startsWith('c/') && !href.startsWith('cpp/')) {
      continue
    }

    const isFunction = name.includes('()')
    const isTemplate = name.includes('<>')
    const category = isFunction ? 'function' : isTemplate ? 'template' : 'type'

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

// 1. 解析 4 个主文件
parseFile(join(publicRoot, 'cpp/index.html'), 'cpp')
parseFile(join(publicRoot, 'c/index.html'), 'c')
parseFile(join(publicRoot, 'cpp/symbol_index.html'), 'cpp')
parseFile(join(publicRoot, 'c/symbol_index.html'), 'c')

// 2. 解析 cpp/symbol_index/ 子分类目录
const cppSubDir = join(publicRoot, 'cpp/symbol_index')
if (existsSync(cppSubDir)) {
  const subFiles = readdirSync(cppSubDir).filter(f => f.endsWith('.html'))
  for (const file of subFiles) {
    parseFile(join(cppSubDir, file), 'cpp')
  }
}

// 去重：按名字分组，优先保留 basename 匹配的条目
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

  const cleanName = name.replace('()', '').replace('<>', '')
  const matching = group.filter((e) => {
    const basename = e.path.split('/').pop()?.replace('.html', '') || ''
    return basename === cleanName || basename.startsWith(cleanName)
  })

  const candidates = matching.length > 0 ? matching : [group[0]]

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
