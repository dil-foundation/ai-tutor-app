import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  StatusBar,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../../context/AuthContext';
import { getUserFullNameSync } from '../../../utils/userUtils';
import UXCamExample from '../../../components/UXCamExample';
import { useUXCamContext } from '../../../context/UXCamContext';

const { width, height } = Dimensions.get('window');

// Modern color palette matching Progress page
const COLORS = {
  primary: '#58D68D',
  primaryGradient: ['#58D68D', '#45B7A8'],
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FAFAFA',
  card: 'rgba(255, 255, 255, 0.95)',
  glass: 'rgba(255, 255, 255, 0.25)',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  border: 'rgba(255, 255, 255, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Default user data - will be populated from authenticated user
const defaultUserData = {
  name: "User",
  email: "",
  avatar: require('../../../assets/animations/user.png'),
  currentLevel: "Beginner",
  memberSince: "Recently",
  learningGoals: "Improve conversational English",
  preferredTime: "Flexible",
  difficultyLevel: "Beginner",
  practiceDuration: "30 minutes"
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { addEvent, tagScreen } = useUXCamContext();
  const [userData, setUserData] = useState(defaultUserData);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Enhanced animation values matching Progress page
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [profileScaleAnim] = useState(new Animated.Value(0.7));
  const [headerScaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotationAnim] = useState(new Animated.Value(0));

  // Pulse animation for active elements
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // UXCam tracking
  useEffect(() => {
    tagScreen('Profile');
    addEvent('profile_screen_viewed', {
      user_id: user?.id,
      timestamp: new Date().toISOString(),
    });
  }, [tagScreen, addEvent, user]);

  // Rotation animation for decorative elements
  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();
    return () => rotationAnimation.stop();
  }, []);

  // Enhanced animation on mount
  useEffect(() => {
    console.log('🎬 [PROFILE] Starting enhanced animations...');
    
    // Staggered animation sequence
    Animated.stagger(150, [
      Animated.timing(headerScaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.timing(profileScaleAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update user data when authenticated user changes
  useEffect(() => {
    if (user) {
      const fullName = getUserFullNameSync(user, 'User');
      
      setUserData({
        ...defaultUserData,
        name: fullName,
        email: user.email || '',
        memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }) : 'Recently'
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    // router.push('/(tabs)/profile/edit');
  };

  const handleSignOut = () => {
    // Track sign out attempt
    addEvent('sign_out_attempted', {
      user_id: user?.id,
      timestamp: new Date().toISOString(),
    });

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              console.log('🔐 Signing out user:', user?.email);
              
              // Track successful sign out
              addEvent('sign_out_successful', {
                user_id: user?.id,
                timestamp: new Date().toISOString(),
              });
              
              await signOut();
              
              // Show success message before navigation
              Alert.alert(
                'Signed Out',
                'You have been successfully signed out.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigation will be handled by auth state change in AuthContext
                      console.log('🔐 Sign out completed, redirecting to auth');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('🔐 Sign out error:', error);
              Alert.alert(
                'Sign Out Failed', 
                'There was an error signing you out. Please try again.',
                [
                  {
                    text: 'OK',
                    onPress: () => setIsSigningOut(false)
                  }
                ]
              );
            }
          }
        }
      ]
    );
  };



  const renderInfoRow = (icon: string, label: string, value: string, color: string) => (
    <View style={styles.infoRow}>
      <View style={styles.infoRowHeader}>
        <View style={[styles.infoRowIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.infoRowLabel}>{label}</Text>
      </View>
      <Text 
        style={styles.infoRowValue}
        numberOfLines={1}
        ellipsizeMode="tail"
        adjustsFontSizeToFit={true}
        minimumFontScale={0.7}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: headerScaleAnim }
                ],
              },
            ]}
          >
            <View style={styles.headerContent}>
              <Animated.View 
                style={[
                  styles.headerGradient,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient as any}
                  style={styles.headerGradientInner}
                >
                  <Ionicons name="person" size={32} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              <Text style={styles.headerTitle}>Your Profile</Text>
              <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
            </View>
          </Animated.View>

          {/* Enhanced Profile Card with Glassmorphism */}
          <Animated.View
            style={[
              styles.profileCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: profileScaleAnim }
                ],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.profileGradient}
              >
                <View style={styles.profileContent}>
                  <View style={styles.avatarContainer}>
                    <Image source={userData.avatar} style={styles.avatar} />
                    <View style={styles.avatarBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    </View>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <View style={styles.levelContainer}>
                      <LinearGradient
                        colors={COLORS.primaryGradient as any}
                        style={styles.levelBadge}
                      >
                        <Text style={styles.levelText}>{userData.currentLevel}</Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>



          {/* Personal Information Section */}
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
              <LinearGradient
                colors={COLORS.primaryGradient as any}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="person-circle" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <BlurView intensity={20} style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.infoGradient}
              >
                {renderInfoRow("person", "Name", userData.name, COLORS.primary)}
                {renderInfoRow("mail", "Email", userData.email, "#3498DB")}
                {renderInfoRow("school", "Grade", user?.user_metadata?.grade ? `Grade ${user.user_metadata.grade}` : 'Not set', "#8B5CF6")}
                {renderInfoRow("people", "Role", user?.user_metadata?.role ? user.user_metadata.role.charAt(0).toUpperCase() + user.user_metadata.role.slice(1) : 'Student', "#F39C12")}
                {renderInfoRow("calendar", "Member Since", userData.memberSince, "#10B981")}
              </LinearGradient>
            </BlurView>
          </Animated.View>



          {/* Sign Out Button */}
          <Animated.View
            style={[
              styles.logoutContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* UXCam Test Button */}
            <TouchableOpacity
              style={[styles.logoutButton, { marginBottom: 15, backgroundColor: '#007AFF' }]}
              onPress={() => {
                // Navigate to UXCam example or show it inline
                Alert.alert('UXCam Test', 'UXCam integration is working! Check your dashboard for events.');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#007AFF', '#0056CC']}
                style={styles.logoutGradient}
              >
                <Ionicons name="analytics" size={20} color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Test UXCam</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, isSigningOut && styles.logoutButtonDisabled]}
              onPress={handleSignOut}
              activeOpacity={0.8}
              disabled={isSigningOut}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF5252']}
                style={styles.logoutGradient}
              >
                {isSigningOut ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.logoutButtonText}>Signing Out...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="log-out" size={20} color="#FFFFFF" />
                    <Text style={styles.logoutButtonText}>Sign Out</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>

        {/* Enhanced Decorative Elements */}
        <Animated.View 
          style={[
            styles.decorativeCircle1,
            {
              transform: [{
                rotate: rotationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle2,
            {
              transform: [{
                rotate: rotationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg'],
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle3,
            {
              transform: [{
                rotate: rotationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle4,
            {
              transform: [{
                rotate: rotationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg'],
                })
              }]
            }
          ]} 
        />
        
        {/* Floating Particles */}
        <Animated.View 
          style={[
            styles.particle1,
            {
              transform: [{
                translateY: pulseAnim.interpolate({
                  inputRange: [1, 1.05],
                  outputRange: [0, -10],
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.particle2,
            {
              transform: [{
                translateY: pulseAnim.interpolate({
                  inputRange: [1, 1.05],
                  outputRange: [0, 15],
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.particle3,
            {
              transform: [{
                translateY: pulseAnim.interpolate({
                  inputRange: [1, 1.05],
                  outputRange: [0, -8],
                })
              }]
            }
          ]} 
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },
  headerGradientInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Lexend-Bold',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'Lexend-Regular',
  },
  profileCard: {
    marginBottom: 40,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(88, 214, 141, 0.3)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  profileGradient: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(254, 254, 254, 0.4)',
    backgroundColor: COLORS.card,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(88, 214, 141, 0.3)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
    fontFamily: 'Lexend-Bold',
  },
  levelContainer: {
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Lexend-Medium',
  },
  memberSince: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontFamily: 'Lexend-Regular',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: -5,
    fontFamily: 'Lexend-Bold',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  infoGradient: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoRow: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
  infoRowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: -5,
    paddingTop: 2,
  },
  infoRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
    marginBottom: -10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: 'Lexend-Medium',
    marginTop: 4,
  },
  infoRowValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'Lexend-Bold',
    marginLeft: 60,
    lineHeight: 20,
  },

  logoutContainer: {
    marginTop: 20,
  },
  logoutButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Lexend-Bold',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(88, 214, 141, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(69, 183, 168, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.7,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(88, 214, 141, 0.05)',
  },
  decorativeCircle4: {
    position: 'absolute',
    bottom: height * 0.4,
    left: width * 0.7,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  particle1: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C757D',
    opacity: 0.3,
  },
  particle2: {
    position: 'absolute',
    top: height * 0.6,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ADB5BD',
    opacity: 0.2,
  },
  particle3: {
    position: 'absolute',
    bottom: height * 0.3,
    left: width * 0.2,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CED4DA',
    opacity: 0.25,
  },
}); 