<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useReferenceSearch } from '~/composables/useReferenceSearch'

const {
  isLoading,
  error,
  query,
  activeCategory,
  results,
  loadIndex,
  setQuery,
  setCategory
} = useReferenceSearch()

const modalOpen = ref(false)
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const loaded = ref(false)

const categories = [
  { value: 'all', label: '全部', icon: 'i-lucide-code' },
  { value: 'function', label: '函数', icon: 'i-lucide-function-square' },
  { value: 'type', label: '类型', icon: 'i-lucide-box' }
]

const categoryMap = {
  function: '函数',
  template: '模板',
  type: '类型'
} as Record<string, string>

function getCategoryColor(category: string) {
  switch (category) {
    case 'function': return 'primary'
    case 'template': return 'secondary'
    case 'type': return 'success'
    default: return 'neutral'
  }
}

async function openModal() {
  modalOpen.value = true

  if (!loaded.value) {
    await loadIndex()
    loaded.value = true
  }

  await nextTick()
  inputRef.value?.focus()
}

function closeModal() {
  modalOpen.value = false
  setQuery('')
  selectedIndex.value = 0
}

function handleSearchInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  setQuery(value)
  selectedIndex.value = 0
}

function scrollToSelected() {
  nextTick(() => {
    const items = listRef.value?.querySelectorAll('.search-result-item')
    const item = items?.[selectedIndex.value]
    item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

declare global {
  interface Window {
    __referenceNavigate?: (path: string) => void
  }
}

function goToResult(index: number) {
  const entry = results.value[index]
  if (!entry) return
  const path = `/reference/zh/${entry.path}`

  if (typeof window !== 'undefined' && window.__referenceNavigate) {
    window.__referenceNavigate(path)
  } else {
    navigateTo(`/reference#${path}`)
  }
  closeModal()
}

function handleKeydown(e: KeyboardEvent) {
  if (!modalOpen.value) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
      e.preventDefault()
      openModal()
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      if (results.value.length === 0) return
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      scrollToSelected()
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      scrollToSelected()
      break
    case 'Enter':
      e.preventDefault()
      goToResult(selectedIndex.value)
      break
    case 'Escape':
      e.preventDefault()
      closeModal()
      break
  }
}

watch(activeCategory, () => {
  selectedIndex.value = 0
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  open: openModal,
  close: closeModal,
  handleKeydown
})
</script>

<template>
  <div class="reference-search-wrapper">
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-lucide-search"
      class="items-center gap-2 cursor-pointer"
      @click="openModal"
    >
      <span class="hidden lg:inline text-sm text-gray-500 dark:text-gray-400">
        搜索手册
      </span>
      <div class="hidden lg:flex items-center gap-0.5">
        <UKbd size="sm">
          ⌘
        </UKbd>
        <UKbd size="sm">
          M
        </UKbd>
      </div>
    </UButton>

    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="bg-white dark:bg-gray-900 flex flex-col max-h-[70vh] rounded-xl">
          <div class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 px-4 py-3">
              <UIcon
                name="i-lucide-search"
                class="w-5 h-5 text-gray-400"
              />
              <input
                ref="inputRef"
                :value="query"
                type="text"
                placeholder="搜索函数、类、类型..."
                class="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
                @input="handleSearchInput"
              >
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-lucide-x"
                @click="closeModal"
              />
            </div>

            <div class="flex gap-1 px-4 pb-3">
              <UButton
                v-for="cat in categories"
                :key="cat.value"
                :variant="activeCategory === cat.value ? 'soft' : 'ghost'"
                :color="activeCategory === cat.value ? 'primary' : 'neutral'"
                size="sm"
                :icon="cat.icon"
                @click="setCategory(cat.value)"
              >
                {{ cat.label }}
              </UButton>
            </div>
          </div>

          <div
            ref="listRef"
            class="flex-1 overflow-y-auto search-results-list"
          >
            <div
              v-if="isLoading"
              class="flex flex-col items-center justify-center py-12 text-gray-500"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="w-6 h-6 animate-spin"
              />
              <p class="mt-2 text-sm">
                加载中...
              </p>
            </div>

            <div
              v-else-if="error"
              class="flex flex-col items-center justify-center py-12 text-gray-500"
            >
              <UIcon
                name="i-lucide-alert-circle"
                class="w-8 h-8"
              />
              <p class="mt-2 text-sm">
                {{ error }}
              </p>
            </div>

            <div
              v-else-if="!query"
              class="flex flex-col items-center justify-center py-12 text-gray-500"
            >
              <UIcon
                name="i-lucide-book-open"
                class="w-8 h-8"
              />
              <p class="mt-2 text-sm">
                输入关键词搜索 C++ 参考手册
              </p>
              <p class="mt-1 text-xs text-gray-400">
                支持函数名、类名、类型名
              </p>
            </div>

            <div
              v-else-if="results.length === 0"
              class="flex flex-col items-center justify-center py-12 text-gray-500"
            >
              <UIcon
                name="i-lucide-search-x"
                class="w-8 h-8"
              />
              <p class="mt-2 text-sm">
                未找到匹配的结果
              </p>
              <p class="mt-1 text-xs text-gray-400">
                试试其他关键词或调整分类
              </p>
            </div>

            <div
              v-else
              class="p-1"
            >
              <div
                v-for="(entry, index) in results"
                :key="entry.path"
                class="search-result-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                :class="index === selectedIndex ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
                @mouseenter="selectedIndex = index"
                @click="goToResult(index)"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="{
                    'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400': entry.category === 'function',
                    'bg-purple-100 dark:bg-purple-800/30 text-purple-600 dark:text-purple-400': entry.category === 'template',
                    'bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400': entry.category === 'type'
                  }"
                >
                  <UIcon
                    :name="entry.category === 'function' ? 'i-lucide-function-square' : entry.category === 'type' ? 'i-lucide-box' : 'i-lucide-layout-template'"
                    class="w-4 h-4"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ entry.name }}
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {{ entry.path }}
                  </div>
                </div>

                <UBadge
                  v-if="activeCategory === 'all'"
                  :color="getCategoryColor(entry.category)"
                  variant="subtle"
                  size="sm"
                  class="shrink-0"
                >
                  {{ categoryMap[entry.category] }}
                </UBadge>

                <UIcon
                  v-if="index === selectedIndex"
                  name="i-lucide-arrow-right"
                  class="w-4 h-4 text-green-600 dark:text-green-400 shrink-0"
                />
              </div>
            </div>
          </div>

          <div
            class="shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between text-xs text-gray-400"
          >
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <UKbd size="sm">↑</UKbd>
                <UKbd size="sm">↓</UKbd> 导航
              </span>
              <span class="flex items-center gap-1">
                <UKbd size="sm">↵</UKbd> 新窗口打开
              </span>
              <span class="flex items-center gap-1">
                <UKbd size="sm">esc</UKbd> 关闭
              </span>
            </div>
            <span>{{ results.length }} 个结果</span>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.reference-search-wrapper {
  display: contents;
}
</style>
