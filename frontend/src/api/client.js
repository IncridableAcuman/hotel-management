const rawApiUrl = import.meta.env.VITE_API_URL || "https://hotel-management-backend-5nx4.onrender.com" || "/api/v1";
const BASE_URL = (() => {
  if (!rawApiUrl || rawApiUrl === '/api/v1') return '/api/v1';
  let url = rawApiUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }
  return url.endsWith('/api/v1') ? url : `${url.replace(/\/+$/, '')}/api/v1`;
})();

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

export function getStoredToken() {
  return localStorage.getItem('hotel_access_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('hotel_access_token', token);
  } else {
    localStorage.removeItem('hotel_access_token');
  }
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // essential for HttpOnly refreshToken cookie
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error('Server bilan bog‘lanib bo‘lmadi. Server yoqilganligini tekshiring: ' + networkError.message);
  }

  // Handle 401 Unauthorized for token refresh (except for /auth/login or /auth/refresh itself)
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/register')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.accessToken) {
            setStoredToken(refreshData.accessToken);
            isRefreshing = false;
            onRefreshed(refreshData.accessToken);
            // Retry initial request with new token
            config.headers.Authorization = `Bearer ${refreshData.accessToken}`;
            return await (await fetch(url, config)).json();
          }
        }
        setStoredToken(null);
      } catch (err) {
        setStoredToken(null);
      } finally {
        isRefreshing = false;
      }
    } else {
      // Queue requests until token is refreshed
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            fetch(url, config)
              .then((res) => (res.status === 204 ? resolve(null) : res.json().then(resolve)))
              .catch(reject);
          } else {
            reject(new Error('Sessiya muddati tugadi. Qaytadan kiring.'));
          }
        });
      });
    }
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = 'Xatolik yuz berdi';
    if (typeof data === 'object' && data !== null) {
      if (data.validationErrors && Object.keys(data.validationErrors).length > 0) {
        errorMessage = Object.values(data.validationErrors).join(', ');
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMessage = data;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url, options) => request(url, { method: 'GET', ...options }),
  post: (url, body, options) => request(url, { method: 'POST', body, ...options }),
  put: (url, body, options) => request(url, { method: 'PUT', body, ...options }),
  patch: (url, body, options) => request(url, { method: 'PATCH', body, ...options }),
  delete: (url, options) => request(url, { method: 'DELETE', ...options }),
};
