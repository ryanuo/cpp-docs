# 类型擦除

**类型擦除**（Type erasure）是一种技术：把多种具体类型包装成统一的接口，从而在使用端忽略底层类型差异。它实现了“不依赖虚函数”的多态。

## 典型例子：`std::function`

```cpp
#include <functional>
#include <iostream>

void lambda_call() {
    std::function<int(int, int)> op;

    op = [](int a, int b) { return a + b; };
    std::cout << op(1, 2); // 3

    op = [](int a, int b) { return a * b; };
    std::cout << op(1, 2); // 2
}
```

`std::function` 内部可以存储普通函数、Lambda、函数对象、成员函数等，但对外暴露统一接口。它通常通过虚函数或函数指针实现，是运行时类型擦除。

## 手动实现一个简单的类型擦除

```cpp
class Animal {
    struct Concept {
        virtual ~Concept() = default;
        virtual void speak() const = 0;
    };

    template <typename T>
    struct Model : Concept {
        T data;
        Model(T d) : data(std::move(d)) {}
        void speak() const override { data.speak(); }
    };

    std::unique_ptr<Concept> p;

public:
    template <typename T>
    Animal(T x) : p(std::make_unique<Model<T>>(std::move(x))) {}

    void speak() const { p->speak(); }
};

struct Cat { void speak() const { std::cout << "喵\n"; } };
struct Dog { void speak() const { std::cout << "汪\n"; } };

Animal a = Cat{};
Animal b = Dog{};
a.speak(); // 喵
b.speak(); // 汪
```

这里用了一个内部虚基类 `Concept` 和模板派生类 `Model`。外部接口 `Animal` 不暴露具体类型，因此实现了类型擦除。

## 与模板静态多态的区别

| 特性 | 类型擦除 | 模板静态多态 |
|------|----------|--------------|
| 类型信息 | 运行时隐藏 | 编译期确定 |
| 容器内混合类型 | 可以（如 `std::vector<Animal>`） | 不行（除非手动擦除） |
| 开销 | 通常有堆分配和虚调用 | 零开销 |

类型擦除牺牲了部分性能，换取了运行时的灵活性。标准库中的 `std::any`、`std::function`、多态分配器都是典型应用。
