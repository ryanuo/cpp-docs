<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const route = useRoute()

const scrollActiveIntoView = () => {
  setTimeout(() => {
    const navContainer = document.querySelector('[data-content-navigation]')
    const activeItem = navContainer?.querySelector('[data-active="true"]')
    if (activeItem && navContainer) {
      const containerRect = navContainer.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()
      const isVisible = itemRect.top >= containerRect.top && itemRect.bottom <= containerRect.bottom
      if (!isVisible) {
        activeItem.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, 50)
}

onMounted(scrollActiveIntoView)
watch(() => route.path, scrollActiveIntoView)
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
