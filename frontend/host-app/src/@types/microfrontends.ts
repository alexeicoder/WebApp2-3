import { ComponentType } from 'react';

export interface MicrofrontendProps {
  user: {
    role: 'client' | 'admin';
    email?: string;
  };
}

// Типы для Remote компонентов
export type RemoteRTKAppType = ComponentType<MicrofrontendProps>;
export type RemoteMobXAppType = ComponentType<MicrofrontendProps>;