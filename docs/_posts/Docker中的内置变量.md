---
title: Docker中的内置变量
date: 2024-01-06 23:35:45
tags: Docker
---

本文根据官方文档整理了Docker中常用的一些环境变量。

<!--more-->

## Docker CLI

下面是 docker cli 支持环境变量列表：

|变量|描述|
|:-:|:-:|
`DOCKER_API_VERSION`|	覆盖用于调试的协商API版本（例如1.19）
`DOCKER_CERT_PATH`|	验证密钥的位置。这个变量 docker CLI 和 Dockerd Daemon 都会使用。
`DOCKER_CONFIG`|	客户端配置文件的位置。默认情况下，Docker命令行将其配置文件存储在 `$HOME` 目录中名为 `.docker` 的目录中。还可以使用 `config.json` 中的选项来修改一些相同的行为。如果设置了环境变量和 `--config` 标志，则该标志将优先于环境变量。命令行选项覆盖环境变量，环境变量覆盖您在 `config.json` 文件中指定的属性。
`DOCKER_CONTENT_TRUST_SERVER`|	要使用的公证服务器的URL。默认为与注册表相同的URL。
`DOCKER_CONTENT_TRUST`|	设置后，Docker 使用公证人来签名和验证镜像。等同于构建(`build`)、创建(`create`)、拉动(`pull`)、推送(`push`)、运行(`run`)时使用 `--disable-content-trust=false` 参数。
`DOCKER_CONTEXT`|	使用的 docker context 名称。(覆盖 `DOCKER_HOST` 环境变量，和使用 `docker context use` 命令设置的默认 context)
`DOCKER_DEFAULT_PLATFORM`|	采用 `--platform` 标志的命令的默认平台。
`DOCKER_HIDE_LEGACY_COMMANDS`|	设置后 (`true`), Docker 在 `docker help` 输出中隐藏“传统”顶层命令（例如 `docker rm` 和 `docker pull`），只打印每个对象类型（例如 `docker container`）的管理命令。这可能会成为未来版本的默认设置。
`DOCKER_HOST`|	要连接的守护程序套接字。
`DOCKER_TLS`|	启用 Docker CLI 发起的连接的 TLS（相当于 `--tls` 命令行选项）。设置为非空值以启用 TLS。请注意，如果设置了任何其他TLS选项，则TLS会自动启用。
`DOCKER_TLS_VERIFY`|	设置后， Docker 使用 Docker 会使用 TLS 并验证远程。这个变量 Docker CLI 和 Dockerd Daemon 都会使用。
`BUILDKIT_PROGRESS`|	当使用`BuildKit` 后端构建时设置进度输出类型（`auto`、`plain`、`tty`、`rawjson`）。使用 `plain` 显示容器输出（默认 `auto`）。

同时由于 Docker 是使用 GO 语言编写的，所以 Docker 还支持 GO 语言运行时的所有环境变量，比如：


变量|	描述
|:-:|:-:|
`HTTP_PROXY`|	HTTP 请求的代理 URL，除非被 `NoProxy` 覆盖，在 `docker build` 时作为 `--build-arg` 的 `http_proxy` 变量。
`HTTPS_PROXY`|	HTTPS 请求的代理 URL，除非被 `NoProxy` 覆盖，在 `docker build` 时作为 `--build-arg` 的 `https_proxy` 变量。
`NO_PROXY`|	逗号分隔值，指定应从代理中排除的主机。在 `docker build` 时作为 `--build-arg` 的 `no_proxy` 变量。
...|...

