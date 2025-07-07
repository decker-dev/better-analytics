# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2024-12-19

### ✨ New Features

#### 🚀 Next.js Server Auto-Initialization
- **Zero-Config Server Tracking**: Server functions (`trackServer`, `identifyServer`, `trackPageviewServer`) now automatically initialize from environment variables
- **Environment Variable Support**: Set `NEXT_PUBLIC_BA_SITE` and optionally `NEXT_PUBLIC_BA_URL` or `BA_API_KEY` for automatic configuration
- **Server Actions Support**: Full compatibility with Next.js Server Actions with auto-initialization
- **API Routes Enhancement**: Streamlined tracking in API routes without manual initialization

#### 🔧 Enhanced Next.js Integration
- **Unified Import Path**: All Next.js functionality now available from `better-analytics/next`
- **Client-Server Consistency**: Both client and server functions work seamlessly with the same configuration
- **Improved Developer Experience**: No more manual server initialization when using environment variables

### 🐛 Bug Fixes
- **Next.js Server Compatibility**: Fixed issues with server-side tracking in Next.js environments
- **Environment Detection**: Improved environment variable detection and fallback handling
- **TypeScript Exports**: Enhanced TypeScript support for Next.js server functions

### 📦 API Changes
- **New Auto-Initializing Functions**: `trackServer`, `identifyServer`, `trackPageviewServer` from `better-analytics/next` 
- **Enhanced Server Configuration**: Support for `BA_API_KEY`, `BA_DEBUG` environment variables
- **Backward Compatibility**: All existing APIs remain unchanged

### 📚 Documentation
- **Updated README**: Comprehensive examples for Next.js server-side tracking
- **Environment Setup Guide**: Clear instructions for zero-config setup
- **Server Actions Examples**: Real-world usage patterns for Next.js Server Actions

---

## [0.9.0] - Previous Release

### ✨ New Features
- **Offline Event Queuing (Expo)**: Robust queueing system using AsyncStorage for mobile environments
- **Automatic Retry**: Events are automatically sent when connection is restored

### 🐛 Bug Fixes  
- **Navigation Tracking in Expo Router**: Fixed critical bug in useExpoRouterTracking hook that violated React Hooks rules

---

## [0.8.0] - Previous Release

### ✨ New Features
- **Expo Router Auto-Tracking**: Zero-config navigation tracking for Expo Router
- **Simplified API**: Cleaner function names and reduced API surface
- **Enhanced Debug Logging**: Better debugging experience for navigation tracking 