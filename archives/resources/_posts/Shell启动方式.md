---
title: Shell启动方式
date: 2024-02-03 23:39:49
tags: Linux
---

Shell 启动时有四种类型：登录 (login) 与非登录 (non-login) 型、交互 (interactve) 与非交互 (non-interactive) 型。不同启动方式其初始化时进行的操作也不同。简单了解一下有助于更好地理解、配置、使用自己的 Linux 系统。

<!--more-->

## 登录式与非登录式

启动 shell 进程时可以是登录式，也可以是非登录式；可以是交互式，也可以是非交互式。

- login shell：取得 bash 时需要完整的登陆流程的，需要使用账号密码获取bash，就称为 login shell。
- non-login shell：取得 bash 接口的方法不需要重复登陆的举动。
  
这两个取得 bash 的情况中，读取的配置文件数据并不一样。一般来说，login shell 其实只会读取这两个配置文件：

- `/etc/profile`：这是系统整体的设置，最好不要修改这个文件；这个文件被调用时会执行 `/etc/profile.d/*.sh` 的所有文件，也就是目录 `/etc/profile.d` 下所有以 `.sh` 结尾的文件，也就是 `sh` 脚本文件。
- `~/.bash_profile` 或 `~/.bash_login` 或 `~/.profile`：属于使用者个人设置。最终只有一个会被读取，按照上面的顺序查找，前一个文件不存在才会尝试读取下一个。

常会看到 `.bashrc` 这个名称，文件名中的 “ rc ” 的含义是 “ Resource Configuration ”。

而且我们会发现，无论是登录式还是非登录式，`~/.bashrc` 都会被加载。

执行 `exit` 命令，退出一个shell（登录或非登录shell）；执行 `logout` 命令，退出登录shell（不能退出非登录shell）。

### 登录式

- 使用 SSH 远程登录 shell 是登录式
- 当前进程运行 shell 脚本是登录式

总结而言，login shell 初始化加载配置文件流程如下图（CentOS中）：

![alt text](<image/shell-ways-to-start/截屏2024-04-04 22.00.23.png>)

#### 系统级配置文件 `/etc/profile`

如果仔细查看这些文件内容，可以看到，`/etc/profile`文件主要设置了一些系统级别的环境，比如 `PATH`、`USER`、`umask` 等变量。调用 `/etc/profile.d/*.sh` 这部分是下面的语句：

```bash
...

if [ -d /etc/profile.d ]; then
  for i in /etc/profile.d/*.sh; do
    if [ -r $i ]; then
      . $i
    fi
  done
  unset i
fi

...
```

#### 个人便好配置文件

个人便好配置文件会有这么多，其实是因应其他 shell 转换过来的使用者的习惯而已。

下面是一个 `~/.bash_profile` 的示例：

```bash
# Get the aliases and functions
if [ -f ~/.bashrc ]; then    
        . ~/.bashrc
fi

# User specific environment and startup programs
PATH=$PATH:$HOME/.local/bin:$HOME/bin    
export PATH
```

可以看到它会调用 `～/.bashrc` 脚本，当然首先会判断文件是否存在。而如果查看 `～/.bashrc` 文件，就会发现它又会调用 `/etc/bashrc` 文件。

相关语句示例如下：

```bash
...

if [ -f /etc/bashrc ]; then
        . /etc/bashrc
fi

...
```

要注意的是，这个 `/etc/bashrc` 是 CentOS 特有的 （其实是 Red Hat 系统特有的），其他不同的版本可能会放置在不同的文件名就是了。不过在有些系统中，这一步（调用 `/etc/bashrc`）会在 `/etc/profile` 中进行，例如 ubuntu 中的 `/etc/profile`：

```bash
...

if [ "${PS1-}" ]; then
  if [ "${BASH-}" ] && [ "$BASH" != "/bin/sh" ]; then
    # The file bash.bashrc already sets the default PS1.
    # PS1='\h:\w\$ '
    if [ -f /etc/bash.bashrc ]; then
      . /etc/bash.bashrc
    fi
  else
    if [ "$(id -u)" -eq 0 ]; then
      PS1='# '
    else
      PS1='$ '
    fi
  fi
fi

...
```


可以看到调用了 `/etc/bash.bashrc`，是一样的。而在 `~/.bashrc` 中就不再调用了。

如果 `~/.bash_profile` 存在就不会读取其他两个文件；如果不存在会尝试读取 `~/.bash_login`，仍然不存在才会加载 `~/.profile` 文件。在我的 ubuntu 22.04 中 `~/.profile` 文件有如下内容：

```bash
...

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi
```

