---
title: 运算符优先级和结合方向
description: "| 结合方向 | 优先级 | 运算符 | 名称 | 说明 | | --------------------- | ------ | ---------- |..."
navigation:
  icon: i-lucide-bookmark
---

# 运算符优先级和结合方向

| 结合方向              | 优先级 | 运算符     | 名称                   | 说明                                          |
| --------------------- | ------ | ---------- | ---------------------- | --------------------------------------------- |
| $\rarr$ <br> 从左向右 | 1      | `::`       | 作用域解析运算符       | [说明](/ch03/review_cpp)                 |
| ^^                    | 2      | `a++`      | 后缀自增运算符         | [说明](/ch02/part2/incdec_operator)      |
| ^^                    | ^^     | `a--`      | 后缀自减运算符         | [说明](/ch02/part2/incdec_operator)      |
| ^^                    | ^^     | `T()`      | 函数风格转型运算符     | [说明](/ch02/part2/other_operator)       |
| ^^                    | ^^     | `T{}`      | 列表风格转型运算符     | [说明](/ch06/cast_overload)              |
| ^^                    | ^^     | `a()`      | 函数调用运算符         | [说明](/ch03/function_definition)        |
| ^^                    | ^^     | `a[]`      | 下标运算符             | [说明](/ch04/array)                        |
| ^^                    | ^^     | `.`        | 成员运算符             | [说明](/ch04/struct/struct_usage)        |
| ^^                    | ^^     | `->`       | 指针成员运算符         | [说明](/ch04/list/list_construct)        |
| $\larr$ <br> 从右向左 | 3      | `++a`      | 前缀自增运算符         | [说明](/ch02/part2/incdec_operator)      |
| ^^                    | ^^     | `++a`      | 前缀自减运算符         | [说明](/ch02/part2/incdec_operator)      |
| ^^                    | ^^     | `+a`       | 一元加运算符           | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `-a`       | 一元减运算符           | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `!`        | 逻辑非运算符           | [说明](/ch02/part2/logical_operator)     |
| ^^                    | ^^     | `~`        | 取反运算符             | [说明](/ch02/part2/bit_operator)         |
| ^^                    | ^^     | `(T)`      | C 风格转型运算符       | [说明](/ch02/part2/other_operator)       |
| ^^                    | ^^     | `*a`       | 解地址运算符           | [说明](/ch04/pointer/pointer)            |
| ^^                    | ^^     | `&a`       | 取地址运算符           | [说明](/ch04/pointer/pointer)            |
| ^^                    | ^^     | `sizeof`   | sizeof 运算符          | [说明](/ch02/part2/other_operator)       |
| ^^                    | ^^     | `co_await` | await 运算符           | 敬请期待                                      |
| ^^                    | ^^     | `new`      | new 运算符             | [说明](/ch04/list/storage_duration)      |
| ^^                    | ^^     | `new T[]`  | new\[\] 运算符         | [说明](/ch04/list/arr_new_del)           |
| ^^                    | ^^     | `delete`   | delete 运算符          | [说明](/ch04/list/storage_duration)      |
| ^^                    | ^^     | `delete[]` | delete\[\] 运算符      | [说明](/ch04/list/arr_new_del)           |
| $\rarr$ <br> 从左向右 | 4      | `.*`       | 成员指针运算符         | [说明](/ch11/advanced/callable)          |
| ^^                    | ^^     | `->*`      | 指针成员指针运算符     | [说明](/ch11/advanced/callable)          |
| ^^                    | 5      | `a*b`      | 乘法运算符             | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `/`        | 除法运算符             | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `%`        | 模运算符               | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | 6      | `a+b`      | 加法运算符             | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `a-b`      | 减法运算符             | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | 7      | `<<`       | 左移运算符             | [说明](/ch02/part2/bit_operator)         |
| ^^                    | ^^     | `>>`       | 右移运算符             | [说明](/ch02/part2/bit_operator)         |
| ^^                    | 8      | `<=>`      | 三路比较运算符         | [说明](/ch11/advanced/defaulted_compare) |
| ^^                    | 9      | `<`        | 小于运算符             | [说明](/ch02/part2/comparison_operator)  |
| ^^                    | ^^     | `<=`       | 小于等于运算符         | [说明](/ch02/part2/comparison_operator)  |
| ^^                    | ^^     | `>`        | 大于运算符             | [说明](/ch02/part2/comparison_operator)  |
| ^^                    | ^^     | `>=`       | 大于等于运算符         | [说明](/ch02/part2/comparison_operator)  |
| ^^                    | 10     | `==`       | 等于运算符             | [说明](/ch02/part2/comparison_operator)  |
| ^^                    | ^^     | `!=`       | 不等于运算符           | [说明](/ch02/part2/comparison_operator)  |
| ^^                    | 11     | `a&b`      | 逐位与运算符           | [说明](/ch02/part2/bit_operator)         |
| ^^                    | 12     | `^`        | 逐位异或运算符         | [说明](/ch02/part2/bit_operator)         |
| ^^                    | 13     | `|`        | 逐位或运算符           | [说明](/ch02/part2/bit_operator)         |
| ^^                    | 14     | `&&`       | 逻辑与运算符           | [说明](/ch02/part2/logical_operator)     |
| ^^                    | 15     | `||`       | 逻辑或运算符           | [说明](/ch02/part2/logical_operator)     |
| $\larr$ <br> 从右向左 | 16     | `a?b:c`    | 条件运算符             | [说明](/ch02/part2/other_operator)       |
| ^^                    | ^^     | `throw`    | throw 运算符           | 敬请期待                                      |
| ^^                    | ^^     | `co_yield` | yield 运算符           | 敬请期待                                      |
| ^^                    | ^^     | `=`        | 简单赋值运算符         | [说明](/)                                      |
| ^^                    | ^^     | `+=`       | 加法复合赋值运算符     | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `-=`       | 减法复合赋值运算符     | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `*=`       | 乘法复合赋值运算符     | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `/=`       | 出发复合赋值运算符     | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `%=`       | 模复合赋值运算符       | [说明](/ch02/part2/arithmetic_operator)  |
| ^^                    | ^^     | `<<=`      | 左移复合赋值运算符     | [说明](/ch02/part2/bit_operator)         |
| ^^                    | ^^     | `>>=`      | 右移复合赋值运算符     | [说明](/ch02/part2/bit_operator)         |
| ^^                    | ^^     | `&=`       | 逐位与复合赋值运算符   | [说明](/ch02/part2/bit_operator)         |
| ^^                    | ^^     | `^=`       | 逐位异或复合赋值运算符 | [说明](/ch02/part2/bit_operator)         |
| ^^                    | ^^     | `|=`       | 逐位或复合赋值运算符   | [说明](/ch02/part2/bit_operator)         |
| $\rarr$ <br> 从左向右 | 17     | `,`        | 逗号运算符             | [说明](/ch02/part2/other_operator)       |

