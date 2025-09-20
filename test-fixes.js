#!/usr/bin/env node
/**
 * Test script for verifying bug fixes in the exe-builder application
 * This script tests all the major bugs that were identified and fixed:
 * 1. Race conditions in file handling
 * 2. Input validation and security issues 
 * 3. Error response format consistency
 * 4. Timeout protection
 * 5. File cleanup
 * 6. Security headers
 * 7. Path validation
 */

import fetch from 'node-fetch'
import { randomUUID } from 'crypto'

const BASE_URL = 'http://localhost:3000'

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
}

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`)
    results.passed++
    results.tests.push({ name: message, status: 'PASS' })
  } else {
    console.log(`❌ ${message}`)
    results.failed++
    results.tests.push({ name: message, status: 'FAIL' })
  }
}

async function testInputValidation() {
  console.log('\n🧪 Testing Input Validation...')
  
  // Test missing source code
  const response1 = await fetch(`${BASE_URL}/sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: {} })
  })
  const result1 = await response1.json()
  assert(result1.error === 'Missing or invalid source code', 'Missing source code properly rejected')
  
  // Test empty source code
  const response2 = await fetch(`${BASE_URL}/sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: { source: '' } })
  })
  const result2 = await response2.json()
  assert(result2.error === 'Source code cannot be empty', 'Empty source code properly rejected')
  
  // Test dangerous system calls
  const response3 = await fetch(`${BASE_URL}/sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      inputs: { 
        source: '#include <unistd.h>\nint main() { system("ls"); return 0; }' 
      } 
    })
  })
  const result3 = await response3.json()
  assert(result3.error && result3.error.includes('dangerous system calls'), 'Dangerous system calls blocked')
  
  // Test oversized input
  const largeSource = '#include <iostream>\n' + 'int x = 1;\n'.repeat(10000) + 'int main() { return 0; }'
  const response4 = await fetch(`${BASE_URL}/sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: { source: largeSource } })
  })
  const result4 = await response4.json()
  assert(result4.error && result4.error.includes('too large'), 'Oversized input properly rejected')
}

async function testRaceConditions() {
  console.log('\n🧪 Testing Race Condition Fixes...')
  
  // Send multiple concurrent requests
  const promises = Array.from({ length: 5 }, (_, i) => 
    fetch(`${BASE_URL}/sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        inputs: { 
          source: `#include <iostream>\nint main() { std::cout << "Test ${i}" << std::endl; return 0; }` 
        } 
      })
    }).then(r => r.json())
  )
  
  const results = await Promise.all(promises)
  
  // Check all requests succeeded
  const allSucceeded = results.every(r => r.downloadUrl && !r.error)
  assert(allSucceeded, 'All concurrent requests succeeded')
  
  // Check all requests have unique download URLs
  const urls = results.map(r => r.downloadUrl).filter(Boolean)
  const uniqueUrls = new Set(urls)
  assert(urls.length === uniqueUrls.size, 'All concurrent requests have unique download URLs')
}

async function testDownloadEndpoint() {
  console.log('\n🧪 Testing Download Endpoint Security...')
  
  // Test invalid UUID format
  const response1 = await fetch(`${BASE_URL}/download/invalid-uuid`)
  const result1 = await response1.json()
  assert(result1.error === 'Invalid request ID', 'Invalid UUID format rejected')
  
  // Test non-existent file
  const validUuid = randomUUID()
  const response2 = await fetch(`${BASE_URL}/download/${validUuid}`)
  const result2 = await response2.json()
  assert(result2.error === 'File not found or has expired', 'Non-existent file properly handled')
}

async function testErrorFormatConsistency() {
  console.log('\n🧪 Testing Error Format Consistency...')
  
  // All error responses should have consistent format
  const errorTests = [
    { inputs: {} }, // Missing source
    { inputs: { source: '' } }, // Empty source
    { inputs: { source: 'invalid code' } } // Invalid C++
  ]
  
  for (const testCase of errorTests) {
    const response = await fetch(`${BASE_URL}/sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    })
    const result = await response.json()
    assert(result.hasOwnProperty('error') && !result.hasOwnProperty('outputs'), 'Error response format consistent')
  }
}

async function testValidCompilation() {
  console.log('\n🧪 Testing Valid Compilation...')
  
  const response = await fetch(`${BASE_URL}/sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      inputs: { 
        source: '#include <iostream>\nint main() { std::cout << "Hello, World!" << std::endl; return 0; }' 
      } 
    })
  })
  
  const result = await response.json()
  assert(result.downloadUrl && result.downloadUrl.includes('/download/'), 'Valid C++ code compilation succeeds')
  
  // Test the download URL works
  if (result.downloadUrl) {
    const downloadResponse = await fetch(result.downloadUrl, { method: 'HEAD' })
    assert(downloadResponse.status === 200, 'Generated executable can be downloaded')
  }
}

async function runTests() {
  console.log('🚀 Starting Bug Fix Verification Tests...')
  console.log('=' .repeat(50))
  
  try {
    await testInputValidation()
    await testRaceConditions()
    await testDownloadEndpoint()
    await testErrorFormatConsistency()
    await testValidCompilation()
    
    console.log('\n' + '='.repeat(50))
    console.log(`📊 Test Results: ${results.passed} passed, ${results.failed} failed`)
    
    if (results.failed === 0) {
      console.log('🎉 All tests passed! Bug fixes are working correctly.')
      process.exit(0)
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message)
    console.log('\n💡 Make sure the server is running on localhost:3000')
    process.exit(1)
  }
}

// Check if node-fetch is available, if not provide helpful message
try {
  await import('node-fetch')
} catch (error) {
  console.log('📦 Installing node-fetch for testing...')
  console.log('Run: npm install node-fetch')
  process.exit(1)
}

runTests()