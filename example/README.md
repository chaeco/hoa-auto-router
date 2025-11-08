# Hoa Auto Router Example

这是一个展示如何使用 `hoa-auto-router` 插件的示例项目。

## 项目结构

```
example/
├── app.ts                 # 主应用文件
├── controllers/           # 控制器目录
│   ├── get-users.ts       # GET /api/users
│   ├── post-login.ts      # POST /api/login
│   └── get-[id].ts        # GET /api/:id
├── package.json
├── tsconfig.json
└── README.md
```

## 安装依赖

```bash
cd example
npm install
```

注意：这个示例使用了本地包 `hoa-auto-router`，需要在上级目录先构建包：

```bash
cd ..
npm run build
cd example
npm install
```

## 运行示例

```bash
# 开发模式
npm run dev

# 或构建后运行
npm run build
npm start
```

## API 端点

启动服务器后，你可以访问以下端点：

- `GET /api/users` - 获取用户列表
- `POST /api/login` - 用户登录（发送 JSON: `{"username": "admin", "password": "password"}`）
- `GET /api/:id` - 获取特定用户详情

## 控制器文件命名规则

- `get-users.ts` → `GET /api/users`
- `post-login.ts` → `POST /api/login`
- `get-[id].ts` → `GET /api/:id`

每个控制器文件必须导出默认的异步函数或使用 `createHandler` 包装的对象。

## 使用插件

```typescript
import { Hoa } from 'hoa'
import { autoRouter } from 'hoa-auto-router'

const app = new Hoa()

app.extend(
  autoRouter({
    dir: './controllers', // 控制器目录
    prefix: '/api', // API 前缀
    defaultRequiresAuth: false, // 默认权限要求
  })
)
```
