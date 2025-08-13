import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface RoleBasedAccessProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ 
  children, 
  fallbackComponent 
}) => {
  const { user, userRole, isStudent, loading, roleLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only handle non-student access when we have a definitive role
    // and we're not loading anymore
    if (!loading && !roleLoading && user && userRole && !isStudent) {
      handleNonStudentAccess();
    }
  }, [user, userRole, loading, roleLoading, isStudent]);

  const handleNonStudentAccess = () => {
    if (userRole === 'teacher') {
      Alert.alert(
        'Access Restricted',
        'Teachers cannot access the mobile app. Please use the web dashboard for administrative functions.',
        [
          {
            text: 'Go to Web Dashboard',
            onPress: () => {
              // You can add a link to the web dashboard here
              console.log('Redirecting to web dashboard');
            }
          },
          {
            text: 'Sign Out',
            onPress: async () => {
              await signOut();
              router.replace('/auth/login');
            }
          }
        ]
      );
    } else if (userRole === 'admin') {
      Alert.alert(
        'Access Restricted',
        'Administrators cannot access the mobile app. Please use the web dashboard for administrative functions.',
        [
          {
            text: 'Go to Web Dashboard',
            onPress: () => {
              // You can add a link to the web dashboard here
              console.log('Redirecting to web dashboard');
            }
          },
          {
            text: 'Sign Out',
            onPress: async () => {
              await signOut();
              router.replace('/auth/login');
            }
          }
        ]
      );
    }
  };

  // Show loading while checking authentication or role
  if (loading || roleLoading || (user && userRole === null)) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#58D68D', '#45B7A8']}
          style={styles.loadingGradient}
        >
          <Ionicons name="school" size={48} color="#FFFFFF" />
          <Text style={styles.loadingText}>
            {roleLoading ? 'Verifying Access...' : 'Checking Access...'}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // If no user, allow access (will be handled by auth flow)
  if (!user) {
    return <>{children}</>;
  }

  // If user is not a student, show access restricted screen
  if (!isStudent) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <View style={styles.accessDeniedContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.accessDeniedGradient}
        >
          <Ionicons name="lock-closed" size={64} color="#FFFFFF" />
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedSubtitle}>
            This mobile app is only available for students.
          </Text>
          <Text style={styles.roleInfo}>
            Your account role: {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Unknown'}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.webDashboardButton}
              onPress={() => {
                // You can add a link to the web dashboard here
                console.log('Redirecting to web dashboard');
              }}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.webDashboardGradient}
              >
                <Ionicons name="globe" size={20} color="#FF6B6B" />
                <Text style={styles.webDashboardText}>Go to Web Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={async () => {
                await signOut();
                router.replace('/auth/login');
              }}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // If user is a student, allow access
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Lexend-Medium',
    marginTop: 8,
    textAlign: 'center',
  },
  accessDeniedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedGradient: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  accessDeniedTitle: {
    fontSize: 28,
    fontFamily: 'Lexend-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedSubtitle: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  roleInfo: {
    fontSize: 14,
    fontFamily: 'Lexend-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  webDashboardButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  webDashboardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  webDashboardText: {
    fontSize: 16,
    fontFamily: 'Lexend-Medium',
    color: '#FF6B6B',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Lexend-Medium',
    color: '#FFFFFF',
  },
});

export default RoleBasedAccess;
