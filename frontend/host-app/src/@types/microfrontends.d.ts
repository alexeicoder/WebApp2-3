import { ComponentType } from 'react';

interface User {
  role: 'client' | 'admin';
  email?: string;
}

declare module 'rtkApp/App' {
  const Component: ComponentType<{ user: User }>;
  export default Component;
}

declare module 'mobxApp/App' {
  const Component: ComponentType<{ user: User }>;
  export default Component;
}