import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..')

const publicRoot = join(root, 'public/reference/zh')

const entries = []

/**
 * 清理 HTML 实体
 */
function decodeHtml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, '\'')
    .trim()
}

/**
 * 解析 HTML 文件
 */
function parseFile(filePath, prefix) {
  if (!existsSync(filePath)) {
    console.warn(`⚠ File not found: ${filePath}`)

    return
  }

  const html = readFileSync(filePath, 'utf-8')

  const $ = cheerio.load(html)

  $('a[title]').each((_, el) => {
    const $el = $(el)

    const rawHref = $el.attr('href') || ''

    const title = $el.attr('title') || ''

    /**
     * 提取名称
     */
    let name = $el.find('tt').text() || $el.find('code').text() || $el.text()

    name = decodeHtml(name)

    if (!name) return

    /**
     * 清理异常文本
     */
    if (name.includes('拼音') || name.includes('英文')) {
      return
    }

    /**
     * 排除目录锚点
     */
    if (rawHref.startsWith('#') || rawHref.includes('#')) {
      return
    }

    /**
     * title 才是真实路径
     */
    let href = title.trim()

    if (!href) {
      return
    }

    if (href.includes(' ')) {
      href = href.substring(0, href.lastIndexOf(' '))
    }

    if (!href.endsWith('.html')) {
      href += '.html'
    }

    if (!href.startsWith(`${prefix}/`)) {
      href = `${prefix}/${href}`
    }

    if (!href.startsWith('c/') && !href.startsWith('cpp/')) {
      return
    }

    const isFunction = name.includes('()')

    const isTemplate = name.includes('<')

    const category = isFunction ? 'function' : isTemplate ? 'template' : 'type'

    const letterMatch = name.match(/[a-zA-Z]/)

    const letter = letterMatch ? letterMatch[0].toUpperCase() : '#'

    entries.push({
      name,

      path: href,

      title,

      category,

      letter
    })
  })
}

/**
 * 主入口
 */

parseFile(join(publicRoot, 'cpp/index.html'), 'cpp')

parseFile(join(publicRoot, 'c/index.html'), 'c')

parseFile(join(publicRoot, 'cpp/symbol_index.html'), 'cpp')

parseFile(join(publicRoot, 'c/symbol_index.html'), 'c')

/**
 * 子目录
 */

const cppSubDir = join(publicRoot, 'cpp/symbol_index')

if (existsSync(cppSubDir)) {
  const files = readdirSync(cppSubDir).filter(f => f.endsWith('.html'))

  for (const file of files) {
    parseFile(join(cppSubDir, file), 'cpp')
  }
}

/**
 * 去重
 */

const map = new Map()

for (const item of entries) {
  const key = `${item.name}-${item.path}`

  if (!map.has(key)) {
    map.set(key, item)
  }
}

const uniqueEntries = Array.from(map.values())

/**
 * 输出 JSON
 */

const output = {
  generated: new Date().toISOString(),

  count: uniqueEntries.length,

  entries: uniqueEntries
}

const outputPath = join(root, 'public/reference-index.json')

const json = JSON.stringify(output, null, 2)

writeFileSync(outputPath, json, 'utf-8')

console.log(`✓ Generated ${uniqueEntries.length} entries`)

console.log(`Size ${(json.length / 1024).toFixed(0)}KB`)

const stats = {
  function: uniqueEntries.filter(e => e.category === 'function').length,

  template: uniqueEntries.filter(e => e.category === 'template').length,

  type: uniqueEntries.filter(e => e.category === 'type').length,

  cpp: uniqueEntries.filter(e => e.path.startsWith('cpp/')).length,

  c: uniqueEntries.filter(e => e.path.startsWith('c/')).length
}

console.log(stats)
