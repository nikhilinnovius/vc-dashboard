import { kv } from "@vercel/kv"

// Interface for storing user API key information
interface UserApiKey {
  email: string
  name: string
  affinityApiKey: string
}

// KV store prefix for user API keys
const USER_API_KEY_PREFIX = "user:api-keys:"

/**
 * Store a user's Affinity API key
 */
export async function storeUserApiKey(email: string, name: string, affinityApiKey: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    await kv.set(`${USER_API_KEY_PREFIX}${normalizedEmail}`, {
      email: normalizedEmail,
      name,
      affinityApiKey,
    })

    return true
  } catch (error) {
    console.error("Error storing user API key:", error)
    return false
  }
}

/**
 * Get a user's Affinity API key by email
 */
export async function getUserApiKey(email: string): Promise<UserApiKey | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const userData = (await kv.get(`${USER_API_KEY_PREFIX}${normalizedEmail}`)) as UserApiKey | null

    return userData
  } catch (error) {
    console.error("Error retrieving user API key:", error)
    return null
  }
}

/**
 * Store multiple user API keys at once
 */
export async function bulkStoreUserApiKeys(
  users: Array<{ email: string; name: string; affinityApiKey: string }>,
): Promise<{
  success: boolean
  successCount: number
  failedCount: number
}> {
  let successCount = 0
  let failedCount = 0

  try {
    for (const user of users) {
      const success = await storeUserApiKey(user.email, user.name, user.affinityApiKey)
      if (success) {
        successCount++
      } else {
        failedCount++
      }
    }

    return {
      success: failedCount === 0,
      successCount,
      failedCount,
    }
  } catch (error) {
    console.error("Error in bulk storing user API keys:", error)
    return {
      success: false,
      successCount,
      failedCount: users.length - successCount,
    }
  }
}
