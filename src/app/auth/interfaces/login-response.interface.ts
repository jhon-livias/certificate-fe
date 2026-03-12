export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expirationToken: number;
  expirationRefreshToken: number;
}
