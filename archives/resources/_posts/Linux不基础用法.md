---
title: Linux不基础用法
date: 2023-10-06 23:06:00
tags: Linux
---

**Some uncommon linux commands usages.**

- Heredoc
- sudo bash -c
- lvm
- static IP
- if
- eval
- screen
- shopt(bash)
- uid & user namespace
- ...

*to be continued...*

<!-- more -->


## Heredoc

作为输入重定向，heredoc具有很高的自由度。使用场景是在某些情况下需要给命令传入一个文本或者一系列内容作为参数，比如设置镜像时需要将一大堆的网站地址写入某个文件，这时在写脚本时就可以使用heredoc。

```shell
[COMMAND] <<[-] ['EOF' | EOF]
  CONTEXT
EOF
```

在出入重定向符号 `<<` 后面加上减号 `-` 将使所有前导制表符被忽略。这样就可以在Shell程序脚本编写内容时使用缩进。不允许使用前导空格字符，只能使用制表符。

`EOF`是结束标识符，可以是任何字符串，但一般使用“EOF（End of File）”。单引号是可选的，表示是否转译变量。比如在`CONTEXT`中包含的环境变量，EOF不带单引号会被转换为相应的值，带单引号会将其视作一个字符串。

`CONTEXT` 的内容可以包含字符串，变量，命令和任何其他类型的输入。CONTEXT最后一行以结束标识符结尾。分隔符前面不允许有空格。

作为输入重定向，它当然是与接受输入的`COMMAND`配合才能发挥作用，比如`tee`、`cat`等，结合输出重定向`>`、`>>`将内容写入某些文档。

需要注意的是，`echo`命令并不接受输入重定向，因此一般不与heredoc结合使用。但是`echo`也可以使用引号包含进换行符以达到相同的作用，如：

```shell
echo 'this is line 1
this is line \'2\'
this is line 3' >> somefile.txt
```

其中出现了引号就要转译，这也是不方便的地方，需要使用诸如`\n`之类的还需要使用`-e`参数。

## sudo

很多时候，非管理员时要写入某些管理员文件我们会想当然地认为使用`sudo`，即：

```shell
sudo echo "something" >> somefile
```

但是依然会发现有“Permission denied”的提醒。这是因为`sudo`仅仅给了`echo`命令管理员权限，`>>`重定向时依然没有相应权限。解决办法很多：
 1. 切换到管理员身份
    ```shell
    sudo su
    ```
 2. 使用管道和`tee`
    ```shell
    echo "something" | sudo tee somefile
    ```
 3. 使用`sh -c`
    ```shell
    sudo sh -c "echo "something" >> somefile"
    ```
    `sh`的`-c`选项就是`--cmd`，表示使用`sh`以命令格式运行后面的字符串，因此只要给`sh`权限即可。

## 磁盘管理：lvm

听说磁盘管理对于企业而言似乎不重要，因为企业一般一次买一大块硬盘够用好几年。但是我觉得磁盘管理是很重要的，万一磁盘坏了怎么办？有时候想存一些东西又不想影响其他数据怎么办？对于个人用户怎么办？毕竟我还是很喜欢linux的。

物理磁盘管理很简单：找到对应设备，通常命名是sda、sdb...，使用`fdisk sda`按照提示操作分区，写入文件系统再挂载就可以了。

比较有意思的是lvm，它的结构如下:

<img src='/image/non-basic-linux/image.png' title="图片来源 linux中国">

多了几层比较抽象的概念，但是很好理解：我们有一块硬盘，首先类似地需要对其进行分区，使得系统能够识别这块硬盘，这就是PV；为了使得lvm能够扩容，而且更重要的是，lvm可以使用不同的物理硬盘，我们需要将这些物理硬盘统一起来，告诉系统，下次lvm要扩容，就从这些硬盘里面抽空间，这就是卷组；创建好卷组之后，就可以从卷组中创建lvm。

理解了抽象概念之后就可以很好地理解相关的命令了：

```shell
fdisk /dev/sda # 创建分区
pvcreate /dev/sda1
pvcreate /dev/sda2 # 创建物理卷
vgcreate vg-name /dev/sda1 /dev/sda2 # 创建卷组
lvcreate -L 100M -n lv-name vg-name # 创建逻辑卷，指定大小100M
mkfs.ext4 lv-name # 写入文件系统
mount lv-name dir # 挂载
```

