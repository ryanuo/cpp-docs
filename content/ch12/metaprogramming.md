# 模板元编程

**模板元编程**（Template Metaprogramming，TMP）是一种利用模板在编译期进行计算和代码生成的技术。它把模板参数当作"输入"，把实例化结果当作"输出"。

## 编译期计算

### 最简单的例子：编译期阶乘

```cpp
template <unsigned N>
struct Factorial {
    static constexpr unsigned value = N * Factorial<N - 1>::value;
};

template <>
struct Factorial<0> {
    static constexpr unsigned value = 1;
};

static_assert(Factorial<5>::value == 120);
static_assert(Factorial<0>::value == 1);
```

编译器在展开 `Factorial<5>` 时，会递归实例化 `Factorial<4>`、`Factorial<3>`... 直到 `Factorial<0>`，每层都计算一次乘法。最终结果完全在编译期确定。

### C++14/17/20 的改进

C++14 放宽了 `constexpr` 函数的限制，直接写函数即可：

```cpp
constexpr unsigned factorial(unsigned n) {
    unsigned result = 1;
    for (unsigned i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}

static_assert(factorial(5) == 120);
```

C++20 更进一步，`constexpr` 函数甚至可以动态分配内存。

建议优先使用 `constexpr` 函数做编译期计算，仅在需要类型推导和条件分支时才用模板递归。

## 编译期分支

### `if constexpr`

C++17 引入的 `if constexpr` 让编译期分支更简洁：

```cpp
template <typename T>
std::string toString(const T& x) {
    if constexpr (std::is_same_v<T, std::string>) {
        return x;
    } else if constexpr (std::is_integral_v<T>) {
        return std::to_string(x);
    } else {
        return "unsupported";
    }
}
```

编译器只会实例化满足条件的那个分支，其他分支直接被丢弃。这替代了传统的模板特化和 SFINAE。

### `std::conditional` 和 `std::enable_if`

C++11/14 常用这些类型萃取工具：

```cpp
// 根据条件选择类型
template <bool B, typename T, typename F>
using conditional_t = typename std::conditional<B, T, F>::type;

using Number = conditional_t<true, int, double>; // int
```

对于条件存在性的分支，仍需要 `std::enable_if`：

```cpp
template <typename T>
std::enable_if_t<std::is_integral_v<T>, bool> is_odd(T n) {
    return n % 2 != 0;
}
```

## 类型萃取

模板元编程最常见的用途是萃取类型信息：

```cpp
// 判断是否为指针类型
template <typename T>
struct is_pointer { static constexpr bool value = false; };

template <typename T>
struct is_pointer<T*> { static constexpr bool value = true; };

template <typename T>
constexpr bool is_pointer_v = is_pointer<T>::value;

static_assert(is_pointer_v<int*>);
static_assert(!is_pointer_v<int>);
```

标准库 `<type_traits>` 提供了完整的类型萃取工具，包括：

- 类型判断：`is_integral`、`is_pointer`、`is_reference`、`is_const` 等
- 类型转换：`remove_const`、`remove_pointer`、`add_lvalue_reference` 等
- 条件选择：`conditional`、`enable_if`、`void_t` 等

## 可变参数模板与折叠表达式

C++11 的可变参数模板让元编程更灵活：

```cpp
// 编译期求和
template <auto... Vs>
constexpr auto sum = (Vs + ...); // C++17 折叠表达式

static_assert(sum<1, 2, 3, 4, 5> == 15);
```

C++17 的折叠表达式让参数包处理更简洁：

```cpp
// 编译期打印所有参数
template <typename... Args>
void printAll(const Args&... args) {
    (std::cout << ... << args) << '\n';
}
```

## 总结

模板元编程的核心思想是：**把计算从运行时转移到编译期**。

现代 C++ 中，优先使用：
- `constexpr` 函数做编译期计算
- `if constexpr` 做编译期分支
- 概念做模板参数约束
- 标准库 `<type_traits>` 做类型萃取

模板递归和 SFINAE 仅在必要时使用。
