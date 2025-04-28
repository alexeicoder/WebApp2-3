export interface JwtPayload {
    email: string;
    sub: string;  // это userId
    role: string;
  }