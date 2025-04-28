import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Visit {
  id: string;
  date: string;
  duration: number;
  type: 'INDIVIDUAL' | 'GROUP';
}

export const visitsApi = createApi({
  reducerPath: 'visitsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001',
    prepareHeaders: (headers) => {
      try {
        const tokenRaw = localStorage.getItem('token');
        let token: string | null = null;

        if (tokenRaw) {
          token = tokenRaw.startsWith('{')
            ? JSON.parse(tokenRaw).access_token
            : tokenRaw;
        }

        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.error('Ошибка обработки токена из localStorage:', error);
      }

      return headers;
    }
  }),
  tagTypes: ['Visits'],
  endpoints: (builder) => ({
    getVisits: builder.query<Visit[], void>({
      query: () => '/visits',
      providesTags: ['Visits'],
    }),
    addVisit: builder.mutation<Visit, Omit<Visit, 'id'>>({
      query: (newVisit) => ({
        url: '/visits',
        method: 'POST',
        body: newVisit,
      }),
      invalidatesTags: ['Visits'],
    }),
    deleteVisit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/visits/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Visits'],
    }),
  }),
});

export const {
  useGetVisitsQuery,
  useAddVisitMutation,
  useDeleteVisitMutation,
} = visitsApi;
