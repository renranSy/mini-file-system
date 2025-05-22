# 文件系统前端

这是一个基于Vue3的文件系统前端项目，提供了现代化的用户界面和交互体验。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Naive UI
- Pinia (状态管理)
- Vue Router
- TailwindCSS
- Axios

## 开发环境要求

- Node.js (推荐v16或更高版本)
- pnpm (包管理器)

## 安装

1. 克隆项目
```bash
git clone https://github.com/renranSy/mini-file-system.git
```

2. 安装依赖
```bash
pnpm install
```

## 开发

启动开发服务器：
```bash
pnpm dev
```

## 构建

构建生产版本：
```bash
pnpm build
```

预览生产构建：
```bash
pnpm preview
```

## 代码规范

项目使用ESLint和Prettier进行代码格式化和规范检查。

运行代码检查：
```bash
pnpm lint
```

格式化代码：
```bash
pnpm format
```

## 项目结构

```
src/
├── api/        # API接口定义
├── assets/     # 静态资源
├── components/ # 公共组件
├── router/     # 路由配置
├── store/      # Pinia状态管理
├── utils/      # 工具函数
├── views/      # 页面组件
├── App.vue     # 根组件
└── main.ts     # 入口文件
```

## 主要功能

- 文件上传和下载
- 文件上传加密、下载解密（后端）
- 文件哈希校验
- 文件管理
- 用户认证

## 许可证

ISC License 