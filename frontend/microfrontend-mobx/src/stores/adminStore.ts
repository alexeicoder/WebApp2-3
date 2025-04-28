import { makeAutoObservable } from 'mobx';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
}

interface Visit {
  id: string;
  type: string;
  date: string;
  duration: number;
}

class AdminStore {
  users: User[] = [];
  visits: Visit[] = [];
  private _token: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setToken(token: string | null) {
    this._token = token;
    console.log('🔑 Установлен токен:', token);
  }

  get token() {
    return this._token || null;
  }

  get authHeader() {
    const header = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    console.log('📤 Заголовки запроса:', header);
    return header;
  }

  async fetchUsers() {
    console.log('📡 Запрос пользователей...');
    const res = await axios.get<User[]>('http://localhost:3000/admin/users', {
      headers: this.authHeader,
    });
    this.users = res.data;
    console.log('✅ Пользователи загружены:', this.users);
  }

  async updateUser(id: string, data: Partial<User>) {
    await axios.put(`http://localhost:3000/admin/users/${id}`, data, {
      headers: this.authHeader,
    });
    await this.fetchUsers();
  }

  async fetchVisits(userId: string) {
    const res = await axios.get<Visit[]>(`http://localhost:3001/visits/admin/users/${userId}/visits`, {
      headers: this.authHeader,
    });
    this.visits = res.data;
  }

  async createVisit(userId: string, type: string, date: string, duration: number) {
    await axios.post(
      `http://localhost:3001/visits/admin/users/${userId}/visits`,
      { type, date, duration },
      { headers: this.authHeader }
    );
    await this.fetchVisits(userId);
  }

  async editVisit(visitId: string, type: string, date: string, duration: number) {
    await axios.patch(
      `http://localhost:3001/visits/${visitId}`,
      { type, date, duration },
      { headers: this.authHeader }
    );
  }

  clearVisits() {
    this.visits = [];
  }
}

export default new AdminStore();
