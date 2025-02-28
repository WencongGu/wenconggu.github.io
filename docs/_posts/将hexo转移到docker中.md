---
title: 将hexo转移到docker中
mathjax: true
date: 2024-11-03 13:40:49
tags: Docker
---

自己瞎折腾的。

<!--more-->

### Docker run -u $(id -u) ...

Docker用户管理默认使用的root的uid，这不好，牵扯到的权限问题很麻烦，所以尽量用 `-u $(id -u)` 指定一个普通用户。

一个经典的运行命令：

```bash
docker run -it --name hexo -v ~/Document/blog:/blog -p 4000:4000 -u $(id -u) hexo
```

>注意这会创建一个匿名卷，拷贝了`~/Document/blog`的内容。虽然会造成内存浪费，但是也算是一种备份，而且完全自动的。如果不需要这个备份，使用--rm标签，同时手动删除匿名卷，可以使用`docker volume prune`。
>>20241103纠正，上面的命令会使用bind mount，因此不会创建匿名卷。

官方的ubuntu镜像中直接存在一个ubuntu用户，用户uid是1000，所以可以使用`USER ubuntu`指令切换用户。此外，在`RUN`指令中如果使用`useradd -u 1111`那么创建的用户在运行时在主机的真实uid也会是1111。所以运行时不必指定uid也可以，指定错了反而可能导致文件没有访问权限。



### 先要保证能使用https的源：

```bash
apt update && apt install -y ca-certificates
```



### apt源配置文件：

```bash
/etc/apt/sources.list.d/ubuntu.sources
```



### 非交互式运行apt：

```bash
DEBIAN_FRONTEND=noninteractive apt ...`
```



### 安装git需要使用：

```bash
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs git`
```



### 无法使用heredoc一次将多行写入配置文件，解决方案：

```Dockerfile
RUN	echo "#!/bin/sh\nset -e\n\n# This script get the latest (hopefully) version of neo-vim and make '~/.config/nvim', '~/.config/nvim/lua' folder, \n# along with an empty '~/.config/nvim/init.lua' file. \napt install -y software-properties-common dirmngr apt-transport-https lsb-release ca-certificates\nadd-apt-repository ppa:neovim-ppa/stable -y \napt update \napt install -y neovim \nmkdir -p /root/.config/nvim" >> /root/get_neovim.sh \
	&& chmod +x get_neovim.sh
```
	
- The following does NOT working!：

```Dockerfile
RUN echo "\
Types: deb \n\
URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports \n\
Suites: noble noble-updates noble-backports \n\
Components: main restricted universe multiverse \n\
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg \n\
\n\
Types: deb \n\
URIs: http://ports.ubuntu.com/ubuntu-ports/ \n\
Suites: noble-security \n\
Components: main restricted universe multiverse \n\
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg \n\
" >> /etc/apt/sources.list.d/ubuntu.sources
```

- 可以支持heredoc语法，需要在Dockerfile文件首加上`# syntax=docker/dockerfile:1`：

```Dockerfile
# syntax=docker/dockerfile:1
RUN <<FILE1 cat > file1 && <<FILE2 cat > file2
I am
first
FILE1
I am
second
FILE2
```



