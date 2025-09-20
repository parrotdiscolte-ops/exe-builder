# C++ Example Files

This directory contains example C++ source files that can be used with the EXE Builder API.

## Examples

### 1. Hello World (`hello_world.cpp`)
A simple "Hello, World!" program that demonstrates basic output.

**Usage:**
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d "{\"inputs\": {\"source\": \"$(cat examples/hello_world.cpp | sed 's/$/\\n/' | tr -d '\n')\"}}"
```

### 2. Calculator (`calculator.cpp`)
Demonstrates mathematical operations including basic arithmetic and advanced functions.

**Usage:**
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d "{\"inputs\": {\"source\": \"$(cat examples/calculator.cpp | sed 's/$/\\n/' | tr -d '\n')\"}}"
```

### 3. Array Processing (`array_processing.cpp`)
Shows array manipulation, sorting, and statistical calculations.

**Usage:**
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d "{\"inputs\": {\"source\": \"$(cat examples/array_processing.cpp | sed 's/$/\\n/' | tr -d '\n')\"}}"
```

## Using with the API

You can use these examples by reading the file content and sending it to the API:

```bash
# Method 1: Copy and paste the code directly
# See the main README.md for examples

# Method 2: Use the shell script
./examples.sh

# Method 3: Use file content (bash/zsh)
SOURCE_CODE=$(cat examples/hello_world.cpp)
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d "{\"inputs\": {\"source\": \"$SOURCE_CODE\"}}"
```