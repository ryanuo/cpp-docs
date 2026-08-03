# C++ 教程

[![Nuxt UI](https://img.shields.io/badge/Built%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![C++2b](https://img.shields.io/badge/Standard-C++2b-00599C?logo=cplusplus&logoColor=white)](https://isocpp.org/)

一份循序渐进、面向初学者的 C++ 语法教程，基于 C++2b 标准编写。

## 内容概览

- **第〇章 ~ 第四章**：C++ 基础语法（数据类型、运算符、控制语句、数组、指针、结构体）
- **第五章 ~ 第八章**：面向对象与模板（构造函数、继承、多态、函数模板、类模板、STL 容器）
- **第九 ~ 第十一章**：进阶主题（链接、文件读写、智能指针、Lambda 表达式、STL 算法）
- **附录**：运算符、关键字、预处理器和编码风格参考

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 参考手册（离线版）

本项目内置了 **cppreference.com 的中文离线文档**，包含完整的 C/C++ 标准库参考。

### 在线地址

`https://zh.cppreference.com`（[归档下载](https://zh.cppreference.com/Cppreference:Archives)）

### 离线使用方式

1. 从上方链接下载最新的 `cppreference-doxygen-*.tar.xz` 归档
2. 解压后将 `reference/zh/` 目录放到 `public/reference/` 下
3. 构建后访问 `/reference/zh/cpp.html` 即可离线浏览

### 目录结构

```
public/reference/
├── zh/
│   ├── cpp.html              # C++ 参考手册首页
│   ├── c.html                # C 参考手册首页
│   ├── symbol_index.html     # 符号索引
│   ├── cpp/                  # C++ 文档子页面
│   └── common/               # 公共资源（CSS/字体）
```

## 技术栈

- [Nuxt 4](https://nuxt.com) - Vue 全栈框架
- [Nuxt Content](https://content.nuxt.com) - Markdown 内容管理
- [Nuxt UI](https://ui.nuxt.com) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com) - 样式框架

## 许可

本项目仅用于学习交流。
