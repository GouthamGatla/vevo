import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'http://jsonplaceholder.typicode.com';

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = 
  fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    timeout: 10000,
  });

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error) {
    console.error('API Error:', result.error);
  }
  
  return result;
};
