import { apiSlice } from './apiSlice';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: { ...order },
      }),
      invalidatesTags: ['Order'],
    }),
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
    getRazorpayConfig: builder.query({
      query: () => '/orders/razorpay/config',
    }),
    createRazorpayOrder: builder.mutation({
      query: (data) => ({
        url: '/orders/razorpay/create',
        method: 'POST',
        body: data,
      }),
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: '/orders/razorpay/verify',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
  useGetRazorpayConfigQuery,
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} = orderApiSlice;
