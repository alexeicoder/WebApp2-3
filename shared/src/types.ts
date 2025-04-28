export interface User {
    id: string;
    email: string;
    password: string;
    role: 'client' | 'admin';
  }
  
  export interface GymVisit {
    id: string;
    userId: string;
    date: Date;
    duration: number;
  }