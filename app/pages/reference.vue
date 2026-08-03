<template>
  <div class="reference-page">
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      class="reference-iframe"
      title="C++ Reference"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      @load="onIframeLoad"
    />
  </div>
</template>

<script setup lang="ts">
declare global {
  interface Window {
    __referenceNavigate?: (path: string) => void
  }
}

useSeoMeta({
  title: 'C++ 参考手册'
})

const iframeRef = ref<HTMLIFrameElement | null>(null)
const iframeSrc = ref('/reference/zh')

// 默认首页
const DEFAULT_PAGE = '/reference/zh'

// 从 hash 中获取当前页面（兼容有/无 .html 后缀）
function getPageFromHash(): string {
  if (typeof window === 'undefined') return DEFAULT_PAGE
  const hash = window.location.hash.slice(1)
  if (hash.startsWith('/reference/zh/')) {
    // 自动补全 .html 后缀
    return hash.endsWith('.html') ? hash : `${hash}.html`
  }
  return DEFAULT_PAGE
}

function adjustIframeHeight() {
  if (!iframeRef.value) return
  const headerHeight = 64
  iframeRef.value.style.height = `${window.innerHeight - headerHeight}px`
}

// iframe 加载完成后，同步浏览器 URL hash
function onIframeLoad() {
  adjustIframeHeight()

  try {
    const iframeUrl = iframeRef.value?.contentWindow?.location.href
    if (iframeUrl) {
      const path = new URL(iframeUrl).pathname
      // 只更新 hash，不改变路径（保持 /reference 路由）
      if (path !== getPageFromHash()) {
        window.history.replaceState({ iframePath: path }, '', `#${path}`)
      }
    }
  } catch (e) {
    console.error(e)
    // CORS 安全限制，忽略
  }
}

// 供 ReferenceSearch 组件调用的方法：导航到指定页面
function navigateTo(path: string) {
  iframeSrc.value = path
  // 使用 hash 记录当前页面，保持 URL 路径为 /reference
  window.history.pushState({ iframePath: path }, '', `#${path}`)
}

// 暴露方法到全局，供 ReferenceSearch 调用
if (typeof window !== 'undefined') {
  window.__referenceNavigate = navigateTo
}

// 监听浏览器后退/前进
function onPopState(event: PopStateEvent) {
  if (event.state?.iframePath) {
    iframeSrc.value = event.state.iframePath
  } else {
    iframeSrc.value = getPageFromHash()
  }
}

// 初始化时从 hash 恢复
function init() {
  iframeSrc.value = getPageFromHash()
}

onMounted(() => {
  window.addEventListener('resize', adjustIframeHeight)
  window.addEventListener('popstate', onPopState)
  adjustIframeHeight()
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustIframeHeight)
  window.removeEventListener('popstate', onPopState)
})

// 客户端初始化
if (typeof window !== 'undefined') {
  init()
}
</script>

<style scoped>
.reference-page {
  width: 100%;
  margin: 0;
  padding: 0;
  padding-top: 1rem;
}

.reference-iframe {
  width: 100%;
  border: none;
  display: block;
  background: white;
}
</style>
