import { jest } from '@jest/globals';
import { autoRouter } from '../auto-router';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
describe('autoRouter', () => {
    const testDir = join(process.cwd(), '__tests__', 'controllers');
    beforeAll(() => {
        // Create test controllers directory
        mkdirSync(testDir, { recursive: true });
        // Create test route files (using .js for dynamic imports to work in tests)
        writeFileSync(join(testDir, 'get-users.js'), 'export default async (ctx) => { ctx.res.body = { users: [] } }');
        writeFileSync(join(testDir, 'post-login.js'), 'export default async (ctx) => { ctx.res.body = { token: "test" } }');
        writeFileSync(join(testDir, 'get-[id].js'), 'export default async (ctx) => { ctx.res.body = { id: ctx.params.id } }');
    });
    afterAll(() => {
        // Clean up test files
        rmSync(testDir, { recursive: true, force: true });
    });
    it('should load routes from directory', async () => {
        const mockApp = {
            get: jest.fn(),
            post: jest.fn(),
            $routes: {
                publicRoutes: [],
                protectedRoutes: [],
                all: [],
            },
        };
        const router = autoRouter({ dir: testDir, prefix: '/api' });
        await router(mockApp);
        expect(mockApp.get).toHaveBeenCalledWith('/api/users', expect.any(Function));
        expect(mockApp.post).toHaveBeenCalledWith('/api/login', expect.any(Function));
        expect(mockApp.get).toHaveBeenCalledWith('/api/:id', expect.any(Function));
        expect(mockApp.$routes).toBeDefined();
        expect(mockApp.$routes.all).toHaveLength(3);
        expect(mockApp.$routes.publicRoutes).toHaveLength(3); // Since defaultRequiresAuth: false
    });
    it('should handle default options', async () => {
        const mockApp = {
            get: jest.fn(),
            post: jest.fn(),
            $routes: undefined,
        };
        const router = autoRouter({ dir: testDir });
        await router(mockApp);
        expect(mockApp.get).toHaveBeenCalledWith('/api/users', expect.any(Function));
    });
    it('should throw error if app is not provided', async () => {
        const router = autoRouter();
        await expect(router(null)).rejects.toThrow('Auto-router plugin requires an application instance');
    });
    it('should support multiple autoRouter instances with different configurations', async () => {
        // Create separate test directories
        const adminDir = join(process.cwd(), '__tests__', 'controllers-admin');
        const clientDir = join(process.cwd(), '__tests__', 'controllers-client');
        mkdirSync(adminDir, { recursive: true });
        mkdirSync(clientDir, { recursive: true });
        // Create admin routes
        writeFileSync(join(adminDir, 'get-dashboard.js'), 'export default async (ctx) => { ctx.res.body = { dashboard: "admin" } }');
        writeFileSync(join(adminDir, 'post-settings.js'), 'export default async (ctx) => { ctx.res.body = { settings: "updated" } }');
        // Create client routes
        writeFileSync(join(clientDir, 'get-profile.js'), 'export default async (ctx) => { ctx.res.body = { profile: "client" } }');
        writeFileSync(join(clientDir, 'post-order.js'), 'export default async (ctx) => { ctx.res.body = { order: "created" } }');
        const mockApp = {
            get: jest.fn(),
            post: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        // Load admin routes
        const adminRouter = autoRouter({
            dir: adminDir,
            defaultRequiresAuth: false,
            prefix: '/api/admin',
        });
        await adminRouter(mockApp);
        // Load client routes
        const clientRouter = autoRouter({
            dir: clientDir,
            defaultRequiresAuth: true,
            prefix: '/api/client',
        });
        await clientRouter(mockApp);
        // Verify admin routes
        expect(mockApp.get).toHaveBeenCalledWith('/api/admin/dashboard', expect.any(Function));
        expect(mockApp.post).toHaveBeenCalledWith('/api/admin/settings', expect.any(Function));
        // Verify client routes
        expect(mockApp.get).toHaveBeenCalledWith('/api/client/profile', expect.any(Function));
        expect(mockApp.post).toHaveBeenCalledWith('/api/client/order', expect.any(Function));
        // Verify route metadata
        expect(mockApp.$routes).toBeDefined();
        expect(mockApp.$routes.all).toHaveLength(4);
        expect(mockApp.$routes.publicRoutes).toHaveLength(2); // admin routes are public
        expect(mockApp.$routes.protectedRoutes).toHaveLength(2); // client routes are protected
        // Cleanup
        rmSync(adminDir, { recursive: true, force: true });
        rmSync(clientDir, { recursive: true, force: true });
    });
    it('should prevent duplicate routes across multiple autoRouter instances', async () => {
        const testDir1 = join(process.cwd(), '__tests__', 'controllers-dup1');
        const testDir2 = join(process.cwd(), '__tests__', 'controllers-dup2');
        mkdirSync(testDir1, { recursive: true });
        mkdirSync(testDir2, { recursive: true });
        // Create same route in both directories
        writeFileSync(join(testDir1, 'get-test.js'), 'export default async (ctx) => { ctx.res.body = { from: "dir1" } }');
        writeFileSync(join(testDir2, 'get-test.js'), 'export default async (ctx) => { ctx.res.body = { from: "dir2" } }');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        // Load routes from both directories with same prefix
        const router1 = autoRouter({ dir: testDir1, prefix: '/api' });
        await router1(mockApp);
        const router2 = autoRouter({ dir: testDir2, prefix: '/api' });
        await router2(mockApp);
        // First route should be registered
        expect(mockApp.get).toHaveBeenCalledWith('/api/test', expect.any(Function));
        expect(mockApp.get).toHaveBeenCalledTimes(1); // Only called once, duplicate rejected
        // Error should be logged for duplicate route
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Skip file'));
        consoleSpy.mockRestore();
        // Cleanup
        rmSync(testDir1, { recursive: true, force: true });
        rmSync(testDir2, { recursive: true, force: true });
    });
    it('should support merged configuration with array', async () => {
        // Create separate test directories
        const mergedAdminDir = join(process.cwd(), '__tests__', 'controllers-merged-admin');
        const mergedClientDir = join(process.cwd(), '__tests__', 'controllers-merged-client');
        mkdirSync(mergedAdminDir, { recursive: true });
        mkdirSync(mergedClientDir, { recursive: true });
        // Create admin routes
        writeFileSync(join(mergedAdminDir, 'get-config.js'), 'export default async (ctx) => { ctx.res.body = { config: "admin" } }');
        // Create client routes
        writeFileSync(join(mergedClientDir, 'get-data.js'), 'export default async (ctx) => { ctx.res.body = { data: "client" } }');
        const mockApp = {
            get: jest.fn(),
            post: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        // Use merged configuration (array)
        const router = autoRouter([
            {
                dir: mergedAdminDir,
                defaultRequiresAuth: false,
                prefix: '/api/admin',
            },
            {
                dir: mergedClientDir,
                defaultRequiresAuth: true,
                prefix: '/api/client',
            },
        ]);
        await router(mockApp);
        // Verify admin routes
        expect(mockApp.get).toHaveBeenCalledWith('/api/admin/config', expect.any(Function));
        // Verify client routes
        expect(mockApp.get).toHaveBeenCalledWith('/api/client/data', expect.any(Function));
        // Verify route metadata
        expect(mockApp.$routes).toBeDefined();
        expect(mockApp.$routes.all).toHaveLength(2);
        expect(mockApp.$routes.publicRoutes).toHaveLength(1); // admin route is public
        expect(mockApp.$routes.protectedRoutes).toHaveLength(1); // client route is protected
        // Cleanup
        rmSync(mergedAdminDir, { recursive: true, force: true });
        rmSync(mergedClientDir, { recursive: true, force: true });
    });
    it('should support array with single configuration', async () => {
        const singleArrayDir = join(process.cwd(), '__tests__', 'controllers-single-array');
        mkdirSync(singleArrayDir, { recursive: true });
        writeFileSync(join(singleArrayDir, 'get-test.js'), 'export default async (ctx) => { ctx.res.body = { test: "ok" } }');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        // Use array with single configuration
        const router = autoRouter([
            {
                dir: singleArrayDir,
                prefix: '/api',
            },
        ]);
        await router(mockApp);
        expect(mockApp.get).toHaveBeenCalledWith('/api/test', expect.any(Function));
        expect(mockApp.$routes).toBeDefined();
        expect(mockApp.$routes.all).toHaveLength(1);
        // Cleanup
        rmSync(singleArrayDir, { recursive: true, force: true });
    });
    it('should support prefix as array for multiple prefixes', async () => {
        const multiPrefixDir = join(process.cwd(), '__tests__', 'controllers-multi-prefix');
        mkdirSync(multiPrefixDir, { recursive: true });
        writeFileSync(join(multiPrefixDir, 'get-test.js'), 'export default async (ctx) => { ctx.res.body = { test: "ok" } }');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        // Use array of prefixes
        const router = autoRouter({
            dir: multiPrefixDir,
            prefix: ['/api', '/v1', '/v2'],
        });
        await router(mockApp);
        // Should register the same route with all prefixes
        expect(mockApp.get).toHaveBeenCalledWith('/api/test', expect.any(Function));
        expect(mockApp.get).toHaveBeenCalledWith('/v1/test', expect.any(Function));
        expect(mockApp.get).toHaveBeenCalledWith('/v2/test', expect.any(Function));
        expect(mockApp.$routes).toBeDefined();
        expect(mockApp.$routes.all).toHaveLength(3);
        // Cleanup
        rmSync(multiPrefixDir, { recursive: true, force: true });
    });
    it('should support file name as HTTP method only (e.g., get.ts)', async () => {
        const methodOnlyDir = join(process.cwd(), '__tests__', 'controllers-method-only');
        const subDir = join(methodOnlyDir, 'users');
        mkdirSync(subDir, { recursive: true });
        // Create files with method name only
        writeFileSync(join(methodOnlyDir, 'get.js'), 'export default async (ctx) => { ctx.res.body = { root: "get" } }');
        writeFileSync(join(subDir, 'get.js'), 'export default async (ctx) => { ctx.res.body = { users: "get" } }');
        writeFileSync(join(subDir, 'post.js'), 'export default async (ctx) => { ctx.res.body = { users: "post" } }');
        const mockApp = {
            get: jest.fn(),
            post: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        const router = autoRouter({ dir: methodOnlyDir, prefix: '/api' });
        await router(mockApp);
        // Should register routes at directory path
        expect(mockApp.get).toHaveBeenCalledWith('/api', expect.any(Function));
        expect(mockApp.get).toHaveBeenCalledWith('/api/users', expect.any(Function));
        expect(mockApp.post).toHaveBeenCalledWith('/api/users', expect.any(Function));
        expect(mockApp.$routes).toBeDefined();
        expect(mockApp.$routes.all).toHaveLength(3);
        // Cleanup
        rmSync(methodOnlyDir, { recursive: true, force: true });
    });
    it('should respect logging option and disable console output', async () => {
        const loggingTestDir = join(process.cwd(), '__tests__', 'controllers-logging-test');
        mkdirSync(loggingTestDir, { recursive: true });
        writeFileSync(join(loggingTestDir, 'get-test.js'), 'export default async (ctx) => { ctx.res.body = { test: "ok" } }');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        // Test with logging disabled
        const router = autoRouter({
            dir: loggingTestDir,
            prefix: '/api',
            logging: false,
        });
        await router(mockApp);
        // console.log should not be called for info logs
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('🔄 Scanning controller directory'));
        consoleSpy.mockRestore();
        // Cleanup
        rmSync(loggingTestDir, { recursive: true, force: true });
    });
    it('should call onLog callback with correct log levels', async () => {
        const onLogTestDir = join(process.cwd(), '__tests__', 'controllers-onlog-test');
        mkdirSync(onLogTestDir, { recursive: true });
        writeFileSync(join(onLogTestDir, 'get-test.js'), 'export default async (ctx) => { ctx.res.body = { test: "ok" } }');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        const onLog = jest.fn();
        const router = autoRouter({
            dir: onLogTestDir,
            prefix: '/api',
            onLog: onLog,
        });
        await router(mockApp);
        // Should have been called with 'info' level logs
        expect(onLog).toHaveBeenCalledWith('info', expect.stringContaining('Scanning controller directory'));
        expect(onLog).toHaveBeenCalledWith('info', expect.stringContaining('✅ GET'));
        expect(onLog).toHaveBeenCalledWith('info', expect.stringContaining('Registered routes'));
        // Cleanup
        rmSync(onLogTestDir, { recursive: true, force: true });
    });
    it('should call onLog callback for error logs even with logging disabled', async () => {
        const errorDir = join(process.cwd(), '__tests__', 'controllers-error-log');
        mkdirSync(errorDir, { recursive: true });
        // Create a file with invalid name to trigger error
        writeFileSync(join(errorDir, 'invalid-file.js'), 'export default async (ctx) => {}');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        const onLog = jest.fn();
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const router = autoRouter({
            dir: errorDir,
            prefix: '/api',
            logging: false,
            onLog: onLog,
        });
        await router(mockApp);
        // onLog should be called with 'error' level
        expect(onLog).toHaveBeenCalledWith('error', expect.stringContaining('Skip file'));
        consoleSpy.mockRestore();
        // Cleanup
        rmSync(errorDir, { recursive: true, force: true });
    });
    it('should support strict mode (default) - reject non-function/non-createHandler exports', async () => {
        const strictDir = join(process.cwd(), '__tests__', 'controllers-strict');
        mkdirSync(strictDir, { recursive: true });
        // Create valid file
        writeFileSync(join(strictDir, 'get-valid.js'), 'export default async (ctx) => { ctx.res.body = { valid: true } }');
        // Create file with object export (invalid in strict mode)
        writeFileSync(join(strictDir, 'get-invalid.js'), 'export default { handler: async (ctx) => { ctx.res.body = { invalid: true } }, meta: {} }');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const router = autoRouter({
            dir: strictDir,
            prefix: '/api',
            strict: true, // Default strict mode
        });
        await router(mockApp);
        // Only valid route should be registered
        expect(mockApp.get).toHaveBeenCalledWith('/api/valid', expect.any(Function));
        expect(mockApp.get).not.toHaveBeenCalledWith('/api/invalid', expect.any(Function));
        // Error should be logged for invalid file
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load route'));
        consoleSpy.mockRestore();
        // Cleanup
        rmSync(strictDir, { recursive: true, force: true });
    });
    it('should support non-strict mode - allow object exports with warning', async () => {
        const nonStrictDir = join(process.cwd(), '__tests__', 'controllers-nonstrict');
        mkdirSync(nonStrictDir, { recursive: true });
        // Create file with valid function export
        writeFileSync(join(nonStrictDir, 'get-test.js'), 'export default async (ctx) => { ctx.res.body = { test: true } }');
        const mockApp = {
            get: jest.fn(),
            $routes: undefined,
            $registeredRoutes: undefined,
        };
        const router = autoRouter({
            dir: nonStrictDir,
            prefix: '/api',
            strict: false, // Non-strict mode
        });
        await router(mockApp);
        // Should register the route
        expect(mockApp.get).toHaveBeenCalledWith('/api/test', expect.any(Function));
        // Cleanup
        rmSync(nonStrictDir, { recursive: true, force: true });
    });
});
//# sourceMappingURL=auto-router.test.js.map