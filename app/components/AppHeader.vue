<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import ReferenceSearch from './ReferenceSearch.vue'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()

const searchRef = ref<InstanceType<typeof ReferenceSearch> | null>(null)

function handleKeydown(event: KeyboardEvent) {
  if (
    (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'm'
  ) {
    event.preventDefault()
    searchRef.value?.open()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <UHeader :ui="{
    center: 'flex-1'
  }" :to="header?.to || '/'">

    <!-- 左侧 -->
    <template v-if="header?.logo?.dark || header?.logo?.light || header?.title" #title>
      <UColorModeImage v-if="header?.logo?.dark || header?.logo?.light" :light="header?.logo?.light!"
        :dark="header?.logo?.dark!" :alt="header?.logo?.alt" class="h-6 w-auto shrink-0" />

      <span v-else-if="header?.title">
        {{ header.title }}
      </span>
    </template>

    <template v-else #left>
      <NuxtLink :to="header?.to || '/'" class="flex items-center gap-2">
        <img src="/logo.png" alt="C++ 教程" class="h-6 w-auto shrink-0" />

        <span class="font-semibold text-sm">
          C++ 教程
        </span>
      </NuxtLink>

      <TemplateMenu />
    </template>

    <!-- 中间区域 -->
    <div class="flex items-center gap-3 w-full">
      <ReferenceSearch ref="searchRef" class="flex-1" />

      <UContentSearchButton v-if="header?.search" :collapsed="false"
        class="flex-1 cursor-pointer text-gray-500 dark:text-gray-400" />
    </div>

    <!-- 右侧 -->
    <template #right>

      <UContentSearchButton v-if="header?.search" class="lg:hidden" />

      <UColorModeButton v-if="header?.colorMode" />

      <template v-if="header?.links">
        <UButton v-for="(link, index) of header.links" :key="index" v-bind="{
          color: 'neutral',
          variant: 'ghost',
          ...link
        }" />
      </template>

    </template>

    <!-- 移动端 -->
    <template #body>
      <UContentNavigation highlight :navigation="navigation" />
    </template>

  </UHeader>
</template>
