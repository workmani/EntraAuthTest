export interface User {
  id: string;
  email: string;
  name?: string;
  // Add other relevant user fields, potentially from Entra ID claims
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// Add other shared types or utility functions below
