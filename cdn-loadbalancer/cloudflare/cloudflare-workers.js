/**
 * Cloudflare Worker for PrismForge AI Global Load Balancing
 * This worker provides intelligent routing, security, and performance optimization
 */

// Regional endpoints configuration
const REGIONAL_ENDPOINTS = {
  'us-east-1': 'https://us-east.prismforge-ai.internal',
  'us-west-2': 'https://us-west.prismforge-ai.internal',
  'eu-west-1': 'https://eu-west.prismforge-ai.internal',
  'ap-northeast-1': 'https://ap-northeast.prismforge-ai.internal',
  'ap-southeast-2': 'https://ap-southeast.prismforge-ai.internal',
  'sa-east-1': 'https://sa-east.prismforge-ai.internal'
}

// Failover priority by region
const FAILOVER_PRIORITY = {
  'us-east-1': ['us-east-1', 'us-west-2', 'eu-west-1'],
  'us-west-2': ['us-west-2', 'us-east-1', 'ap-northeast-1'],
  'eu-west-1': ['eu-west-1', 'us-east-1', 'ap-northeast-1'],
  'ap-northeast-1': ['ap-northeast-1', 'ap-southeast-2', 'us-west-2'],
  'ap-southeast-2': ['ap-southeast-2', 'ap-northeast-1', 'us-west-2'],
  'sa-east-1': ['sa-east-1', 'us-east-1', 'us-west-2']
}

// Country to region mapping
const COUNTRY_TO_REGION = {
  // North America
  'US': 'us-east-1', 'CA': 'us-east-1', 'MX': 'us-east-1',
  // Europe
  'GB': 'eu-west-1', 'IE': 'eu-west-1', 'FR': 'eu-west-1', 'DE': 'eu-west-1',
  'IT': 'eu-west-1', 'ES': 'eu-west-1', 'NL': 'eu-west-1', 'BE': 'eu-west-1',
  'AT': 'eu-west-1', 'CH': 'eu-west-1', 'SE': 'eu-west-1', 'NO': 'eu-west-1',
  'DK': 'eu-west-1', 'FI': 'eu-west-1', 'PT': 'eu-west-1', 'PL': 'eu-west-1',
  // Asia Pacific
  'JP': 'ap-northeast-1', 'KR': 'ap-northeast-1', 'CN': 'ap-northeast-1',
  'TW': 'ap-northeast-1', 'HK': 'ap-northeast-1',
  'SG': 'ap-southeast-2', 'MY': 'ap-southeast-2', 'TH': 'ap-southeast-2',
  'ID': 'ap-southeast-2', 'PH': 'ap-southeast-2', 'VN': 'ap-southeast-2',
  'IN': 'ap-southeast-2', 'AU': 'ap-southeast-2', 'NZ': 'ap-southeast-2',
  // South America
  'BR': 'sa-east-1', 'AR': 'sa-east-1', 'CL': 'sa-east-1', 'CO': 'sa-east-1',
  'PE': 'sa-east-1', 'VE': 'sa-east-1', 'UY': 'sa-east-1', 'PY': 'sa-east-1',
  'BO': 'sa-east-1', 'EC': 'sa-east-1'
}

// Cache configuration
const CACHE_CONFIG = {
  // Static assets - long cache
  'static': { ttl: 31536000, browser: 31536000 }, // 1 year
  // API responses - short cache
  'api': { ttl: 300, browser: 60 }, // 5 minutes CDN, 1 minute browser
  // HTML pages - medium cache
  'html': { ttl: 3600, browser: 300 }, // 1 hour CDN, 5 minutes browser
  // Health checks - short cache
  'health': { ttl: 30, browser: 0 } // 30 seconds CDN, no browser cache
}

// Rate limiting configuration
const RATE_LIMITS = {
  'api': { requests: 100, window: 60 }, // 100 requests per minute for API
  'login': { requests: 5, window: 60 }, // 5 login attempts per minute
  'general': { requests: 1000, window: 60 } // 1000 requests per minute general
}

// Security headers
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'none';"
}

/**
 * Main request handler
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Handle incoming request
 */
async function handleRequest(request) {
  try {
    const url = new URL(request.url)
    const cf = request.cf || {}
    
    // Get client information
    const country = cf.country || 'US'
    const region = getRegionForCountry(country)
    const clientIP = request.headers.get('CF-Connecting-IP') || '0.0.0.0'
    
    // Security checks
    const securityCheck = await performSecurityChecks(request, clientIP)
    if (securityCheck.blocked) {
      return securityCheck.response
    }
    
    // Rate limiting
    const rateLimitCheck = await performRateLimit(request, clientIP)
    if (rateLimitCheck.blocked) {
      return rateLimitCheck.response
    }
    
    // Handle different request types
    if (url.pathname.startsWith('/api/')) {
      return handleAPIRequest(request, region, url)
    } else if (isStaticAsset(url.pathname)) {
      return handleStaticAsset(request, region, url)
    } else {
      return handlePageRequest(request, region, url)
    }
    
  } catch (error) {
    console.error('Worker error:', error)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        ...SECURITY_HEADERS
      }
    })
  }
}