lvm创建的每一步都可以使用`*display`命令检查自己的操作，`*remove`删除创建的内容，即：

```shell
pvdisply
pvremove /dev/sda2/
vgdisplay
vgremove vg-name
lvdisplay
lv remove lv-name # 删除前要先卸载
```

扩容lvm：

```shell
# 设置卷的大小为200M
lvresize -L 200M /dev/vg-name/lv-name

# 接下来，检查磁盘错误
 e2fsck -f /dev/vg-name/lv-name

# 运行以下命令扩展文件系统以后，ext4信息就更新了
resize2fs /dev/vg-name/lv-name 

# 验证
lvdisplay 
```
以上就是完整的操作流程。事实上，现在有很多可视化做的很好地磁盘管理工具，比如ubuntu的Gparted，可以使用`sudo apt install gparted`安装，只要熟悉磁盘管理的流程，操作就不成问题。

## ssh

ssh可方便地远程连接服务器，是一个很好用的工具。ubuntu自带，mac和windows似乎要下载。

首先明白ssh也是client-server架构，服务器是server,登陆方是client,很常见，比如docker也是这样。

ssh会在当前用户的根目录下生成一个`.ssh`文件夹，里面存放着`authorized_keys`，`config`，`github`，`known_hosts`和密钥文件。其中`config`文件配置了一些服务的别名、地址、验证文件等信息，是常常要用到的文件。`authorized_keys`是服务端存储已知客户端公钥的文件，如果一个客户端公钥存在于这个文件中，那么客户端就可以凭借相应的私钥登陆。

同时，linux系统下会有一个`/etc/ssh/`目录，里面有一个`sshd_config`文件，是服务端守护进程的配置文件，里面包含监听地址、监听端口、允许验证次数、是否允许root账户登录等等信息。配置它属于高阶玩法。

一个简单的登陆流程不需要过多的配置，只需要知道主机的地址、用户名、密码即可，格式为:

```shell
ssh user@hostname -p 22
```

参数`-p`表示指定端口，一般ssh默认是22，要使用其他端口，要确服务端防火墙打开，也就是确保客户端有权限访问服务端的这个端口，同时在 `/etc/ssh/sshd_config` 中添加一项 `Port 22222`。可以添加多个端口，只需要确保不会冲突就行，服务器会同时监听这些端口。客户端使用的端口是全权交给操作系统分配的。注意 ssh 协议是基于 TCP 协议的，理解了 TCP 协议就大致理解了 ssh 协议。

每次都要这样操作会很麻烦，于是可以配置`config`文件：

```config
Host nickname
Hostname address
IdentityFile ~/.ssh/key_name
User user
```

`key_name`是在使用`ssh-keygen`命令时指定的密钥名，如果没有指定名称就不需要配置上面的文件，但是如果下次再生成密钥时就会覆盖，所以一般是需要配置一次的。`ssh-keygen`可选参数常用的`-t`指定加密类型，`-b`指定比特位，`-m`指定描述信息。

然后就可以使用`ssh-copy-id -i ~/.ssh/key_name nickname`命令方便地传输密钥，不需要手动复制公钥。输入命令后就可以完成传输，此后就可以使用`nickname`直接登陆主机。

为了方便地实现主机与本机的文件交换，可以使用`scp [-r] src dist`。路径中服务端的路径要写全，比如`nickname:~/myfile`，复制目录时要使用参数`-r`。在mac段有一个可视化的工具叫做transmit,很方便。

还有一个实用命令 `rsync [-r] src dist`，它的使用方式与 `scp` 命令十分相似，其作用是同步文件，如果文件不存在就创建，使用 `-r` 参数以同步多个文件。注意，针对目录的操作中，如果目录后面带有 `/` 则表示同步目录中的每一个文件，而目录本身不会传输，操作后目标位置仅会同步几个文件，不带 `/` 则表示传输整个目录，操作过后目标目录下会多出一个源目录。

在 Mac 系统中传输文件时总会多出一个 `.DS_Store` 文件，这时 Mac 系统特有的，每个文件夹下都会存在的文件，如果简单使用 `-r` 参数就会连带着这个文件一同复制。为了忽视这个文件，可以使用下面的命令：

```bash
rsync  --exclude=".DS_Store" -r src dist
```

