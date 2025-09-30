// Vercel API Client for direct REST API access
// This is useful when you want to access Vercel services without the SDK

interface VercelKVClient {
  get: (key: string) => Promise<any>
  set: (key: string, value: any, options?: { ex?: number }) => Promise<void>
  hget: (key: string, field: string) => Promise<any>
  hset: (key: string, data: Record<string, any>) => Promise<void>
  hgetall: (key: string) => Promise<Record<string, any>>
}

interface VercelBlobClient {
  put: (pathname: string, body: any, options?: any) => Promise<{ url: string }>
}

class VercelApiClient {
  private kvBaseUrl: string
  private kvToken: string
  private blobToken: string

  constructor() {
    this.kvBaseUrl = process.env.KV_REST_API_URL || ''
    this.kvToken = process.env.KV_REST_API_TOKEN || ''
    this.blobToken = process.env.BLOB_READ_WRITE_TOKEN || ''
  }

  // KV Methods
  kv: VercelKVClient = {
    get: async (key: string) => {
      const response = await fetch(`${this.kvBaseUrl}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
        },
      })
      if (!response.ok) throw new Error(`KV GET failed: ${response.statusText}`)
      const data = await response.json()
      return data.result
    },

    set: async (key: string, value: any, options?: { ex?: number }) => {
      const url = new URL(`${this.kvBaseUrl}/set/${key}`)
      if (options?.ex) {
        url.searchParams.set('ex', options.ex.toString())
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
          'Content-Type': 'text/plain',
        },
        body: typeof value === 'string' ? value : JSON.stringify(value),
      })
      if (!response.ok) throw new Error(`KV SET failed: ${response.statusText}`)
    },

    hget: async (key: string, field: string) => {
      const response = await fetch(`${this.kvBaseUrl}/hget/${key}/${field}`, {
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
        },
      })
      if (!response.ok) throw new Error(`KV HGET failed: ${response.statusText}`)
      const data = await response.json()
      return data.result
    },

    hset: async (key: string, data: Record<string, any>) => {
      const response = await fetch(`${this.kvBaseUrl}/hset/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(`KV HSET failed: ${response.statusText}`)
    },

    hgetall: async (key: string) => {
      const response = await fetch(`${this.kvBaseUrl}/hgetall/${key}`, {
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
        },
      })
      if (!response.ok) throw new Error(`KV HGETALL failed: ${response.statusText}`)
      const data = await response.json()
      return data.result || {}
    },
  }

  // Blob Methods  
  blob: VercelBlobClient = {
    put: async (pathname: string, body: any, options?: any) => {
      const url = new URL('https://blob.vercel-storage.com')
      url.searchParams.set('filename', pathname)
      
      if (options?.access) url.searchParams.set('access', options.access)
      if (options?.addRandomSuffix) url.searchParams.set('addRandomSuffix', '1')

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${this.blobToken}`,
          'x-content-type': options?.contentType || 'application/octet-stream',
        },
        body: body,
      })

      if (!response.ok) throw new Error(`Blob PUT failed: ${response.statusText}`)
      return await response.json()
    },
  }
}

// Export a singleton instance
export const vercelApi = new VercelApiClient()

// Example usage:
// await vercelApi.kv.set('my-key', 'my-value')
// const value = await vercelApi.kv.get('my-key')
// const blobResult = await vercelApi.blob.put('test.txt', 'Hello World', { access: 'public' })
