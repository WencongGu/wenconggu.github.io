---
title: python进阶-魔术命令
date: 2024-01-31 23:24:43
tags: Python
---

**魔术命令**（**Magic Command**）是常规python代码的增强版，这些命令通常由**IPython**的内核（kernel）提供，以`%`字符为前缀。简单来说，这些命令是为了解决常见问题设置的，同时也给代码提供了一些快捷方式。

魔术命令似乎不大常见，但是如果能恰当使用可以使得代码效率有很大提升。本文汇总了一些比较实用的魔术命令。

<!--more-->

## 魔术命令
一共有两种魔术命令：`%`前缀和`%%`前缀的。`%`前缀表示这个命令会在一行代码上运行，而`%%`前缀表示该命令会在整个单元上运行。
### `%magic`：显示所有魔术命令的详细文档

不了解或者暂时忘记了某个命令或不知道有什么命令时，使用这个命令查看当前解释器支持的所有命令。这个命令的输出可能会很长。

### `%run`：运行外部 python 文件

当我们想要在jupyter notebooks中运行一些代码片段时，我们想运行位于某目录里的外部代码文件。`%run`能让你在jupyter notebook中运行任何外部的python文件。

基本用法为：

```python
%run script.py
```

其中 `script.py` 是要运行的外部 Python 脚本文件的路径。在执行这个命令后，Jupyter Notebook 会加载并执行 `script.py` 中的代码。如果脚本中有输出，也会显示在 Notebook 中。

如果需要传递参数给外部脚本，可以在 `%run` 命令后面添加参数：

```python
%run script.py arg1 arg2
```

在这种情况下，`arg1` 和 `arg2` 会作为参数传递给 `script.py` 中的脚本。在脚本中可以通过 `sys.argv` 或其他方式获取这些参数。

在使用 `%run `命令时，外部脚本中定义的变量和函数会在 Jupyter Notebook 的命名空间中保留，可以在 Notebook 中继续使用这些变量和函数。这使得 `%run` 命令非常适合在 Jupyter Notebook 中调试和测试外部脚本。

### `%%script`：运行其他语言代码

`%%script` 魔术命令可以在Jupyter Notebook中用于在代码单元格中运行其他编程语言的代码。下面是 `%%script` 魔术命令的基本用法：

1. 在Jupyter Notebook中的代码单元格中输入 `%%script`，后面紧跟要使用的编程语言，例如 bash、python、R 等。
2. 编写要执行的相应语言的代码。
3. 运行代码单元格，即可执行相应语言的代码。

例如，如果要在代码单元格中运行 Bash 脚本，可以按照以下步骤操作：

```python
%%script bash
echo "Hello, World!"
```

然后运行该代码单元格，就会输出：

```bash
Hello, World!
```

再比如，需要运行 C 语言代码，输入如下内容：

```python
%%script C
#include <stdio.h>

int main() {
    printf("Hello from C program!\\n");
    return 0;
}
```

这个单元格后面的代码都将被视为是 C 语言的代码。

注意，`%%script` 魔术命令只能在代码单元格的第一行使用，且后面必须紧跟要使用的编程语言。这样可以告诉Jupyter Notebook要使用哪种解释器或编译器来执行代码。如果需要在同一个代码单元格中混合不同语言的代码，可以使用不同的 `%%script` 魔术命令来分隔不同部分的代码。

### `%time`：代码执行时间

使用 `%time` 命令在 IPython 或 Jupyter Notebook 中执行代码时，会输出一个时间统计，通常包括以下两部分信息：

- **`Wall time`**: 这表示代码块执行的总时间，包括实际运行代码的时间以及任何系统资源等待时间（例如，如果代码在等待 I/O 操作完成）。这个时间是用户最关心的，因为它反映了代码执行的实际耗时。
  比如：
  ```python
  Wall time: 0.12 s
  ```
  这就是说代码块执行所需的总时间是 0.12 秒。

- **`CPU times`**: 这个部分（如果显示）会列出几个不同的时间指标，通常包括：
  + **user**: 代码执行过程中用户态CPU消耗的时间。
  + **sys**: 代码执行过程中系统态CPU消耗的时间。
  + **total**: 用户态和系统态CPU消耗的总时间。
  比如：
  ```python
  CPU times: user 0.01 s, sys: 0.02 s, total: 0.03 s
  ```
  这意味着代码执行过程中，用户态CPU消耗了 0.01 秒，系统态CPU消耗了 0.02 秒，总共消耗了 0.03 秒的CPU时间。

有时候，如果你只关心 `%time` 的输出，你可以这样做：
```python
%time result = some_function()
```
这里，`result` 是函数 `some_function()` 的返回值，而 `%time` 会给出执行 `some_function()` 的时间统计。

请注意，`%time` 命令的输出格式可能会根据你的 **IPython** 或 **Jupyter Notebook** 版本略有不同。此外，如果你使用的是 **`%timeit`** 命令，它将执行代码块多次以获得更准确的时间统计，并且输出会包括每次迭代的**平均时间**。

另外，`%%time`命令可以用来计算整个单元格的执行时间。

### `%matplotlib`：内联显示 matplotlib 图形

在 Jupyter Notebook 中使用 `%matplotlib` 魔术命令可以让你在代码块中直接显示 `matplotlib` 绘制的图形，而不需要使用 `plt.show()` 来显示图形。

它主要有三种形式：

- `%matplotlib inline`: 这是最常用的用法，它会在 Jupyter Notebook 中内联显示 matplotlib 图形，即在代码块下方直接显示图形，而不是弹出一个新窗口显示图形。这样可以使得图形更加直观地与代码交互。
- `%matplotlib notebook`: 这个用法会在 Jupyter Notebook 中启用交互式图形，允许用户对图形进行交互操作，比如缩放、平移等。这个模式对于需要交互式探索数据的情况非常有用。
- `%matplotlib qt`: 这个用法会在 Jupyter Notebook 外部弹出一个独立的窗口显示 matplotlib 图形，而不是在 Notebook 中显示。这种方式适用于需要在独立窗口中查看图形的情况。

### `%cd`、`%pwd`、`%ls`、`%ll`、`%history`

类似Linux中的命令。

### 其他


`%who` 和 `%whos`: 列出当前命名空间中定义的变量。
`%reset`: 重置 IPython 命名空间。
`%load`: 加载外部脚本或模块。
`%store`: 在 IPython 会话之间存储变量，接收其他会话的变量时使用`-r`参数，比如`%store -r shared_var`。
`%debug`: 进入交互式调试器。
`%%writefile`: 将所在单元格内容（通常是代码、注释）写入文件：`%%writefile myfile`，`myfile`不存在会创建，存在会覆盖。
`%%html`、`%%svg`: 渲染单元格中的 `HTML` 或 `SVG`。
`%%bash`、`%%perl`、`%%ruby`、`%%sql` 等等：在单元格中运行其他语言的代码。但是这些命令只在Jupyter Notebook中有用。

可以看到，python中的魔术命令十分强大。