可以将 `alias rsync="rsync --exclude='.DS_Store'"` 写入 `~/.bashrc` 或者 `~/.zshrc` 中，以方便使用。Mac 中默认的 Terminal 是 zsh，所以一般写入 `~/.zshrc` 即可。

这个命令还有几个比较好用的参数：`-z`传输时压缩文件，减少传输数据量。`-u`仅传输更新过的文件。`-e` 参数用于指定要使用的远程 shell 程序。通常情况下默认使用 SSH 来进行远程传输，因此 `-e` 参数通常用于指定 SSH 连接的相关选项，比如指定端口号、指定私钥等。

**注意事项**：

在 `config` 文件中设置了主机别名后，要注意这个文件是放在哪个用户根目录中。比如在 `user1` 的根目录也就是 `/home/user1/.ssh` 目录下的 `config` 文件仅对 `user1` 用户有效，在使用别名时会在用户根目录下的 `.ssh` 目录中寻找 `config` 文件并解析，因此在一个用户目录下配置的别名其他用户就无法使用。要配置所有用户都可以使用的别名，要在 `/etc/ssh/` 目录下寻找类似的对应配置文件。

### 问题记录

在使用远程登录 shell 时，可能会遇到某些权限问题。比如我遇到过使用 ssh 链接时，推送更改到 Github 时会出现无仓库权限的提示，但是本地推送就没有问题。我的 GitHub 配置也绝对没有问题。

这个问题我还没有找到原因。但是这也提醒我 ssh 登录与一般登录方式不能完全等价。

## `screen`

既然使用了 ssh 远程命令，也可以了解一下 `screen` 命令。

`screen` 是一个在 Linux 和 Unix 系统中常用的终端复用工具，它允许用户在单个终端窗口中同时运行多个终端会话。通过 `screen` 命令，用户可以创建多个虚拟终端，每个虚拟终端可以独立运行命令，而且用户可以在这些虚拟终端之间自由切换。

以下是 `screen` 命令的一些常用功能和用法：

- 启动一个新的 `screen` 会话：

 ```bash
 screen
 ```

- 创建一个带有自定义名称的 `screen` 会话：

 ```bash
 screen -S session_name
 ```

- 列出当前所有的 `screen` 会话：

 ```bash
 screen -ls
 ```

- 重新连接到一个已存在的 `screen` 会话：

 ```bash
 screen -r session_id
 ```

- 在 `screen` 会话中快捷键：
  
 + 按下 `Ctrl+A` 后，再按下 `C` 键可以创建一个新的终端窗口。
 + 按下 `Ctrl+A` 后，再按下 `N` 键可以切换到下一个终端窗口。
 + 按下 `Ctrl+A` 后，再按下 `P` 键可以切换到上一个终端窗口。
 + 按下 `Ctrl+A` 后，再按下 `D` 键可以暂时断开当前 `screen` 会话，但会话仍在后台运行。
 + 按下 `Ctrl+A` 后，再按下 `K` 键可以关闭当前终端窗口。

`screen` 命令非常有用，特别是在远程连接服务器时，可以保持会话的持久性，即使网络连接断开也能够重新连接到之前的会话。通过 `screen`，用户可以更高效地管理多个终端会话。

## 静态IP

静态IP的配置可以在路由器上设置，但是需要管理员权限。介绍一下ubuntu18以后的版本怎么配置，演示使用的是22.04的长期支持版，操作都相同。

配置文件在`/etc/netplan`目录下的`00-installer-config.yaml`文件，查看和修改中这个文件需要管理员权限。默认的文件内容如下所示：

```shell
~$ sudo cat /etc/netplan/00-installer-config.yaml 
# This is the network config written by 'subiquity'
network:
  ethernets:
    ens160:
      dhcp4: true
  version: 2
```

可以看到使用了DHCP自动获取IP。将其修改为：

```shell
# This is the network config written by 'subiquity'
network:
  ethernets:
    ens160:
      dhcp4: false
      addresses: 
        - 192.168.1.106/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
          addresses: 
            - 8.8.8.8
            - 114.114.114.114
  version: 2
```

这是一个`.yaml`文件，注意空格和缩进。几个参数需要解释一下：

