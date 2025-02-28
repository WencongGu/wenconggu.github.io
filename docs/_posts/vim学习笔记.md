---
title: NeoVim学习笔记
mathjax: true
date: 2024-11-22 17:25:06
tags: NeoVim
---

初学时的草稿型笔记，杂乱地记录下。

<!--more-->



neovim


cmd mode: %s/pattern/new/g 表示替换：s->substitution g->global

help命令：:h cmd, or :h 'setopt'

lua调用vimscript：vim.cmd “set number”

## Configuration

User configuration and data files are found in standard base-directories (see also $NVIM_APPNAME). Note in particular:

- Use `$XDG_CONFIG_HOME/nvim/init.vim` instead of `.vimrc` for your config.
- Use `$XDG_CONFIG_HOME/nvim` instead of `.vim` to store configuration files.
- Use `$XDG_STATE_HOME/nvim/shada/main.shada` instead of `.viminfo` for persistent session information. shada

Note: 用`init.lua`和`init.vim`都可，不过一个用lua语法，一个用vim的专用语法。建议用`init.lua`。

## Standard Paths

Nvim stores configuration, data, and logs in standard locations. Plugins are
strongly encouraged to follow this pattern also. Use stdpath() to get the
paths.

The "base" (root) directories conform to the XDG Base Directory Specification.
[https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)

The `$XDG_CONFIG_HOME`, `$XDG_DATA_HOME`, `$XDG_RUNTIME_DIR`, `$XDG_STATE_HOME`, `$XDG_CACHE_HOME`, `$XDG_CONFIG_DIRS` and `$XDG_DATA_DIRS` environment variables are used if defined, else default values (listed below) are used.

- CONFIG DIRECTORY (DEFAULT)
    
`$XDG_CONFIG_HOME `           Nvim: stdpath("config")
    
    Unix:         `~/.config`                   `~/.config/nvim`
    
    Windows:      `~/AppData/Local`             `~/AppData/Local/nvim`
- DATA DIRECTORY (DEFAULT)

`$XDG_DATA_HOME`              Nvim: stdpath("data")

    Unix:         `~/.local/share`              `~/.local/share/nvim`

    Windows:      `~/AppData/Local`             `~/AppData/Local/nvim-data`
- RUN DIRECTORY (DEFAULT)

`$XDG_RUNTIME_DIR`            Nvim: stdpath("run")

    Unix:         `/tmp/nvim.user/xxx`          `/tmp/nvim.user/xxx`

    Windows:      `$TMP/nvim.user/xxx`          `$TMP/nvim.user/xxx`
- STATE DIRECTORY (DEFAULT)

`$XDG_STATE_HOME`             Nvim: stdpath("state")
    
    Unix:         `~/.local/state`              `~/.local/state/nvim`
    Windows:      `~/AppData/Local`             `~/AppData/Local/nvim-data`
- CACHE DIRECTORY (DEFAULT)

`$XDG_CACHE_HOME`             Nvim: stdpath("cache")

    Unix:         `~/.cache`                    `~/.cache/nvim`

    Windows:      `~/AppData/Local/Temp`        `~/AppData/Local/Temp/nvim-data`
- LOG FILE (DEFAULT)

`$NVIM_LOG_FILE`              Nvim: stdpath("log")/log

    Unix:         `~/.local/state/nvim`         `~/.local/state/nvim/log`

    Windows:      `~/AppData/Local/nvim-data`   `~/AppData/Local/nvim-data/log`
> Note that stdpath("log") is currently an alias for stdpath("state").

- ADDITIONAL CONFIGS DIRECTORY (DEFAULT)

`$XDG_CONFIG_DIRS`            Nvim: stdpath("config_dirs")

    Unix:         `/etc/xdg/`                   `/etc/xdg/nvim`

    Windows:      `Not applicable`              `Not applicable`
- ADDITIONAL DATA DIRECTORY (DEFAULT)

`$XDG_DATA_DIRS`              Nvim: stdpath("data_dirs")

    Unix:         `/usr/local/share`            `/usr/local/share/nvim`
                  `/usr/share`                  `/usr/share/nvim`

    Windows:      Not applicable              Not applicable


## linux的XDG（X Desktop Group）基本目录规范

