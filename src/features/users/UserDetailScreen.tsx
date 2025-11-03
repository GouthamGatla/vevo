import React, { useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Linking,
} from 'react-native';
import { useGetUserByIdQuery } from '../../services/api/usersApi';
import { useRoute, RouteProp } from '@react-navigation/native';
import NotificationIcon from '../../../assets/icons/notification.svg';
import MobileIcon from '../../../assets/icons/mobileIcon.svg';
import WebIcon from '../../../assets/icons/web.svg';
import LocationIcon from '../../../assets/icons/location.svg';
import CommunityIcon from '../../../assets/icons/community.svg';


export const UserDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const { userId } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: user, isLoading, error, refetch } = useGetUserByIdQuery(userId);

  useEffect(() => {
    if (user) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [user, fadeAnim]);

  const getUserInitials = useCallback((name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  const getUserColor = useCallback((id: number) => {
    const colors = [
      '#0077b5', '#006699', '#004d73', '#003d5c',
      '#0a66c2', '#0e5490', '#0576b8', '#0768b3'
    ];
    return colors[id % colors.length];
  }, []);

  const handleEmailPress = useCallback(() => {
    if (user?.email) {
      Linking.openURL(`mailto:${user.email}`);
    }
  }, [user?.email]);

  const handlePhonePress = useCallback(() => {
    if (user?.phone) {
      const phoneNumber = user.phone.replace(/\s/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  }, [user?.phone]);

  const handleWebsitePress = useCallback(() => {
    if (user?.website) {
      const url = user.website.startsWith('http') ? user.website : `https://${user.website}`;
      Linking.openURL(url);
    }
  }, [user?.website]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0077b5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Unable to load profile</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  const fullAddress = `${user.address.suite}, ${user.address.street}, ${user.address.city}, ${user.address.zipcode}`;
  const userColor = getUserColor(user.id);
  const userInitials = getUserInitials(user.name);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor="#0077b5"
          colors={['#0077b5']}
        />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.profileCard}>
          <View style={styles.profilePictureSection}>
            <View style={[styles.profilePicture, { backgroundColor: userColor }]}>
              <Text style={styles.profilePictureText}>{userInitials}</Text>
            </View>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileUsername}>{user.username}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleEmailPress}
            activeOpacity={0.7}
          >
            <NotificationIcon width={24} height={24} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{user.email}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handlePhonePress}
            activeOpacity={0.7}
          >
            <MobileIcon width={24} height={24} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{user.phone}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleWebsitePress}
            activeOpacity={0.7}
          >
            <WebIcon width={24} height={24} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactLink}>{user.website}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.divider} />
          
          <View style={styles.locationItem}>
          <LocationIcon width={24} height={24} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>{fullAddress}</Text>
            </View>
          </View>

          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <Text style={styles.coordinateValue}>{user.address.geo.lat}</Text>
            </View>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <Text style={styles.coordinateValue}>{user.address.geo.lng}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.divider} />
          
          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <View style={styles.companyIconContainer}>
              <CommunityIcon width={24} height={24} />
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{user.company.name}</Text>
                <Text style={styles.companyTagline}>{user.company.catchPhrase}</Text>
              </View>
            </View>
            <View style={styles.companyDetails}>
              <Text style={styles.companyDescription}>{user.company.bs}</Text>
            </View>
          </View>
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
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
    paddingTop: 24,
    paddingBottom: 24,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profilePicture: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  profilePictureText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 1,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  profileUsername: {
    fontSize: 17,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f2ef',
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
  contactLink: {
    fontSize: 15,
    fontWeight: '400',
    color: '#0077b5',
    lineHeight: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f2ef',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 22,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  coordinateItem: {
    flex: 1,
    marginRight: 16,
  },
  coordinateLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
  },
  companyCard: {
    paddingHorizontal: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#f3f2ef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyIcon: {
    fontSize: 24,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  companyTagline: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  companyDetails: {
    marginTop: 8,
    paddingLeft: 60,
  },
  companyDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
});
