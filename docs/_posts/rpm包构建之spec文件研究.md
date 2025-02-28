---
title: rpm包构建之spec文件研究
mathjax: true
date: 2024-11-22 17:19:28
tags: Linux
---

初工作时常用到rpm包，不妨看看它是怎么构建的。而且它可以通过CPack与CMake无缝衔接，可以窥见稍大一些的项目都是怎么组织构建的。

<!--more-->

[rpm打包指南](https://docs.redhat.com/zh-cn/documentation/red_hat_enterprise_linux/7/pdf/rpm_packaging_guide/Red_Hat_Enterprise_Linux-7-RPM_Packaging_Guide-zh-CN.pdf)

软件包管理工具rpm，和rpm包的制作。

## rpm包结构

RPM 软件包是包含其它文件和元数据的文件（系统所需文件的信息）。

具体地，RPM 软件包由 cpio 归档组成。cpio归档除了程序文件，还包含RPM 标头（软件包元数据），rpm 软件包管理器使用此元数据来确定依赖项、安装文件的位置和其他信息。

rpm包分为两种SRPM和RPM，除了程序文件和cpio归档，二者的不同之处在于：

- SRPM 包含源代码和 SPEC 文件，也可以包括补丁文件
- 二进制 RPM 包含构建得到的二进制文件

## 制作rpm包项目结构

制作一个rpm的项目结构如下：

|目录|作用|
|:-:|:-:|
BUILD|%build阶段构建的根目录，默认的%setup就是将压缩包文件复制到这里。
RPMS|一级子目录是架构，二级子目录就是二进制rpm包
SOURCES*|构建过程中的源代码和布丁，**注意，rpm包构建的源代码必须是打包压缩文件**，使用rpmbuild时的最开始查找源文件就在这个目录下。
SPECS|在此目录下查找spec文件
SRPMS|如果不生成二进制rpm时，就生成srpm，在此目录下。

>***注意，rpm包构建的源代码必须是打包压缩文件**，存放在SOURCES目录下，这样更方便使用内置宏的各种默认值，因为rpmbuild会自动地创建一些对应的目录，使用压缩包会自动处理这些。也许可以直接把源码和目录结构放在BUILD中，但是没必要。
>
>更新以补丁的形式发布。

### BUILDROOT

|||
|:-:|:-:|
BUILDROOT*|运行rpmbuild命令之后会自动创建，一级子目录会是rpm版本信息结合CPU架构或noarch，二级子目录会是一个linux环境的fs，在%install过程中会在这个二级子目录中模拟真实运行的linux主机的目录，以此来定义安装等行为。二级子目录使用变量`$RPM_BUILD_ROOT`或者宏`%{buildroot}`引用，它模拟了最终用户的文件系统。定义为`%{_buildrootdir}/%{name}-%{version}-%{release}.%{_arch}`，其中`%{_buildrootdir}`就是这个BUILD目录。

> *注意，上面的描述是基于ubuntu构建的，而且redhat官网也是这么说的。
>
> 但是，在fedora上观察到了不同的行为（是我自己翻rpmbuild的输出看的，也许不准？），即BUILDROOT创建为BUILD的一个二级子目录，比如解压源代码后得到目录project-build，BUILDROOT就在这个目录下，且BUILDROOT就是模拟用户fs环境，在打包完成后会自动删除。
> 简而言之就是BUILDROOT的位置并不确定。没找到怎么修改相关宏的方法。但是文档中明确表示如果修改这些宏会导致不可预知的后果，最好还是使用默认值，不会太离谱。
> 但是不重要，只要使用默认宏就不许关注具体位置，理解工作原理，即使用一个目录模拟最终用户文件系统这个逻辑就行。


### 命令

需要安装软件包：`yum install rpmdevtools`

创建工作区：`rpmdev-setuptree`

创建spec文件模版：`rpmdev-newspec`

构建：`rpmbuild -bb xxx.spec`

## Spec文件

Sepc文件分为三部分：preamble items，正文，Scriptlets，每个部分又分为几个阶段。最重要的是正文中的内容。

### Preamble Items

定义rpm的一些基本属性，有很多，比如Name, Version, Release, License, URL等。挑一些比较有实质影响的：

|Item|描述内容|
|:-:|:-:|
Source0|源代码路径，或者url，比如`%{name}-boost-%{version}.tar.gz`，可以添加更多，比如`Source1`,`Source2`,etc. 也可以使用Source RPM
Patch0|补丁，类似于Source0
BuildArch|软件包的架构依赖
BuildRequires|构建阶段需要目标机器上安装的软件包，比如gcc
Requires|安装本rpm包的依赖软件包，比如python

### Body Items

|Item|任务|
|:-:|:-:|
|`%description` |RPM 中打包的软件的完整描述，可跨越多行，并且可以分为几个段落|
|`%prep` |用于准备要构建的软件的命令或一系列命令，例如，在 Source0 中解压缩存档，通常使用宏`%setup -q`就足够了，自动解压代码到`%{_builddir}`下，也可以包含shell脚本|
|`%build` |正常的编译阶段，比如gcc编译，比如将java、python等编译为字节码，工作目录是`%{_builddir}`，即BUILD|
|`%install`* |安装软件包，可能是%build阶段生成的机器码，也可能是一些脚本，简而言之就是把相关程序从 `%{_builddir}` （构建发生位置）复制到`%buildroot` 目录（其中包含要打包文件的目录结构），使用`rpm -ivh`安装软件包时也会在用户机器上对应在BUILDROOT的实际文件系统中运行|
|`%check` |用于测试软件的命令或一系列命令。这通常包括单元测试等内容，不常用|
|`%files` |将在最终用户系统中安装的文件列表，它会检查在%install中安装了的但是没有使用%files描述的文件。`rpm -ql`命令查看|

> *查看“注”部分讨论

### Scriptlets 

定义了一组在安装或删除软件包之前或之后执行的 RPM 指令，包括：

|Scriptlet|执行时机|
|:-:|:-:|
|`%pretrans` |在安装或删除任何软件包之前执行|
|`%pre` |在目标系统上安装软件包之前执行|
|`%post` |仅在目标系统上安装软件包后执行|
|`%preun` |在从目标系统卸载软件包前执行|
|`%postun` |在软件包从目标系统卸载后执行|
|`%posttrans` |在事务结束时执行|

### 注

就这么简单。在工程目录RPMS或者SRPMS下得到rpm后安装，所有的行为会按照spec文件的指令执行。

%build阶段也许太麻烦，当然可以直接编译好，直接讲二进制文件打包到rpm中即可，就无需build了。当然很麻烦。

遗留小问题：

- build阶段工作目录到底是什么？
  - 默认是BUILD目录，通常会默认进入%setup解压源码得到的文件夹中。可以cd到其他文件夹下，比如虚拟用户的文件系统BUILDROOT中。

- %setup宏到底会将文件复制到什么目录下？

  - BUILD目录中。

- ？？？%install阶段“这仅在创建软件包时运行，而不是当最终用户安装软件包时。”是翻译错误吧？要不然真就“乌云”了。

  - 没翻译错，英文也是这么说的，但是很奇怪，在最终用户安装rpm包时的安装动作的确是按照%install中的指令执行的。如若不然，不知道在哪里指定安装阶段的行为，当然Scriptlets更是不涉及。暂时找不到其他资料。暂时先说服自己就当是安装时执行的命令，不必再浪费时间了。

就这些问题了，安心。

整个过程是很清晰的，能够满足软件包管理的需求。


## 一些有用的宏

全部的宏使用`rpm --showrc`查看。在`~/.rpmmacros`文件中也可查看一些，不建议修改这个文件。宏的默认值也是可以被修改的，用户也可以自定义宏并使用。

|宏|值|
|:-:|:-:|
|`%{_sysconfdir}`        |`/etc`|
|`%{_prefix}`            |`/usr`|
|`%{_exec_prefix}`       |`%{_prefix}`|
|`%{_bindir}`            |`%{_exec_prefix}/bin`|
|`%{_lib}`               |`lib (lib64 on 64bit systems)`|
|`%{_libdir}`            |`%{_exec_prefix}/%{_lib}`|
|`%{_libexecdir}`        |`%{_exec_prefix}/libexec`|
|`%{_sbindir}`           |`%{_exec_prefix}/sbin`|
|`%{_sharedstatedir}`    |`/var/lib`|
|`%{_datadir}`           |`%{_prefix}/share`|
|`%{_includedir}`        |`%{_prefix}/include`|
|`%{_oldincludedir}`     |`/usr/include`|
|`%{_infodir}`           |`/usr/share/info`|
|`%{_mandir}`            |`/usr/share/man`|
|`%{_localstatedir}`     |`/var`|
|`%{_initddir}`          |`%{_sysconfdir}/rc.d/init.d `|
|`%{_topdir}`            |`%{getenv:HOME}/rpmbuild`|
|`%{_builddir}`          |`%{_topdir}/BUILD`|
|`%{_rpmdir}`            |`%{_topdir}/RPMS`|
|`%{_sourcedir}`         |`%{_topdir}/SOURCES`|
|`%{_specdir}`           |`%{_topdir}/SPECS`|
|`%{_srcrpmdir}`         |`%{_topdir}/SRPMS`|
|`%{_buildrootdir}`      |`%{_topdir}/BUILDROOT`|
|`%{_var}`               |`/var`|
|`%{_tmppath}`           |`%{_var}/tmp`|
|`%{_usr}`               |`/usr`|
|`%{_usrsrc}`            |`%{_usr}/src`|
|`%{_docdir}`            |`%{_datadir}/doc`|
|`%{buildroot}`          |`%{_buildrootdir}/%{name}-%{version}-%{release}.%{_arch}`|
|`$RPM_BUILD_ROOT`       |`%{buildroot}`|

完