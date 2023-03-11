---
icon: edit
date: 2023-03-11
category:
  - Interpreter
tag:
  - JavaScript
  - Interpreter
---

# 解释器系列

我正尝试实现一个占用资源极少的 JavaScript 解释器，这个系列记录一些思路。

<!-- more -->

## 背景

这并不是用于通用目的的 JavaScript 解释器，而是给 MCU 设计的，所以它对标的是 [JerryScript](https://github.com/jerryscript-project/jerryscript)、[QuickJS](https://bellard.org/quickjs/) 之类的引擎，是没有 JIT 的基本字节码解释器。既然是给 MCU 设计，我最关心的问题还是性能和资源占用，至于 js 的支持程度就得往后放了。

那么问题来了，既然有 JerryScript 和 QuickJS，为什么还要重复造轮子？首先 QuickJS 并不是真的针对 MCU 设计的，资源占用“比较高”。而 JerryScript 虽然号称是针对 IOT 设备开发，但是又比 QuickJS 慢很多。因此我想尝试是否有可能实现一种比较快，同时资源占用少到主流 MCU 可以接受的 JS 解释器。

## 实现思路

我之前有实现脚本语言解释器的经验，而且是类似于 PUC Lua 解释器的实现，所以不出意外的话这次也会选择类似的 register VM 方案。简单起见，我将分开实现 compiler 和 Runtime 部分。Compiler 只在电脑上运行，所以 REPL、`eval` 之类的功能都不会做。

### Compiler

Compiler 将 js 源码编译为字节码，如果是手写 parser 的话一般是一趟式代码生成，对于 js 其实是有点麻烦的：
- 众所周知 js 的函数是会提升的（也就是后面定义的函数可以在前面使用），`function` 变量需要先遍历一趟搜集符号；
- js 没法用 LL1 文法表达，并且词法规则也较为复杂，手写 lexer 和 parser 都有困难。

手写是不可能手写的，肯定用 Lexer/Parser 生成工具咯。我打算直接用 Haskell 开发 Compiler 部分，恰好之前用过 [Alex](https://haskell-alex.readthedocs.io/en/latest/) 和 [Happy](https://haskell-happy.readthedocs.io/en/latest/index.html)，大概分分钟就能拼一个 parser 出来。剩下的代码生成部分用 Haskell 做应该也没有什么问题。

在 PC 端生成字节码的显著好处是有机会使用更好的优化方法，基本不用在意速度。

### Runtime

这个其实没什么好说的，就是照着 PUC Lua 的模子改。不过可能会改用原始的标记清扫 GC。另外我选择用 C++ 11 实现运行时，以获得更好的开发体验和开发效率。
