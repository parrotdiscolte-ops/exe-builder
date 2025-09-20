# API Documentation

## Overview

The EXE Builder API provides a simple HTTP interface for compiling C++ source code and retrieving executable files.

## Base URL

```
http://localhost:3000
```

## Authentication

No authentication is required for this API.

## Endpoints

### POST /sse

Compiles C++ source code and returns a download URL for the executable.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "inputs": {
    "source": "string (required) - C++ source code to compile"
  }
}
```

#### Response

**Success (200 OK):**
```json
{
  "outputs": {
    "download": "string - URL to download the compiled executable"
  }
}
```

**Compilation Error (200 OK):**
```json
{
  "outputs": {
    "error": "string - Compilation error message from g++"
  }
}
```

**Bad Request (400 Bad Request):**
```json
{
  "error": "string - Error message for missing source code"
}
```

#### Example

**Request:**
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "source": "#include <iostream>\nint main() { std::cout << \"Hello!\" << std::endl; return 0; }"
    }
  }'
```

**Success Response:**
```json
{
  "outputs": {
    "download": "http://localhost:3000/output.exe"
  }
}
```

### GET /output.exe

Downloads the compiled executable file.

#### Request

**Method:** GET
**URL:** `/output.exe`

#### Response

**Success (200 OK):**
- **Content-Type:** `application/octet-stream`
- **Body:** Binary executable file

**Not Found (404 Not Found):**
- Returned when no executable has been compiled yet

#### Example

```bash
curl -O http://localhost:3000/output.exe
```

## Error Handling

The API returns errors in the following scenarios:

1. **Missing Source Code (400):** When the request body doesn't contain valid source code
2. **Compilation Errors (200):** When g++ fails to compile the code (returned as success with error details)
3. **Server Errors (500):** Internal server errors

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting in production environments.

## Security Considerations

⚠️ **WARNING:** This API compiles and serves arbitrary code. It should not be exposed to untrusted users without proper security measures:

- Input validation and sanitization
- Resource limits and timeouts
- Sandboxing and isolation
- Authentication and authorization
- Network security

## Limitations

- Single-file C++ programs only
- Uses g++ with default compilation flags
- No support for custom compiler options
- No multi-user support or session management
- Executables are overwritten on each compilation