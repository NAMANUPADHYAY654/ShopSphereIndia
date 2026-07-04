import { apiSlice } from './apiSlice';

export const complaintApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createComplaint: builder.mutation({
      query: (data) => ({ url: '/complaints', method: 'POST', body: data }),
      invalidatesTags: ['Complaint'],
    }),
    getMyComplaints: builder.query({
      query: () => '/complaints/my',
      providesTags: ['Complaint'],
    }),
    getAllComplaints: builder.query({
      query: () => '/complaints',
      providesTags: ['Complaint'],
    }),
    updateComplaint: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/complaints/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Complaint'],
    }),
    addComplaintMessage: builder.mutation({
      query: ({ id, text }) => ({ url: `/complaints/${id}/message`, method: 'POST', body: { text } }),
      invalidatesTags: ['Complaint'],
    }),
  }),
});

export const {
  useCreateComplaintMutation,
  useGetMyComplaintsQuery,
  useGetAllComplaintsQuery,
  useUpdateComplaintMutation,
  useAddComplaintMessageMutation,
} = complaintApiSlice;
