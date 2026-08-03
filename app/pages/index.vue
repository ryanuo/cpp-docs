<script setup lang="ts">
const title = 'C++ 教程'
const description = '一份循序渐进、面向初学者的 C++ 语法教程。从基本概念到现代 C++ 编程，带你系统掌握 C++。'

useSeoMeta({
  titleTemplate: '',
  title,
  description
})

const chapters = [
  { icon: 'i-lucide-code', title: '第一章 感性认识 C++ 程序', to: '/ch01', desc: '第一个 C++ 程序、输出和输入的初步认识。' },
  { icon: 'i-lucide-layers', title: '第二章 理性认识 C++ 程序', to: '/ch02', desc: '数据类型、运算符和控制语句的深入讲解。' },
  { icon: 'i-lucide-square-function', title: '第三章 过程式编程', to: '/ch03', desc: '函数的定义、声明、调用和递归思想。' },
  { icon: 'i-lucide-box', title: '第四章 POD 类型与结构', to: '/ch04', desc: '数组、指针、结构体和链表等基础数据结构。' },
  { icon: 'i-lucide-copy', title: '第五章 初探面向对象', to: '/ch05', desc: '构造函数、拷贝控制和运算符重载入门。' },
  { icon: 'i-lucide-component', title: '第六章 运算符重载', to: '/ch06', desc: '运算符重载的语法和应用。' },
  { icon: 'i-lucide-git-branch', title: '第七章 继承与多态', to: '/ch07', desc: '面向对象的核心：继承、虚函数和多态。' },
  { icon: 'i-lucide-layout-template', title: '第八章 模板基础', to: '/ch08', desc: '函数模板、类模板和 STL 容器迭代器。' },
  { icon: 'i-lucide-link', title: '第九章 链接', to: '/ch09', desc: '编译器、链接器和 Makefile 的使用。' },
  { icon: 'i-lucide-hard-drive', title: '第十章 常用库介绍', to: '/ch10', desc: '文件读写、随机数、智能指针和代数数据类型。' },
  { icon: 'i-lucide-sparkles', title: '第十一章 函数式编程', to: '/ch11', desc: 'Lambda 表达式、闭包和 STL 算法。' },
  { icon: 'i-lucide-git-fork', title: '第十二章 模板进阶', to: '/ch12', desc: '偏特化、定制点、概念与模板元编程。' }
]
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-16">
    <div class="text-center mb-16">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-medium mb-6"
      >
        <UIcon name="i-lucide-sparkles" />
        C++2b 标准
      </div>
      <h1 class="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {{ title }}
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        {{ description }}
      </p>
    </div>

    <div class="mb-12">
      <a
        href="/reference/zh"
        class="flex items-center justify-between p-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-book-open"
            class="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
          />
          <div>
            <div class="font-semibold text-blue-900 dark:text-blue-100">C++ 参考手册</div>
            <div class="text-sm text-blue-700 dark:text-blue-300 mt-1">离线版 cppreference.com 文档，涵盖 C++ 标准库完整参考。</div>
          </div>
        </div>
        <UIcon
          name="i-lucide-arrow-right"
          class="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
        />
      </a>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
      <NuxtLink
        v-for="ch in chapters"
        :key="ch.to"
        :to="ch.to"
        class="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors"
      >
        <UIcon
          :name="ch.icon"
          class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0"
        />
        <div>
          <div class="font-medium text-gray-900 dark:text-white">{{ ch.title }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ ch.desc }}</div>
        </div>
      </NuxtLink>
    </div>

    <div class="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
      <UIcon
        name="i-lucide-info"
        class="w-5 h-5 shrink-0 mt-0.5"
      />
      <p class="text-sm">
        这份教程基于 <strong>C++2b</strong> 标准编写。建议使用支持 C++11 或更高版本的编译器。
      </p>
    </div>
  </div>
</template>
