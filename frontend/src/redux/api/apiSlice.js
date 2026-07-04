import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// In dev: Vite proxy handles /api → localhost:5000
// In prod (Vercel): VITE_API_URL must point to Render backend
const baseUrl = import.meta.env.VITE_API_URL || '/api';

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User', 'Category', 'Cart', 'Complaint'],
  endpoints: (builder) => ({}),
});
