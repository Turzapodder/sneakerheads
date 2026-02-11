import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Custom hook for making authenticated API requests
 */
export const useApi = () => {
  const { getToken } = useAuth();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      // Get Clerk JWT token
      const token = await getToken();

      // Prepare headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      // Make request
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };

  return {
    // GET request
    get: (endpoint: string) => apiCall(endpoint, { method: "GET" }),

    // POST request
    post: (endpoint: string, body?: any) =>
      apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    // PUT request
    put: (endpoint: string, body?: any) =>
      apiCall(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      }),

    // DELETE request
    delete: (endpoint: string) => apiCall(endpoint, { method: "DELETE" }),
  };
};

/**
 * API service functions
 */
export const authApi = {
  // Get current user
  getCurrentUser: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user");
      }

      return response.json();
    } catch (error) {
      console.error("getCurrentUser error:", error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (
    token: string,
    data: { firstName?: string; lastName?: string },
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    } catch (error) {
      console.error("updateProfile error:", error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      return response.json();
    } catch (error) {
      console.error("deleteAccount error:", error);
      throw error;
    }
  },
};