/**
 * Get optimal region for country
 */
function getRegionForCountry(country) {
  return COUNTRY_TO_REGION[country] || 'us-east-1'
}

/**
 * Perform security checks
 */
async function performSecurityChecks(request, clientIP) {
  const url = new URL(request.url)
  const userAgent = request.headers.get('User-Agent') || ''
  const referer = request.headers.get('Referer') || ''
  
  // Block known malicious user agents
  const maliciousUA = [
    'sqlmap', 'nmap', 'masscan', 'zmap', 'nikto', 'dirb', 'dirbuster',
    'gobuster', 'wfuzz', 'ffuf', 'whatweb', 'nessus', 'openvas'
  ]
  
  if (maliciousUA.some(ua => userAgent.toLowerCase().includes(ua))) {
    return {
      blocked: true,
      response: new Response('Access denied', { 
        status: 403,
        headers: SECURITY_HEADERS 
      })
    }
  }
  
  // Block suspicious paths
  const suspiciousPaths = [
    '/.env', '/.git', '/admin', '/phpmyadmin', '/wp-admin',
    '/xmlrpc.php', '/config.php', '/.htaccess', '/web.config'
  ]
  
  if (suspiciousPaths.some(path => url.pathname.includes(path))) {
    return {
      blocked: true,
      response: new Response('Not found', { 
        status: 404,
        headers: SECURITY_HEADERS 
      })
    }
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\s*(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+)/i,
    /'(\s*(or|and)\s+\w+\s*=\s*\w+|1\s*=\s*1)/i,
    /(\s*(or|and)\s+\d+\s*=\s*\d+)/i
  ]
  
  const queryString = url.search
  if (queryString && sqlPatterns.some(pattern => pattern.test(queryString))) {
    return {
      blocked: true,
      response: new Response('Bad request', { 
        status: 400,
        headers: SECURITY_HEADERS 
      })
    }
  }
  
  return { blocked: false }
}

/**
 * Perform rate limiting
 */
async function performRateLimit(request, clientIP) {
  const url = new URL(request.url)
  let limitType = 'general'
  
  // Determine rate limit type
  if (url.pathname.startsWith('/api/auth/')) {
    limitType = 'login'
  } else if (url.pathname.startsWith('/api/')) {
    limitType = 'api'
  }
  
  const limit = RATE_LIMITS[limitType]
  const key = `rate_limit:${limitType}:${clientIP}`
  
  // Get current count from KV store (in production, use Cloudflare KV)
  // For this example, we'll use a simple in-memory approach
  const current = await getRateLimitCount(key)
  
  if (current >= limit.requests) {
    return {
      blocked: true,
      response: new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.requests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + 60).toString(),
          ...SECURITY_HEADERS
        }
      })
    }
  }
  
  // Increment counter
  await incrementRateLimitCount(key, limit.window)
  
  return { blocked: false }
}

/**
 * Handle API requests with caching and failover
 */
async function handleAPIRequest(request, region, url) {
  const cacheKey = `api:${url.pathname}${url.search}`
  
  // Check cache for GET requests (except auth endpoints)
  if (request.method === 'GET' && !url.pathname.includes('/auth/')) {
    const cachedResponse = await getCachedResponse(cacheKey)
    if (cachedResponse) {
      return addHeaders(cachedResponse, {
        'X-Cache': 'HIT',
        'X-Region': region
      })
    }
  }
  
  // Try primary region first, then failover
  const regions = FAILOVER_PRIORITY[region] || [region, 'us-east-1']
  let response = null
  let lastError = null
  
  for (const tryRegion of regions) {
    try {
      const endpoint = REGIONAL_ENDPOINTS[tryRegion]
      if (!endpoint) continue
      
      const backendURL = new URL(url.pathname + url.search, endpoint)
      
      response = await fetch(backendURL.toString(), {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'X-Forwarded-For': request.headers.get('CF-Connecting-IP'),
          'X-Original-Host': url.hostname,
          'X-Region': region
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
      })
      
      if (response.ok) {
        // Cache successful GET responses
        if (request.method === 'GET' && !url.pathname.includes('/auth/')) {
          await setCachedResponse(cacheKey, response.clone(), CACHE_CONFIG.api.ttl)
        }
        
        return addHeaders(response, {
          'X-Cache': 'MISS',
          'X-Region': tryRegion,
          'X-Served-By': tryRegion
        })
      }
      
      lastError = `${tryRegion}: ${response.status} ${response.statusText}`
      
    } catch (error) {
      console.error(`Error from ${tryRegion}:`, error)
      lastError = `${tryRegion}: ${error.message}`
      continue
    }
  }
  
  // All regions failed
  return new Response(JSON.stringify({
    error: 'Service temporarily unavailable',
    details: 'All regions are currently experiencing issues',
    lastError: lastError
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '60',
      ...SECURITY_HEADERS
    }
  })
}

