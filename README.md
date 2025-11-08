# @chaeco/hoa-auto-router

[![npm version](https://badge.fury.io/js/%40chaeco%2Fhoa-auto-router.svg)](https://badge.fury.io/js/%40chaeco%2Fhoa-auto-router)
[![codecov](https://codecov.io/gh/chaeco/hoa-auto-router/branch/main/graph/badge.svg)](https://codecov.io/gh/chaeco/hoa-auto-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

File-based automatic router plugin for Hoa.js framework. Routes are **functions only** for simplicity.

## Features

- 🚀 Zero-config automatic routing based on file structure
- 📁 Nested directory support with automatic path building
- � Built-in permission metadata (`requiresAuth`) support
- 🤝 Perfect integration with `@chaeco/hoa-jwt-permission`
- �🔍 Built-in validation for file naming and parameters
- 📝 Type-safe with full TypeScript support
- ⚡ Dynamic parameter support `[param]` syntax
- 🛡️ Duplicate route detection
- 🎯 Async handler support
- 🌍 Global `defaultRequiresAuth` configuration

## Installation

```bash
npm install @chaeco/hoa-auto-router
# or
yarn add @chaeco/hoa-auto-router
```

## Quick Start

### Basic Setup

```typescript
import { Hoa } from 'hoa'
import { autoRouter } from '@chaeco/hoa-auto-router'

const app = new Hoa()

// Recommended: Strict mode (default enabled, functions only)
app.extend(
  autoRouter({
    dir: './controllers',
    prefix: '/api',
    defaultRequiresAuth: false, // Blacklist mode
    strict: true, // Strict mode (default)
  })
)

app.listen(3000)
```

### Strict Mode

**Strict Mode (strict: true) - Recommended**:

- ✅ Only pure function exports allowed
- ✅ Only `createHandler()` wrapped exports allowed
- ❌ Plain object exports `{ handler, meta }` not allowed
- 🎯 Enforces consistent team code style

**Non-Strict Mode (strict: false)**:

- ✅ All export formats allowed
- ⚠️ Will show warning messages
- 💡 用于向后兼容或灵活迁移

### File Naming Convention

Files should follow the pattern: `[method]-[name].ts`

**Supported HTTP Methods**: `get`, `post`, `put`, `delete`, `patch`, `head`, `options`

## Examples

### 1. Basic Route

```typescript
// controllers/get-users.ts
export default async ctx => {
  ctx.res.body = { users: [] }
}
// Route: GET /api/users
```

### 3. Multiple Parameters

```typescript
// controllers/get-[userId]-posts.ts
export default async ctx => {
  const userId = ctx.params.userId
  ctx.res.body = { userId }
}
// Route: GET /api/:userId/posts

// controllers/get-[userId]-[postId].ts
export default async ctx => {
  const { userId, postId } = ctx.params
  ctx.res.body = { userId, postId }
}
// Route: GET /api/:userId/:postId
```

### 4. Nested Directories

```text
controllers/
  users/
    get-[id].ts        // GET /api/users/:id
    posts/
      get-[id].ts      // GET /api/users/posts/:id
```

## Permission Metadata

### Two Supported Export Methods

#### Method 1: Pure Function (Recommended for most routes)

```typescript
// controllers/get-users.ts
export default async ctx => {
  ctx.res.body = { users: [] }
}
// Uses global defaultRequiresAuth configuration
```

#### Method 2: createHandler Wrapper（需要权限元数据时）

```typescript
import { createHandler } from '@chaeco/hoa-auto-router'

// controllers/users/get-info.ts - Protected route
export default createHandler(
  async ctx => {
    ctx.res.body = { success: true, data: { userId: ctx.currentUser?.id } }
  },
  { requiresAuth: true, description: '获取用户信息' }
)

// controllers/auth/post-login.ts - Public route
export default createHandler(
  async ctx => {
    ctx.res.body = { success: true }
  },
  { requiresAuth: false }
)
```

### Configuration Modes

**Blacklist Mode (Recommended for public APIs)**:

```typescript
autoRouter({
  defaultRequiresAuth: false,  // Public by default
})

// Only mark routes that need protection
export default createHandler(async (ctx) => { ... }, { requiresAuth: true })
```

**Whitelist Mode (Recommended for internal APIs)**:

```typescript
autoRouter({
  defaultRequiresAuth: true,  // Protected by default
})

// Only mark routes that should be public
export default createHandler(async (ctx) => { ... }, { requiresAuth: false })
```

## Integration with @chaeco/hoa-jwt-permission

Routes automatically collected for permission checking:

```typescript
import { Hoa } from 'hoa'
import { jwt } from '@hoajs/jwt'
import { autoRouter } from '@chaeco/hoa-auto-router'
import { jwtAuth } from '@chaeco/hoa-jwt-permission'
import config from './config'

const app = new Hoa()

// Layer 1: Token Verification
app.use(jwt({ secret: config.jwtSecret, algorithms: ['HS256'] }))

// Layer 2: Permission Check (auto-discovers from autoRouter)
app.use(jwtAuth({ autoDiscovery: true }))

// Layer 3: Route Discovery & Registration
app.extend(
  autoRouter({
    defaultRequiresAuth: false,
  })
)

// Now all routes are automatically protected based on metadata!
app.listen(3000)
```

**How it works:**

1. `autoRouter` scans `controllers/` and extracts permission metadata
2. Stores route info in `app.$routes` with `requiresAuth` flag
3. `jwtAuth` reads from `app.$routes` and validates requests
4. **No duplicate route configuration needed!**

## Type Safety

```typescript
import { createHandler, RouteHandler } from '@chaeco/hoa-auto-router'
import type { HoaContext } from 'hoa'

export default createHandler({ requiresAuth: true }, (async (ctx: HoaContext): Promise<void> => {
  ctx.res.body = { success: true }
}) as RouteHandler)
```

## API Reference

### `autoRouter(options)`

**Options**:

- `dir` (string) - Controllers directory path (default: `./controllers`)
- `prefix` (string) - API route prefix (default: `/api`)
- `defaultRequiresAuth` (boolean) - Global default permission requirement (default: `false`)

### `createHandler(meta?, handler)`

Wrapper function to attach metadata to route handlers.

**Parameters**:

- `meta` (object, optional)
  - `requiresAuth` (boolean) - Whether route requires authentication
  - `description` (string) - Route description
- `handler` (function) - The async route handler

**Returns**: The wrapped handler function

## Validation Rules

- ✅ Filenames must start with a valid HTTP method
- ✅ Parameters must use bracket syntax: `[paramName]`
- ✅ Empty parameters `[]` are not allowed
- ✅ Only default exports allowed (no named exports)
- ✅ Default export must be a function
- ✅ Directory names should not contain HTTP method keywords
- ✅ Duplicate routes are detected and skipped
- ✅ Routes are logged with permission indicators (🔒 for protected routes)

## Best Practices

✅ **Do**:

- Use `createHandler()` to explicitly mark permission requirements
- Choose appropriate `defaultRequiresAuth` mode for your API
- Use `@chaeco/hoa-jwt-permission` with `autoDiscovery: true`
- Keep route metadata close to handlers
- Use nested directories for logical grouping

❌ **Don't**:

- Export objects or other non-function types
- Mix export styles unnecessarily
- Use complex logic for route names
- Create routes outside `controllers/` directory
- Forget to update permission config when changing API behavior

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

ISC
