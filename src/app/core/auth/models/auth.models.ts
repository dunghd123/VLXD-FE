export enum Role {
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
};

export interface LoginRequest {
  username: string;
  password: string;
};

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
};

export interface LoginCredentials {
  username: string;
  password: string;
};

export interface User {
  username: string;
  email: string;
  role: Role;
  fullName: string;
  isActive: boolean;
};