import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import adminStore from './stores/adminStore';

interface Props {
  userId: string;
  onClose: () => void;
}

const UserEditor: React.FC<Props> = observer(({ userId, onClose }) => {
  const user = adminStore.users.find((u) => u.id === userId);
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<'admin' | 'client'>(user?.role || 'client');
  const [newVisitType, setNewVisitType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  const [newVisitDate, setNewVisitDate] = useState<string>('');
  const [newVisitDuration, setNewVisitDuration] = useState<string>('');
  const [editVisitId, setEditVisitId] = useState<string | null>(null);
  const [editedVisitData, setEditedVisitData] = useState<{
    [id: string]: { date: string; type: string; duration: string };
  }>({});

  useEffect(() => {
    if (user) {
      adminStore.fetchVisits(userId);
    }

    return () => {
      adminStore.clearVisits();
    };
  }, [userId, user]);

  if (!user) return <div>Пользователь не найден</div>;

  const saveUser = async () => {
    await adminStore.updateUser(userId, { email, role });
  };

  const addVisit = async () => {
    const duration = parseInt(newVisitDuration);
    if (newVisitDate && !isNaN(duration)) {
      await adminStore.createVisit(userId, newVisitType, newVisitDate, duration);
      setNewVisitDate('');
      setNewVisitDuration('');
    } else {
      alert('Пожалуйста, укажите дату и корректную продолжительность посещения.');
    }
  };

  const saveVisitEdit = async (id: string) => {
    const v = editedVisitData[id];
    const duration = parseInt(v.duration);
    if (!v.date || isNaN(duration)) {
      alert('Пожалуйста, укажите корректные значения');
      return;
    }
    await adminStore.editVisit(id, v.type as 'INDIVIDUAL' | 'GROUP', v.date, duration);
    await adminStore.fetchVisits(userId);
    setEditVisitId(null);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 20, marginTop: 20 }}>
      <h4>Редактирование пользователя</h4>
      <div>
        Email: <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        Роль:
        <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'client')}>
          <option value="admin">admin</option>
          <option value="client">client</option>
        </select>
      </div>
      <button onClick={saveUser}>Сохранить</button>
      <button onClick={onClose} style={{ marginLeft: 10 }}>Закрыть</button>

      <h4>Посещения:</h4>
      <ul>
        {adminStore.visits.map((v) => {
          const isEditing = v.id === editVisitId;
          const data = editedVisitData[v.id] || {
            date: v.date,
            type: v.type,
            duration: v.duration.toString(),
          };

          return (
            <li key={v.id} style={{ marginBottom: 10 }}>
              {isEditing ? (
                <div>
                  <input
                    type="datetime-local"
                    value={data.date}
                    onChange={(e) =>
                      setEditedVisitData((prev) => ({
                        ...prev,
                        [v.id]: { ...prev[v.id], date: e.target.value },
                      }))
                    }
                  />
                  <select
                    value={data.type}
                    onChange={(e) =>
                      setEditedVisitData((prev) => ({
                        ...prev,
                        [v.id]: { ...prev[v.id], type: e.target.value },
                      }))
                    }
                    style={{ marginLeft: 8 }}
                  >
                    <option value="INDIVIDUAL">INDIVIDUAL</option>
                    <option value="GROUP">GROUP</option>
                  </select>
                  <input
                    type="number"
                    value={data.duration}
                    min={1}
                    onChange={(e) =>
                      setEditedVisitData((prev) => ({
                        ...prev,
                        [v.id]: { ...prev[v.id], duration: e.target.value },
                      }))
                    }
                    style={{ marginLeft: 8, width: 70 }}
                    placeholder="мин"
                  />
                  <button onClick={() => saveVisitEdit(v.id)} style={{ marginLeft: 10 }}>💾</button>
                  <button onClick={() => setEditVisitId(null)} style={{ marginLeft: 5 }}>✖️</button>
                </div>
              ) : (
                <div>
                  📅 {new Date(v.date).toLocaleString()} — <strong>{v.type}</strong> — ⏱ {v.duration} мин
                  <button onClick={() => {
                    setEditVisitId(v.id);
                    setEditedVisitData((prev) => ({
                      ...prev,
                      [v.id]: {
                        date: v.date,
                        type: v.type,
                        duration: v.duration.toString(),
                      },
                    }));
                  }} style={{ marginLeft: 10 }}>
                    ✏️
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <h4>Добавить новое посещение:</h4>
      <div>
        Тип:
        <select value={newVisitType} onChange={(e) => setNewVisitType(e.target.value as 'INDIVIDUAL' | 'GROUP')}>
          <option value="INDIVIDUAL">INDIVIDUAL</option>
          <option value="GROUP">GROUP</option>
        </select>
      </div>
      <div>
        Дата и время:{' '}
        <input
          type="datetime-local"
          value={newVisitDate}
          onChange={(e) => setNewVisitDate(e.target.value)}
        />
      </div>
      <div>
        Продолжительность (в минутах):{' '}
        <input
          type="number"
          min={1}
          value={newVisitDuration}
          onChange={(e) => setNewVisitDuration(e.target.value)}
        />
      </div>
      <button onClick={addVisit}>➕ Добавить посещение</button>
    </div>
  );
});

export default UserEditor;
