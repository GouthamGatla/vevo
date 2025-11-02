import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from '../services/api/postsApi';
import { usersApi } from '../services/api/usersApi';
import { commentsApi } from '../services/api/commentsApi';

export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      postsApi.middleware,
      usersApi.middleware,
      commentsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