XDG基本目录规范基于以下概念：

- 有一个用于写入特定用户数据文件的基本目录: `$XDG_DATA_HOME`
- 有一个用于写入特定用户的配置文件基本目录: `$XDG_CONFIG_HOME`
- 有一组首选的基本数据目录: `$XDG_DATA_DIRS`
- 有一组首选的基本配置目录: `$XDG_CONFIG_DIRS`
- 有一个用于写入用户特定的非必要（缓存）数据的基本目录: `$XDG_CACHE_HOME`
- 有一个用户放置特定于用户的运行时文件和其他文件对象: `$XDG_RUNTIME_DIR`

|XDG环境变量|默认值|
|:-:|:-:|
`$XDG_DATA_HOME`|`$HOME/.local/share`
`$XDG_CONFIG_HOME`|	`$HOME/.config`
`$XDG_DATA_DIRS`|	`/usr/local/share/:/usr/share/`
`$XDG_CONFIG_DIRS`|	`/etc/xdg`
`$XDG_CACHE_HOME`|	`$HOME/.cache`
`$XDG_RUNTIME_DIR`| 用户特定的不重要的运行时文件和其他文件对象（例如套接字，命名管道…）存储的基本目录。该目录必须由用户拥有，并且他必须是唯一具有读写访问权限的目录。它的Unix访问模式必须是0700。

参考规范


文件|	参考规范：subdir应该为软件名
|:-:|:-:|
数据文件|	`$datadir/subdir/filename`
配置文件|	`$confdir/subdir/filename`

`$config`默认为`～/.config:/etc`

命令：

基本移动：
hjkl
gg/G
<Ctrl-u>/<Ctrl-d> = pageUp/pagrDown half page
<Ctrl-b>/<Ctrl-f> = full page
zz/zt/zb

f: forward
b: backward
u: pageup
d: pagedown

?反向查找


## 非见名知义符号

- % 

跳转：跳到匹配的配对符（括号等）处
命令：range，所有行
寄存器：当前文件名，只用于put
跳转：{x}%表示跳转到当前文档百分之x的位置

- " 

寄存器：前缀，指定某次操作使用的寄存器
mark：上次离开这个文件的位置

- ' or ` 

跳转：mark，标记位置

- .  

普通：重复上一次修改。宏中仅对最后一个修改有用。
命令模式：address，表示光标所在行
寄存器：上一次插入内容，只用于put
mark：上次修改的位置

- ,

查找：重复上一次的f查找（;用于F查找）!f查找用于本行查找！

- &

命令：重复上次:s操作

- *

查找：当前所在WORD为{pattern}，等价于/{pattern}，正向查找
range：使用上次可视区域

- #

查找：当前所在WORD为{pattern}，等价于/{pattern}，反向查找
寄存器：包含当前窗口能使用的文件名，只用于put

- :

普通：√
寄存器：上一次执行的命令，只用于put


## 寄存器

