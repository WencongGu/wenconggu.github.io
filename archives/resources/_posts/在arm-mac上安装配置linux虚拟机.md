---
title: 在M1芯片的MacBook Air中配置Linux（ubuntu）
date: 2023-12-03 19:17:20
tags: Linux
---


前段时间研究隐私计算，涉及联邦学习，要配置环境。我是用的是国内微众银行的FATE框架，设备是m1 MacBook Air。配置过程有两大问题，第一是FATE框架只支持linux，第二是只支持x86处理器架构。感觉就像是对Mac判了死刑。但是经过我一番折腾，发现还是可以在docker中跑起来的，虽然花费一些精力。折腾光是折腾Linux也花了小白不少时间，所以写文来记录一下。

arm架构的处理器要安装centos实属有些状况，会发现下载来的安装包安装不了。网络上有关于这个问题的探讨可以参考，[arm64(aarch64)安装centos 7.5.1804](https://blog.csdn.net/feixiang3839/article/details/80857138/)。当然可以选择下载民间制作的镜像，只是我觉得centos7官方似乎“不再维护”了，没必要（虽然它的确是目前国内应用最多的linux）；而且我们arm党在装好后就会发现，centos下的包管理器国内镜像源也相对很少。

于是我来投向Ubuntu。为什么？因为用的人多，社区活跃，配套软件支持丰富，相对也足够稳定。

总结地讲，遇到的困难主要就是国内网络配置问题，其次就是arm架构的问题。

<!-- more -->

## 安装VMWare Fusion

要装虚拟机首先需要一个虚拟机软件。这里选用VMWare，Mac上它叫Fusion版。它本身是一个收费软件，但是它的许可证密钥很容易找到可用的，只是个人使用的话问题不大。安装也很简单，去[官网](https://www.vmware.com/products/fusion/fusion-evaluation.html)下载，一步步安装就行。到许可证密钥那一步直接上浏览器搜关键词“VMWare密钥”，试一试就能找到可用的。如果是在不放心，可以看看[这位大佬的文章](https://zhuanlan.zhihu.com/p/452412091)，文章详细介绍了在VMWare里装Windows，不想装Windows可以学习一下VMWare，能有比较好的理解。当然本文也会有较为详尽的介绍。

## 下载Ubuntu镜像

下载镜像去[官网](https://cn.ubuntu.com)是最让人安心的，但是在国内下载极慢。可以去[中科大的镜像源](https://mirrors.ustc.edu.cn)。

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.25.21.png>)

找到“Ubuntu”，注意不是衍生版或者core，这两种一般用在别的地方。选择一个版本，注意作为M1 Mac用户要选择arm64版本。那么选择哪一个Ubuntu呢？答案是`22.04.4(arm64, Server)`。

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.26.03.png>)

>解释一下：选择22.04.4而不是更新的版本？因为这个版本是所谓的“LTS（Long Term Support）”版，就是长期支持版，选择这个版本在相当一段时间内是不用担心官方会抛弃这个版本了。怎么知道它是LTS版的呢？在官网的下载界面可以看到这个版本号后面会有LTS标注，而可选的更新的版本则没有。

![alt text](<image/mac-ubuntu/截屏2024-03-05 19.34.13.png>)

>另外，arm版本的ubuntu镜像中，官方提供的只有Server版本。这就导致我们安装好系统后还需要配置桌面环境，但是这并不算麻烦。如果不是arm架构的芯片，我们可以直接下载Desktop版。不过值得一提的是，如果使用的是其他的镜像源网站比如清华的tuna，arm版ubuntu镜像也是有预装桌面环境的版本的，就在刚刚下载的那个版本前后，有一个`22.04.4(arm64+raspi, Preinstalled Desktop)`，下载的文件是`.img.gz`，应该可以先解压，改一下后缀变成`.iso`文件就行。当然可行，不过我想有一个更加定制化的系统，去除那些多余的组件，也能让后面运行多个虚拟机时更加快捷。
>>多提一句，显然，arm的机器是不能安装其他架构的虚拟系统的。但是，有一款软件叫UTM，它可以直接运行x86或者其他架构的系统，其实是借助一个叫qemu的模拟技术，在安装时只需要关闭Hypervison功能就行。之所以我要说的这么抽象，是因为实在不推荐这么办，因为模拟化技术实在吃性能，模拟出来的机器性能也堪忧，没有实际价值。

## 安装Ubuntu

下载好镜像后就可以安装了。打开VMWare，在弹出的窗口中点击左上角的加号选择新建：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.14.41.png>)

