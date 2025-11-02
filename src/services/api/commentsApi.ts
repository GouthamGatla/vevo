import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Comment'],
  endpoints: (builder) => ({
    getCommentsByPostId: builder.query<Comment[], number>({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: (result, error, postId) => [
        { type: 'Comment', id: postId },
        ...(result?.map(({ id }) => ({ type: 'Comment' as const, id })) || []),
      ],
    }),
  }),
});

export const {
  useGetCommentsByPostIdQuery,
} = commentsApi;
