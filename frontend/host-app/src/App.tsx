import React, { Suspense, useState, useEffect, lazy } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthForm from './components/AuthForm';
import './App.css';

interface MicroFrontendProps {
  user: {
    role: 'client' | 'admin';
    email?: string;
  };
  token?: string;
}

const RemoteRTKApp = lazy(() => import('rtkApp/App') as Promise<{
  default: React.ComponentType<MicroFrontendProps>;
}>);

const RemoteMobXApp = lazy(() => import('mobxApp/App') as Promise<{
  default: React.ComponentType<MicroFrontendProps>;
}>);

const App: React.FC = () => {
  const [user, setUser] = useState<MicroFrontendProps['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Проверка на наличие токена в localStorage при монтировании компонента
  useEffect(() => {
    console.log('🔍 Проверяем наличие токена в localStorage...');
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      console.log('✅ Токен найден в localStorage');
      const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userFromStorage);
      setToken(savedToken);
      console.log('📦 Восстановленные данные пользователя:', userFromStorage);
    } else {
      console.log('⚠️ Токен не найден в localStorage');
    }
  }, []);

  const handleLogout = () => {
    console.log('🔒 Пользователь выходит...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    console.log('✅ Токен и данные пользователя удалены из localStorage');
  };

  return (
    <Provider store={store}>
      <div className="App">
        {user && (
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        )}

        {!user ? (
          <AuthForm
            onSuccess={({ token, ...userData }) => {
              console.log('🔑 Авторизация успешна. Сохранение данных пользователя и токена...');
              setUser(userData);
              setToken(token);
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем данные пользователя
              console.log('✅ Токен и данные пользователя сохранены в localStorage:', { token, userData });
            }}
          />
        ) : user.role === 'client' ? (
          <Suspense fallback={<div className="loading">Загрузка клиентского кабинета...</div>}>
            <RemoteRTKApp user={user} token={token || ''} />
          </Suspense>
        ) : (
          <Suspense fallback={<div className="loading">Загрузка админ-панели...</div>}>
            <RemoteMobXApp user={user} token={token || ''} />
          </Suspense>
        )}
      </div>
    </Provider>
  );
};

export default App;
