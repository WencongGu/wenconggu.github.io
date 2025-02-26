---
title: Learning Vim Notes
mathjax: true
date: 2024-10-08 23:10:18
tags: Neovim
---

简单的小笔记

<!--more-->

基本的操作模式：

>{Action} = {Operation} + {motion | textObject}
>
>>Operation: d, y, ...
>>
>>motion: l, 3j, ...
>>
>>textObject: w, i", a[, ...
	
- `[count] {Action}`
- cmd mode
	- `:[Range | address] {exCommand}`


Vim定制化的更高阶主题还有keymap，auto-command，user-function，script

autocommand相当于监听vim的一些内置事件，比如on BufRead，为这些事件添加监听器，完成一些动作。Java和JS web中都有类似主题，类同。web中可以自定义事件并使用ele.dispatchEvent(event)完成触发，vim似乎也可以这样，但是我觉得没必要。

user-function是相对于vim的built-in方程的，内置方程是比如feedkeys之类的。vimscript中使用call调用方程，在neovim的lua脚本中会使用vim.call(func,param)。

一些快捷键的组合是比较难记的，需要长时间积累使用，目前没有学习打算。不过感觉用户脚本比较有可玩性，在neovim中使用lua写脚本也很简单。
