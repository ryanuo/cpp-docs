<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const route = useRoute()
const router = useRouter()

function scrollToActiveNav() {
  if (typeof document === 'undefined') return

  const navAside = document.querySelector('aside')
  if (!navAside) return

  // Find active link by href match or active class
  const activeLink = navAside.querySelector(`a[href="${route.path}"]`)
    || navAside.querySelector('a.text-primary-500')
    || navAside.querySelector('a[class*="text-primary"]')

  if (activeLink) {
    const container = activeLink.closest('aside') as HTMLElement
    if (container) {
      const containerTop = container.offsetTop
      const itemTop = (activeLink as HTMLElement).offsetTop
      container.scrollTo({
        top: itemTop - containerTop - 100,
        behavior: 'smooth'
      })
    }
  }
}

// After each route change, scroll nav
router.afterEach(() => {
  setTimeout(scrollToActiveNav, 50)
})

// Initial scroll
onMounted(() => {
  setTimeout(scrollToActiveNav, 100)
})
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UContentNavigation
            highlight
            :navigation="navigation"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
