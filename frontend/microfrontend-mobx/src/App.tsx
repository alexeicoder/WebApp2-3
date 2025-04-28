import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import adminStore from './stores/adminStore';
import UserEditor from './UserEditor';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
}

interface AdminAppProps {
  user?: User;
  token?: string | { access_token: string };
}

const AdminApp: React.FC<AdminAppProps> = observer(({ user: incomingUser, token: incomingToken }) => {
  const [user, setUser] = useState<User | null>(incomingUser ?? null);
  const [isReady, setIsReady] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔑 Установлен токен:', incomingToken);

    if (incomingToken && incomingUser) {
      const accessToken = typeof incomingToken === 'string' ? incomingToken : incomingToken.access_token;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(incomingUser));
      adminStore.setToken(accessToken);
      setUser(incomingUser);
    } else {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const parsedToken = storedToken;
        const parsedUser = JSON.parse(storedUser);
        adminStore.setToken(parsedToken);
        setUser(parsedUser);
      } else {
        console.warn('⚠️ Нет данных авторизации в props и localStorage');
      }
    }

    setIsReady(true);
  }, [incomingToken, incomingUser]);

  useEffect(() => {
    if (isReady && user?.role === 'admin') {
      adminStore.fetchUsers();
    }
  }, [isReady, user]);

  if (!isReady) return <div>Загрузка...</div>;
  if (!user || user.role !== 'admin') return <div>⛔ Требуются права администратора</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Админ-панель</h2>
      <p>Вы вошли как: {user.email}</p>

      <h3>Пользователи:</h3>
      <ul>
        {adminStore.users.map((u) => (
          <li key={u.id} style={{ marginBottom: 10 }}>
            <strong>{u.email}</strong> — {u.role}
            <button onClick={() => setSelectedUserId(u.id)} style={{ marginLeft: 10 }}>
              Управление
            </button>
          </li>
        ))}
      </ul>

      {selectedUserId && (
        <UserEditor userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
});

export default AdminApp;
