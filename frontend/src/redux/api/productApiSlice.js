import { apiSlice } from './apiSlice';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword = '', pageNumber = 1, category = '', isTrending = '', isBestSeller = '', minPrice = '', maxPrice = '', sort = '' } = {}) => ({
        url: '/products',
        params: { keyword, pageNumber, category, isTrending, isBestSeller, minPrice, maxPrice, sort },
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 5,
    }),
    getProductDetails: builder.query({
      query: (productId) => `/products/${productId}`,
      keepUnusedDataFor: 5,
    }),
    getCategories: builder.query({
      query: () => '/categories',
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetCategoriesQuery,
} = productApiSlice;
