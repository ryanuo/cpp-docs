# 静态派发

派发（Dispatch）指决定调用哪个函数或代码路径的机制。

- **动态派发**（Dynamic dispatch）：运行时通过虚表选择函数，如虚函数。
- **静态派发**（Static dispatch）：编译期确定调用目标，没有运行时开销。

模板是 C++ 实现静态派发的主要手段。

## 示例：通过模板实现静态多态

```cpp
template <typename Derived>
struct Base {
    void interface() {
        static_cast<Derived*>(this)->implementation();
    }
};

struct A : Base<A> {
    void implementation() { std::cout << "A\n"; }
};

struct B : Base<B> {
    void implementation() { std::cout << "B\n"; }
};

A a; a.interface(); // 输出 A
B b; b.interface(); // 输出 B
```

这种模式称为 **CRTP**（Curiously Recurring Template Pattern，奇异递归模板模式）。它让派生类在编译期就确定基类行为，避免了虚函数开销。

## 与动态派发的对比

| 特性 | 动态派发 | 静态派发 |
|------|----------|----------|
| 决策时机 | 运行时 | 编译期 |
| 开销 | 虚表指针 + 间接调用 | 无额外开销 |
| 灵活性 | 运行时替换对象 | 类型在编译期确定 |
| 典型应用 | 运行时多态 | 泛型算法、类型萃取 |

静态派发更适合性能敏感或类型完全确定的场景。