### 安装node：

	[https://deb.nodesource.com/](https://deb.nodesource.com/)

	[https://github.com/nodesource/distributions](https://github.com/nodesource/distributions)



- 配置npm淘宝源命令：

```bash
npm config set registry https://registry.npmmirror.com
```

### 安装neovim不能直接用apt，因为不是最新版：

	参考：https://linuxcapable.com/how-to-install-neovim-on-ubuntu-linux/

	neovim仓库：https://github.com/neovim/neovim

- Import either the stable√ or unstable (nightly) version directly from the Neovim LaunchPAD PPA(建议，但仍然不是最新版，暂缓)：

```bash
apt install -y software-properties-common dirmngr apt-transport-https lsb-release ca-certificates # 安装add-apt-repository
add-apt-repository ppa:neovim-ppa/stable -y
apt update
apt install -y neovim
# apt-cache policy neovim # Verify the installation of the PPA version
```

- 或者用snapd(容器里似乎运行不了，但是虚拟机是成功了的)：

```bash
apt install -y snapd
ln -s /var/lib/snapd/snap /snap
snap install core
snap install nvim --classic # 非沙箱模式下安装软件
```



### 可能需要查看ip

```bash
apt install -y iproute2
```



### 可能需要ssh

```bash
apt install -y openssh-server openssh-client
```



### Docker容器用户权限问题

设计Linux和Docker的一些底层概念比如uid，user namespace，使用git时也会遇到无权限的问题，即便是已经在`~/.ssh`中复制了密钥。这不像是容器的问题，更应该是Linux文件权限管理和git的问题，因为在主机上使用普通用户是可以部署的，但切换了root就不行，即使有了密钥文件。

应该是ssh的问题。正常情况下使用ssh连接一个ip，ssh会寻找`~/.ssh/config`文件，按照配置连接。

但是问题来了，使用`git push/pull`的时候怎么读配置的呢？当然说的是用公私钥连接。这个我没有找到资料支持，不过经过探索可以发现一些行为。当在本地使用`ssh—keygen`命令生成公私钥对后使用git，会在`~/.ssh/config`文件中添加一个`Host github`的词条，当前用户使用`git push/pull`的时候会按照这个配置。

但是，在docker容器中（即便使用了uid映射）或者使用root用户使用git时不会使用这个配置！而在host中新建一个用户却可以使用。很怪。

原因未知，但是 GitHub[官方文档](https://docs.github.com/zh/)关于ssh debug的论述中有“[Should the sudo command or elevated privileges be used with Git?](https://docs.github.com/zh/authentication/troubleshooting-ssh/error-permission-denied-publickey?platform=linux)”的小节，内容如下：

>You should not be using the sudo command or elevated privileges, such as administrator permissions, with Git.
>
>If you have a very good reason you must use sudo, then ensure you are using it with every command. If you generate SSH keys without sudo and then try to use a command like sudo git push, you won't be using the same keys that you generated.

就是说的确，配置文件只对一个用户生效。

可以使用命令`ssh -vT git@github.com`验证是否能与GitHub建立连接。

也许有其他更好的办法解决这个问题，比如对使用完全同名同uid的用户。这里使用了更简单的做法，因为不想费劲了。就是将~/.ssh/config中的Host github改成`Host github.com`，有效。git，hexo都能用了。


### Docker镜像的导出导入：

使用 export 和 import 通过容器来导入、导出镜像

使用 save 和 load 通过镜像来保存、加载镜像文件

两个方式的差异：

如果使用 import 导入 save 产生的文件，虽然导入不提示错误，但是启动容器时会提示失败，会出现类似"docker: Error response from daemon: Container command not found or does not exist"的错误。

1. 文件大小不同

	export 导出的镜像文件体积小于 save 保存的镜像

2. 是否可以对镜像重命名
	
	docker import 可以为镜像指定新名称

	docker load 不能对载入的镜像重命名

3. 是否可以同时将多个镜像打包到一个文件中

	docker export 不支持

	docker save 支持

4. 是否包含镜像历史
	
	export 导出（import 导入）是根据容器拿到的镜像，再导入时会丢失镜像所有的历史记录和元数据信息（即仅保存容器当时的快照状态），所以无法进行回滚操作。

	save 保存（load 加载）的镜像，没有丢失镜像的历史，可以回滚到之前的层（layer）。

5. 应用场景不同
	
	docker export 的应用场景：主要用来制作基础镜像，比如我们从一个 ubuntu 镜像启动一个容器，然后安装一些软件和进行一些设置后，使用 docker export 保存为一个基础镜像。然后，把这个镜像分发给其他人使用，比如作为基础的开发环境。

	docker save 的应用场景：如果我们的应用是使用 docker-compose.yml 编排的多个镜像组合，但我们要部署的客户服务器并不能连外网。这时就可以使用 docker save 将用到的镜像打个包，然后拷贝到客户服务器上使用 docker load 载入。



### **完整文件**

```Dockerfile
FROM ubuntu

WORKDIR /home/ubuntu

RUN	apt update \
	&& apt install -y ca-certificates \
	&& mv /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.bak \
	&& echo "\nTypes: deb\nURIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports\nSuites: noble noble-updates noble-backports\nComponents: main restricted universe multiverse\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n\n# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释\n# Types: deb-src\n# URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports\n# Suites: noble noble-updates noble-backports\n# Components: main restricted universe multiverse\n# Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n\n# 以下安全更新软件源包含了官方源与镜像站配置，如有需要可自行修改注释切换\nTypes: deb\nURIs: http://ports.ubuntu.com/ubuntu-ports/\nSuites: noble-security\nComponents: main restricted universe multiverse\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n\n# Types: deb-src\n# URIs: http://ports.ubuntu.com/ubuntu-ports/\n# Suites: noble-security\n# Components: main restricted universe multiverse\n# Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n\n# 预发布软件源，不建议启用\n\n# Types: deb\n# URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports\n# Suites: noble-proposed\n# Components: main restricted universe multiverse\n# Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n\n# # Types: deb-src\n# # URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports\n# # Suites: noble-proposed\n# # Components: main restricted universe multiverse\n# # Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n" >> /etc/apt/sources.list.d/ubuntu.sources \
	&& apt update && apt upgrade -y

RUN	apt-get install -y curl \
	&& curl -fsSL https://deb.nodesource.com/setup_lts.x -o ./nodesource_setup.sh \
	&& bash ./nodesource_setup.sh \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs git

RUN	npm config set registry https://registry.npmmirror.com \
	&& npm install hexo-cli -g \
	&& echo 'PATH="$PATH:./node_modules/.bin"' >> ./.profile \
	&& npm install hexo-deployer-git --save

COPY .gitconfig ./

COPY help.md ./help.md

COPY .ssh ./.ssh

RUN echo 'PATH="$PATH:./node_modules/.bin"' >> ./.profile \
	&& echo "#!/bin/sh\nset -e\n\n# This script get the latest (hopefully) version of neo-vim and make '~/.config/nvim', '~/.config/nvim/lua' folder, \n# along with an empty '~/.config/nvim/init.lua' file.  \n\napt install -y software-properties-common dirmngr apt-transport-https lsb-release ca-certificates\nadd-apt-repository ppa:neovim-ppa/stable -y \napt update \napt install -y neovim \nmkdir -p ~/.config/nvim \n" >> ./get_neovim.sh \
	&& chmod +x get_neovim.sh \
	&& echo "alias hxc='hexo clean' \nalias hxg='hexo generate' \nalias blog='cd /blog && pwd' \nalias hxd='blog && hexo clean && hexo deploy && cd -' \nalias hxs='blog && hxc && hxg && hexo server && cd -' \nalias blogmd='blog && cd source/_posts && pwd' \n" >> ./.bashrc \
	&& echo "Host github.com\nHostname github.com\nPreferredAuthentications publickey\nIdentityFile ~/.ssh/github\nUser git\n" > ./.ssh/config \
	&& chown -R ubuntu:ubuntu .

VOLUME [ "/blog" ]

USER ubuntu
```