1. `dhcp4`，显然需要设定为`false`以关闭dhcp服务。
2. `addresses`，需要设置的静态IP地址，最好和当前的IP地址一样。查看方法是使用`ifconfig`命令，如果现实没有该命令就使用`sudo apt install net-tools`安装。输入命令后需要找到正确的网卡，比如如下结果：
   
   ```shell
   ~$ ifconfig 
   ens160: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.106  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::20c:29ff:fe9b:b6cb  prefixlen 64  scopeid 0x20<link>
        ether 00:0c:29:9b:b6:cb  txqueuelen 1000  (以太网)
        RX packets 933  bytes 160830 (160.8 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 261  bytes 45010 (45.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 46  memory 0x3fe00000-3fe20000  

   lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (本地环回)
        RX packets 112  bytes 8532 (8.5 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 112  bytes 8532 (8.5 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
   ```
   
   就需要找到网卡`ens160`，找到其中的的配置。可以看到这里的IP是`192.168.1.106`，掩码为`255.255.255.0`，因此就在静态IP中配置为`192.168.1.106/24`。
3. `routes`，配置网关，可以使用`route -n`查看：
   
   ```shell
   ~$ route -n
   内核 IP 路由表
   目标            网关            子网掩码        标志  跃点   引用  使用 接口
   0.0.0.0         192.168.1.1     0.0.0.0         UG    0      0        0 ens160
   192.168.1.0     0.0.0.0         255.255.255.0   U     0      0        0 ens160
   ```

   目标为`0.0.0.0`就代表“整个互联网”，它所对应的网关就是我们需要配置的网关。网关一般就是当前网段的1号IP，但是有一些特殊的路由器厂商会设置为其他的地址，最好还是看着命令来。

4. `nameservers`，配置DNS服务器。

上述操作完成后再使用命令`sudo netplan apply`就可以使配置生效了。

## if语句

 shell脚本中的if条件判断看起来很乱，条件的判断语句有三种格式，逻辑运算符也有两套，字符串和数字的比较也有细微的差别。这些差别很容易让编写的脚本出问题。这里总结一下。

### 条件判断格式

 1. **单中括号`[ ]`**

  - bash的内部命令，`[`和`test`是等同的。如果我们不用绝对路径指明，通常我们用的都是bash自带的命令。`if/test`结构中的左中括号是调用`test`的命令标识，右中括号是关闭条件判断的。这个命令把它的参数作为比较表达式或者作为文件测试，并且根据比较的结果来返回一个退出状态码。基于此，`[ ]`中的内容都被视作是参数，因此必须插入空格。`if/test`结构中并不是必须右中括号，但是新版的Bash中要求**必须**这样。

  - `test`和`[ ]`中可用的比较运算符只有`=`和`!=`，两者都是用于字符串比较的，不可用于整数比较，整数比较只能使用`-eq`，`-gt`这种形式。无论是字符串比较还是整数比较都不支持大于号小于号。如果实在想用，对于字符串比较可以使用转义形式，如果比较"ab"和"bc"：`[ ab \< bc ]`，结果为真，也就是返回状态为0。`[ ]`中的逻辑与和逻辑或使用`-a`和`-o` 表示。

  - `[ ]`也会在正则表达式中用于表示字符范围。用作正则表达式的一部分，描述一个匹配的字符范围。**作为`test`用途的中括号内不能使用正则。**

  - `[ ]`在数组中也用来引用数组中每个元素的编号。

 2. **双中括号`[[ ]]`**

  - `[[`是bash程序语言的关键字，并不是一个命令，`[[ ]]`结构比`[ ]`结构更加通用。在`[[`和`]]`之间所有的字符都**不会发生文件名扩展或者单词分割**，但是会发生参数扩展和命令替换。

  - 支持字符串的**模式匹配**，使用`=~`操作符时甚至支持shell的正则表达式。字符串比较时可以把右边的作为一个模式，而不仅仅是一个字符串，比如`[[ hello == hell? ]]`，结果为真。`[[ ]]`中匹配字符串或通配符，不需要引号。

  - 使用`[[ ]]`条件判断结构，而不是`[ ]`，能够防止脚本中的许多逻辑错误。比如，`&&`、`||`、`<`和`>` 操作符能够正常存在于`[[ ]]`条件判断结构中，但是如果出现在`[ ]`结构中的话，会报错。

  - bash把双中括号中的表达式看作一个单独的元素，并返回一个退出状态码。

 3. **圆括号`( )`，`(())`**
   
   圆括号作为条件判断不常用，但是也会有。
   
   - `( )`会相当于一个子shell，执行括号中的命令，返回命令的执行状态。对于`$(cmd)`结构，便将$(cmd)中的cmd执行一次，得到其标准输出并返回。
  
   - `(( ))`可以将命令扩展为一个数学表达式，计算并返回其结果。如果表达式的结果为0，那么返回的退出状态码为1，或者"false"，而一个非零值的表达式所返回的退出状态码将为0，或者是"true"。若是逻辑判断，表达式exp为真则为1,假则为0。**这一点和`[[ ]]`判断时正好相反。**

   `(())`常用在其他地方，比如`for((i=0;i<5;i++));do cmd;done`，在括号中不需要`$`来使用变量值。

