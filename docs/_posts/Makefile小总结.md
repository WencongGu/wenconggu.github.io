---
title: Makefile小总结
mathjax: true
date: 2024-11-22 17:22:04
tags: make
---

自己领悟了一下这个工具的设计思想，作了小总结，虽然用处十分有限，但是设计思想挺有趣的，而且很多项目都在用。

<!--more-->

很好的入门：
[Makefile Tutorial](http://makefiletutorial.foofun.cn/)

## 使用make动机

Makefile被发明的动机是针对相对大规模C/C++项目的编译慢等问题。

对于一些较大的项目，原始的办法是使用gcc/g++等编译命令，或者写成一个简单的脚本。使用脚本可以避免每次都输入一遍编译所需的文件，但问题是每次修改某个文件之后都需要完全重新编译整个项目，这样十分耗时。简单的想法是将一键编译过程拆分为编译+链接，只需监控每个文件的更改，只对需要重新编译的部分进行编译，在最终可执行程序中只需要链接到新程序中即可。使用脚本实现这个想法比较困难，因为大项目的程序之间依赖关系十分复杂，也就是无法简单确定“需要重新编译的部分”，即使针对某个项目设计了完善的依赖关系，它也欠缺可扩展性。针对这些问题，make工具被发明出来，而make是基于Makefile执行的。

## Makefile设计思想

复习一下C/C++程序编译过程：

||||
|:-:|:-:|:-:|
|预处理(Preprocessing) | `.c` -> `.i` | 涉及文本处理，比如宏定义、头文件的递归展开、删除注释内容，生成的`.i`文件是一个文本文件。gcc可以使用-E标签指定。|
|编译(Compilation)|`.i` -> `.s`|将文本源程序编译为汇编代码，编译规则由OS、CPU架构决定。gcc可以使用-S标签指定。|
|汇编(Assemble)|`.s` -> `.o`|将汇编代码转换为机器码，`.o`文件就是目标文件。可以使用as命令，等价于gcc使用-c标签。|
|链接(Linking)||将多个目标文件（`.o`）和库文件（`.so`等）链接到一起生成最终可执行文件。可以使用ld命令。|

通常会关注从`.c`到`.o`，和`.o`到可执行文件的两步。

一个项目中，我们需要一个最终目标，就是一个可执行程序target，很明显这个target依赖于源文件，经过拆分可以有这样的依赖规则：target依赖`.o`文件，`.o`文件依赖`.c`文件。

make是这样设计的，它的每一项都是一个依赖（先决条件-文件）与生成目标（目标-文件），对应着一项规则，这个规则下会定义一些执行的命令，当规则被触发时执行这些命令。

被指定的规则什么时候被触发？只有在某个作为先决条件的文件的时间戳大于目标文件时，这条规则的所有先决条件都比目标文件旧，那就什么也不做，`make: 'all' is up to date.`。

make在执行时会根据规则建立文件依赖关系树，通过文件时间戳判断需要重新编译的部分，仅执行需要的规则，如果没有找到更新的先决条件，就什么也不做。对应到C/C++项目编译就是仅仅编译更新的部分，从而节省编译时间。这就make工具的核心用法。

依我看，除了这个可以根据文件时间戳判断执行的部分规则功能之外，make能做的事脚本都能做。不过不得不说这个设计思路还是十分优秀的。

## Makefile需要注意的细节

下面有一些细节部分的问题。

### 被指定的规则什么时候被触发？

只有在某个作为先决条件的文件的时间戳大于目标文件时，这条规则的所有先决条件都比目标文件旧，那就什么也不做，`make: 'all' is up to date.`。

一个目标文件如果不存在，那它对应的规则就一定会被执行。但是如果文件一旦存在，就会检查这个文件的时间戳来判断是否执行规则。

如果需要一些目标，我们希望make总会执行它（比如定义一个clean规则，用于清理多余文件。但是如果恰好有一个文件叫clean那就可能不会执行了），此时可以使用`.PHONY`。

更新一个文件后，如果它并不作为make目标的某个先决条件，那么make还是什么都不会做。

### 规则的编写

多个目标文件对应相同的命令、相同的依赖文件，可以将多个目标写在一起作为一条规则。也就是说一个规则可以有多个目标。

每个规则下可以有多行命令，但是这些命令都执行在独立的环境中，比如linux中就是每行都在新的bash中，万万注意。比如需要在某个文件夹下工作时，不可将cd命令写在独立的行中。

#### 通配符与模式规则

通配符`*`用于在用户文件系统中匹配文件，它不可在make变量中定义，可以用于规则中，或者`$(wildcard *.c)`等函数中。在规则中使用时如果匹配不到文件不会使用空字符，而会保持为`*.c`。

通配符`%`通常用于模式规则，比如定义一个`%.o: %.c`规则，假设make碰到一个`.o`文件没有用户定义的规则，它就会被匹配到这个规则中。注意，这个规则是按需生成的，比如假设对于`example.o`文件已经有了对应规则`example.o: example.c`，那make就会使用已经存在的规则。

静态模式规则：`targets..: target_pattern: prerequistes_pattern`。很好理解，但是不太懂有什么必要用这个形式。据说常搭配`$(filter pattern,objs)`使用。

make内置函数很多都是为了文本处理，具体地讲是为了处理文件名。除了上面的wildcard，还有`$(patsubst pattern,replacement,text)`命令，简写为`$(text:pattern=replacement)`，也很常用。

#### make内置变量

当然作为自动化执行工具，Makefile中还有很多内置变量和函数，让我们可以不必列出所有文件，同时方便地处理文件名。比如：

|||
|:-:|:-:|
|`$@`|规则中的目标|
|`$^`|规则中的所有先决条件|
|`$<`|规则中的第一个先决条件|
|`$?`|规则中有更新的先决条件|
|`$*`|模式规则中`%`匹配到的词干|

修改SHELL变量的值来修改规则中命令执行的shell。

为了避免每次引入新文件就该修改Makefile的麻烦，应当尽可能使用这些内置变量、配合一些内置函数和模式规则来编写规则。

### 针对C/C++的特殊关照

注意make对C/C++项目的特殊关照。

- 隐式规则，自动地生成`.c/.cpp`->`.o`、`n.o`->`n`共三个规则，对应命令分别是`$(CC) -c $(CPPFLAGS) $(CFLAGS)`、`$(CXX) -c $(CPPFLAGS) $(CXXFLAGS)`、`$(CC) $(LDFLAGS) n.o $(LOADLIBES) $(LDLIBS)`，如果make没有按照预期走，可以考虑是不是有隐式规则起了作用。
- 模式匹配时针对`.c/.cpp/.o`等C/C++项目文件可以自动分析suffix和stem，stem会存储在`$*`中，即便使用的匹配是`%`。一般情况下还是需要使用`%.suffix`匹配，使用`$*`得到词干。

### 引入其他Makefile中的规则: include

使用`include file.mks...`指令引入其他的Makefile，使得这些Makefile中的规则也可以使用。这是一个很使用的指令，因为gcc可以使用-MM标签直接分析`.c`文件的依赖关系，可以由此直接生成Makefile格式的文件，于是就不用绞尽脑汁分析考虑程序依赖关系，节省了很大力气。

### 使用make命令

不指定目标默认执行第一条规则。

使用`CTRL+C`中断make时会清理掉创建的新项目。

## Makefile CookBook

```Makefile
# 感谢Job Vranish (https://spin.atomicobject.com/2016/08/26/makefile-c-projects/)
TARGET_EXEC := final_program

BUILD_DIR := ./build
SRC_DIRS := ./src

# 找到我们要编译的所有C和C++文件
# 请注意 * 表达式两边的单引号。 否则Make会在那里错误地展开。
SRCS := $(shell find $(SRC_DIRS) -name '*.cpp' -or -name '*.c' -or -name '*.s')

# 每个C/C++文件的字符串替换。
# 例如，hello.cpp变成./build/hello.cpp.o
OBJS := $(SRCS:%=$(BUILD_DIR)/%.o)

# 字符串替换(不带%的后缀版本)。
#例如，./build/hello.cpp.o变成./build/hello.cpp.d
DEPS := $(OBJS:.o=.d)

# ./src中的每个文件夹将需要传递给GCC，以便它可以找到头文件
INC_DIRS := $(shell find $(SRC_DIRS) -type d)
# 为INC_DIRS添加前缀。所以moduleA会变成-ImoduleA。GCC会理解-I标志
INC_FLAGS := $(addprefix -I,$(INC_DIRS))

# -MMD和-MP标志一起为我们生成Makefiles！
# 这些文件将有.d而不是.o作为输出。
CPPFLAGS := $(INC_FLAGS) -MMD -MP

# 最后一个构建步骤。
$(BUILD_DIR)/$(TARGET_EXEC): $(OBJS)
	$(CC) $(OBJS) -o $@ $(LDFLAGS)

# C源代码的构建步骤
$(BUILD_DIR)/%.c.o: %.c
	mkdir -p $(dir $@)
	$(CC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@

# C++源代码构建步骤
$(BUILD_DIR)/%.cpp.o: %.cpp
	mkdir -p $(dir $@)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $< -o $@


.PHONY: clean
clean:
	rm -r $(BUILD_DIR)

# 包含.d makefiles。 
# 前面的 - 抑制缺少makefile的错误。 
# 最初，所有的.d文件都将丢失，我们不希望出现这些错误。
-include $(DEPS)
```

## 项目构建与打包工具链

再来捋一下编译一个大型项目的工具链，思考一下各个环节为什么需要这些工具。

### 编译项目的构建工具：make

首先是最底层的编译工具，比如gcc，最为原始的方法就是输入`gcc -o main main.c`之类的命令。对于大型项目，需要输入的文件也许很多，每次输入命令很麻烦。

自然可以想到将命令写成一个脚本，再稍费点功夫甚至能够自动读取项目中的文件，类似于`gcc -o target $(ls *.c)`之类自动化的命令，这样就算加入新文件也不怕了。

但是使用脚本依然面临一个问题。开发过程中每次修改可能只对一部分文件进行了修改，但是普通的脚本却只能每次都重新编译整个项目。我们希望的是每次只实际编译有改动的部分文件，最终链接到其他不变的代码的编译结果中去，以此来达到加快编译速度的目的。

使用脚本显然很难实现这个功能，所以人们发明了Make。Make按照Makefile制定的“规则”来完成任务。Makefile的格式类似于：

```Makefile
targetfile: prerequisite1 prerequisite2...
    command1
    command2
    ...
```

对于C语言项目，可能会是：

```Makefile
target: main.o libs.o
    ld -o main main.o libs.o

main.o: main.c
    gcc -c main.c -o main.o

libs.o: libs.c
    gcc -c libs.c -o libs.o
```

Make会根据Makefile中的规则分析程序文件的依赖关系，根据文件时间戳判断文件的更新情况，并确定需要执行的规则。比如上面的文件中，如果只修改了`main.c`，那么就只会执行`target`和`main.o`两条规则，从而节省了编译整个项目的时间。

### 生成构建项目的生成工具：cmake

但是逐渐的Make的问题也显现出来，主要有两点。一是在真正的大型项目中Makefile本身的编写也会很繁琐，二是随着Make的发展，make也有了多种实现，比如MinGW的make和MSYS的make，它们之间也有细小的差异。此外，make不能跨平台也是一个主要的不足。为了解决make的这些问题，CMake应运而生。

所以简单讲，CMake是make的上层工具，是make项目的生成器。它抽象程度更高，描述力更强。

CMake通过更为简洁的DSL——CMakeLists.txt更为简洁地描述了一个项目的构建流程，能够针对不同架构、跨平台地生成对应的make项目，极大地节省了编写Makefile的时间。常见的使用CMake的流程就是先使用`cmake .`生成Makefile，再执行`make`命令。当然cmake命令可以直接使用`--build`标签简化这两个步骤。

项目构建工具除了make还有很多，比如以小巧、运行快著称的ninja，它们是同一级别的工具。使用CMake的另一大优点就是也能够针对不同的构建工具生成对应的项目文件。C/C++语言主要以make/cmake作为构建工具链，但也可以使用其他工具比如Java常用的Maven、Gradle等，make/cmake也不仅用于C/C++项目，实际上它们作为自动化工具用途也十分广泛。

比如应用程序的打包。

### 程序的打包

什么是打包？当我们从源代码最终构建出一个可执行文件后，通常还需要分发软件，以便在目标机器上运行程序。如果私人使用那便自由；如果是面向用户的，目标机器通常会有专门的工具对这些软件统一管理。为了能够让这个管理软件的软件对我们的软件进行管理，我们需要为我们的软件加上一些对应的元数据，指示管理软件如何管理我们的软件。这个过程会对我们的程序再做一层包装，这就是程序的打包。打包的具体方式根据管理软件的方式而定。

以Linux平台为例，常见的软件打包方式比如RedHat系的rpm、Debian系的deb等。以rpm包为例，使用`rpmbuild`命令，按照规则编写`xxx.spec`文件，打包程序会按照这个文件的指示对程序进行打包。这个spec文件就是DSL，它有着特定的格式，指导了打包程序按特定的程序打包软件。一般我们还会在文件中加入编译的命令，比如使用make/cmake，同时完成编译、打包的流程。

打包工具可以调用编译工具make/cmake进行编译再打包，只需要在spec文件调用命令即可。而上层工具cmake也很好地集成了打包工具——CPack，`include(CPack)`。CPack支持生成不同的打包项目，比如可以生成zip、7z，rpm、deb、NSIS、STGZ、dmg等等软件包，只需要在CMakeLists.txt中使用相关指令即可。常见的流程是使用`cmake .`生成项目，再：

- 使用make`make && make package`，生成源码包使用`make package_source`
- 使用cmake脚本(cmake生成)`cpack -C CPackConfig.cmake`，`cpack -C CPackSourceConfig.cmake`
- 使用`cpack -G RPM`指定generator，生成的二进制安装程序将包含通过 CMake 的 install() 命令

CPack更详细内容可以看看[CPack官方文档](https://cmake-doc.readthedocs.io/zh-cn/latest/module/CPack.html)，Makefile的细节部分我有整理[Makefile笔记](/2024/11/22/Makefile小总结/index.html)，rpm的构建我也整理了[spec文件研究笔记](/2024/11/22/rpm包构建之spec文件研究/index.html)

完