import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Modern color palette
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

interface Exercise {
  name: string;
  status: 'completed' | 'in_progress' | 'locked';
}

interface StageCardProps {
  index: number;
  stage: {
    stage: string;
    subtitle: string;
    completed: boolean;
    progress: number;
    exercises: Exercise[];
    unlocked: boolean;
  };
  expanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

const StageCard: React.FC<StageCardProps> = ({ index, stage, expanded, onPress, children }) => {
  const status = stage.completed ? 'completed' : stage.unlocked ? 'in_progress' : 'locked';
  const clampedProgress = Math.round(stage.progress);
  const isActive = status === 'in_progress';

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.primary;
      case 'locked': return COLORS.text.tertiary;
      default: return COLORS.text.tertiary;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'ellipse';
      case 'locked': return 'lock-closed';
      default: return 'lock-closed';
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={15} style={styles.glassCard}>
        <TouchableOpacity
          style={[
            styles.card,
            status === 'locked' && styles.lockedCard,
            isActive && styles.activeCard,
            status === 'completed' && styles.completedCard,
          ]}
          activeOpacity={0.8}
          onPress={onPress}
          disabled={status === 'locked'}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={styles.cardGradient}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <LinearGradient
                  colors={
                    status === 'locked' ? ['#E5E7EB', '#D1D5DB'] : 
                    status === 'completed' ? [COLORS.success, '#059669'] : 
                    COLORS.primaryGradient as any
                  }
                  style={styles.iconGradient}
                >
                  <Text style={[styles.stageNumber, status === 'locked' && styles.lockedText]}>
                    {index + 1}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.textBlock}>
                <Text style={[styles.title, status === 'locked' && styles.lockedText]}>
                  {stage.stage}
                </Text>
                <Text style={[styles.subtitle, status === 'locked' && styles.lockedText]}>
                  {stage.subtitle}
                </Text>
              </View>
              <View style={styles.statusBlock}>
                {status === 'locked' ? (
                  <View style={styles.lockedIconContainer}>
                    <Ionicons name="lock-closed" size={24} color={COLORS.text.tertiary} />
                  </View>
                ) : (
                  <View style={styles.expandIconContainer}>
                    <Ionicons 
                      name={expanded ? 'chevron-up-circle' : 'chevron-down-circle'} 
                      size={28} 
                      color={isActive ? COLORS.primary : COLORS.text.secondary} 
                    />
                  </View>
                )}
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${clampedProgress}%`,
                        backgroundColor: getStatusColor()
                      }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.progressText}>{clampedProgress}% Complete</Text>
            </View>

            {/* Expanded Content */}
            {expanded && children && (
              <View style={styles.expandedContent}>
                {children}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: 'transparent', // Ensure background is transparent
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.98)', // More opaque to hide lines behind
  },
  cardGradient: {
    padding: 24,
    borderRadius: 20,
  },
  lockedCard: {
    opacity: 0.8,
    borderColor: 'rgba(156, 163, 175, 0.3)',
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
  },
  activeCard: {
    borderColor: COLORS.primary,
    borderWidth: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  completedCard: {
    borderColor: COLORS.success,
    borderWidth: 2,
    shadowColor: COLORS.success,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageNumber: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#FFFFFF',
    fontFamily: 'Lexend-Bold',
  },
  lockedText: {
    color: COLORS.text.tertiary,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'Lexend-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontFamily: 'Lexend-Regular',
  },
  statusBlock: {
    marginLeft: 16,
  },
  lockedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    fontFamily: 'Lexend-Medium',
    textAlign: 'right',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.1)',
  },
});

export default StageCard; 