# 定制点

**定制点**（Customization Point）是指用户可以为算法或库提供自定义行为的接口。C++ 中常见的实现方式有：函数重载、ADL 和 C++20 的 Customization Point Object（CPO）。

## 通过重载和 ADL

考虑一个简单的 `swap` 实现：

```cpp
namespace my {
    template <typename T>
    void swap(T& a, T& b) {
        T tmp = std::move(a);
        a = std::move(b);
        b = std::move(tmp);
    }
}

namespace user {
    struct Widget { int* data; };

    void swap(Widget& a, Widget& b) noexcept {
        using std::swap;
        swap(a.data, b.data);
    }
}

user::Widget w1, w2;
my::swap(w1, w2); // 错误：不会找到 user::swap
```

上面的写法不会找到用户自定义的 `swap`，因为 `my::swap` 只在自己的作用域查找。

正确的做法是使用 ADL，把 `swap` 定义在被操作类型相同的作用域中，并调用时加上 `using std::swap;`：

```cpp
namespace user {
    struct Widget { int* data; };

    void swap(Widget& a, Widget& b) noexcept {
        using std::swap;
        swap(a.data, b.data);
    }
}

user::Widget w1, w2;
using std::swap;
swap(w1, w2); // ADL 找到 user::swap
```

## 什么是定制点

由于 ADL 和重载规则比较复杂，C++ 社区把这类“可以被用户自定义的函数”称为**定制点**。例如 `std::swap`、`std::begin`、`std::end` 都是标准库中的定制点。

C++20 引入了 **Customization Point Object**（CPO），通过一个函数对象来统一调用规则，避免 ADL 陷阱。例如 `std::ranges::swap` 就是一个 CPO。

```cpp
#include <utility>

user::Widget w1, w2;
std::ranges::swap(w1, w2); // 自动处理 ADL 和默认实现
```

设计自己的库时，如果允许用户自定义行为，最好把相关函数定义在用户类型所在命名空间，或者使用 CPO 风格。
