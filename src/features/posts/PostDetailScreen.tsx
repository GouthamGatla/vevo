import React, { useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useGetPostByIdQuery } from '../../services/api/postsApi';
import { useGetCommentsByPostIdQuery } from '../../services/api/commentsApi';
import { useGetUserByIdQuery } from '../../services/api/usersApi';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppRoutes';

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetailScreen'>;
type PostDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostDetailScreen'>;

const CommentSkeleton: React.FC = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.6],
  });

  return (
    <View style={styles.commentSkeletonCard}>
      <View style={styles.commentSkeletonHeader}>
        <Animated.View style={[styles.commentSkeletonAvatar, { opacity }]} />
        <View style={styles.commentSkeletonInfo}>
          <Animated.View style={[styles.commentSkeletonLine, styles.commentSkeletonLineShort, { opacity }]} />
          <Animated.View style={[styles.commentSkeletonLine, styles.commentSkeletonLineVeryShort, { opacity }]} />
        </View>
      </View>
      <Animated.View style={[styles.commentSkeletonLine, { opacity }]} />
      <Animated.View style={[styles.commentSkeletonLine, styles.commentSkeletonLineMedium, { opacity }]} />
    </View>
  );
};

export const PostDetailScreen: React.FC = () => {
  const route = useRoute<PostDetailScreenRouteProp>();
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const { postId } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: post, isLoading: isLoadingPost, error: postError } = useGetPostByIdQuery(postId);
  const { data: comments, isLoading: isLoadingComments } = useGetCommentsByPostIdQuery(postId);
  const { data: user } = useGetUserByIdQuery(post?.userId || 0, {
    skip: !post?.userId,
  });

  useEffect(() => {
    if (post) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [post, fadeAnim]);

  const getUserInitials = useCallback((name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  const getUserColor = useCallback((userId: number) => {
    const colors = [
      '#0077b5', '#006699', '#004d73', '#003d5c',
      '#0a66c2', '#0e5490', '#0576b8', '#0768b3'
    ];
    return colors[userId % colors.length];
  }, []);

  const handleUsernamePress = useCallback(() => {
    if (post?.userId) {
      navigation.navigate('UserDetailScreen', { userId: post.userId });
    }
  }, [post, navigation]);

  if (isLoadingPost) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0077b5" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (postError || !post) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Unable to load this post</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userColor = getUserColor(post.userId);
  const userInitials = user ? getUserInitials(user.name) : '?';

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.postCard}>
          <View style={styles.authorSection}>
            <TouchableOpacity 
              onPress={handleUsernamePress}
              style={styles.authorInfo}
              activeOpacity={0.7}
            >
              <View style={[styles.authorAvatar, { backgroundColor: userColor }]}>
                <Text style={styles.authorAvatarText}>{userInitials}</Text>
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{user?.name || 'Loading...'}</Text>
                <View style={styles.authorMeta}>
                  <Text style={styles.authorMetaText}>{user?.username || ''}</Text>
                  <Text style={styles.authorMetaDot}>•</Text>
                  <Text style={styles.authorMetaText}>Post #{post.id}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.postContent}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody}>{post.body}</Text>
          </View>

          <View style={styles.engagementBar}>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementIcon}>💬</Text>
              <Text style={styles.engagementText}>
                {comments?.length || 0} {comments?.length === 1 ? 'comment' : 'comments'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>
              {comments?.length || 0} {comments?.length === 1 ? 'Comment' : 'Comments'}
            </Text>
          </View>

          {isLoadingComments ? (
            <View style={styles.commentsLoading}>
              {[1, 2, 3].map((i) => (
                <CommentSkeleton key={i} />
              ))}
            </View>
          ) : (
            <>
              {comments && comments.length > 0 ? (
                <View style={styles.commentsList}>
                  {comments.map((comment, index) => {
                    const commenterInitials = comment.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);
                    
                    const commenterColor = getUserColor(comment.id);
                    const isLastComment = index === comments.length - 1;

                    return (
                      <View 
                        key={comment.id} 
                        style={[
                          styles.commentCard,
                          isLastComment && styles.commentCardLast
                        ]}
                      >
                        <View style={styles.commentHeader}>
                          <View style={[styles.commentAvatar, { backgroundColor: commenterColor }]}>
                            <Text style={styles.commentAvatarText}>{commenterInitials}</Text>
                          </View>
                          <View style={styles.commenterInfo}>
                            <Text style={styles.commentName}>{comment.name}</Text>
                            <Text style={styles.commentEmail}>{comment.email}</Text>
                          </View>
                        </View>
                        <Text style={styles.commentBody}>{comment.body}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyCommentsIcon}>💬</Text>
                  <Text style={styles.emptyCommentsText}>No comments yet</Text>
                  <Text style={styles.emptyCommentsSubtext}>Start the conversation</Text>
                </View>
              )}
            </>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f2ef',
  },
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f2ef',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
    fontWeight: '400',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0077b5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 120,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
    paddingTop: 16,
    paddingBottom: 0,
  },
  authorSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e9ecef',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 0,
  },
  authorAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorMetaText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
  },
  authorMetaDot: {
    fontSize: 13,
    color: '#666666',
    marginHorizontal: 6,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 28,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  postBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  engagementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 8,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  engagementText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  commentsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
    paddingTop: 0,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  commentsLoading: {
    paddingTop: 0,
  },
  commentsList: {
    paddingTop: 0,
  },
  commentCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#ffffff',
  },
  commentCardLast: {
    borderBottomWidth: 0,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    borderWidth: 0,
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  commenterInfo: {
    flex: 1,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  commentEmail: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '400',
  },
  commentBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    fontWeight: '400',
    letterSpacing: -0.1,
    marginLeft: 44,
  },
  emptyComments: {
    padding: 48,
    alignItems: 'center',
  },
  emptyCommentsIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.4,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  commentSkeletonCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  commentSkeletonHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentSkeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    marginRight: 12,
  },
  commentSkeletonInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  commentSkeletonLine: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginBottom: 8,
    width: '100%',
  },
  commentSkeletonLineShort: {
    width: '40%',
  },
  commentSkeletonLineMedium: {
    width: '75%',
  },
  commentSkeletonLineVeryShort: {
    width: '30%',
    height: 10,
    marginBottom: 0,
  },
});
