# MyCppTutorial → cpp-docs 迁移计划

## 1. 项目对比

| 维度 | MyCppTutorial (源) | cpp-docs (目标) |
|------|-------------------|-----------------|
| 框架 | VuePress 2 + Vite | Nuxt 4 + Nuxt Content 3 |
| 内容格式 | Markdown (200 文件) | Markdown + MDC |
| 路由 | 基于 dir 的 sidebar.yml | 基于文件路径 [...slug].vue |
| 导航 | plugins/sidebar 生成 | .navigation.yml 文件 |
| 数学公式 | KaTeX (mdEnhance) | KaTeX (@nuxtjs/mdc) |
| 代码高亮 | Prism.js | Shiki (Nuxt Content 内置) |
| 流程图 | mermaid (mdEnhance) | mermaid (Nuxt Content 内置) |
| 暗色模式 | 无 | 内置 |
| 搜索 | Docsearch | 内置全文搜索 |

## 2. 源项目自定义插件分析

| 插件 | 功能 | 使用频次 | 迁移难度 |
|------|------|----------|----------|
| **codemo** | C++ 可运行代码块（编译/运行按钮、行聚焦、输入参数） | ~150+ 处 | ⚠️ 高 |
| **sdsc** | 语法描述块（`@文本@` 彩色语法图） | ~80+ 处 | ⚠️ 高 |
| **io-block** | 程序输入/输出示例（¶↵ 标记） | ~50+ 处 | 中 |
| **autolinker** | 自动链接 | 全局 | 低 |
| **sidebar** | 侧边栏生成 | 全局 | 低 |
| **container** | tip/warning/danger 提示 | ~20 处 | 低 |

## 3. 迁移计划

### 第一阶段：基础设施搭建

#### 1.1 创建内容目录结构
```
content/
├── index.md                    # 首页
├── preface.md                  # 前言
├── postscript.md               # 后记
├── technical_info.md           # 技术信息
├── ch00/
│   ├── .navigation.yml         # 章节导航
│   ├── README.md
│   ├── computer.md
│   ├── programming.md
│   └── programming_language.md
├── ch01/
│   ├── .navigation.yml
│   ├── README.md
│   ├── first_program.md
│   └── ...
├── ... (ch00-ch12 + appendix)
```

#### 1.2 Frontmatter 转换规则

VuePress 示例：
```yaml
---
home: true
title: 首页
---
```

Nuxt Content 示例：
```yaml
---
title: 首页
description: 谷雨同学的 C++ 教程
navigation:
  icon: i-lucide-house
---
```

转换规则：
- `home: true` → 移到 content/index.md
- `title` → 保持
- 添加 `description`（取首段内容或手动编写）
- 添加 `navigation.icon`（根据章节分配 Lucide 图标）

#### 1.3 导航文件 (.navigation.yml) 生成

每个包含子章节的目录都需要一个 `.navigation.yml`：

```yaml
# content/ch01/.navigation.yml
title: 第一章 感性认识 C++ 程序
icon: i-lucide-book-open
```

### 第二阶段：内容文件迁移（200 个文件）

#### 2.1 批量复制 + Frontmatter 注入

使用脚本批量处理：
1. 复制 MyCppTutorial/src/**/*.md → content/**/*.md
2. 为每个文件添加/转换 frontmatter
3. 文件重命名：README.md → index.md（Nuxt Content 约定）

#### 2.2 内部链接转换

| 源格式 | 目标格式 |
|--------|----------|
| `](../ch01/first_program)` | `](/ch01/first_program)` |
| `](../ch01/first_program.md#函数调用)` | `](/ch01/first_program#函数调用)` |
| `](./first_program.md)` | `](/ch01/first_program)` |

### 第三阶段：自定义语法适配

#### 3.1 codemo 块处理（最高难度）

源格式：
````markdown
```cpp codemo(focus=3-5,input=hello_world)
#include <iostream>
int main() {
    std::cout << "Hello" << std::endl;  // codemo focus-next-line
}
```
````

Nuxt Content 没有内置 codemo 功能，需要选择方案：

**方案 A：降级为普通代码块**
- 最快速，丢失交互功能
- 保留代码高亮
- 后续可逐步添加回可运行功能

**方案 B：创建自定义 Vue 组件**
- 创建 `app/components/content/Codemo.vue`
- 使用 MDC 语法：`:::codemo{lang="cpp" focus="3-5" input="hello_world"}`
- 需要实现：
  - 代码高亮（Shiki）
  - 行聚焦
  - 模拟终端输出（显示预设结果）
  - 可选：集成在线编译器 API

**方案 C：使用第三方服务**
- 集成 Compiler Explorer API
- 或嵌入 Godbolt

