export type UserRole = 'user' | 'admin';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  age: number;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginSuccessResponse {
  status: true;
  data: {
    user: AuthUser;
    token: string;
  };
}

export interface LoginErrorResponse {
  status: false;
  error: {
    message: string;
  };
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export interface GetCurrentUserSuccessResponse {
  status: true;
  data: AuthUser;
}

export interface GetCurrentUserErrorResponse {
  status: false;
  error:
    | {
        message?: string;
      }
    | string;
}

export type GetCurrentUserResponse =
  | GetCurrentUserSuccessResponse
  | GetCurrentUserErrorResponse;

export interface LogoutSuccessResponse {
  status: true;
  data: {
    message: string;
  };
}

export interface LogoutErrorResponse {
  status: false;
  error:
    | {
        message?: string;
      }
    | string;
}

export type LogoutResponse = LogoutSuccessResponse | LogoutErrorResponse;

export interface AuthErrorMessage {
  type: 'api' | 'network' | 'storage';
  message: string;
}
