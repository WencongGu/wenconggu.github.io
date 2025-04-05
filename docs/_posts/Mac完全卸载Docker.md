---
title: Mac完全卸载Docker
date: 2024-09-21 12:13:15
tags: Docker, MacBook
---

在Mac上彻底卸载Docker: [https://yqqy.top/blog/2022/uninstall-docker-on-macos](https://yqqy.top/blog/2022/uninstall-docker-on-macos)

<!--more-->

## 情况一：可以打开 Docker Desktop

直接在 Mac 上打开 Docker Desktop，然后点击troubleshoot，选择uninstall。

## 情况二：打不开 Docker Desktop

打开命令行执行以下命令：

```shell
/Applications/Docker.app/Contents/MacOS/Docker --uninstall
```

## 情况三：打不开 Docker Desktop 且情况二无法解决

打开命令行执行以下命令：

```shell
sudo rm -Rf /Applications/Docker.app
sudo rm -f /usr/local/bin/docker
sudo rm -f /usr/local/bin/docker-machine
sudo rm -f /usr/local/bin/com.docker.cli
sudo rm -f /usr/local/bin/docker-compose
sudo rm -f /usr/local/bin/docker-compose-v1
sudo rm -f /usr/local/bin/docker-credential-desktop
sudo rm -f /usr/local/bin/docker-credential-ecr-login
sudo rm -f /usr/local/bin/docker-credential-osxkeychain
sudo rm -f /usr/local/bin/hub-tool
sudo rm -f /usr/local/bin/hyperkit
sudo rm -f /usr/local/bin/kubectl.docker
sudo rm -f /usr/local/bin/vpnkit
sudo rm -Rf ~/.docker
sudo rm -Rf ~/Library/Containers/com.docker.docker
sudo rm -Rf ~/Library/Application\ Support/Docker\ Desktop
sudo rm -Rf ~/Library/Group\ Containers/group.com.docker
sudo rm -f ~/Library/HTTPStorages/com.docker.docker.binarycookies
sudo rm -f /Library/PrivilegedHelperTools/com.docker.vmnetd
sudo rm -f /Library/LaunchDaemons/com.docker.vmnetd.plist
sudo rm -Rf ~/Library/Logs/Docker\ Desktop
sudo rm -Rf /usr/local/lib/docker
sudo rm -f ~/Library/Preferences/com.docker.docker.plist
sudo rm -Rf ~/Library/Saved\ Application\ State/com.electron.docker-frontend.savedState
sudo rm -f ~/Library/Preferences/com.electron.docker-frontend.plist
```

```shell
sudo rm -rf /Users/yucharlotte/Library/Application\ Scripts/group.com.docker
sudo rm -rf /Users/yucharlotte/Library/Caches/Docker\ Desktop

参考资料：

- https://docs.docker.com/desktop/mac/troubleshoot/

>文作者：[YY](https://yqqy.top/about)
>
>本文链接：[https://yqqy.top/blog/2022/uninstall-docker-on-macos](https://yqqy.top/blog/2022/uninstall-docker-on-macos)
>
>版权声明： 本博客所有文章除特别声明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.zh-hans) 许可协议。转载请注明来自 [YY's Blog'](https://yqqy.top/blog/2022/uninstall-docker-on-macos)！
