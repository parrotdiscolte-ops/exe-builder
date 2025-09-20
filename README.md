# EXE Builder - Bug Fixes Documentation

This document outlines the major bugs that were identified and fixed in the exe-builder application.

## Overview

The exe-builder is an Express.js server that compiles C++ source code and provides downloadable executables. The original implementation had several critical security and reliability issues that have been addressed.

## Fixed Bugs

### 1. Race Condition in File Handling ✅

**Problem**: Multiple simultaneous requests would overwrite the same `main.cpp` and `output.exe` files, causing compilation failures and incorrect results.

**Solution**: 
- Generate unique filenames using UUID for each request
- Files are now named `main_{uuid}.cpp` and `output_{uuid}.exe`
- Each request is completely isolated from others

**Impact**: Eliminates race conditions, allows concurrent compilation requests.

### 2. Input Validation and Security Issues ✅

**Problem**: 
- No input size limits (could cause memory exhaustion)
- No sanitization of user input
- Potential for malicious code execution through system calls

**Solution**:
- Added 100KB limit on source code input
- Implemented pattern detection for dangerous system calls
- Added comprehensive input validation

**Blocked patterns**:
- `system()` calls
- `exec*()` family functions  
- `popen()` calls
- Dangerous includes like `<unistd.h>`, `<sys/stat.h>`

### 3. Error Response Format Inconsistencies ✅

**Problem**: Mixed error response formats made client integration difficult.

**Before**: 
```json
{"error": "message"}           // Some endpoints
{"outputs": {"error": "msg"}}  // Other endpoints
```

**After**: All endpoints consistently return:
```json
{"error": "message"}
```

### 4. Missing Compilation Timeout Protection ✅

**Problem**: No timeout for compilation process could lead to hung processes and resource exhaustion.

**Solution**: 
- Added 30-second compilation timeout
- Automatic cleanup of files if compilation times out
- Proper error response when timeout occurs

### 5. File Cleanup Issues ✅

**Problem**: Generated files were never cleaned up, leading to disk space issues over time.

**Solution**:
- Automatic cleanup after successful download
- Scheduled cleanup after 10 minutes for unused files
- Cleanup on compilation errors and timeouts

### 6. Security Vulnerabilities ✅

**Problem**: Missing security headers and no request size limits.

**Solution**:
- Added security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` 
  - `X-XSS-Protection: 1; mode=block`
- Added 1MB request body size limit
- UUID validation for download endpoints

### 7. Path Validation Issues ✅

**Problem**: Download endpoint didn't validate request IDs, potential for directory traversal.

**Solution**: 
- Added strict UUID format validation for download requests
- Proper error handling for invalid or non-existent files
- Secure file serving with automatic cleanup

## API Changes

### Compilation Endpoint
```
POST /sse
```

**Request**:
```json
{
  "inputs": {
    "source": "C++ source code here"
  }
}
```

**Success Response**:
```json
{
  "downloadUrl": "http://localhost:3000/download/{uuid}"
}
```

**Error Response**:
```json
{
  "error": "Error description"
}
```

### Download Endpoint
```
GET /download/{uuid}
```

Downloads the compiled executable with proper cleanup after download.

## Testing

Run the test suite to verify all fixes:

```bash
npm install node-fetch
node test-fixes.js
```

The test suite verifies:
- Input validation works correctly
- Race conditions are resolved
- Security measures are in place
- Error formats are consistent
- Valid compilations work properly

## Security Improvements

1. **Input Sanitization**: Dangerous system calls are blocked
2. **Size Limits**: Request body limited to 1MB, source code to 100KB
3. **Timeout Protection**: Compilation limited to 30 seconds
4. **File Isolation**: Each request uses unique temporary files
5. **Automatic Cleanup**: All temporary files are cleaned up
6. **Security Headers**: Standard security headers are set
7. **UUID Validation**: Download endpoints validate request IDs

## Backward Compatibility

All changes maintain backward compatibility with existing clients. The API endpoints remain the same, with only improved error handling and response consistency.