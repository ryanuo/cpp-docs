# 模板特化与偏特化

模板特化（Template specialization）是指为模板参数提供一套专门的实现。它分为两种：

- **完全特化**（Full specialization）：所有模板参数都被指定为具体类型/值。
- **偏特化**（Partial specialization）：只约束部分模板参数，剩余参数仍由用户指定。

## 完全特化

以类模板为例：

```cpp
template <typename T>
struct Traits {
    static constexpr bool is_pointer = false;
};

// 完全特化：T 为 int* 时
template <>
struct Traits<int*> {
    static constexpr bool is_pointer = true;
};
```

函数模板也可以完全特化，但通常更推荐重载：

```cpp
template <typename T>
void print(const T& x) { std::cout << x; }

template <>
void print<bool>(const bool& x) { std::cout << (x ? "true" : "false"); }
```

## 偏特化

类模板支持偏特化：

```cpp
template <typename T, typename U>
struct SameType {
    static constexpr bool value = false;
};

// 当两个参数相同时匹配
template <typename T>
struct SameType<T, T> {
    static constexpr bool value = true;
};

static_assert(SameType<int, int>::value);
static_assert(!SameType<int, double>::value);
```

指针偏特化也很常见：

```cpp
template <typename T>
struct RemovePointer {
    using type = T;
};

template <typename T>
struct RemovePointer<T*> {
    using type = T;
};

static_assert(std::is_same_v<RemovePointer<int*>::type, int>);
```

## 函数模板没有偏特化

C++ 不允许函数模板偏特化。遇到类似需求时，通常使用**重载**或**标签派发**（tag dispatch）。

```cpp
// 错误：函数模板不能偏特化
template <typename T>
void foo(T* p);      // 这是重载，不是偏特化
```

偏特化是静态派发的重要工具，在标准库的类型萃取（type traits）中大量使用。
