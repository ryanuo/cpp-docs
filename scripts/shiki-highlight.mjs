import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { createHighlighter } from 'shiki'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicRoot = join(root, 'public/reference/zh')

const BATCH = 200

const SHIKI_CSS = `
.shiki{overflow-x:auto;padding:0.5em;border-radius:0.25em;font-size:0.875em;line-height:1.5}
.shiki,.shiki span{color:var(--shiki-dark);background-color:var(--shiki-dark-bg)}
.shiki .line{display:inline-block;width:100%}
@media (prefers-color-scheme:light){
  .shiki,.shiki span{color:var(--shiki-light);background-color:var(--shiki-light-bg)}
}
`

async function main() {
  const highlighter = await createHighlighter({
    themes: ['dark-plus', 'light-plus'],
    langs: ['cpp', 'c']
  })

  function walk(dir) {
    const out = []
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      const s = statSync(p)
      if (s.isDirectory()) out.push(...walk(p))
      else if (name.endsWith('.html')) out.push(p)
    }
    return out
  }

  const files = walk(publicRoot)
  console.log(`Found ${files.length} HTML files`)

  let totalBlocks = 0
  let processed = 0

  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH)
    await Promise.all(batch.map(processFile))
    processed += batch.length
    console.log(`  ${processed}/${files.length}`)
  }

  async function processFile(filePath) {
    const html = readFileSync(filePath, 'utf-8')
    const $ = cheerio.load(html)
    let changed = false

    $('div.mw-highlight').each((_, el) => {
      const $el = $(el)
      const lang = $el.attr('class').match(/mw-highlight-lang-(\w+)/)?.[1]
      if (!lang) return

      const $pre = $el.find('pre')
      if (!$pre.length) return

      const code = $pre.text()
      if (!code.trim()) return

      try {
        const result = highlighter.codeToHtml(code, {
          lang,
          themes: { dark: 'dark-plus', light: 'light-plus' },
          defaultColor: false
        })
        $pre.replaceWith(result)
        // 移除 mw-highlight 相关类，防止运行时 pygments 重复处理
        $el.removeClass((_, className) => (className.match(/mw-highlight[^\s]*/g) || []).join(' '))
        changed = true
        totalBlocks++
      } catch {
        // skip
      }
    })

    if (changed) {
      const $existing = $('head style[data-shiki]')
      if ($existing.length) {
        $existing.replaceWith(`<style data-shiki>${SHIKI_CSS}</style>`)
      } else {
        $('head').append(`<style data-shiki>${SHIKI_CSS}</style>`)
      }
      writeFileSync(filePath, $.html(), 'utf-8')
    }
  }

  console.log(`Done. Highlighted ${totalBlocks} blocks.`)
}

main().catch(console.error)