**推荐**：阶段一用方案 A 快速迁移，阶段二实现方案 B 的核心功能。

#### 3.2 sdsc 语法描述块处理

源格式：
````markdown
```sdsc
返回值类型 函数名"("[形参列表]")"
    复合语句
```
````

Nuxt Content 无内置支持，需自定义：

**方案**：创建 `app/components/content/SdscBlock.vue`
- 使用 MDC 语法：`:::sdsc`
- 解析语法描述格式（`@文本@` 表示参数位置）
- 渲染为带样式的语法图（保留原项目的彩色高亮）

处理 `@文本@` 内联语法（行内代码）：
- 源格式：`` @函数名@ ``
- 目标：高亮渲染为语法标记

#### 3.3 io-block 处理

源格式：
````markdown
```io
¶ 输入内容
↵ 输出内容
```
````

**方案**：创建 `app/components/content/IoBlock.vue`
- 使用 MDC 语法：`:::io-block`
- 解析 ¶（输入）和 ↵（输出）标记
- 渲染为输入/输出对比样式

#### 3.4 tip/warning/danger 容器处理

源格式：
```markdown
> 提示内容
```

VuePress container 与 Nuxt Content callout 语法不同：

**方案**：转换为 Nuxt Content callout 语法
```markdown
::callout{icon="i-lucide-lightbulb"}
提示内容
::
```

或直接使用 tip 别名：
```markdown
> [!NOTE] 提示内容
```

### 第四阶段：样式与组件适配

#### 4.1 代码块样式
- Nuxt Content 使用 Shiki，默认主题配色
- 需要配置暗色/亮色双主题
- 行高亮、行号通过 Shiki transformers 实现

#### 4.2 数学公式样式
- Nuxt Content 通过 @nuxtjs/mdc 支持 KaTeX
- 需确认容器样式兼容（行内公式、行间公式）

#### 4.3 自定义组件注册
- 所有 `app/components/content/` 目录下的组件自动注册为 MDC 组件
- 全局组件在 `app/components/` 下自动导入

### 第五阶段：首页与导航重写

#### 5.1 首页
- 从 `src/README.md` 迁移
- 重写 hero 区域为 Nuxt UI 风格
- 保留 C++ 特色

#### 5.2 侧边栏
- 从 sidebar.yml 生成各目录的 .navigation.yml
- 导航结构保持不变
- 添加图标（Lucide）

### 第六阶段：验证与优化

1. **构建验证**：`pnpm build` 无错误
2. **内容完整性**：200 文件全部渲染
3. **链接检查**：内部链接、锚点正确
4. **样式检查**：代码高亮、数学公式、暗色模式
5. **性能检查**：Lighthouse 评分、构建时间

## 4. 迁移优先级（推荐顺序）

| 优先级 | 任务 | 工作量 | 依赖 |
|--------|------|--------|------|
| P0 | 目录结构设计 + frontmatter 模板 | 0.5h | 无 |
| P1 | 200 文件批量复制 + 基础转换 | 2h | P0 |
| P2 | frontmatter 批量生成（title/description/icon） | 1h | P1 |
| P3 | .navigation.yml 批量生成 | 1h | P1 |
| P4 | codemo 降级或组件实现 | 4-8h | P1 |
| P5 | sdsc 组件实现 | 3-4h | P1 |
| P6 | io-block 组件实现 | 2h | P1 |
| P7 | tip/warning/danger 转换 | 0.5h | P1 |
| P8 | 内部链接批量转换 | 1h | P1 |
| P9 | 首页重写 | 1h | P0 |
| P10 | 样式调整 + 暗色模式适配 | 2h | 全部 |
| P11 | 构建验证 + 内容检查 | 1h | 全部 |

## 5. 风险与注意事项

1. **codemo 功能丢失**：源项目的在线编译/运行功能在 Nuxt 中需要重新实现或放弃
2. **sdsc 语法图的精确还原**：自定义解析需要完整兼容原项目的语法格式
3. **数学公式边缘情况**：部分复杂公式可能需要手动调整
4. **SEO 影响**：URL 结构变化可能影响搜索引擎排名（如部署上线）
5. **图片/静态资源**：检查是否有本地图片需要迁移

## 6. 建议执行方式

1. **先做一个章节的完整迁移**（如 ch00）：
   - 完成该章节所有文件的完整转换
   - 验证所有自定义组件工作正常
   - 确认样式和导航正确

2. **再批量迁移剩余章节**：
   - 基于 ch00 验证过的模板
   - 使用脚本批量处理
   - 人工检查特殊格式

3. **最后全局优化**：
   - 样式微调
   - 性能优化
   - 搜索配置
