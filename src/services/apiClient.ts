/**
 * Centralized API Client Layer
 * Handles authentication tokens, headers, error normalization, and network requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://life-track-wy17.onrender.com/api';
const TOKEN_KEY = 'lifetrack_auth_token';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getAuthToken();
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // 401 Unauthorized handling
    if (response.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lifetrack:unauthorized'));
      }
    }

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const errorMessage =
        errorData.message ||
        (response.status === 403
          ? 'Access forbidden.'
          : response.status === 404
          ? 'Resource not found.'
          : response.status === 409
          ? 'Conflict error.'
          : response.status === 422
          ? 'Validation failed.'
          : response.status === 429
          ? 'Too many requests. Please slow down.'
          : response.status >= 500
          ? 'Server encountered an error. Please try again later.'
          : `HTTP error ${response.status}`);

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Parse JSON if available
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return {} as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or offline error
    throw new ApiError(
      'Unable to connect to the server. Please check your network connection.',
      0,
      { originalError: error.message }
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers, // Browser sets multipart boundary automatically
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.message || 'File upload failed', response.status, errorData);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Upload failed. Please check connection.', 0);
    }
  },
};
