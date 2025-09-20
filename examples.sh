#!/bin/bash
# Simple examples of using the EXE Builder API

API_URL="http://localhost:3000"

echo "=== EXE Builder API Examples ==="
echo "Make sure the server is running on $API_URL"
echo ""

# Example 1: Hello World
echo "1. Hello World Example"
echo "----------------------"
response1=$(curl -s -X POST $API_URL/sse \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "source": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}"
    }
  }')
echo "Response: $response1"
echo ""

# Example 2: Math Operations
echo "2. Math Operations Example"
echo "-------------------------"
response2=$(curl -s -X POST $API_URL/sse \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "source": "#include <iostream>\n#include <cmath>\nint main() {\n    double a = 15.5, b = 4.2;\n    std::cout << \"Numbers: \" << a << \" and \" << b << std::endl;\n    std::cout << \"Sum: \" << a + b << std::endl;\n    std::cout << \"Difference: \" << a - b << std::endl;\n    std::cout << \"Product: \" << a * b << std::endl;\n    std::cout << \"Division: \" << a / b << std::endl;\n    std::cout << \"Square root of a: \" << sqrt(a) << std::endl;\n    return 0;\n}"
    }
  }')
echo "Response: $response2"
echo ""

# Example 3: Error Handling
echo "3. Compilation Error Example"
echo "----------------------------"
response3=$(curl -s -X POST $API_URL/sse \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "source": "#include <iostream>\nint main() {\n    std::cout << \"This will cause an error\"\n    return 0;\n}"
    }
  }')
echo "Response: $response3"
echo ""

# Example 4: Download executable
echo "4. Download Executable"
echo "---------------------"
echo "If compilation was successful, download with:"
echo "curl -O $API_URL/output.exe"
echo ""

echo "=== Examples completed ==="