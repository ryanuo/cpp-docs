# C++20 概念

**概念**（Concepts）是 C++20 引入的语法，用于在编译期对模板参数施加约束。它让模板接口更清晰、错误信息更友好、重载选择更精确。

## 基本语法

概念是一个编译期谓词，返回布尔值：

```cpp
template <typename T>
concept Integral = std::is_integral_v<T>;

template <typename T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::convertible_to<T>;
};
```

使用方式：

```cpp
// 方式一：在模板参数列表中直接声明
template <std::integral T>
T add(T a, T b) { return a + b; }

// 方式二：使用 requires 子句
template <typename T>
    requires Addable<T>
T add(T a, T b) { return a + b; }

// 方式三：在 auto 约束中使用
auto add(std::integral auto a, std::integral auto b) { return a + b; }
```

## 为什么需要概念

### 1. 更好的错误信息

没有概念时，错误的模板参数会导致几十行嵌套错误信息。有概念时，编译器直接告诉你：

```
error: constraint 'Integral<float>' not satisfied
```

### 2. 区分重载

```cpp
template <std::integral T>
void process(T x) { /* 处理整数 */ }

template <std::floating_point T>
void process(T x) { /* 处理浮点 */ }
```

没有概念时，两个模板参数都是 `typename T`，无法编译。

## 标准库提供的概念

C++20 标准库 `<concepts>` 头文件提供了许多现成概念：

| 概念 | 含义 |
|------|------|
| `std::integral<T>` | T 是整数类型 |
| `std::floating_point<T>` | T 是浮点类型 |
| `std::signed_integral<T>` | T 是有符号整数 |
| `std::unsigned_integral<T>` | T 是无符号整数 |
| `std::movable<T>` | T 可以移动 |
| `std::copyable<T>` | T 可以复制 |
| `std::default_initializable<T>` | T 可以默认初始化 |
| `std::equality_comparable<T>` | 支持 `==` 和 `!=` |
| `std::totally_ordered<T>` | 支持完整的比较运算 |
| `std::regular<T>` | 可复制、默认初始化、可比较 |
| `std::invocable<T, Args...>` | 可以用 Args 调用 T |
| `std::predicate<F, Args...>` | 调用结果可转为 bool |

不需要手写，直接复用标准概念即可。

## 概念与 SFINAE

在概念出现之前，约束模板参数常用 **SFINAE**（Substitution Failure Is Not An Error）：

```cpp
template <typename T, typename = std::enable_if_t<std::is_integral_v<T>>>
void foo(T x);
```

SFINAE 代码难以理解和维护。概念替代了这种写法，更加直观：

```cpp
template <std::integral T>
void foo(T x);
```

两者编译期行为相同，但概念是官方推荐的现代写法。
