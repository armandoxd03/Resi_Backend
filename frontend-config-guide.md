# Frontend Configuration Guide

This guide explains how to properly configure your React/Next.js frontend to connect to your Render backend.

## 1. Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://resilinked-backend.onrender.com` |

> 📝 Note: Replace `resilinked-backend` with your actual Render application name

## 2. Update Your API Service/Client

Make sure your API client uses the environment variable:

```javascript
// api.js or apiClient.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Example with fetch
async function callApi(endpoint, options = {}) {
  const url = `${API_URL}/api/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
}

// Example with axios
import axios from 'axios';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
```

## 3. Testing Your Configuration

To test if your configuration is working correctly:

1. Check your browser's network tab when making API requests
2. Look for requests going to `https://resilinked-backend.onrender.com` instead of `localhost:5000`
3. If you still see requests to localhost, clear your browser cache and restart your application

## 4. Local Development

For local development, you can still use `http://localhost:5000` as the API URL when the environment variable isn't set.

## 5. Common Issues

- **CORS Errors**: Make sure your frontend URL is added to the `CLIENT_URL` and `FRONTEND_URL` variables in your backend
- **Connection Refused**: Check that your Render backend is running and the URL is correct
- **404 Errors**: Ensure your API endpoints match between frontend and backend