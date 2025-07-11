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
    case 'completed': return '#22C55E';
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
  const progress = Math.round(
    (stage.exercises.filter((ex) => ex.status === 'completed').length / stage.exercises.length) * 100
  );

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
              ? { backgroundColor: '#22C55E', borderWidth: 0 }
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
          <Text style={[styles.title, status === 'completed' && { color: '#222' }, status === 'in_progress' && { color: '#22C55E' }]}>{stage.stage.replace(/Stage \d+ – /, '')}</Text>
          <Text style={styles.subtitle}>{stage.subtitle}</Text>
        </View>
        <View style={styles.statusBlock}>
          <Text style={[styles.status, status === 'completed' && { color: '#22C55E' }, status === 'locked' && { color: '#BDC3C7' }]}>{getStatusText(stage)}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={status === 'locked' ? '#BDC3C7' : '#22C55E'} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={['#22C55E', '#22C55E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${progress}%` }]}
          />
          <View style={styles.progressBarBg} />
          <Text style={styles.progressText}>{progress}% Complete</Text>
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
    shadowColor: '#22C55E',
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
    backgroundColor: '#22C55E',
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
    zIndex: -1,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  progressText: {
    fontSize: 12,
    color: '#22C55E',
    marginTop: 4,
    marginLeft: 2,
    fontFamily: 'Lexend-Regular',
  },
});

export default StageCard; 