/**
 * Handle static assets with aggressive caching
 */
async function handleStaticAsset(request, region, url) {
  const cacheKey = `static:${url.pathname}`
  
  // Check cache first
  const cachedResponse = await getCachedResponse(cacheKey)
  if (cachedResponse) {
    return addHeaders(cachedResponse, {
      'X-Cache': 'HIT',
      'Cache-Control': `public, max-age=${CACHE_CONFIG.static.browser}, immutable`
    })
  }
  
  // Fetch from origin
  const regions = FAILOVER_PRIORITY[region] || [region, 'us-east-1']
  
  for (const tryRegion of regions) {
    try {
      const endpoint = REGIONAL_ENDPOINTS[tryRegion]
      if (!endpoint) continue
      
      const backendURL = new URL(url.pathname + url.search, endpoint)
      
      const response = await fetch(backendURL.toString(), {
        headers: {
          'X-Forwarded-For': request.headers.get('CF-Connecting-IP'),
          'X-Original-Host': url.hostname
        }
      })
      
      if (response.ok) {
        // Cache for a long time
        await setCachedResponse(cacheKey, response.clone(), CACHE_CONFIG.static.ttl)
        
        return addHeaders(response, {
          'X-Cache': 'MISS',
          'X-Region': tryRegion,
          'Cache-Control': `public, max-age=${CACHE_CONFIG.static.browser}, immutable`,
          'Expires': new Date(Date.now() + CACHE_CONFIG.static.browser * 1000).toUTCString()
        })
      }
      
    } catch (error) {
      console.error(`Static asset error from ${tryRegion}:`, error)
      continue
    }
  }
  
  return new Response('Asset not found', { 
    status: 404,
    headers: SECURITY_HEADERS 
  })
}

/**
 * Handle page requests with moderate caching
 */
async function handlePageRequest(request, region, url) {
  const cacheKey = `page:${url.pathname}${url.search}`
  
  // Check cache for GET requests
  if (request.method === 'GET') {
    const cachedResponse = await getCachedResponse(cacheKey)
    if (cachedResponse) {
      return addHeaders(cachedResponse, {
        'X-Cache': 'HIT',
        'X-Region': region
      })
    }
  }
  
  // Try regions in order
  const regions = FAILOVER_PRIORITY[region] || [region, 'us-east-1']
  
  for (const tryRegion of regions) {
    try {
      const endpoint = REGIONAL_ENDPOINTS[tryRegion]
      if (!endpoint) continue
      
      const backendURL = new URL(url.pathname + url.search, endpoint)
      
      const response = await fetch(backendURL.toString(), {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'X-Forwarded-For': request.headers.get('CF-Connecting-IP'),
          'X-Original-Host': url.hostname,
          'X-Region': region
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
      })
      
      if (response.ok) {
        // Cache successful GET responses
        if (request.method === 'GET') {
          await setCachedResponse(cacheKey, response.clone(), CACHE_CONFIG.html.ttl)
        }
        
        return addHeaders(response, {
          'X-Cache': 'MISS',
          'X-Region': tryRegion,
          'Cache-Control': `public, max-age=${CACHE_CONFIG.html.browser}`
        })
      }
      
    } catch (error) {
      console.error(`Page request error from ${tryRegion}:`, error)
      continue
    }
  }
  
  return new Response('Service unavailable', { 
    status: 503,
    headers: {
      'Retry-After': '60',
      ...SECURITY_HEADERS 
    }
  })
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.webp', '.pdf', '.mp4', '.webm'
  ]
  
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/public/')
}

/**
 * Add headers to response
 */
function addHeaders(response, additionalHeaders = {}) {
  const headers = new Headers(response.headers)
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value)
  })
  
  // Add additional headers
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  })
}

/**
 * Cache management functions (simplified - use Cloudflare KV in production)
 */
async function getCachedResponse(key) {
  // In production, use: return await CACHE_KV.get(key, { type: 'json' })
  return null // Placeholder
}

async function setCachedResponse(key, response, ttl) {
  // In production, implement proper KV storage with TTL
  // await CACHE_KV.put(key, JSON.stringify({
  //   status: response.status,
  //   headers: Object.fromEntries(response.headers.entries()),
  //   body: await response.text()
  // }), { expirationTtl: ttl })
}

/**
 * Rate limiting functions (simplified - use Cloudflare KV in production)
 */
async function getRateLimitCount(key) {
  // In production, use: return parseInt(await RATE_LIMIT_KV.get(key) || '0')
  return 0 // Placeholder
}

async function incrementRateLimitCount(key, windowSeconds) {
  // In production, implement proper KV increment with expiration
  // await RATE_LIMIT_KV.put(key, (count + 1).toString(), { expirationTtl: windowSeconds })
}