# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-11-08

### Added

- Initial release of `@chaeco/hoa-auto-router`
- File-based automatic routing system for Hoa.js framework
- Support for nested directory structures
- Built-in permission metadata with `requiresAuth` support
- Dynamic parameter support using `[param]` syntax
- Duplicate route detection and validation
- TypeScript support with full type definitions
- Integration with `@chaeco/hoa-jwt-permission` for automatic permission checking
- Comprehensive test suite with Jest
- Example project demonstrating usage

### Features

- 🚀 Zero-config automatic routing based on file structure
- 📁 Nested directory support with automatic path building
- 🔒 Built-in permission metadata (`requiresAuth`) support
- 🤝 Perfect integration with `@chaeco/hoa-jwt-permission`
- 🔍 Built-in validation for file naming and parameters
- 📝 Type-safe with full TypeScript support
- ⚡ Dynamic parameter support `[param]` syntax
- 🛡️ Duplicate route detection
- 🎯 Async handler support
- 🌍 Global `defaultRequiresAuth` configuration

### Technical Details

- ESM module support
- Peer dependency on `hoa: ^0.3.0`
- Node.js >=16.0.0 requirement
- MIT License

## [Unreleased]

### Planned

- Additional export formats support
- More configuration options
- Performance optimizations
- Extended documentation
