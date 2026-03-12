import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Text,
  TextInput,
  Platform,
  RefreshControl,
  PermissionsAndroid,
} from 'react-native';
import { useGetPostsQuery } from '../../services/api/postsApi';
import { useGetUsersQuery } from '../../services/api/usersApi';
import { Post } from '../../services/api/postsApi';
import { useNavigation } from '@react-navigation/native';
import { useDebounce } from 'use-debounce';
import SearchIcon from '../../../assets/icons/search.svg';
import {requestNotifications, check} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';



export const PostsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  
  const { data: posts, isLoading: isLoadingPosts, error: postsError, refetch: refetchPosts } = useGetPostsQuery();
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useGetUsersQuery();

  const requestNotificationPermission = async () => {
  if (Platform.OS === 'ios') {
    await requestNotifications(['alert', 'sound', 'badge']);
  } else if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  }
};

const getToken = () => {
  const token = messaging().getToken();
  console.log(token, "token");
}

useEffect(() => {
  requestNotificationPermission();
  getToken();

},[])

  const userIdToName = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {} as Record<number, string>);
  }, [users]);

  const userIdToUsername = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
      acc[user.id] = user.username;
      return acc;
    }, {} as Record<number, string>);
  }, [users]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!debouncedSearchQuery.trim()) return posts;

    const query = debouncedSearchQuery.toLowerCase();
    return posts.filter((post) => {
      const name = userIdToName[post.userId]?.toLowerCase() || '';
      const username = userIdToUsername[post.userId]?.toLowerCase() || '';
      const title = post.title.toLowerCase();
      return title.includes(query) || name.includes(query) || username.includes(query);
    });
  }, [posts, debouncedSearchQuery, userIdToName, userIdToUsername]);

  const handlePostPress = useCallback((postId: number) => {
    navigation.navigate('PostDetailScreen', { postId });
  }, [navigation]);

  const handleUsernamePress = useCallback((userId: number) => {
    navigation.navigate('UserDetailScreen', { userId });
  }, [navigation]);

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
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    return colors[userId % colors.length];
  }, []);

  const renderPostItem = useCallback(({ item: post }: { item: Post }) => {
    const userName = userIdToName[post.userId] || 'Unknown User';
    const username = userIdToUsername[post.userId] || '';
    const userColor = getUserColor(post.userId);
    const userInitials = getUserInitials(userName);
    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity 
            onPress={() => handleUsernamePress(post.userId)}
            style={styles.userInfo}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: userColor }]}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{userName}</Text>
              <View style={styles.postMetaRow}>
                {username && <Text style={styles.postMeta}>{username}</Text>}
                {username && <Text style={styles.postMetaDot}>•</Text>}
                <Text style={styles.postMeta}>Post #{post.id}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => handlePostPress(post.id)}
          activeOpacity={0.95}
          style={styles.postContent}
        >
          <Text style={styles.postTitle} numberOfLines={3}>
            {post.title}
          </Text>
          {post.body && (
            <Text style={styles.postBody} numberOfLines={2}>
              {post.body}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.postFooter}>
          <TouchableOpacity 
            onPress={() => handlePostPress(post.id)}
            style={styles.viewPostButton}
            activeOpacity={0.7}
          >
            <Text style={styles.viewPostText}>View Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [userIdToName, userIdToUsername, handlePostPress, handleUsernamePress, getUserInitials, getUserColor]);

  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  const onRefresh = useCallback(() => {
    refetchPosts();
    refetchUsers();
  }, [refetchPosts, refetchUsers]);

  const isRefreshing = isLoadingPosts || isLoadingUsers;

  if (isLoadingPosts || isLoadingUsers) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0077b5" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (postsError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Error loading posts</Text>
        <Text style={styles.emptySubtext}>Please pull down to refresh</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forum</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon width={24} height={24} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0077b5"
            colors={['#0077b5']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No posts found' : 'No posts available'}
            </Text>
            {searchQuery && (
              <Text style={styles.emptySubtext}>
                Try to search for a post by title, username or name
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
    fontWeight: '400',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#262626',
    padding: 0,
    marginLeft: 10,
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postMeta: {
    fontSize: 13,
    color: '#8e8e8e',
    fontWeight: '400',
  },
  postMetaDot: {
    fontSize: 13,
    color: '#8e8e8e',
    marginHorizontal: 6,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  postBody: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginTop: 2,
  },
  postFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  viewPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
  },
  viewPostText: {
    fontSize: 14,
    color: '#0077b5',
    fontWeight: '600',
    marginRight: 4,
  },
  viewPostArrow: {
    fontSize: 16,
    color: '#0077b5',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
    textAlign: 'center',
  },
});
