// lib/errors/auth-error.ts
export class AuthError extends Error {
    redirectPath: string;
    
    constructor(message: string, redirectPath: string) {
      super(`UNAUTHENTICATED:${redirectPath}`);
      this.redirectPath = redirectPath;
      this.name = 'AuthError';
    }
  }