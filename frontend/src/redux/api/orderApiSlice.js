import { apiSlice } from './apiSlice';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query({
      query: () => '/orders/my',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    getOrderTracking: builder.query({
      query: (id) => `/orders/${id}/tracking`,
      keepUnusedDataFor: 10,
    }),
  }),
});

export const { useGetMyOrdersQuery, useGetOrderByIdQuery, useGetOrderTrackingQuery } = orderApiSlice;
