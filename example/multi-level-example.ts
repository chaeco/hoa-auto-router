/**
 * Multi-Level Configuration Example
 * 多层级配置示例
 * 
 * This example demonstrates how to use multiple autoRouter instances
 * with different configurations for different directories.
 * 
 * 此示例演示如何为不同的目录使用多个具有不同配置的 autoRouter 实例。
 */

import { Hoa } from 'hoa'
import { autoRouter } from '../src'
import type { AppRoutesRegistry, RouteInfo } from '../src'

const app = new Hoa()

// Scenario 1: Merged configuration for Admin and Client routes
// 场景 1：合并配置管理端和客户端路由
app.extend(
  autoRouter([
    {
      // Admin routes - default public, some routes may require auth
      // 管理端路由 - 默认公开，部分路由可能需要认证
      dir: './controllers/admin',
      defaultRequiresAuth: false,
      prefix: '/api/admin',
    },
    {
      // Client routes - default protected, some routes may be public
      // 客户端路由 - 默认受保护，部分路由可能公开
      dir: './controllers/client',
      defaultRequiresAuth: true,
      prefix: '/api/client',
    },
  ])
)

// Scenario 2: Merged configuration for multiple business modules
// 场景 2：合并配置多个业务模块
app.extend(
  autoRouter([
    {
      dir: './controllers/user',
      prefix: '/api/user',
      defaultRequiresAuth: false,
    },
    {
      dir: './controllers/order',
      prefix: '/api/order',
      defaultRequiresAuth: true,
    },
    {
      dir: './controllers/product',
      prefix: '/api/product',
      defaultRequiresAuth: false,
    },
  ])
)

// Scenario 3: Merged configuration for API versioning
// 场景 3：合并配置 API 版本管理
app.extend(
  autoRouter([
    {
      dir: './controllers/v1',
      prefix: '/api/v1',
      defaultRequiresAuth: false,
    },
    {
      dir: './controllers/v2',
      prefix: '/api/v2',
      defaultRequiresAuth: false,
    },
  ])
)

// After all routes are loaded, you can inspect the registered routes
// 所有路由加载完成后，可以检查已注册的路由
const appWithRoutes = app as any as (typeof app & { $routes?: AppRoutesRegistry })

console.log('\n📊 Route Statistics:')
console.log(`   Total routes: ${appWithRoutes.$routes?.all.length || 0}`)
console.log(`   Public routes: ${appWithRoutes.$routes?.publicRoutes.length || 0}`)
console.log(`   Protected routes: ${appWithRoutes.$routes?.protectedRoutes.length || 0}`)

console.log('\n📋 All Routes:')
appWithRoutes.$routes?.all.forEach((route: RouteInfo) => {
  const authMark = route.requiresAuth ? ' 🔒' : ''
  console.log(`   ${route.method.padEnd(7)} ${route.path}${authMark}`)
})

console.log('🚀 Server running on http://localhost:3000')

export default app
