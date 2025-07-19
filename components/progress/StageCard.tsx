import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  };
  expanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#58D68D';
    case 'in_progress': return '#3B82F6';
    case 'locked': return '#F3F4F6';
    default: return '#F3F4F6';
  }
};

const getStatusText = (stage: any) => {
  if (stage.completed) return 'Complete';
  if (stage.progress > 0) return `${Math.floor(stage.progress / 33.34) + 1}/3 done`;
  return 'Locked';
};

const StageCard: React.FC<StageCardProps> = ({ index, stage, expanded, onPress, children }) => {
  const status = stage.completed ? 'completed' : stage.progress > 0 ? 'in_progress' : 'locked';
  const completedExercises = stage.exercises.filter((ex) => ex.status === 'completed').length;
  const totalExercises = stage.exercises.length;
  const progress = Math.round((completedExercises / totalExercises) * 100);
  
  // Also check if any exercises are in progress and give them partial credit
  const inProgressExercises = stage.exercises.filter((ex) => ex.status === 'in_progress').length;
  const partialProgress = Math.round((inProgressExercises * 0.5) * (100 / totalExercises));
  const totalProgress = progress + partialProgress;
  
  // Ensure progress is at least 0 and at most 100
  const clampedProgress = Math.max(0, Math.min(100, totalProgress));
  
  // Debug logging
  console.log(`📊 [STAGE CARD] Stage ${index + 1} progress:`, {
    completed: completedExercises,
    inProgress: inProgressExercises,
    total: totalExercises,
    progress: progress,
    partialProgress: partialProgress,
    totalProgress: totalProgress,
    clampedProgress: clampedProgress,
    expanded: expanded,
    exercises: stage.exercises.map(e => ({ name: e.name, status: e.status }))
  });
  
  // Additional debug for progress bar
  if (expanded) {
    console.log(`🎯 [PROGRESS BAR] Stage ${index + 1}:`, {
      width: `${clampedProgress}%`,
      colors: ['#58D68D', '#45B7A8'],
      zIndex: 2
    });
  }

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={onPress}
        disabled={status === 'locked'}
      >
        {/* Icon Circle/Shield with number and overlay icon */}
        <View
          style={[
            styles.iconCircle,
            status === 'completed'
              ? { backgroundColor: '#58D68D', borderWidth: 0 }
              : status === 'in_progress'
              ? { backgroundColor: '#3B82F6', borderWidth: 0 }
              : { backgroundColor: '#F3F4F6', borderColor: '#E0E0E0', borderWidth: 1 }
          ]}
        >
          <Text
            style={[
              styles.stageNumber,
              status === 'locked'
                ? { color: '#888' }
                : { color: '#fff' }
            ]}
          >
            {index + 1}
          </Text>
          {/* Overlay icon for completed and locked */}
          {status === 'completed' && (
            <View style={styles.iconOverlayCompleted}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </View>
          )}
          {status === 'locked' && (
            <View style={styles.iconOverlayLocked}>
              <Ionicons name="lock-closed" size={16} color="#B0B3B8" />
            </View>
          )}
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, status === 'completed' && { color: '#222' }, status === 'in_progress' && { color: '#58D68D' }]}>{stage.stage.replace(/Stage \d+ – /, '')}</Text>
          <Text style={styles.subtitle}>{stage.subtitle}</Text>
        </View>
        <View style={styles.statusBlock}>
          <Text style={[styles.status, status === 'completed' && { color: '#58D68D' }, status === 'locked' && { color: '#BDC3C7' }]}>{getStatusText(stage)}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={status === 'locked' ? '#BDC3C7' : '#58D68D'} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg} />
          <LinearGradient
            colors={['#58D68D', '#45B7A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${clampedProgress}%` }]}
          >
            {/* Fallback View in case LinearGradient doesn't render */}
            <View style={[styles.progressBarFallback, { width: '100%' }]} />
          </LinearGradient>
          <Text style={styles.progressText}>{clampedProgress}% Complete</Text>
        </View>
      )}
      {expanded && children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconOverlayCompleted: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#58D68D',
    borderRadius: 10,
    padding: 2,
    zIndex: 2,
  },
  iconOverlayLocked: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stageNumber: {
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Lexend-Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Lexend-Regular',
  },
  statusBlock: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    fontFamily: 'Lexend-Bold',
  },
  progressBarContainer: {
    marginTop: 0,
    marginBottom: 8,
    marginHorizontal: 18,
    position: 'relative',
    height: 10,
    justifyContent: 'center',
  },
  progressBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    zIndex: 0,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 10,
    borderRadius: 5,
    zIndex: 2,
  },
  progressBarFallback: {
    height: '100%',
    backgroundColor: '#58D68D',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#58D68D',
    marginTop: 4,
    marginLeft: 2,
    fontFamily: 'Lexend-Regular',
  },
});

export default StageCard; 