GO 语言运行时环境变量更多的应当去查询[GO 语言规范](https://pkg.go.dev/golang.org/x/net/http/httpproxy#Config)

这些变量是直接在构建的环境中定义的，比如要修改docker默认的客户端配置文件的位置，就可以使用下面的语句:

```bash
export DOCKER_CONFIG=/path/to/config.json
```

当然可以写入bash配置文件 `~/.bashrc` 中，以永久生效。

单次配置时，docker 还提供了 `--config` 参数，可以指定配置文件的位置，比如：

```bash
docker --config ~/testconfigs/ ps
```

这个命令使用 ` ~/testconfigs/` 目录下的 `config.json` 文件覆盖了 `docker ps` 命令。对于其他环境变量，docker也提供了相似的 参数，比如 `--tls` 参数可以覆盖 `DOCKER_TLS` 环境变量。

Docker 的配置文件默认在 `~/.docker/config.json`，还可以进行更加详细的配置，可以查看[官方文档](https://docs.docker.com/engine/reference/commandline/cli/#docker-cli-configuration-file-configjson-properties)详细了解。

## `ARG` & `--build-arg`

在 `Dockerfile` 中，`ARG` 可以用来声明变量，使得镜像能够更好地被他人理解和使用，也可以用来定义构建时变量，同样便于其他使用者理解，但是镜像构建完成后，这些变量就不再存在了。它定义的变量在构建镜像时，可以通过 `--build-arg` 参数来覆盖。

### Docker 预定义变量

Docker有一组预定义的ARG变量，您可以在Dockerfile中不使用相应的ARG指令的情况下使用这些变量。

- `HTTP_PROXY` 等价于 `http_proxy`
- `HTTPS_PROXY` 等价于 `https_proxy`
- `FTP_PROXY` 等价于 `ftp_proxy`
- `NO_PROXY` 等价于 `no_proxy`
- `ALL_PROXY` 等价于 `all_proxy`

默认情况下，这些预定义的变量被排除在 `docker history` 命令的输出之外。排除它们可以降低意外泄露 `HTTP_PROXY` 等变量中敏感身份验证信息的风险。如果在在 `Dockerfile` 中添加 `ARG` 语句，则这些变量将被保留在输出中。

可以为每个环境设置以下属性：

|变量	|描述
|:-:|:-:|
`httpProxy`|	容器的 `HTTP_PROXY` 和 `http_proxy` 的默认值，以及在 `docker build` 时作为 `--build-arg` 的默认值。
`httpsProxy`|	容器的 `HTTPS_PROXY` 和 `https_proxy` 的默认值，以及在 `docker build` 时作为 `--build-arg` 的默认值。
`ftpProxy`|	容器的 `FTP_PROXY` 和 `ftp_proxy` 的默认值，以及在 `docker build` 时作为 `--build-arg` 的默认值。
`noProxy`|	容器的 `NO_PROXY` 和 `no_proxy` 的默认值，以及在 `docker build` 时作为 `--build-arg` 的默认值。
`allProxy`|	容器的 `ALL_PROXY` 和 `all_proxy` 的默认值，以及在 `docker build` 时作为 `--build-arg` 的默认值。

这些设置用于配置容器的代理设置，而不是用于配置 CLI 或守护程序的代理设置。

>警告：代理设置可能包含敏感信息（例如，如果代理需要身份验证）。环境变量在容器的配置中以纯文本形式存储，因此可以通过远程API进行检查，或者在使用docker commit时提交到映像。

### 全局平台变量

如果使用 `BuildKit` 构建镜像，则 Docker 还有一组预定义的 `ARG` 变量，其中包含执行构建的节点平台（构建平台）和结果映像平台（目标平台）上的信息。这些信息包含在下面的 `ARG` 变量中：

|变量|描述|
|:-:|:-:|
`TARGETPLATFORM`| 构建目标平台。其值例如`linux/amd64`，`linux/arm/v7`，`windows/amd64`。
`TARGETOS`| `TARGETPLATFORM` 指定的平台的操作系统
`TARGETARCH`| `TARGETPLATFORM` 指定的平台的CPU架构
`TARGETVARIANT`| `TARGETPLATFORM` 指定的平台的变量
`BUILDPLATFORM`| 执行构建的当前节点的平台
`BUILDOS`| `BUILDPLATFORM` 指定的平台的操作系统
`BUILDARCH`| `BUILDPLATFORM` 指定的平台的架构
`BUILDVARIANT`| `BUILDPLATFORM` 指定的平台的变量

但是，这些变量并不是自动可用的，要使用 `--build-arg` 定义这些变量，需要在 `Dockerfile` 中使用 `ARG` 指令来生命这些变量，并且不赋值。

### `BuildKit` 内置变量

变量|	类型|	描述
|:-:|:-:|:-:|
`BUILDKIT_CACHE_MOUNT_NS`|	String|	设置可选的缓存 ID 命名空间。在 Docker 中，可以通过设置缓存 ID 命名空间来区分不同的缓存，以便更好地管理和控制缓存的使用。
`BUILDKIT_CONTEXT_KEEP_GIT_DIR`|	Bool|	触发 Git 上下文以保留 `.git` 目录。在 Docker 中，当构建镜像时，通常会将源代码从 Git 存储库中复制到镜像中进行构建。通过触发 Git 上下文并保留 `.git` 目录，可以在构建过程中保留 Git 仓库的信息，包括提交历史、分支信息等。
`BUILDKIT_INLINE_CACHE2`|	Bool|	是否将内联缓存元数据存储到镜像配置中。将缓存元数据内联到镜像配置中可以提高构建效率，因为在下一次构建时，Docker 可以更快地确定哪些步骤可以重用缓存，不过内联缓存元数据可能会增加镜像的大小.
`BUILDKIT_MULTI_PLATFORM`|	Bool|	是否让输出结果具有确定性，而不考虑多平台输出。构建镜像时可以选择输出多个不同平台的镜像，这些镜像可以在不同架构的计算机上运行。然而，有时候用户可能更关心镜像构建的结果是否具有确定性，即无论在哪个平台上构建，输出结果都是相同的。如果选择让输出结果具有确定性，那么无论在哪个平台上构建镜像，输出结果都将是相同的。这样做的好处是可以确保在不同环境中运行镜像时的一致性，但可能会牺牲多平台输出的灵活性。需要根据具体需求来权衡是否选择让输出结果具有确定性。
`BUILDKIT_SANDBOX_HOSTNAME`|	String|	用于指定在构建过程中用于运行构建操作的沙盒容器的主机名(默认 `buildkitsandbox`)，以增加安全性和隔离性。
`BUILDKIT_SYNTAX`|	String|	用于指定 Dockerfile 的语法版本。
`SOURCE_DATE_EPOCH`|	Int|	为创建的镜像和层设置 Unix 时间戳。这个功能与可重现构建有关。从 `Dockerfile 1.5`、`BuildKit 0.11` 起开始支持。镜像的构建过程可能涉及多个层，每个层都有自己的创建时间戳。通过设置创建时间戳，可以使得构建的镜像和镜像层在不同时间构建时具有相同的时间戳，从而实现可重现构建的功能。可重现构建是指无论何时构建镜像，输出结果都是相同的，这有助于确保构建的一致性和可验证性。

## `Daemon CLI`

下面是由 `Daemon CLI` 提供的变量：

|变量|	描述
|:-:|:-:|
`DOCKER_CERT_PATH`|	验证密钥的位置。这个变量 Docker CLI 和 Dockerd Daemon 都会使用。
`DOCKER_DRIVER`|	要使用的存储驱动程序，它会影响 Docker 如何管理镜像和容器的存储。常见的 Docker 存储驱动程序包括 `aufs`、`overlay2`、`btrfs`、`zfs` 等，具体支持的存储驱动程序取决于您所使用的 Docker 版本和操作系统。注意这个不是 `build driver`，`build driver` 是 `buildx` 构建时的驱动，主要用于多平台镜像构建。
`DOCKER_RAMDISK`|	如果设置此设置，将禁用 `pivot_root`。`pivot_root` 是一个 Linux 系统调用，用于更改进程的根文件系统。这个环境变量的作用是指定 Docker 容器的临时文件系统是否应该使用 RAM 磁盘。当设置 `DOCKER_RAMDISK=true` 时，Docker 将使用 RAM 磁盘来存储容器的临时文件系统，这可能会提高容器的性能。
`DOCKER_TLS_VERIFY`|	设置后，Docker 使用Docker会使用TLS并验证远程。这个变量 Docker CLI 和 Dockerd Daemon都会使用。
`DOCKER_TMPDIR`|	守护进程创建的临时文件的位置。
`MOBY_DISABLE_PIGZ`|	禁用 `unpigz` 的使用，在拉取图像时并行解压图层。
`HTTP_PROXY`|	用于设置 HTTP 代理的地址
`HTTPS_PROXY`|	用于设置 HTTPS 代理的地址
`NO_PROXY`|	用于设置不使用代理的主机列表

使用时也是直接在构建环境中定义即可。更多详细的设置一般使用 `dockerd [OPTIONS]` 命令行参数进行设置，详细内容在[文档](https://docs.docker.com/reference/cli/dockerd/#description)中。

需要注意的是，为了输出 debug 内容，需要使用 `dockerd --debug` 或者在 `daemon.json` 文件中添加 `"debug": true`。同时这个用法时实验特性，因此还需要添加 `"experimental": true`，或者使用 `dockerd --experimental`命令。

文档中提到，Docker Daemon默认配置文件在 `/etc/docker/daemon.json` 中（可以使用`--config-file` 参数指定其他位置），这个文件中可以设置很多参数，比如：

```json
{
  "allow-nondistributable-artifacts": [],
  "api-cors-header": "",
  "authorization-plugins": [],
  "bip": "",
  "bridge": "",
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "10GB",
      "policy": [
        { "keepStorage": "10GB", "filter": ["unused-for=2200h"] },
        { "keepStorage": "50GB", "filter": ["unused-for=3300h"] },
        { "keepStorage": "100GB", "all": true }
      ]
    }
  },
  "cgroup-parent": "",
  "containerd": "/run/containerd/containerd.sock",
  "containerd-namespace": "docker",
  "containerd-plugins-namespace": "docker-plugins",
  "data-root": "",
  "debug": true,
  "default-address-pools": [
    {
      "base": "172.30.0.0/16",
      "size": 24
    },
    {
      "base": "172.31.0.0/16",
      "size": 24
    }
  ],
  "default-cgroupns-mode": "private",
  "default-gateway": "",
  "default-gateway-v6": "",
  "default-network-opts": {},
  "default-runtime": "runc",
  "default-shm-size": "64M",
  "default-ulimits": {
    "nofile": {
      "Hard": 64000,
      "Name": "nofile",
      "Soft": 64000
    }
  },
  "dns": [],
  "dns-opts": [],
  "dns-search": [],
  "exec-opts": [],
  "exec-root": "",
  "experimental": false,
  "features": {},
  "fixed-cidr": "",
  "fixed-cidr-v6": "",
  "group": "",
  "host-gateway-ip": "",
  "hosts": [],
  "proxies": {
    "http-proxy": "http://proxy.example.com:80",
    "https-proxy": "https://proxy.example.com:443",
    "no-proxy": "*.test.example.com,.example.org"
  },
  "icc": false,
  "init": false,
  "init-path": "/usr/libexec/docker-init",
  "insecure-registries": [],
  "ip": "0.0.0.0",
  "ip-forward": false,
  "ip-masq": false,
  "iptables": false,
  "ip6tables": false,
  "ipv6": false,
  "labels": [],
  "live-restore": true,
  "log-driver": "json-file",
  "log-level": "",
  "log-opts": {
    "cache-disabled": "false",
    "cache-max-file": "5",
    "cache-max-size": "20m",
    "cache-compress": "true",
    "env": "os,customer",
    "labels": "somelabel",
    "max-file": "5",
    "max-size": "10m"
  },
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 5,
  "max-download-attempts": 5,
  "mtu": 0,
  "no-new-privileges": false,
  "node-generic-resources": [
    "NVIDIA-GPU=UUID1",
    "NVIDIA-GPU=UUID2"
  ],
  "oom-score-adjust": 0,
  "pidfile": "",
  "raw-logs": false,
  "registry-mirrors": [],
  "runtimes": {
    "cc-runtime": {
      "path": "/usr/bin/cc-runtime"
    },
    "custom": {
      "path": "/usr/local/bin/my-runc-replacement",
      "runtimeArgs": [
        "--debug"
      ]
    }
  },
  "seccomp-profile": "",
  "selinux-enabled": false,
  "shutdown-timeout": 15,
  "storage-driver": "",
  "storage-opts": [],
  "swarm-default-advertise-addr": "",
  "tls": true,
  "tlscacert": "",
  "tlscert": "",
  "tlskey": "",
  "tlsverify": true,
  "userland-proxy": false,
  "userland-proxy-path": "/usr/libexec/docker-proxy",
  "userns-remap": ""
}
```

## 其他

以上环境变量包含了Docker使用中大部分会用到的变量，但是仍然不全，有一些其他的变量，比如 `DOCKER_BUILDKIT`、`DOCKER_OPTS`、`DOCKER_REGISTRY`、`DOCKER_NETWORK_MODE`、`DOCKER_VERSION`等，无法全部罗列，在需要使用时只需要查找资料即可。另外对于每一个环境变量都会在有关的配置文件中存在一个配置项等价于配置这个环境变量，或者在对应的 CLI 中有相关的命令行参数。命令行参数一般是对于单次运行而言的，它的优先级最高，也就是会覆盖其他配置。卸载配置文件中会在每次运行时都起作用。环境变量则介于两者之间，它可以写入bash配置以便每次运行起作用，也可以在它存在时都起作用。不过在配置文件和命令行参数中存在的选项不一定有环境变量对应。但是如果了解了环境变量的主要内容，大部分操作应该都不成问题。




























