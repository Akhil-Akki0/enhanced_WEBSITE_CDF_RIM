/**
 * Enterprise Production Hardened API Client
 * 
 * DEVELOPED by Akhil.A gmail :- akkedu01@gmail.com
 * 
 * Features:
 * - Credentials: 'include' for HttpOnly refresh tokens
 * - Automatic X-CSRF-Token header injection from double-submit cookie
 * - In-Memory Bearer Token injection (Zero localStorage tokens)
 * - Automatic 401 retry via Silent Token Refresh
 * - Detailed Request & Response diagnostics in browser console
 * - Correlation ID tracking
 * - Safe client-side error normalization (avoids blank "HTTP 404:" errors)
 */

let inMemoryAccessToken: string | null = null;
let inMemoryCsrfToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setCsrfToken(token: string | null) {
  inMemoryCsrfToken = token;
}

export function getCsrfToken(): string | null {
  if (inMemoryCsrfToken) return inMemoryCsrfToken;

  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(^|;\s*)cfd_csrf_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[2]);
    }
  }
  return null;
}

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipCsrf?: boolean;
}

export async function apiClient<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const correlationId = crypto.randomUUID ? crypto.randomUUID() : `cid_${Date.now()}`;
  const headers = new Headers(options.headers || {});

  // 1. Content-Type default
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // 2. Attach Correlation ID for end-to-end tracing
  headers.set('X-Correlation-ID', correlationId);

  // 3. Attach In-Memory Bearer Token
  if (!options.skipAuth && inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  // 4. Attach CSRF Token for mutation requests (POST, PUT, DELETE, PATCH)
  const method = (options.method || 'GET').toUpperCase();
  if (!options.skipCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers.set('X-CSRF-Token', csrf);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Enables httpOnly refresh cookie transmission
  };

  // Diagnostic logging for developer debugging
  console.debug(`[CFD API Request] ${method} ${endpoint}`, {
    correlationId,
    headers: Object.fromEntries(headers.entries()),
    hasBody: Boolean(options.body),
  });

  let response: Response;
  try {
    response = await fetch(endpoint, config);
  } catch (netErr: any) {
    console.error(`[CFD API Network Failure] ${method} ${endpoint}:`, netErr);
    throw new Error(`Network connection error: ${netErr.message || 'Backend server is unreachable'}`);
  }

  // Parse response body (JSON or text)
  const contentType = response.headers.get('content-type') || '';
  let responseData: any = null;
  if (contentType.includes('application/json')) {
    responseData = await response.json().catch(() => null);
  } else {
    responseData = await response.text().catch(() => null);
  }

  console.debug(`[CFD API Response] ${response.status} ${endpoint}`, {
    status: response.status,
    statusText: response.statusText,
    data: responseData,
    correlationId,
  });

  // 5. Handle Token Expiry (HTTP 401) with Automatic Silent Refresh
  if (response.status === 401 && !options.skipAuth && endpoint !== '/api/auth/refresh' && endpoint !== '/api/auth/login') {
    console.info('[CFD API] Access token expired. Attempting silent refresh...');
    const refreshedToken = await attemptSilentRefresh();
    if (refreshedToken) {
      // Retry original request once with new access token
      headers.set('Authorization', `Bearer ${refreshedToken}`);
      const csrf = getCsrfToken();
      if (csrf) headers.set('X-CSRF-Token', csrf);

      const retryRes = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include',
      });

      const retryContentType = retryRes.headers.get('content-type') || '';
      let retryData: any = null;
      if (retryContentType.includes('application/json')) {
        retryData = await retryRes.json().catch(() => null);
      } else {
        retryData = await retryRes.text().catch(() => null);
      }

      if (!retryRes.ok) {
        const errorMsg =
          retryData?.error ||
          `HTTP ${retryRes.status}: ${retryRes.statusText || 'Retry failed'}`;
        const err: any = new Error(errorMsg);
        err.status = retryRes.status;
        err.data = retryData;
        throw err;
      }
      return retryData;
    }
  }

  if (!response.ok) {
    let message = '';
    if (responseData && typeof responseData === 'object' && responseData.error) {
      message = responseData.error;
    } else if (typeof responseData === 'string' && responseData.trim().length > 0 && responseData.length < 250) {
      message = responseData.trim();
    } else if (response.status === 404) {
      message = `HTTP 404: Endpoint ${endpoint} was not found on the backend server. Verify the server is running on port 3001 and routes are mounted under /api/auth.`;
    } else {
      message = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
    }

    const err: any = new Error(message);
    err.status = response.status;
    err.code = responseData?.code;
    err.details = responseData?.details;
    err.data = responseData;
    err.path = endpoint;
    err.correlationId = correlationId;
    throw err;
  }

  return responseData;
}

// Helper: Attempt silent refresh with single-flight mutex promise
async function attemptSilentRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
        return data.accessToken;
      }
      setAccessToken(null);
      return null;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
