import React, { useState } from 'react';
import { useGetVisitsQuery, useAddVisitMutation, useDeleteVisitMutation } from './services/api';
import { format } from 'date-fns';
import './ClientDashboard.css';

interface Visit {
  id: string;
  date: string;
  duration: number;
  type: 'INDIVIDUAL' | 'GROUP';
}

interface NewVisit {
  date: string;
  duration: number;
  type: 'INDIVIDUAL' | 'GROUP';
}

interface Props {
  user: {
    email: string;
  };
}

const ClientDashboard: React.FC<Props> = ({ user }) => {
  // просто чтобы убедиться, что токен строка:
  //const token = localStorage.getItem('token');
  const storedToken = localStorage.getItem('token');
  const token = storedToken ? JSON.parse(storedToken).access_token : null;

  //console.log('Токен из localStorage:', token);

  const { data: visits = [], isLoading, isError } = useGetVisitsQuery();
  const [addVisit] = useAddVisitMutation();
  const [deleteVisit] = useDeleteVisitMutation();

  const [newVisit, setNewVisit] = useState<NewVisit>({
    date: format(new Date(), 'yyyy-MM-dd'),
    duration: 60,
    type: 'INDIVIDUAL',
  });

  const handleAddVisit = async () => {
    try {
      await addVisit(newVisit).unwrap();
      setNewVisit({
        date: format(new Date(), 'yyyy-MM-dd'),
        duration: 60,
        type: 'INDIVIDUAL',
      });
    } catch (error) {
      console.error('Ошибка при добавлении визита:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVisit(id).unwrap();
    } catch (error) {
      console.error('Ошибка при удалении визита:', error);
    }
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка загрузки данных</div>;

  return (
    <div className="client-dashboard">
      <h2>Личный кабинет клиента</h2>
      <p>Email: {user.email}</p>

      <div className="add-visit-form">
        <h3>Добавить визит</h3>
        <input
          type="date"
          value={newVisit.date}
          onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
        />
        <input
          type="number"
          value={newVisit.duration}
          onChange={(e) =>
            setNewVisit({ ...newVisit, duration: Number(e.target.value) })
          }
          min="30"
          max="120"
        />
        <select
          value={newVisit.type}
          onChange={(e) =>
            setNewVisit({
              ...newVisit,
              type: e.target.value as 'INDIVIDUAL' | 'GROUP',
            })
          }
        >
          <option value="INDIVIDUAL">Индивидуальное</option>
          <option value="GROUP">Групповое</option>
        </select>
        <button onClick={handleAddVisit}>Добавить</button>
      </div>

      <div className="visits-list">
        <h3>Мои визиты</h3>
        {visits.length === 0 ? (
          <p>У вас пока нет запланированных визитов</p>
        ) : (
          <ul>
            {visits.map((visit: Visit) => (
              <li key={visit.id}>
                <div>
                  <span className="visit-date">
                    {format(new Date(visit.date), 'dd.MM.yyyy HH:mm')}
                  </span>
                  <span className="visit-duration"> {visit.duration} мин.</span>
                  <span className="visit-type">
                    {visit.type === 'INDIVIDUAL' ? ' Индивидуальное' : ' Групповое'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(visit.id)}
                  className="delete-button"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
