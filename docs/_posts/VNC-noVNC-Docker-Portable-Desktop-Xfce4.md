---
title: VNC+noVNC+Docker->Portable Desktop(Xfce4)
date: 2024-01-09 17:33:35
tags: Linux, Docker
---

在大多数时候，容器项目不需要gui环境。但是某些特殊情况下使用gui环境会方便很多。虽然容器运行桌面环境收到诸多限制，但是即便是演示性质，仅仅是其可行性就显示出容器技术的巨大威力。

使用vnc技术可以理想地实现远程桌面的功能，无疑是解决这一问题的首选方案。再结合上novnc软件就可以抛弃vncviewer，在容器外直接使用浏览器就可以浏览界面，极大地方便了环境配置。这篇文章就介绍了使用vnc+novnc+docker容器化一个ubuntu xfce4桌面环境，并使用浏览器查看桌面。

<!--more-->

## 概述

Docker容器可以提供一个轻量级且独立的运行环境，通常被用于运行后台服务单元，但仍然会存在需要UI界面显示的场景，以下提供了一种采用VNC方式实现的Docker容器中的应用图形界面可视化方案。

想要共享宿主机的显示器，可以考虑使用`DISPLAY=unix:$DISPLAY`的环境变量，同时将`/tmp/.X11-unix`映射到容器中的`.X11-unix`目录下，具体原理Docker公司的程序员Jessie Frazelle在[她的个人博客](https://blog.jessfraz.com/post/docker-containers-on-the-desktop/?spm=a2c6h.12873639.article-detail.9.34657e98NHKfnb)中有十分详细的介绍。

不过始终应当记住，**容器不是虚拟机**！容器仅仅是使用了Linux底层的命名空间实现的隔离机制，进程管理与调度都与虚拟机有很大差别。

VNC（Virtual Network Computing）是一种远程桌面协议，它允许用户通过网络远程访问和控制远程计算机的图形界面。VNC具有跨平台兼容性，可以在不同操作系统（如Windows、macOS和Linux）之间进行远程访问和控制。使用novnc就可以直接将桌面环境映射到浏览器中再进行操作，而无需安装vncviewer。具体原理我在[我的个人博客](https://wenconggu.github.io)中有详细介绍。

## 构建思路

### 基础镜像

容器镜像使用的是ubuntu镜像，直接拉取最新版的镜像即可：

```shell 
docker pull ubuntu
```

### 创建容器

创建容器，容器名为`vncdemo`，镜像名为`ubuntu`，使用`-v`参数将容器的中目录映射到宿主机上，使用 `-p` 参数指定端口映射，将宿主机的`80`端口映射到容器的`80`端口上，将宿主机的`5900`端口映射到容器的`5900`端口上，这样就可以通过访问宿主机的端口来访问容器的端口：

```shell
docker run -it -v ~/Downloads:/root/Downloads -p 80:80 -p 5900:5900 --name vncdemo ubuntu bash
```

创建好容器后首先检查更新容器的软件：

```shell
apt udpate && apt upgrade -y
```

### 在容器安装Xvfb

Xvfb（X virtual framebuffer）是一个在内存中模拟X窗口系统的虚拟服务器。它主要被用于在没有图形硬件或无需显示器的服务器上运行图形应用程序或测试工具。Xvfb提供了一个虚拟的X服务器环境，它将图形界面的输出渲染到一块特殊的内存区域，而不是显示在物理显示设备上。这使得图形应用程序能够正常运行，而无需实际的显示设备。
 
在本实施方案中，使用Xvfb主要是为了让图形应用程序能够在没有实际显示设备的情况下也能够正常运行。通过使用以下命令，在容器中安装Xvfb：

```shell
apt update
apt install -y xvfb
```

### 在容器启动虚拟屏幕

使用`Xvfb`命令启动虚拟屏幕：

```shell
Xvfb :0 -screen 0 1280x960x24 -listen tcp -ac +extension GLX +extension RENDER &
```

其中，`:0` 指定了显示器号；使用 `-screen` 参数将屏幕分辨率设置为`1280x960`，颜色深度设置为`24`位；使用 `-listen tcp` 参数用来指定`Xvfb`监听`tcp`连接请求，能够接收来自其他设备的连接请求；使用 `-ac` 参数允许任何设备都可以连接到`Xvfb`服务器上；使用 `+extension` 参数加载`GLX`和`RENDER`这两个扩展模块，使`Xvfb`服务器支持更丰富的图形渲染和`OpenGL`功能。使用 `&` 表示在后台运行该命令。

然后将`DISPLAY`环境变量设置为 `:0` ，设置完成后可以使用 `echo $DISPLAY` 命令来查看当前`DISPLAY`环境变量。

```shell
export DISPLAY=:0
```

### 在容器安装x11vnc

  x11vnc是一个允许远程访问Linux系统的开源软件。它可以将X服务器上的图形界面转发到远程客户端，使得用户可以通过VNC协议远程控制Linux系统，实现远程桌面操作。

  在本实施方案中，使用x11vnc主要是为了让用户可以通过VNC协议远程访问到容器中的Xvfb虚拟屏幕。使用以下命令进行安装：

```shell
apt install -y x11vnc
```

### 在容器启动X11vnc

使用`x11vnc`命令启动X11vnc服务：

```shell
x11vnc -display :0 -forever -shared -rfbport 5900 -passwd 123456 &
```

其中，使用 `-display` 参数指定要共享的X服务器显示器名称，默认为 `:0` ；使用 `-forever` 参数表示在断开连接后仍然保持`x11vnc`运行；使用 `-shared` 参数表示允许多个客户端同时连接；使用 `-rfbport` 参数来指定VNC服务端口，默认为`5900`；使用 `-passwd` 参数指定访问密码为123456。


### 在容器安装novnc

  noVNC是一个开源Web浏览器VNC客户端,采用 `HTML 5 WebSockets`, `Canvas` 和 `JavaScript` 实现，通过网页提供对远程计算机桌面的访问。用户只需在浏览器中输入noVNC的URL，并提供远程计算机的IP地址和端口号，即可连接到远程计算机并开始远程控制。noVNC还具有跨平台的特性，可以在各种操作系统和设备上运行，包括Windows、Linux、macOS、Android等。

noVNC采用`WebSockets`实现，但是目前大多数VNC服务器都不支持 `WebSockets`，所以noVNC是不能直接连接 VNC 服务器的，需要一个代理来做`WebSockets`和`TCP sockets` 之间的转换。这个代理在`noVNC`的目录里，叫做`websockify` 。
 
 在本实施方案中，使用novnc主要是为了让用户在通过VNC方式访问容器中的图形应用程序时，不需要安装VNC Viewer，只需要使用浏览器，输入相应的URL就可以进行远程访问。使用以下命令进行安装：

```shell
apt install -y novnc
```

### 在容器启动novnc服务

使用`websockify`命令，绑定`80`端口，将从`localhost`的`5900`端口（即x11vnc服务端口）接收到的VNC流量转发到novnc的Web界面，其中使用 `--web` 参数指定novnc的Web根目录。

```shell
websockify --web /usr/share/novnc 80 localhost:5900 &
```

### 安装xfce4桌面环境

xfce4是一个精简的轻量化桌面，与Gnome和KDE相比更小巧，并且界面美观、对用户友好，适合云服务器远程连接场景下使用。其他的桌面环境还有ubuntu-desktop等。

使用如下命令安装xfce4以及一些好用的软件包：

```shell
apt update
apt install xfce4 xfce4-goodies vim
```

启动桌面环境的命令是`startxfce4`，稍等软件运行，在宿主机的浏览器中访问`localhost:80/vnc.html`，点击连接输入上面设置的密码`123456`就成功进入了桌面。

### 启动桌面环境的shell脚本

脚本`start.sh`：

```shell
#\!/bin/bash
Xvfb :0 -screen 0 $image_resolution -listen tcp -ac +extension GLX +extension RENDER &
x11vnc -display :0 -forever -shared -rfbport 5900 -passwd $passwd &
websockify --web /usr/share/novnc 80 localhost:5900 &
startxfce4 
```

注意最后的启动命令尽量放在当前shell中，就是不加`&`，因为容器中运行多进程是十分危险的。

增加执行权限：

```shell
chmod +x start.sh
```

直接运行即可：

```shell
./start.sh
```

## 构建镜像

上述操作可以全部集成在`Dockerfile`中，文末是我编写的示例。与上面的流程不同的是，这里使用了几个构建时变量，分别是`user_mirror="true"`，`passwd=aaaaaa`，`image_resolution`，分别代表：是否使用国内apt软件源镜像，链接noVNC时使用的密码，虚拟桌面的分辨率和色位。典型的构建命令比如：

```shell
docker build --build-arg passwd=123456 --build-arg image_resolution=1920x1080X24 -t vncdemo .
```



进入容器会直接部署桌面，可以保持后台运行，但是需要暴露端口`80`映射到`80`。典型的运行命令比如：

```shell
docker run -d --name deskubuntu -v ~/Downloads:/root/Downloads -p 80:80 vncdemo
```

稍等后即可访问其`80`端口，比如访问宿主机`http://localhost:80/vnc.html`，链接密码就是构建时使用的`passwd`参数。

### Dockerfile

`Dockerfile`内容：

```Dockerfile
FROM ubuntu

ARG DEBIAN_FRONTEND=nointeractive

ARG use_mirror="true"

ARG passwd=aaaaaa

ARG image_resolution=1080x720x16

USER root

WORKDIR /root

ENV DISPLAY=:0

EXPOSE 80

EXPOSE 5900

RUN echo "#\!/bin/bash \n\
Xvfb :0 -screen 0 $image_resolution -listen tcp -ac +extension GLX +extension RENDER & \n\
x11vnc -display :0 -forever -shared -rfbport 5900 -passwd $passwd & \n\
websockify --web /usr/share/novnc 80 localhost:5900 & \n\
startxfce4 " \
	> /root/desktop.sh && \
	chmod +x /root/desktop.sh

RUN if [ "$use_mirror" = "true" ]; \
	then mv /etc/apt/sources.list /etc/apt/sources.list.backup; \
	echo "deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy main restricted universe multiverse \n \
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse \n \
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse \n \
deb http://ports.ubuntu.com/ubuntu-ports/ jammy-security main restricted universe multiverse" > /etc/apt/sources.list ; \
	fi && \
	apt update && apt upgrade -y && \
	apt install -y apt-transport-https ca-certificates && \
	mv /etc/apt/sources.list /etc/apt/sources.list.tuna && \
	echo "deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy main restricted universe multiverse \n \
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse \n \
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse \n \
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ jammy-security main restricted universe multiverse" > /etc/apt/sources.list && \
	apt update && apt upgrade -y && \
	apt autoremove -y && apt clean

RUN apt install -y xvfb  x11vnc novnc && \
	apt install -y xfce4 xfce4-goodies vim && \
	apt install -y gedit curl wget && \
	apt autoremove -y && apt clean

CMD ./desktop.sh
```

