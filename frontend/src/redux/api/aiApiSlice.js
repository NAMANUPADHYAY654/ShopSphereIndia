import { apiSlice } from './apiSlice';

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminCopilot: builder.mutation({
      query: (data) => ({
        url: '/ai/admin/copilot',
        method: 'POST',
        body: data,
      }),
    }),
    executeAdminAction: builder.mutation({
      query: (data) => ({
        url: '/ai/admin/execute-action',
        method: 'POST',
        body: data,
      }),
    }),
    getFraudRadar: builder.query({
      query: () => '/ai/admin/fraud-radar',
    }),
    getSecurityCenter: builder.query({
      query: () => '/ai/admin/security-center',
    }),
    getPricingRadar: builder.query({
      query: () => '/ai/admin/pricing-radar',
    }),
    getWeeklyDigest: builder.query({
      query: () => '/ai/admin/weekly-digest',
    }),
    getSellerHealth: builder.query({
      query: () => '/ai/admin/seller-health',
    }),
    draftRejection: builder.mutation({
      query: (data) => ({
        url: '/ai/admin/draft-rejection',
        method: 'POST',
        body: data,
      }),
    }),
    getSupportTriage: builder.query({
      query: () => '/ai/admin/support-triage',
    }),
    getSentimentRadar: builder.query({
      query: () => '/ai/admin/sentiment-radar',
    }),
    onboardingCopilot: builder.mutation({
      query: (data) => ({
        url: '/ai/seller/onboard-chat',
        method: 'POST',
        body: data,
      }),
    }),
    autoCategorize: builder.mutation({
      query: (data) => ({
        url: '/ai/seller/auto-categorize',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useAdminCopilotMutation,
  useExecuteAdminActionMutation,
  useGetFraudRadarQuery,
  useGetSecurityCenterQuery,
  useGetPricingRadarQuery,
  useGetWeeklyDigestQuery,
  useGetSellerHealthQuery,
  useDraftRejectionMutation,
  useGetSupportTriageQuery,
  useGetSentimentRadarQuery,
  useOnboardingCopilotMutation,
  useAutoCategorizeMutation,
} = aiApiSlice;
