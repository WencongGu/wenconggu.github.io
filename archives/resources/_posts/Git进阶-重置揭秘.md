---
title: Git进阶-重置揭秘
date: 2023-09-21 23:13:18
tags: Git
---

紧接着上一篇，继续谈谈Git在数据恢复时使用 `git reset` 和使用 `git checkout` 都发生了什么。

<!-- more -->

## 三棵树

理解 `reset` 和 `checkout` 的最简方法，就是以 Git 的思维框架（将其作为内容管理器）来管理三棵不同的树。 “树” 在我们这里的实际意思是 “文件的集合”，而不是指特定的数据结构。

git作为一个数据管理系统，一般会操作三棵树：

- 工作目录（Working Directory）：当前工作目录，沙盒
- 暂存区（Index）：预期的下一次提交的快照，暂存
- HEAD：上一次提交的快照，下一次提交的父结点，仓库

HEAD指针比较难以捉摸。HEAD 是当前分支引用的指针，它的含义是该分支上的「最后」一次提交，「最后」的意思是 HEAD 将是下一次提交的父结点。但是实际上，HEAD 指向的可能并不是时间上的最后一次提交。

## 典型的提交过程

经典的 Git 工作流程是通过操纵这三个区域来以更加连续的状态记录项目快照的。

![alt text](<image/Git-Objects/image copy 3.png>)

1. 工作区作出修改
   ![alt text](<image/Git-Objects/image copy 4.png>)
2. 将修改添加到暂存区，使用 `git add` 命令
   ![alt text](<image/Git-Objects/image copy 5.png>)
3. 提交修改，使用 `git commit` 命令，移动HEAD指针指向的引用
   ![alt text](<image/Git-Objects/image copy 6.png>)
   命令使用暂存区中的内容和提交信息创建一个提交对象，将提交对象放入仓库中，并更新 HEAD 指向的引用master，将master指向该提交对象。

这是一个完整的操作过程。现在我们修改了工作区并提交，使得数据系统变成下面的样子：

![alt text](<image/Git-Objects/image copy 7.png>)

现在考虑 `reset` 命令，它有三种模式：`--soft`、`--mixed` 和 `--hard`，分别相当于撤销一个提交过程的三个操作的更进一步。

## 重置操作

### `reset`

撤销时：

1. 移动HEAD指针指向的引用
   ![alt text](<image/Git-Objects/image copy 8.png>)
   这一步相当于在仓库中的状态被撤销，到这一步如果就需要停止，就使用 `git reset --soft` 命令，执行这个命令只会将仓库中的HEAD指针移动到上次提交之前到位置，其他内容不受影响。
2. 撤销暂存区
   ![alt text](<image/Git-Objects/image copy 9.png>)
   如果使用 `git reset --mixed HEAD~` 命令，它会撤销一上次提交，但还会取消暂存所有的东西。 于是，我们回滚到了所有 `git add` 和 `git commit` 的命令执行之前。这个参数是默认值。
3. 撤销工作目录
   ![alt text](<image/Git-Objects/image copy 10.png>)
   如果使用 `git reset --hard HEAD~` 命令，它会撤销一上次提交，并取消暂存所有的东西，然后将工作目录中的所有内容也恢复到和仓库中相同的状态。这是一个很危险的命令，可能会破坏工作区已有的更改。相当于在上一个命令的基础上更进一步。

总结一下 `reset` 命令会以特定的顺序重写这三棵树，在你指定以下选项时停止：

- 移动 HEAD 分支的指向 （若指定了 `--soft`，则到此停止）

- 使索引看起来像 HEAD （若未指定 `--hard`，则到此停止）

- 使工作目录看起来像索引

`reset` 命令还可以单独操作某一个文件，此时它不再操作HEAD指针，而且只有 `--mixed`模式。这方面没有什么特别内容，不再赘述。

### `checkout`
    
`checkout` 命令也操作着3棵树，但是有些不太一样的地方。当传入的参数是一个branch时，它会更新3棵树，但是与 `reset --hard` 不同的是，它对工作目录是安全的，而且会尝试将工作目录的文件与branch中的文件简单合并以更新。`reset --hrad` 会不加检查地更改内容，因此可能导致工作区内容丢失。

在对HEAD指针的操作上二者也有不同。如果传入一个branch参数给 `checkout` 命令，它会移动HEAD指针自己，使得HEAD指向该branch，但是不会移动branch引用的指向。如图所示：

![alt text](<image/Git-Objects/image copy 11.png>)

另外一个不同就是，`checkout` 命令接收branch参数后还可以接收一个文件路径参数，此时它会将3棵树中该文件都恢复到指定branch中的状态。而 `reset` 命令不能这样，它接收一个路径参数后不能使用 `--hard`。

除此之外，`checkout` 命令还有其他一些功能，比如可以传入一个commit id，此时它会将HEAD指针指向该commit id，然后将3棵树恢复到该commit id的状态，此时的HEAD指针就处于分离头指针的状态，简单讲就是此时所有的提交都不会被保存，属于演练，想要保存可以在新的提交上新建一个分支。

## 总结

至此，就总结完了 `reset` 和 `checkout` 命令都主要差别。下面的表格简单总结了在实际应用中二者的主要区别：

“HEAD” 一列中的 “REF” 表示该命令移动了 HEAD 指向的分支引用，而 “HEAD” 则表示只移动了 HEAD 自身。 特别注意 'SAFE?' 一列，如果它标记为 NO，那么运行该命令之前就需要考虑一下。

||HEAD|Index|Working Dir|SAFE?|
|:-:|:--:|:--:|:--:|:-:|
|`reset --soft [commitId branch]`|ref|no|no|yes|
|`reset [--mixed] [commitId branch]`|ref|yes|no|yes|
|`reset --hard [commitId branch]`|ref|yes|yes|**NO**|
|`checkout <commitId>`|HEAD|yes|yes|yes|
|`reset [commitId branch] <paths>`|NO|yes|no|yes|
|`checkout [commitId branch] <paths>`|HEAD|yes|yes|**NO**|