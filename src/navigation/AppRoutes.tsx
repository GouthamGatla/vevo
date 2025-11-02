export const AppRoutes = {
  posts: 'PostsListScreen',
  postDetail: 'PostDetailScreen',
  userDetail: 'UserDetailScreen',
} as const;

export type RootStackParamList = {
  PostsListScreen: undefined;
  PostDetailScreen: { postId: number };
  UserDetailScreen: { userId: number };
};
