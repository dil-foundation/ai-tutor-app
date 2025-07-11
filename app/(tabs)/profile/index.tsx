import { fetchUserProfile, fetchUserProgress } from '@/config/api';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { UserProfile } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAuthData, getAuthData } from '../../utils/authStorage';

const { width, height } = Dimensions.get('window');

// Helper function to safely display data with N/A fallback
const safeDisplay = (value: any, fallback: string = 'N/A'): string => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  } catch (error) {
    return 'N/A';
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  useEffect(() => {
    loadUserData();
    
    // Subtle animations for professional feel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authData = await getAuthData();
      
      if (!authData.token || !authData.userId) {
        setError('Authentication required');
        router.replace('/(auth)/login');
        return;
      }

      // Fetch user profile and progress data in parallel
      const [profileData, progressData] = await Promise.all([
        fetchUserProfile(authData.userId, authData.token),
        fetchUserProgress(authData.userId, authData.token)
      ]);

      if (profileData) {
        // Transform API data to match our UserProfile interface
        const transformedUserData: UserProfile = {
          id: profileData.id || authData.userId,
          name: profileData.name || profileData.full_name || 'N/A',
          email: profileData.email || 'N/A',
          avatar: profileData.avatar_url ? { uri: profileData.avatar_url } : require('../../../assets/images/user_avatar.png'),
          currentLevel: profileData.current_level || profileData.level || 'N/A',
          memberSince: formatDate(profileData.created_at || profileData.join_date),
          nativeLanguage: profileData.native_language || profileData.first_language || 'N/A',
          learningGoals: profileData.learning_goals || 'N/A',
          preferredTime: profileData.preferred_time || 'N/A',
          difficultyLevel: profileData.difficulty_level || 'N/A',
          practiceDuration: profileData.practice_duration || 'N/A',
          notifications: profileData.notifications || {
            dailyReminder: false,
            weeklyProgress: false,
            achievementAlerts: false,
            newContent: false,
          },
          privacy: profileData.privacy || {
            shareProgress: false,
            allowAnalytics: false,
            publicProfile: false,
          },
        };

        setUserData(transformedUserData);
      } else {
        setError('Failed to load profile data');
      }

      if (progressData) {
        setProgressData(progressData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await clearAuthData();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/profile/edit');
  };

  const handleRefresh = () => {
    loadUserData();
  };

  const renderSettingItem = (icon: string, title: string, subtitle: string, onPress: () => void) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={1}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.settingArrow}>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  // Calculate fluency level from progress data
  const getFluencyLevel = (): number => {
    if (!progressData || !progressData.completion_percentage) return 0;
    return Math.round(progressData.completion_percentage);
  };

  const getCurrentStage = (): string => {
    if (!progressData || !progressData.current_stage) return 'N/A';
    return `Stage ${progressData.current_stage}`;
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No user data
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-circle" size={48} color={Colors.textSecondary} />
          <Text style={styles.errorText}>No profile data available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerIconContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account and learning preferences</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.profileContent}>
            <Image source={userData.avatar} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{safeDisplay(userData.name)}</Text>
              <Text style={styles.userLevel}>{safeDisplay(userData.currentLevel)}</Text>
              <Text style={styles.memberSince}>Member since {safeDisplay(userData.memberSince)}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Personal Information */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{safeDisplay(userData.name)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{safeDisplay(userData.email)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Native Language</Text>
              <Text style={styles.infoValue}>{safeDisplay(userData.nativeLanguage)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Stage</Text>
              <Text style={styles.infoValue}>{getCurrentStage()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fluency Level</Text>
              <View style={styles.fluencyContainer}>
                <Text style={styles.infoValue}>{getFluencyLevel()}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${getFluencyLevel()}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Learning Preferences */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="book-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Learning Preferences</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Learning Goals</Text>
              <Text style={styles.infoValue}>{safeDisplay(userData.learningGoals)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Preferred Time</Text>
              <Text style={styles.infoValue}>{safeDisplay(userData.preferredTime)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Difficulty Level</Text>
              <Text style={styles.infoValue}>{safeDisplay(userData.difficultyLevel)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Practice Duration</Text>
              <Text style={styles.infoValue}>{safeDisplay(userData.practiceDuration)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Settings Section */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            {renderSettingItem("person-outline", "Edit Profile", "Update your personal information", handleEditProfile)}
            {renderSettingItem("lock-closed-outline", "Change Password", "Update your password", () => {})}
            {renderSettingItem("notifications-outline", "Notifications", "Manage notification preferences", () => {})}
            {renderSettingItem("language-outline", "Language Settings", "App language preferences", () => {})}
            {renderSettingItem("shield-checkmark-outline", "Privacy", "Privacy and data settings", () => {})}
            {renderSettingItem("download-outline", "Export Data", "Download your progress data", () => {})}
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          style={[
            styles.logoutContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={1}>
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: Spacing.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userLevel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  memberSince: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  infoCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  fluencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 2,
    marginLeft: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  settingsCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  settingSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
  },
  settingArrow: {
    padding: Spacing.xs,
  },
  logoutContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
}); 