| 类型                | 标识               | 读写者 | 是否为只读 | 包含的字符来源                                                                                                                                                                                                                                       |
| ------------------- | ------------------ | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unnamed             | `"`                | vim    | 否         | 最近一次的复制或删除操作 (`d`, `c`, `s`, `x`, `y`)                                                                                                                                                                                                   |
| Numbered            | `0`至`9`           | vim    | 否         | 寄存器 `0`: 最近一次复制。寄存器 `1`: 最近一次删除。寄存器 `2`: 倒数第二次删除，以此类推。对于寄存器 `1` 至 `9`，他们其实是只读的最多包含 9 个元素的队列。这里的队列即为数据类型 [queue](<https://en.wikipedia.org/wiki/Queue_(abstract_data_type)>) |
| Small delete        | `-`                | vim    | 否         | 最近一次行内删除                                                                                                                                                                                                                                     |
| Named               | `a`至`z`, `A`至`Z` | 用户   | 否         | 如果你通过复制操作存储文本至寄存器 `a`，那么 `a` 中的文本就会被完全覆盖。如果你存储至 `A`，那么会将文本添加给寄存器 `a`，不会覆盖之前已有的文本                                                                                                      |
| Read-only           | `:`与`.`和`%`      | vim    | 是         | `:`: 最近一次使用的命令，`.`: 最近一次添加的文本，`%`: 当前的文件名                                                                                                                                                                                  |
| Alternate buffer    | `#`                | vim    | 否         | 大部分情况下，这个寄存器是当前窗口中，上一次访问的缓冲区。请参阅 `:h alternate-file` 来获取更多帮助                                                                                                                                                  |
| Expression          | `=`                | 用户   | 否         | 复制 VimL 代码时，这个寄存器用于存储代码片段的执行结果。比如，在插入模式下复制 `<c-r>=5+5<cr>`，那么这个寄存器就会存入 10                                                                                                                            |
| Selection           | `+`和`*`           | vim    | 否         | `*` 和 `+` 是 [剪贴板](#剪贴板) 寄存器                                                                                                                                                                                                               |
| Drop                | `~`                | vim    | 是         | 最后一次拖拽添加至 Vim 的文本（需要 "+dnd" 支持，暂时只支持 GTK GUI。请参阅 `:help dnd` 及 `:help quote~`）                                                                                                                                          |
| Black hole          | `_`                | vim    | 否         | 一般称为黑洞寄存器。对于当前操作，如果你不希望在其他寄存器中保留文本，那就在命令前加上 `_`。比如，`"_dd` 命令不会将文本放到寄存器 `"`、`1`、`+` 或 `*` 中                                                                                            |
| Last search pattern | `/`                | vim    | 否         | 最近一次通过 `/`、`?` 或 `:global` 等命令调用的匹配条件                                                                                                                                                                                              |




## 标识符

- <Nul> : 0 = CTRL-@ <Nul> 
- <BS> : 退格键 = CTRL-H backspace 
- <Tab> : 制表符 = CTRL-I , tab   Tab linefeed 
- <NL> : 换行符 = CTRL-J , (用作 <Nul>)
- <CR> : 回车符 = CTRL-M , carriage-return 
  - <Return>  同 <CR> 
  - <Enter>   同 <CR>
- <Esc> : 转义 = CTRL-[ , escape   <Esc>
- <lt> : 小于号 = < , <lt> 
- <Bslash> : 反斜杠 = \ , backslash   <Bslash> 
- <Bar> : 竖杠 = | , <Bar> 
- <CSI> : 命令序列引入 = ALT-Esc , <CSI> 
- <EOL> : 行尾 (可以是 <CR>、<NL> 或 <CR><NL>，根据不同的系统和 'fileformat' 而定)
- <S-...> : Shift＋键 = shift , <S- 
- <C-...> : Control＋键 = control , ctrl   <C- 
- <M-...> : Alt＋ 或 Meta＋键 , meta  alt   <M- 
- <A-...> :  同 <M-...> , <A- 
- <D-...> : Command＋键 (只用于 Macintosh) ,  <D-



操作符与命令补充
- gu /gU /g~  ：操作符，                转小写/转大写/翻转大小写
- J ：join，连接两行
- <Ctrl-a> /<Ctrl-x> ：增加数字/减少数字
- g<Ctrl-A> ：创建递增序列
- < /> ：左/右缩进


:f[ile][!] {name}       设置当前文件名为 {name}。可选的 ! 避免截短消息，就像
                         :file  那样。

[https://yianwillis.github.io/vimcdoc/doc/editing.html#editing.txt](https://yianwillis.github.io/vimcdoc/doc/editing.html#editing.txt)



:center|left|right 默认以80列


:e[dit] {filename} 编辑文件

buffer:

 buffer的三种状态：a：active，已加载到内存并显示，h：hidden，已加载到内存但未显示，i：inactive，未加载
 
 `hidden`
 
 一般修改后的buffer切换时要:bn!，此时变为h状态。选项hidden就是允许直接hide。

:edit :e
:buffers :ls
:bn/bp    切换：next/previous<C-^>
:b[bufferno] /b [buffername] 切换到指定buffer
:badd
:bd 

:bufdo {cmd} 对所有的buffer做cmd，多个cmd用管道符隔开，这里和Linux中含义不同

:explorer :E 打开文件夹，这也是一个buffer

:sp :split <C-W>s 水平分割，跟一个文件
:vs :vsplit <C-W>v 垂直分割 


todo：尝试将alt/option键+↑↓←→ ️改成像vs code中一样的移动，思路是剪切+粘贴


**多窗口三个主题：buffer、window、tab，附加一个args，另外就是目录操作：netrw，文档P4336**
bufdo,windo,tabdo,argdo

- args
  - :args {filenames}
  - :n[ext]
  - :p[revious]
  - :w(rite)n
  - :w(rite)p
  跳转：
  - `" 上次离开这个文件的位置
  - `. 上次修改的位置
  - `[A-Z] 大写字母对所有文件生效，小写mark对当前文件生效
  动：
  - argdo
- window
  增：
  - :new
  - :vnew = :vertical new
  - :sp[plit] {filename}
  - :vs[plit] {filename}
  删：
  - :clo[se] = :q
  - :on[ly]
  - :hide
  改：
  <C-W>系列命令
  - <C-W>w
  - <C-W>↑↓←→
  动：
  - windo
  预览窗口：
  - :pc[lose]
- tab
  增：
  - :tabe[dit] = :tabnew
  - :tab split
  删：
  - :tabc[lose]
  改：
  - :tabo[nly]
  - :tabn[ext] = gt（普通模式命令）
  - :tabp[revious] = gT（——）
  查：
  - :tabs
  动：
  - :tabd[o] {cmd} 可以用|连接多条命令
  - :tab {Ex cmd} (eg. :tab h tab)
- buffer
  增：
  - :e[dit] {filename}
  - :hide
  - :b[uffer] {no/filename}
  - :sb[uffer] {no/filename} 新窗口打开某个buffer 
  - :sbn/sbp
  删：
  - :bd[elete] 区别 :bw[ipeout]
  改：
  - :bn[ext]
  - :bp[revious]
  查：
  - :ls = buffers
- netrw
  - :Ex[plore]
  跳转：
  进入后。要回到浏览器，再用一次 ":edit ." 或":Explore" ":Rexplore" 即可，按 <CTRL‑O>（回到之前的位置）也行。
  - <CR> 进入
  - -或u或<C-O>返回
  增：
  - d 新建目录
  删：
  - D 删除
  改：
  - R 改名
  查：
  - o 水平新窗口打开
  - v 垂直新窗口
  - p preview-window
  - t 使用新tab打开
  - mb/gb 建立/转到bookmark

如果寄存器存放着诸如 <BS> 或其它特殊字符，这些字符就被解释成好像它们本来是从键
盘键入的。如果你不要这样解释 (你确实要在文本中插入 <BS>)，那么要命令 CTRL‑R
CTRL‑R {register}。

- u 列表外缓冲区 unlisted‑buffer 。
- % 当前缓冲区。
- # 轮换缓冲区。
- a 激活缓冲区，缓冲区被加载且显示。
- h 隐藏缓冲区，缓冲区被加载但不显示。
- = 只读缓冲区。
- ‑ 不可改缓冲区，'modifiable' 选项不置位。
- + 已修改缓冲区。



Path to a Vim configuration file. If unset, it will check for `$HOME/.vscodevimrc`, `$HOME/.vimrc`, `$HOME/_vimrc`, and `$HOME/.config/nvim/init.vim`, in that order.

24

想要输入真的<ESC>之类的字符串，可以用\<ESC>

/查找之后普通模式下用n下一个，N上一个
**回到之前位置用<C-O>，新位置用<C-I>**

实际上还可以使用大写字母标记，这种标记是全局的，它们可以在任何文件中使用。

:r {filename or !cmd} 提前内容

R进入替换模式

<C-A>add
<C-X>减

键盘映射 n,i,v,o(操作符等待),c,x,t,l,s

有七种映射存在
- 用于普通模式: 输入命令时。
- 用于可视模式: 可视区域高亮并输入命令时。
- 用于选择模式: 类似于可视模式，但键入的字符对选择区进行替换。
- 用于操作符等待模式: 操作符等待中 ("d"，"y"，"c" 等等之后)。
-下: omap‑info 。
- 用于插入模式: 也用于替换模式。
- 用于命令行模式: 输入 ":" 或 "/" 命令时。
- 用于终端模式: 在 :terminal 缓冲区里输入时。



