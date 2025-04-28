import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, headers, body, query, params } = req;

    // Логируем входящий запрос
    console.log('\n=== INCOMING REQUEST ===');
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('Params:', JSON.stringify(params, null, 2));
    
    // Скрываем чувствительные данные
    const safeBody = { ...body };
    if (safeBody.password) safeBody.password = '*****';
    if (safeBody.token) safeBody.token = '*****';
    console.log('Body:', JSON.stringify(safeBody, null, 2));

    // Перехватываем ответ
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks: Buffer[] = [];

    (res as any).write = (chunk: any, ...rest: any[]) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      return oldWrite.apply(res, [chunk, ...rest]);
    };

    (res as any).end = (chunk: any, ...rest: any[]) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      const responseBody = Buffer.concat(chunks).toString('utf8');

      console.log('\n=== RESPONSE ===');
      console.log(`Status: ${res.statusCode}`);
      console.log('Headers:', JSON.stringify(res.getHeaders(), null, 2));
      
      try {
        const jsonResponse = JSON.parse(responseBody);
        const safeResponse = { ...jsonResponse };
        if (safeResponse.token) safeResponse.token = '*****';
        console.log('Body:', safeResponse);
      } catch {
        console.log('Body:', responseBody);
      }
      console.log(`Duration: ${Date.now() - start}ms`);

      return oldEnd.apply(res, [chunk, ...rest]);
    };

    next();
  }
}