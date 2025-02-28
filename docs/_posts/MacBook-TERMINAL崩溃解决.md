---
title: MacBook TERMINAL崩溃解决
date: 2024-09-08 23:26:17
tags: MacBook
---

[参考链接](https://discussionschinese.apple.com/thread/254281677?sortBy=rank)

只需要在访达中把下面的文件夹删除：

>`~/Library/Saved Application State/com.apple.Terminal.savedState`

<!--more-->

其他应用似乎也可以这么操作，长个记性。

注意mac上文件目录，根目录下有个`用户->资源库`，用户目录下还有个`资源库`。

可以抽空详细了解一下mac上应用的目录结构。

目前看来应用数据似乎都安排在`~`下，删除应用时，目前已知应当关注：

- 将应用拖入废纸篓
- 查看`~`下的隐藏目录
- 查看安装应用的用户的`~->资源库(Library)->Application Support`
- 个别应用似乎在`~->资源库(Library)`下也有文件夹，最好搜索确认后再删除

之前在无限试用crossover时遇到[这个新鲜操作](https://www.chengzz.com/1031.html)，说明`~/Library/Preferences`目录下也有文件。

待学习。为了更好地管理自己的设备。
