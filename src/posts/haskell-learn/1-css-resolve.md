---
icon: edit
date: 2023-04-25
category:
  - Haskell
tag:
  - Haskell
  - CSS
---

# CSS 解析器：选择器算法

这篇教程教你用 Haskell 实现一个简单的 CSS 解析器（准确来说其实是求解 CSS 选择器）。如果你是不满足于编写几行 Haskell 函数的初学者，不妨来看看这个教程🐒。

<!-- more -->

本教程并不涉及真正的 Web 技术——它基本上只是一个以 Web 相关问题作为背景的一个习题，所以没有 Web 经验的人应该也不会感到困难。

## CSS 简介

CSS 是用来描述 Web 界面元素的一系列规则，例如：
``` css
p {
  color: white; /* 将文本颜色设置为白色 */
  font-size: 18px; /* 将字号设置为 18 像素大 */
}

.panel {
  background-color: gray;
  border-radius: 2px;
}
```
这段 CSS 将作用到 HTML 中的类型为 `p` 和 `class` 属性为 `"panel"` 的所有元素。本文所将要涉及的 CSS 基本上就是这样，可以看到它们由这样的结构重复组成：
```
selector { rule-set }
```
其中有两条规则：
1. 位于花括号前面的 `selector` 部分是选择器，它决定 CSS 规则会对页面中哪些元素起作用。
2. 花括号里面的 `rule-set` 部分是规则集合，也就是元素与选择器匹配时起作用的样式属性。

规则集合是一些属性名和属性值组成的键值对，属性名和属性值之间用 `:` 分隔，而两个属性键值对之间用 `;` 分隔。

选择器的规则稍微复杂一点，在本教程中我们打算支持这些[选择器](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)：
- 通用选择器（Universal selector）：选择所有元素。写作 `*`。
- 元素选择器（Type selector）：选择所有给定类型名称的元素。写作类型的名称，例如 `div`，`input`。
- 类选择器（Class selector）：选择所有具有给定 `class` 属性值的元素。以 `.` 开头，例如 `.window`。
- ID 选择器（ID selector）：选择所有具有指定 `id` 属性的元素。以 `#` 开头，例如 `#title`。
- 分组选择器（Grouping selector）：使用 `,` 组合多个选择器，例如 `div, #title, .window`。元素匹配到分组选择器中的任意选择器即可。
- 后代组合器（Descendant combinator）：通过空格组合两个选择器，例如 `div .icon`。只有当元素有祖先匹配第一个选择器且元素本身匹配第二个选择器时后代组合器才匹配。
- 直接子代组合器（Child combinator）：通过 `>` 组合两个选择器，例如 `div > .icon`。仅当父级元素匹配第一个选择器且元素本身匹配第二个选择器时直接子代组合器才匹配。

单独的背景知识介绍就到这里吧，其他细节我会在后面中补充。

## 用 Haskell 表示数据

### 选择器

我定义了一个 `Selector` 类型表示各种选择器：
``` haskell
data Selector
  = SelectorUniversal -- 通用选择器（*）
  | SelectorType String -- 元素选择器
  | SelectorClass String -- 类选择器
  | SelectorId String -- ID 选择器
  | SelectorDescendent Selector Selector -- 后代选择器
  | SelectorChild Selector Selector -- 直接后端选择器
  | SelectorList [Selector] -- 分组选择器
  deriving (Show, Eq)
```
在这个定义中，一个 `Selector` 可以由多种方法来构造（以 `|` 分隔）。第 9 行声明了 `Selector` 类型继承自 `Show` 和 `Eq` 类型类，这会自动让我们的 `Selector` 类型具有相等性判别和使用 `show`、`print` 函数打印的能力。不妨在 GHCi 中尝试一下：
``` haskell
ghci> SelectorClass "icon"
SelectorClass "icon" -- 类选择器 .icon
ghci> SelectorDescendent (SelectorId "window") SelectorUniversal
SelectorDescendent (SelectorId "window") SelectorUniversal -- 后代选择器 #window *
ghci> SelectorClass "icon" == SelectorClass "icon"
True
```

::: tip
为什么不使用 CSS 文本形式的选择器呢？因为把文本解析成 `Selector` 需要更多的知识，这超出了本教程的范围。接下来我还会直接用 Haskell 代码构造其他数据。
:::
