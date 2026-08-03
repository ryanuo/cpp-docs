import { ref, computed } from 'vue'
import { pinyin } from 'pinyin-pro'

export interface ReferenceEntry {
  name: string
  path: string
  title: string
  category: 'function' | 'template' | 'type'
  letter: string
}

interface IndexData {
  generated: string
  count: number
  entries: ReferenceEntry[]
}

let indexCache: IndexData | null = null

export function useReferenceSearch() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const query = ref('')
  const activeCategory = ref('all')

  async function loadIndex(): Promise<IndexData | null> {
    if (indexCache) return indexCache

    isLoading.value = true
    error.value = null

    try {
      const res = await fetch('/reference-index.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      indexCache = await res.json()
      return indexCache
    } catch (e) {
      error.value = 'Failed to load search index'
      console.error('[ReferenceSearch] Failed to load index:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取拼音首字母（英文直接小写）
  function getPinyinInitials(text: string): string {
    // 只取中文部分转拼音，英文保持原样
    const cleaned = text.replace(/[<>]/g, '').replace(/\(\)/g, '')
    const result = pinyin(cleaned, {
      pattern: 'first',
      toneType: 'none',
      type: 'array'
    })
    return result.join('').toLowerCase()
  }

  // 搜索逻辑
  const results = computed(() => {
    const q = query.value.toLowerCase().trim()
    if (!indexCache || !q) return []

    let entries = indexCache.entries

    // 分类筛选
    if (activeCategory.value !== 'all') {
      entries = entries.filter(e => e.category === activeCategory.value)
    }

    // 匹配并评分
    const scored = entries.map((entry) => {
      const nameLower = entry.name.toLowerCase()
      const initials = getPinyinInitials(entry.name)

      let score = 0

      // 精确匹配
      if (nameLower === q) {
        score = 100
      } else if (nameLower.startsWith(q)) {
        // 开头匹配
        score = 80
      } else if (nameLower.includes(q)) {
        // 包含匹配
        score = 60
      } else if (initials.includes(q)) {
        // 拼音首字母匹配
        score = 40
      } else {
        // 模糊匹配（跳字）
        let qi = 0
        for (let i = 0; i < nameLower.length && qi < q.length; i++) {
          if (nameLower[i] === q[qi]) qi++
        }
        if (qi === q.length) score = 20
      }

      return { entry, score }
    })

    // 过滤有分数的，按分数降序
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(item => item.entry)
  })

  function setQuery(q: string) {
    query.value = q
  }

  function setCategory(cat: string) {
    activeCategory.value = cat
  }

  return {
    isLoading,
    error,
    query,
    activeCategory,
    results,
    loadIndex,
    setQuery,
    setCategory
  }
}
