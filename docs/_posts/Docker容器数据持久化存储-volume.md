---
title: 'Docker容器数据持久化存储: volume'
mathjax: true
date: 2024-10-28 23:13:20
tags: Docker
---

Docker数据管理。

<!--more-->

Docker对容器数据管理有三种，volume，bind mount，tmpfs。

1. **volume**

由docker管理的数据存储模式，所谓由docker管理，就是能够使用`docker volume xxx`命令来查看这个数据管理器“volume”，不过实际上其中的数据也就是在docker运行目录下的volumes文件夹(比如`/var/lib/docker/volumes`)，它就是一个一般的文件夹，和容器用的是一套fs，所以很容易操作保存的数据。理论上不建议直接操作这个文件夹，但是好像没什么所谓。

2. bind mount

使用bind mount的容器会将host fs的某个位置挂载到容器fs的某个位置，相当于是一种点对点的映射。

3. tmpfs

注意，这不是用来持久化容器数据的模式。有时我们在容器中需要产生一些数据，但是这些数据只是临时数据，不需要长期存储，就可以把这些数据产生的位置使用tmpfs模式映射到host的某个位置。这种模式映射的数据会在容器退出后销毁。

## volume的细节

既然将这种管理方式抽象为volume这个名字，就需要为它赋予一些性质。所说volume本质上只是一个文件夹的映射，但是docker在管理时都是在操作一个个的volume这个概念。

如何得到一个volume实例？首先当然可以使用`docker volume create xxx`命令直接创建一个名为xxx的volume，这样它就是一个可以使用的管理方式了。要对某个容器使用这个volume来管理数据，就可以使用`-v xxx:/path`标签(或者`--mount`)，`/path`表示容器中想要映射出来的位置，如果容器中没有这个位置会自动创建。不过其实完全不需要`volume create xxx`，因为直接使用这种-v标签的格式后就会直接自动创建一个名为xxx的volume。

volume的挂载分为具名挂载和匿名挂载。上面的`-v xxx:/path`就是指定了volume的名称是xxx，所以称为具名挂载。还有一种匿名挂载，在`docker run`时仅指定容器目录`-v /path`即可，这样docker也会自动创建一个匿名volume，但是这个volume的名称是一串随机字符，当然映射位置就是`/path`。

使用匿名挂载还有一种情况，就是镜像构建的Dockerfile中使用了`VOLUME ["/path"]`指令，这样在docker run时，如果没有指定挂载点，会自动创建一个匿名卷。而如果指定了挂载点，这个挂载点是一个具名volume的话就会使用这个volume，如果是一个host文件系统的路径那就是bind mount。简而言之，Dockerfile中的指令是默认值，使用docker run指定会覆盖默认值。

匿名卷和具名卷还有其他不同的行为。在`docker run`时，如果使用了`--rm`，那么在这个容器退出后匿名卷也会被自动删除。没有被删除的匿名卷可以使用`docker volume prune`命令删除，“This will remove anonymous local volumes not used by at least one container.”，具名卷需要手动删除`docker volume rm`。一个volume不论是否被使用都不会被`docker system prune`清理。

volume在`docker run`时被创建，它的默认行为是copy容器中目标位置下的文件，而不是覆盖。

## bind mount

注意，上面说的xxx是一个volume的名字，而不是host路径。如果是host的路径，那就变成了bind模式。如果这个路径不存在会自动创建。

对我来说，bind模式最大的不同就是它在映射时会完全遮盖目标path下原有的文件。理论上，host路径下这些文件会被自由修改，所以不安全，不如使用volume。

实践发现，一个`/path`只能选择一种挂载方式。没有发现可以把host某个路径下的文件转移到volume中的办法，但是也很好实现，比如创建volume和bind分别映射到不同位置，容器内转移文件即可。

## 文件权限问题

docker在启动一个容器时默认是使用root用户的，这会造成一些麻烦。容器内看到的uid和host是一致的（默认不启用namespace），也就是说权限也是一样的，创建的文件所有者会变成root。

使用`docker run --uid $(uid -u)`来指定用户。此时在容器内部可能看到不同的用户名，但是这个uid应当对应当前host的用户。在host中使用`ps aux`命令也会发现当前的容器进程的uid也不再是root，而是当前用户。

在ubuntu基础镜像中除了root还有一个用户ubuntu，这个用户的uid是1000，不需要在`docker run`时指定。

Dockerfile中可以在`RUN`指令中直接使用`useradd -u 1111`的指令创建一个uid为1111的用户，这个uid也是host下的uid。可以使用USER指令来指定容器运行时使用哪个用户。

[uid我也简单地不专业地描述了一下。](/2023/10/06/Linux不基础用法/index.html)
