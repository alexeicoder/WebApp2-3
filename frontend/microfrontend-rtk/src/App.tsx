import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import ClientDashboard from './ClientDashboard';

interface User {
  role: 'client' | 'admin';
  email?: string;
}

interface Props {
  user?: User;
  token?: string;
}

const App: React.FC<Props> = ({ user, token }) => {
  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    console.log('📦 Полученные пропсы в App:', { user, token }); // ← теперь ты увидишь содержимое

    const existingToken = localStorage.getItem('token');

    if (token) {
      if (existingToken !== token) {
        localStorage.setItem('token', JSON.stringify(token));
        console.log('✅ Новый токен сохранён в localStorage:', token);
      } else {
        console.log('ℹ️ Токен уже актуален в localStorage');
      }
      setIsTokenReady(true);
    } else {
      console.warn('⚠️ Токен не передан в пропсах. Пробуем взять из localStorage...');

      if (existingToken) {
        console.log('✅ Токен найден в localStorage');
        setIsTokenReady(true);
      } else {
        console.error('⛔ Токен не найден ни в props, ни в localStorage');
        setIsTokenReady(false);
      }
    }
  }, [token]);

  if (!isTokenReady) {
    return <div>🔒 Авторизация недоступна. Попробуйте обновить страницу.</div>;
  }

  return (
    <Provider store={store}>
      {user ? (
        <ClientDashboard user={{ email: user.email ?? '' }} />
      ) : (
        <div>⛔ Пожалуйста, войдите в систему</div>
      )}
    </Provider>
  );
};

export default App;