可以看到完成了相同的任务。


### 非登录式

- 新开进程运行Shell脚本是非登录式
- 在图形接口上启动Shell是非登录式，比如在桌面环境中使用终端

 `/etc/profile` 与 `~/.bash_profile` 都是在取得 login shell 的时候才会读取的配置文件，在 non-login shell 中它们不会被加载，而是直接加载 `~/.bashrc`。
 
 CentOS 中一个典型的 `~/.bashrc` 文件示例如下：

 ```bash
 # .bashrc

# User specific aliases and functions
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Source global definitions
if [ -f /etc/bashrc ]; then
        . /etc/bashrc
fi
```

由于 root 的身份与一般使用者不同，如果是一般使用者的 `~/.bashrc` 会有些许不同，在 root 的 `~/.bashrc` 中其实已经规范了较为保险的命令别名了。 此外，CentOS 7.x 还会主动的调用 `/etc/bashrc` 文件，这个文件为 bash 定义出下面的数据：

- 依据不同的 `UID` 规范出 `umask` 的值；
- 依据不同的 `UID` 规范出提示字符 （就是 `PS1` 变量）；
- 调用 `/etc/profile.d/*.sh` 的设置。

#### `~/.bash_logout`

还有一个可能很有用的文件，`~/.bash_logout`，这个文件记录了“当我登出 bash 后，系统再帮我做完什么动作后才离开”。默认的情况下，登出时， bash 只是帮我们清掉屏幕的信息而已，我们也可以将一些备份或者是其他你认为重要的工作写在这个文件中（例如清空暂存盘）。

## 交互式与非交互式

交互式是 shell 等待用户的输入，输入的一个个命令能即时查看结果。

非交互式则是新进程运行命令或者Shell脚本，新进程的程序无法与用户互动，无法等待用户输入的命令。

如果清楚这个，交互式与非交互式也就理解了。

#### 交互式

- 使用SSH远程登录Shell是交互式
- 当前进程运行Shell脚本是交互式
- 在图形接口上启动Shell是交互式

#### 非交互式

- 新开进程运行shell脚本是非交互式

## 相关环境变量

判断是否交互式：`$PS1`

输出的值不为空，为交互式，否则为非交互式：

```bash
[root@centos ~]# echo $PS1
[\u@\h \W]\$ # 交互式

[root@centos ~]# cat test.sh # 编写文件，输出$PS1变量
echo $PS1

[root@centos ~]# bash test.sh  # 非交互式

```

`PS1` 是一个环境变量，用于定义命令提示符（prompt）的格式。命令提示符是在终端中显示的文本，通常包含用户名、主机名、当前工作目录等信息，以便用户知道自己在哪个系统的哪个目录下执行命令。通过设置 PS1 变量，可以自定义命令提示符的外观和内容。
`PS1` 变量的设置示例：

- \\u：当前用户名
- \\h：主机名
- \\w：当前工作目录的绝对路径
- \\W：当前工作目录的基本名称
- \\n：换行符
- \\t：当前时间（24 小时制）
- \\d：当前日期
- \\$：提示符符号（$ 表示普通用户，# 表示超级用户）

判断是否登录式：`shopt login_shell`

```bash
[root@centos ~]# shopt login_shell
login_shell    	on
```

`shopt` 命令用于显示和设置 shell 中的一些环境变量。相似的命令是 `set`。`shopt` 和 `set` 命令都用于设置 shell 的选项和变量，但它们之间有一些区别。

`shopt` 命令：
- `shopt` 用于设置和显示与 shell 行为相关的选项。
- `shopt` 只能用于设置和管理 Bash shell 的选项，不能用于设置变量。

通过 shopt 命令设置的选项通常是与 shell 的行为和功能相关的，如扩展的模式匹配、目录递归搜索等。

`set` 命令：
- `set` 用于设置 shell 的参数和变量。
- `set` 可以用于设置和显示 shell 的环境变量、位置参数、特殊参数等。

通过 `set` 命令设置的变量通常是与 shell 的环境和参数相关的，如 `PATH` 变量、`PS1` 提示符、位置参数等。

总的来说，`shopt` 用于管理 Bash shell 的选项，而 `set` 用于设置 shell 的参数和变量。

或者使用如下命令：

```bash
echo $0
```

如果输出是 `bash` 或 `su` 而没有前面的 `-` 符号，则 shell 是非登录 shell。输出显示 `bash` 前面有 `-`意味着我们正在使用登录 shell。

比如：

```bash
user@server:~$ echo $0
-bash # 登录式

root@server:~# echo $0
bash # 非登录式
```