### 字符串判断

以下表达式用来判断字符串。

 - `[ string ]`：如果`string`不为空（长度大于0），则判断为真。

 - `[ -n string ]`：如果字符串`string`的长度大于零，则判断为真。

 - `[ -z string ]`：如果字符串`string`的长度为零，则判断为真。

 - `[ string1 = string2 ]`：如果`string1`和`string2`相同，则判断为真。

 - `[ string1 != string2 ]`：如果`string1`和`string2`不相同，则判断为真。

 - `[ string1 '>' string2 ]`：如果按照字典顺序`string1`排列在string2之后，则判断为真。

 - `[ string1 '<' string2 ]`：如果按照字典顺序`string1`排列在`string2`之前，则判断为真。

>**引用字符串变量作逻辑比较时最好使用双引号**，否则可能会出现错误，提示参数过多。而且如果变量为空，双目判断可能会变为其他的判断，引起难以察觉的逻辑错误，而使用引号可以很好地避免这个问题。比如`[ "$var" = "String" ]`，`[ - n "$var" ]`
>注意，`test`命令内部的`>`和`<`，必须用引号引起来（或者是用反斜杠转义）。否则，它们会被 shell 解释为重定向操作符。

### test 判断的逻辑运算

通过逻辑运算，可以把多个`test`判断表达式结合起来，创造更复杂的判断。三种逻辑运算`AND`，`OR`，和`NOT`，都有自己的专用符号。

 - `AND`运算：符号`&&`，也可使用参数`-a`。

 - `OR`运算：符号`||`，也可使用参数`-o`。

 - `NOT`运算：符号`!`。

### 文件判断

文件状态的判断也很常用，简单罗列一部分：

 - `[ -d dir ]`：如果 `dir` 存在并且是一个目录，则为`true`。

 - `[ -e file ]`：如果 `file` 存在，则为`true`。

 - `[ -f file ]`：如果 `file` 存在并且是一个普通文件（不是块或者其他设备文件），则为`true`。

 - `[ -L file ]`：如果 `file` 存在并且是一个符号链接，则为`true`。
 
 - `[ -N file ]`：如果 `file` 存在并且自上次读取后已被修改，则为`true`。

 - `[ -r file ]`：如果 `file` 存在并且可读（当前用户有可读权限），则为`true`。

 - `[ -w file ]`：如果 `file` 存在并且可写（当前用户拥有可写权限），则为`true`。

 - `[ -x file ]`：如果 `file` 存在并且可执行（有效用户有执行／搜索权限），则为`true`。

## eval 命令

`eval` 是一个 bash 内置命令，语法格式为：

```bash
eval cmd
```

运行时，`eval` 命令会先将传递给它的参数(`cmd`)解析为bash命令，然后再执行这个命令，就是俗称的“二次扫描”。

比如定义一个变量 `cmd='ls -al'`，然后执行 `eval $cmd` 时，它会首先扫描 `$cmd` 对其进行解析，解析得到的命令为 `cmd` 的值，即 `ls -al`，然后再运行这个命令，而不是将其简单地视作字符串。

再比如命令 `eval echo '$'$#`，运行时首先解析字符串 `'$'$#`，其含义是明显的，`'$'`是一个字符不动，`$#`作为 bash 保留变量表示传输到脚本中的变量个数，比如传递了4个变量，那么命令就相当于执行 `echo $4`。

再比如，定义变量 `x=foo`，`foo=4`，如果直接运行 `y=\$$x`，会发现变量 `y` 的值是字符串 `$foo`，很明显，`echo` 命令解携了一次参数 `\$$x`，将`$x`解析为`foo`，所以`\$`与`foo`拼接起来的到`y`的值是`$foo`。如果使用 `eval y=\$$x` 则会再将 `y=$foo` 解析为 `y=4`然后执行，最终变量 `y` 的值就为4。