接下来按照提示把下载好的镜像文件拖到地方，也就是所谓的“**从光盘或者映像中安装**“。

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.14.10.png>)

>至于其他的三个选项，显然一个是关于Windows，一个是关于远程服务器的，另一个是使用`.vmdk`文件创建虚拟机，这是VMWare自创的一种虚拟机磁盘文件格式，如果你之前使用VMWare创建过虚拟机，那只需要保存那个虚拟机的这个文件就可以完整复现原先的虚拟机。这段介绍不清楚也无关紧要，只是了解一下这个软件会让我们更加从容。

继续操作。拖拽到位后VMWare会自动识别文件，因此会直接出现“**完成**”的界面：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.15.41.png>)

当然可以选择直接运行，不过更多地时候我们会想要自定义设置，那样的话有一种掌握实权的感觉。如果直接运行的话点击**完成**，命名之后（也可以指定一个虚拟机存放位置，无关紧要）存储，点击新窗口中的开始符号就会开始安装，在之后可以再进行相关自定义设置；如果要自定义，点击**自定设置**，就会弹出设置窗口。一般我自己的设置是：

1. 配置**硬盘**为32G（默认20G，一般够用），总线类型改为SATA，取消拆分为多个文件；
   
2. **处理器**改为4核；
   
3. **网络**模式改为WI-FI；
   
4. 移除USB和蓝牙（反正也用不了）、摄像头。

就不一一展示了，各位可以尽管自信地自定义，大不了重装一次，反正iso文件就在那里。

点击窗口的那个三角形的开始按钮后，直接回车稍微等待片刻。

>此时想使用鼠标的话可以使用`control + command`键释放鼠标。

片刻后出现如下画面：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.18.28.png>)

回车：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.19.00.png>)

可以看到没有中文选项，但是没关系！直接连发几个回车，分别设置了:

1. **语言**
2. **键盘布局**
3. **安装类型**
4. **网络**
5. **代理**（直接没有，之后再设置）
6. **镜像测试**（到这一步要等一会儿，或者直接回车之后选择continue，一般mirror不会有问题）

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.19.17.png>)

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.19.27.png>)

然后到了**磁盘**这一步：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.19.58.png>)

>可以看到设置了LVM（Logic Volume Manager），这个磁盘管理方式方便日后扩容，就保持不变吧。但是目前没有用上已有的空间，可以在在这里方便的设置一下，但是跳过也丝毫不影响。

首先选择下面的**Done**，在下一个页面中选择这一条：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.20.13.png>)

回车后选择**Edit**，在弹出的窗口中可以调整这个磁盘的**Size**，在这一栏什么都不填的话就默认最大：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.20.27.png>)

完成后选择Save，可以看到界面发生了某些变化：先前的free space都被我们吃掉了。选择**Done**，然后**Continue**：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.21.01.png>)

然后就是设置一些账号密码，这在屏幕上有着清晰的展示。这些内容以后都是可以更改的，不必纠结（上面所有的设置都可以在以后更改）。比如我的设置就很随便，密码也很简单：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.21.48.png>)

接下来就是直接**continue**，然后就是一个询问要不要安装OpenSSH：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.22.36.png>)

>这是一个很好用的工具，要不要呢？想一下，如果以后有远程登录到这台机器的需求就安装，只需要**空格**选择；没有就不用安装。但是这个后面也可以再装，所以我一般不装。

选择**Done**，后面也是一些很popular的工具：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.22.45.png>)

一般我都直接跳过。选则**Done**之后就进入安装界面：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.22.51.png>)

等待一会儿，不需要太久，看到这个画面：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.37.11.png>)

选择“**Reboot Now**”重启，稍后会看到：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.37.21.png>)

这时候需要我们**回车**才会进入系统，主要是此时我们的CD/DVD还安装着，所以没办法进入。

稍等片刻，看到：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.41.09.png>)

乱七八糟的信息，主要就是一些密钥，直接输入刚才设置的用户名（username），再输入密码（输入密码过程不会显示），就进入系统了。

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.41.23.png>)

看着满屏的信息，感觉很烦，可以用`Ctrl + L`或者命令输入`clear`清除界面。接下来开始对系统动刀子。为方便操作，可以先切换到管理员身份，运行

```shell
sudo su
```

随后输入用户密码。这样可以避免每条命令都输入`sudo`。

1. 更新软件源
   
   ```shel
   apt update -y && apt upgrade -y
   ```

