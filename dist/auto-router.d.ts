/**
 * Auto router plugin - factory function
 * 自动路由插件 - 工厂函数
 * Used as application extension
 * 用作应用扩展
 *
 * Supports both single configuration and merged configuration (array)
 * 支持单个配置和合并式配置（数组）
 *
 * Options description:
 * 选项说明：
 *   - dir: Controller directory path (default: './controllers')
 *   dir: 控制器目录路径（默认：'./controllers'）
 *   - prefix: API route prefix, supports string or array (default: '/api')
 *   prefix: API 路由前缀，支持字符串或数组（默认：'/api'）
 *   - defaultRequiresAuth: Global default permission requirement (default: false)
 *   defaultRequiresAuth: 全局默认权限要求（默认：false）
 *     - false: All interfaces are public by default, unless explicitly set requiresAuth: true
 *     false: 所有接口默认为公开，除非显式设置 requiresAuth: true
 *     - true: All interfaces are protected by default, unless explicitly set requiresAuth: false
 *     true: 所有接口默认为受保护，除非显式设置 requiresAuth: false
 *   - strict: Strict mode (default: true)
 *   strict: 严格模式（默认：true）
 *     - true: Only allow pure function and createHandler export methods, prohibit other object exports
 *     true: 只允许纯函数和 createHandler 导出方式，禁止其他对象导出
 *     - false: Allow ordinary object { handler, meta } export method, but will show warning
 *     false: 允许普通对象 { handler, meta } 的导出方式，但会显示警告
 *   - logging: Whether to output route registration logs (default: true)
 *   logging: 是否输出路由注册日志（默认：true）
 *   - onLog: Custom logging callback for integration with own logging systems
 *   onLog: 自定义日志输出回调，方便集成自己的日志系统
 *
 * Usage:
 * 使用方式:
 *   // Custom logging - 自定义日志
 *   app.extend(autoRouter({
 *     dir: './controllers',
 *     onLog: (level, msg) => myLogger[level](msg)
 *   }))
 *
 *   // Single configuration - 单个配置
 *   app.extend(autoRouter({ dir: './controllers' }))
 *
 *   // Multiple prefixes - 多个前缀
 *   app.extend(autoRouter({ dir: './controllers', prefix: ['/api', '/v1'] }))
 *
 *   // Merged configuration - 合并式配置
 *   app.extend(autoRouter([
 *     { dir: './controllers/admin', prefix: '/api/admin', defaultRequiresAuth: false },
 *     { dir: './controllers/client', prefix: '/api/client', defaultRequiresAuth: true }
 *   ]))
 *
 *   // Whitelist mode - protected by default, mark public interfaces
 *   白名单模式 - 默认受保护，标记公开接口
 *   app.extend(autoRouter({ dir: './controllers', defaultRequiresAuth: true }))
 *
 *   // Disable strict mode - allow all export methods (not recommended)
 *   禁用严格模式 - 允许所有导出方式（不推荐）
 *   app.extend(autoRouter({ dir: './controllers', strict: false }))
 *
 *   // Disable logging - quiet mode
 *   禁用日志输出 - 静默模式
 *   app.extend(autoRouter({ dir: './controllers', logging: false }))
 */
export declare function autoRouter(options?: {
    dir?: string;
    prefix?: string | string[];
    defaultRequiresAuth?: boolean;
    strict?: boolean;
    logging?: boolean;
    onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
} | Array<{
    dir?: string;
    prefix?: string | string[];
    defaultRequiresAuth?: boolean;
    strict?: boolean;
    logging?: boolean;
    onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
}>): (app: any) => Promise<void>;
//# sourceMappingURL=auto-router.d.ts.map