## shopt (Bash)

在 Bash 中，有两个内置命令用来控制 Bash 的各种可配置行为的开关（打开或关闭），这些开关称之为选项（option）。其中一个命令是 `set`，`set` 命令有三种功能：显示所有的变量和函数；修改 Bash 的位置参数；控制 Bash 的第一套选项。可见 `set` 命令完全违背了“一个命令只干一件事”的 UNIX 哲学。另外一个命令是 `shopt`，从名字（shell options 的缩写）就可以看出，它的功能是控制 Bash 的另一套选项。

`set` 命令是 Bash 从 sh 继承来的，而且它和它的大多数选项一起都是在 POSIX 规范中的。而 `shopt` 是 Bash 在 2.0 版本时新增的，别的 Shell 没有这个命令。

在 Bash 1.* 时代，用 `set` 命令开启的选项只能在当前 Shell 进程中生效，没有办法通过环境变量传递给它的子进程 Shell，从 Bash 2.0 开始，新增了一个只读变量 `SHELLOPTS`，只要把它设置成环境变量，它就能把在当前 Shell 中打开的选项传递给子进程 Shell。

`shopt` 也可以控制 `set` 的选项，反之则不行。`shopt` 命令有个 `-o` 选项，这个选项的功能就是用来查看或修改原本用 `set` 控制的那套选项。

为什么有两个变量来控制选项，参考文章[Bash 为何要发明 shopt 命令](https://www.cnblogs.com/ziyunfei/p/4913758.html)。上面的内容也基本是复制来的。

为什么要知道这个？在使用Shell脚本时，需要注意，bash 的有些行为与终端有所不同，比如 `alias` 命令。使用 `shopt expand_aliases` 命令查看 `alias` 配置时会发现 `expand_aliases` 默认是 `off`，这意味着此时虽然仍然可以定义alias别名，但是bash不会将alias别名扩展成对应的命令，而是将alias别名本身当作命令执行。

但是上面的问题在其他shell中就不存在，比如zsh脚本中就可以正常使用`alias`命令。

其实在这就是几种shell启动方式的区别。在非交互式或者非登录式的bash shell中都会是这样。可以在脚本中手动打开这个选项，命令 `shopt -s  expand_aliases `。或者在脚本中指定以使用login shell，方法是在第一行的指定的解释器后加上 `--login`，即第一行变成 `#!/bin/bash --login`。或者直接在脚本中读取相关配置文件，可以读取 `source ~/.bahsrc`。或者将bash指定为交互式，即第一行使用 `#!/bin/bash -i`。

## uid & user namespace

简单用自己的话总结一下，就是说uid由内核管理，而内核只会管理一套uid、gid。一个用户由uid唯一标识，至于作为字符串的username则由用户级的应用比如passwd提供。

uid的重要性主要体现在权限管理上，内核在访问资源时会通过操作的uid来确定其是否有相应权限。

user namespace则是对uid的显示上封装在一个独立环境中，比如uid=1000的用户创建了ns，它在这个ns中的uid就是0，也就是root。但是对于内核而言它依然只是同一个用户，只是权限发生了一些变化。

上面的过程还牵扯到用户映射的概念，很好理解，字面意思。但是不是很理解的是ns的资源是什么意思。暂且抽象地想象成一个集合，对应一些文件，一些命令。

说到权限，有一个概念是capability。如果没有这个概念，可以想像我们的权限就只剩了，root或者非root，这是非常危险的。所以将root的权限拆分为capabilities，在执行操作时只赋予对应的capability，限制恶意程序。

在namespace中，一个namespace的创建者具有它的全部capabilities，但是这个创建者在这个namespace中不具有任何父ns中的任何capabilities，也就是说，在一个ns中的root用户，即便对于内核而言它的确是系统的root，它也不能访问ns资源之外的资源。用户在同一个namespace中的权限则视实际执行环境而定。

这些内容在docker容器中会比较有实际价值。虽然docker默认并不启用内核的ns，但是实际运行模式类似，不同之处在于docker是直接在容器内限制了其他资源的可见性。有时还是需要考虑docker容器进程运行的用户问题，就需要清楚uid的有关概念了。