2. 安装桌面环境
   
   ```shell
   apt install --no-install-recommends ubuntu-gnome-desktop -y
   ```

   >解释一下，`--no-install-recommends`参数表示不安装其他附加包。对一般人而言这些附加包完全用不上，想用的话也可以再安装，而这里不安装直接可以省下至少1G的内存。当然可以去掉这个选项。后面使用的`ubuntu-gnome-desktop`环境也是可以选择的，它跟`ubuntu-desktop`没有区别，其他还有一些桌面环境比如lxde（xubuntu）、lubuntu等，很多，不想折腾的话就用`ubuntu-gnome-desktop`应该可以满足大部分需求。

3. 安装firefox
   
   如果上一步使用了`--no-install-recommends`参数，那就需要单独安装一下firefox，否则没有浏览器。命令也很简单：

   ```shell
   apt install firefox -y
   ```

   >安装时可能略微卡顿一下，可能会有3分钟到10分钟左右看起来像卡住了一样，不要紧，耐心等待一下，安装完成。

这是我们只要重启一下就可以进入图形化的桌面环境了。**但是**且慢，我们先关机，把CD/DVD移除了。输入命令：

```shell
shutdown now
```

关机后，在窗口的左上角可以找到设置按钮，点开就看到了设置页面，以后其他的设置比如网络、内存、硬盘都可以在这里设置。现在点击“CD/DVD(SATA)”按钮，选择“高级选项”，移除：

![alt text](<image/mac-ubuntu/截屏2024-03-05 21.19.23.png>)
![alt text](<image/mac-ubuntu/截屏2024-03-05 21.19.38.png>)

再开机后应该就可以看到图形桌面环境了。

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.13.09.png>)

登录，进入桌面环境：

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.13.29.png>)

## 设置Ubuntu

### 设置中文

点击左下角，打开Settings，找到“**Region & Language**”，

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.13.46.png>)

选择“**Manage Installed Languages**”，

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.14.10.png>)

找到“**Install/Remove Languages...**”：

![alt text](<image/mac-ubuntu/截屏2024-03-05 21.23.06.png>)

点击，勾选“**Chinese(simplified)**”：

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.14.26.png>)

随后点击“**Apply**”，输入密码后，等待安装：

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.14.38.png>)

**安装完成后记得把中文拖到English上面**，这样：

![alt text](<image/mac-ubuntu/截屏2024-03-05 21.32.14.png>)

之后就**close**，然后**重启**，再登录时就是中文了：

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.29.17.png>)

选择“**保留旧的名称**”，且“**不要再次询问我**”，命令行操作时会方便很多。

>当然上面设置中文的步骤不是必须的。英语能力对于搞Linux的人来说也是很重要的。可以的话使用英文当然不错。

### 配置软件源

>配置软件源是说在使用apt软件管理包时从这个源网站下载软件，原始的源不算慢，但是国内源更快。就使用中科大源吧，常用的源很多，比如清华、阿里、华为，基本是一样的，一般而言企业的源质量要好于学校的，这里为了演示就用中科大的。（20240306: 建议先不要用清华的，同步有点慢，导致有的软件装不了。）

