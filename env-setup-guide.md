# Local Development Setup for Vercel Services

## Method 1: Using Vercel CLI (Recommended)

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Link your project:**
   ```bash
   vercel link
   ```

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```

4. **Run with Vercel dev server:**
   ```bash
   vercel dev
   ```

## Method 2: Manual Environment Variables

Create a `.env.local` file with these variables:

```env
# Vercel KV
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_token

# Auth0
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_ISSUER=your_auth0_issuer
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## How to get these values:

1. **Vercel KV & Blob tokens:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Copy the KV and Blob tokens

2. **Or use Vercel CLI:**
   ```bash
   vercel env ls
   vercel env pull .env.local
   ```

## Vercel REST APIs

You can also access Vercel services via REST APIs:

### KV REST API
```javascript
// GET
fetch(`${process.env.KV_REST_API_URL}/get/your-key`, {
  headers: {
    Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
  },
})

// SET  
fetch(`${process.env.KV_REST_API_URL}/set/your-key`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
  },
  body: 'your-value'
})
```

### Blob REST API
```javascript
// Upload
fetch('https://blob.vercel-storage.com', {
  method: 'PUT',
  headers: {
    authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    'x-content-type': 'image/png',
    'x-add-random-suffix': '1'
  },
  body: fileData
})
```
