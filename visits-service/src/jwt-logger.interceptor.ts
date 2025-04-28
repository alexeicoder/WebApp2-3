import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtLoggerInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = this.jwtService.verify(token);
        console.log('\n===== JWT VERIFICATION =====');
        console.log('Decoded Payload:', decoded);
        console.log('Token Expires:', new Date(decoded.exp * 1000).toISOString());
      } catch (e) {
        console.error('\n===== JWT ERROR =====');
        console.error('Error:', e.message);
        console.error('Token:', token);
      }
    }

    return next.handle().pipe(
      tap(() => {
        console.log('===== END JWT DEBUG =====\n');
      })
    );
  }
}