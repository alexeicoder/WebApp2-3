import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders auth form when user not logged in', () => {
  render(<App />);
  const authForm = screen.getByText(/Вход|Регистрация/i);
  expect(authForm).toBeInTheDocument();
});
