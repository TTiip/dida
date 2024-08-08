# DiDa

使用 Vue3 来实现滴答清单的功能

## 启动项目

### 1. 安装项目依赖

```bash
# 或者使用 pnpm i
pnpm bootstrap
```
### 2. 启动后端服务

```bash
pnpm docker:be
```

通过 docker 来启动后端服务以及 mongoDB 服务

启动成功后就可以通过 http://localhost:3000/ 访问到后端服务了

如果你使用了 mongoDB client 之类的应用 可以直接连接 http://localhost:27017

注意:
1. 这里将会占用 3000 以及 27017 端口,请检查在启动之前是否端口被占用的问题
2. 通过 docker:be 进入的是 prod 环境 不过对于我们写测试来讲也不需要关心后端逻辑

#### 如何开发修改后端代码并进入开发模式

需要按照以下步骤执行 (不过理论上来讲你也不太需要开发修改后端代码)

```bash
pnpm dev:be
```

这时候会启动后端服务, 但是后端服务依赖 mongoDB server, 地址也是写死的: http://localhost:27017

所以你需要保证你本地有开启 mongoDB server

这里有两个选项:
1. 自己在本地开启 mongoDB server
2. 使用 pnpm docker:be 启动 后端 server 以及 mongoDB server , 然后你手动把后端 server 给关了 只留一个 mongoDB server 就可以