这时打开Firefox，搜索再次进入[中科大的镜像源](https://mirrors.ustc.edu.cn)，搜索ubuntu，看到：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.29.42.png>)

注意，arm架构的我们要用的是“ubuntu-ports”，点击那一行右边的`Help`，进入：

![alt text](<image/mac-ubuntu/截屏2024-03-06 12.31.04.png>)

可以看到官方的指导。可以按照下面的步骤来：

先打开一个终端（Terminal），运行：

```shell
sudo su
```

以切换到管理员，随后直接运行：

```shell
cp /etc/apt/sources.list /etc/apt/sources.list.backup # 备份官方源
cat /etc/apt/sources.list << EOF # 写入新配置
# 默认注释了源码仓库，如有需要可自行取消注释
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy main main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-security main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-security main restricted universe multiverse

# 预发布软件源，不建议启用
# deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-proposed main restricted universe multiverse
# deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-proposed main restricted universe multiverse
EOF
apt update -y && apt upgrade -y # 更新软件源
```

另外，可能很多人会觉得这个终端的字体好难受，那就设置一下。点击左上角的三条杠，选择“配置文件首选项”，选择下面的“未命名”，在右边的选项中勾选“自定义字体”前面的选项框：

![alt text](<image/mac-ubuntu/截屏2024-03-05 22.05.14.png>)

会发现稍微舒服了一点，还有其他一些设置可以自定义。

### 安装Docker

 Docker真的很好用。它是一种虚拟化技术，可以在很小的开销中实现，省去了很多配置环境的烦恼。虽然我们在虚拟机中再装一个虚拟化软件很幽默，但好用就行。而且相对于装虚拟机，它造成的性能损失与系统资源开销几乎可以忽略。

 安装Docker很简单，我们选择最简单的，用官方提供的脚本安装，并使用清华镜像源加速。清华的官方说明同样可以在官网搜索“docker”，同样进入“docker-ce”那一行右边的`Help`：

![alt text](<image/mac-ubuntu/截屏2024-03-06 16.55.39.png>)

可以看到“自动安装方式”的指导：

![alt text](<image/mac-ubuntu/截屏2024-03-06 13.18.09.png>)

就是下面的命令：

 ```shell
 cd /home/$USER/Downloads/
 sudo su # 切换到管理员
 curl -fsSL https://get.docker.com -o get-docker.sh
 DOWNLOAD_URL=https://mirrors.ustc.edu.cn/docker-ce sh get-docker.sh
 rm -f get-docker.sh
 ```

 等待一会儿后，看到：

 ![alt text](<image/mac-ubuntu/截屏2024-03-05 22.21.55.png>)

 便是安装成功。下面还需要配置Docker Hub的国内源，使用的是腾讯的源，中科大的源目前只能在校内使用了。运行下面几行代码：

 ```shell
 sudo su
 cat /etc/docker/daemon.json << EOF
 {
    "registry-mirrors": ["https://ccr.ccs.tencentyun.com"]
 }
 EOF
 systemctl enable docker    # 允许docker开机自启动
 systemctl restart docker   # 重启docker以应用Docker Hub源
 docker info
 ```

 在管理员用户下安装的docker只能由root用户使用，当然可以每次都切换用户，但是也可以将docker权限添加到用户组。比如，用户名是 alice，可以运行：

 >也可以新开一个终端，这样直接就是默认用户。

 ```shell
 export user=alice # 选择用户！
 su $user # 切换到用户
 sudo chown root:docker /var/run/docker.sock # 修改docker.sock权限为root:docker
 sudo groupadd docker          # 添加docker用户组 
 sudo gpasswd -a $USER docker  # 将当前用户添加至docker用户组
 newgrp docker                 # 更新docker用户组
 ```
 
 运行后看到如下信息则配置成功：

 ![alt text](<image/mac-ubuntu/截屏2024-03-05 22.39.20.png>)

 ### 安装vscode

 如果安装桌面环境时使用了`--no-install-recommends`选项，我们等文本编辑器就只有vim了。vim是一个十分强大的编辑器，但是学习成本很高。我们选择安装一个vscode，后续写代码时也更加方便。

 在x86架构的机器中往往只需要一行命令，即`snap install --classic code`即可，虽然没有GUI。但是这个方法在arm上行不通。可以运行下面的命令：

 ```shell
 cd /home/$USER/Downloads # 切换文件夹，将下载的文件集中管理，显得整齐一些
 sudo su
 apt-get install wget gpg
 wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
 install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
 sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
 rm -f packages.microsoft.gpg
 apt install apt-transport-https
 apt update
 apt install code -y # 或者 code-insiders
 ```

 命令执行完成后就可以在应用界面看到vscode了：

 ![alt text](<image/mac-ubuntu/截屏2024-03-06 13.50.07.png>)

 >vscode一般不会以root身份运行，官方也不建议这么做。但是如果确实需要的话可以在终端直接运行`sudo code`，根据提示还需要添加`--no-sandbox --user-data-dir`。忽略`--user-data-dir`，它一般需要一个参数，一个路径。可以在`~/.bashrc`中写入一个`alias code='code --no-sandbox --user-data-dir=/!:1`。
 >>在`alias`需要得到用户参数时使用：
 >>/!:1  表示第一个参数
 >>/!:2* 表示第二个及余下的所有参数
 >>/!*   表示所有参数

 ## 后记

 这样一来算是搭建好了基本的系统环境，但是这个系统基本可以说是“裸着的”。后面我还会再装Java、python、nginx、tomcat、hexo，做深度学习还会用到一些乱七八糟的环境，还想要搭建远程服务器，搭建自己的个人主页，逐渐丰富自己的这个小世界。arm架构的机器上干活的确比主流的x86机器要麻烦不少，很多人估计就直接放弃了，我自己也感受到很难坚持下来。但是对于计算机非科班学生来说，这的确是一个学习与实践的好机会。如果能坚持下来，光是成就感就是非比寻常的。