| **以下运算符的操作数均因被小括号括起而不存在歧义性，故不存在优先级或结合方向。**                                 |||||
| `const_cast<T>(a)`                       ||| const_cast 运算符       | [说明](/ch07/polymorphism/cpp_cast)      |
| `static_cast<T>(a)`                      ||| static_cast 运算符      | [说明](/ch07/polymorphism/cpp_cast)      |
| `dynamic_cast<T>(a)`                     ||| dynamic_cast 运算符     | [说明](/ch07/polymorphism/cpp_cast)      |
| `reinterpret_cast<T>(a)`                 ||| reinterpret_cast 运算符 | [说明](/ch07/polymorphism/cpp_cast)      |
| `typeid(a)`                              ||| typeid 运算符           | [说明](/ch07/polymorphism/rtti)          |
| `sizeof...(a)`                           ||| sizeof... 运算符        | 敬请期待                                      |
| `noexcept(a)`                            ||| noexcept 运算符         | 敬请期待                                      |
| `alignof(a)`                             ||| alignof 运算符          | 获取对象或类型的对其要求                      |

## 注

1. 条件表达式的 `?` 和 `:` 之间如同视有小括号，不考虑优先级；
2. sizeof 表达式的操作数不能是 C 风格转型；

> C++ 标准中不指定运算符名、优先级或结合顺序。C++ 标准使用类 EBNF 文法描述对应语法标记的语义。
> 
> 运算符优先级与运算顺序无关；除逗号、逻辑与、逻辑或、赋值以外的运算符的运算顺序大多是未指明的。

<style>
table code {
    color: inherit;
    padding: unset;
    font-size: inherit;
    background-color: unset;
}
</style>