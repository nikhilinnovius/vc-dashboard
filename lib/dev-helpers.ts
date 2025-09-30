// Development helpers for working with Vercel services locally

/**
 * Check if Vercel services are properly configured
 */
export function checkVercelConfig() {
  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  console.log('🔍 Vercel Configuration Check:')
  console.log('✅ KV URL:', kvUrl ? '✓ Configured' : '❌ Missing')
  console.log('✅ KV Token:', kvToken ? '✓ Configured' : '❌ Missing')
  console.log('✅ Blob Token:', blobToken ? '✓ Configured' : '❌ Missing')

  const allConfigured = kvUrl && kvToken && blobToken
  console.log('🚀 Status:', allConfigured ? '✅ Ready for development' : '❌ Configuration needed')

  if (!allConfigured) {
    console.log('\n📋 Setup Instructions:')
    console.log('1. Run: vercel login')
    console.log('2. Run: vercel link')  
    console.log('3. Run: vercel env pull .env.local')
    console.log('4. Restart your dev server')
  }

  return allConfigured
}

/**
 * Test Vercel KV connection
 */
export async function testKVConnection() {
  try {
    const { kv } = await import('@vercel/kv')
    
    // Test key
    const testKey = 'dev-test-' + Date.now()
    const testValue = 'Hello from localhost!'

    // Set a test value
    await kv.set(testKey, testValue, { ex: 60 }) // Expires in 1 minute
    
    // Get it back
    const retrieved = await kv.get(testKey)
    
    // Clean up
    await kv.del(testKey)

    const success = retrieved === testValue
    console.log('🔗 KV Connection:', success ? '✅ Working' : '❌ Failed')
    
    return success
  } catch (error) {
    console.error('❌ KV Connection Error:', error)
    return false
  }
}

/**
 * Test Vercel Blob connection
 */
export async function testBlobConnection() {
  try {
    const { put, del } = await import('@vercel/blob')
    
    // Create a test file
    const testContent = 'Test from localhost - ' + new Date().toISOString()
    const testBlob = new Blob([testContent], { type: 'text/plain' })
    
    // Upload test file
    const result = await put('dev-test.txt', testBlob, {
      access: 'public',
      addRandomSuffix: true,
    })
    
    console.log('🔗 Blob Connection: ✅ Working')
    console.log('📁 Test file uploaded:', result.url)
    
    // Clean up (optional - files auto-expire or can be managed via dashboard)
    try {
      await del(result.url)
      console.log('🗑️ Test file cleaned up')
    } catch (deleteError) {
      console.log('ℹ️ Test file will auto-expire (cleanup not critical)')
    }
    
    return true
  } catch (error) {
    console.error('❌ Blob Connection Error:', error)
    return false
  }
}

/**
 * Run all development checks
 */
export async function runDevChecks() {
  console.log('🛠️ Running Development Environment Checks...\n')
  
  const configOk = checkVercelConfig()
  
  if (configOk) {
    console.log('\n🧪 Testing Connections...')
    const kvOk = await testKVConnection()
    const blobOk = await testBlobConnection()
    
    console.log('\n📊 Summary:')
    console.log('Configuration:', configOk ? '✅' : '❌')
    console.log('KV Connection:', kvOk ? '✅' : '❌')
    console.log('Blob Connection:', blobOk ? '✅' : '❌')
    
    const allGood = configOk && kvOk && blobOk
    console.log('\n🎉 Overall Status:', allGood ? '✅ All systems go!' : '❌ Setup needed')
    
    return allGood
  }
  
  return false
}
