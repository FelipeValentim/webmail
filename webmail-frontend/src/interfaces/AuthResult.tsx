interface AuthResult {
  email: string;
  accessToken: string;
  refreshToken: string;
  serviceType: number;
}

export default AuthResult;
