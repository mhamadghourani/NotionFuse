const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Safe helper to extract token without crashing Next.js server-side builds
const getSafeToken = () => typeof window !== 'undefined' ? localStorage.getItem("token") : null;

const parseResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message = typeof data === 'string'
      ? data
      : data.message || data.error || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const authService = {
  login: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseResponse(res);
  },

  register: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseResponse(res);
  },

  validateToken: async () => {
    const token = getSafeToken();
    const res = await fetch(`${BASE_URL}/api/v1/user/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error("Invalid token");
    }

    return true;
  },

  verifyEmail: async (token) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`);
    return parseResponse(res);
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return parseResponse(res);
  },

  resetPassword: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseResponse(res);
  },
};

export const userService = {
  getMe: async () => {
    const token = getSafeToken();
    const res = await fetch(`${BASE_URL}/api/v1/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error("Failed to fetch user profile");
    return res.json();
  },

  updateProfile: async (data) => {
    const token = getSafeToken();
    const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.text();
  },

  updatePassword: async (data) => {
    const token = getSafeToken();
    const res = await fetch(`${BASE_URL}/api/v1/user/password`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update password");
    }
    return res.text();
  }
};

export const notionService = {
  /**
   * ADDED: Fetches the backend-generated link containing dynamic user state identifiers.
   */
  getConnectUrl: async () => {
    const token = getSafeToken();
    const res = await fetch(`${BASE_URL}/api/v1/oauth/authorize-url`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return parseResponse(res); // Returns { url: "https://api.notion.com/..." }
  },

  getDatabases: async () => {
    const token = getSafeToken();
    const res = await fetch(`${BASE_URL}/api/v1/notion/my-databases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.status === 409) {
      return { connected: false, databases: [] };
    }

    if (!res.ok) throw new Error("Failed to fetch databases");

    return res.json();
  },

  getMergedHistory: async () => {
    const token = getSafeToken(); 
    const response = await fetch(`${BASE_URL}/api/v1/notion/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to fetch merge history");
    return await response.json(); 
  },

  executeMerge: async (payload) => {
    const token = getSafeToken();
    const response = await fetch(`${BASE_URL}/api/v1/notion/merge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Database merge execution failed");
    return response.text();
  },

  getActivePipelines: async () => {
    try {
      const token = getSafeToken();
      
      const response = await fetch(`${BASE_URL}/api/v1/notion/pipelines`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("SERVER_ERROR");
      }
      
      return await response.json();
    } catch (error) {
      if (error.message === "SERVER_ERROR") {
        throw error;
      }
      throw new Error("BACKEND_OFFLINE");
    }
  }
};