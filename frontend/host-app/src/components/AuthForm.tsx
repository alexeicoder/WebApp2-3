import React, { useState } from 'react';
import { useLoginMutation, useRegisterMutation } from '../services/authApi';

interface AuthFormProps {
  onSuccess: (data: { role: 'client' | 'admin'; email?: string; token: string }) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    try {
      const result = await (isLogin ? login : register)(credentials).unwrap();
      console.log('Успешный ответ от API:', result);
      localStorage.setItem('token', result.access_token);
      console.log('Токен сохранён в localStorage', result.access_token);
      onSuccess({ ...result.user, token: result.access_token }); // ← теперь передаём токен напрямую
      console.log('Вызван onSuccess с данными:', result.user);
    } catch (error) {
      alert(isLogin ? 'Ошибка входа' : 'Ошибка регистрации');
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Пароль" required />
        <button type="submit">
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>
      <button 
        type="button" 
        onClick={() => setIsLogin(!isLogin)}
        className="toggle-auth"
      >
        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  );
};

export default AuthForm;
