import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, ProfileUpdateData } from '../../../types/user';

export default function EditProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user data - replace with actual data from context/API
  const [userData, setUserData] = useState<UserProfile>({
    id: "1",
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    avatar: require('../../../assets/images/user_avatar.png'),
    currentLevel: "A2 Elementary",
    memberSince: "January 2025",
    nativeLanguage: "Urdu",
    learningGoals: "Improve conversational English for work",
    preferredTime: "Evening",
    difficultyLevel: "Medium",
    practiceDuration: "30 minutes",
    notifications: {
      dailyReminder: true,
      weeklyProgress: true,
      achievementAlerts: true,
      newContent: false
    },
    privacy: {
      shareProgress: false,
      allowAnalytics: true,
      publicProfile: false
    },
    achievements: [],
    stats: {
      streak: 7,
      totalPracticeTime: 12.5,
      overallProgress: 28,
      currentStageProgress: 45,
      totalSessions: 25,
      averageSessionTime: 30
    },
    weakAreas: ["pronunciation", "grammar"],
    strengths: ["vocabulary", "listening"],
    favoriteExercises: ["conversation", "roleplay"]
  });

  const [editableData, setEditableData] = useState({
    name: userData.name,
    email: userData.email,
    learningGoals: userData.learningGoals,
    preferredTime: userData.preferredTime,
    difficultyLevel: userData.difficultyLevel,
    practiceDuration: userData.practiceDuration,
    notifications: { ...userData.notifications },
    privacy: { ...userData.privacy }
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate data
      if (!editableData.name.trim()) {
        Alert.alert("Error", "Name cannot be empty");
        return;
      }

      if (!editableData.email.trim() || !editableData.email.includes('@')) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }

      // Update user data
      const updateData: ProfileUpdateData = {
        name: editableData.name,
        email: editableData.email,
        learningGoals: editableData.learningGoals,
        preferredTime: editableData.preferredTime,
        difficultyLevel: editableData.difficultyLevel,
        practiceDuration: editableData.practiceDuration,
        notifications: editableData.notifications,
        privacy: editableData.privacy
      };

      // TODO: Call API to update profile
      console.log('Updating profile:', updateData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        "Success",
        "Profile updated successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? Your changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        { text: "Cancel", style: "destructive", onPress: () => router.back() }
      ]
    );
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder?: string,
    multiline?: boolean
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const renderPickerField = (
    label: string,
    value: string,
    options: string[],
    onValueChange: (value: string) => void
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.pickerOption,
              value === option && styles.pickerOptionSelected
            ]}
            onPress={() => onValueChange(option)}
          >
            <Text style={[
              styles.pickerOptionText,
              value === option && styles.pickerOptionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSwitchField = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string
  ) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchContent}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && <Text style={styles.switchDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#374151', true: '#93E893' }}
        thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, styles.saveButton]}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.sectionCard}>
            {renderInputField(
              "Full Name",
              editableData.name,
              (text) => setEditableData({ ...editableData, name: text })
            )}
            {renderInputField(
              "Email",
              editableData.email,
              (text) => setEditableData({ ...editableData, email: text })
            )}
            {renderInputField(
              "Learning Goals",
              editableData.learningGoals,
              (text) => setEditableData({ ...editableData, learningGoals: text }),
              "Describe your English learning goals...",
              true
            )}
          </View>
        </View>

        {/* Learning Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Preferences</Text>
          <View style={styles.sectionCard}>
            {renderPickerField(
              "Preferred Practice Time",
              editableData.preferredTime,
              ["Morning", "Afternoon", "Evening"],
              (value) => setEditableData({ ...editableData, preferredTime: value })
            )}
            {renderPickerField(
              "Difficulty Level",
              editableData.difficultyLevel,
              ["Easy", "Medium", "Hard"],
              (value) => setEditableData({ ...editableData, difficultyLevel: value })
            )}
            {renderPickerField(
              "Practice Duration",
              editableData.practiceDuration,
              ["15 minutes", "30 minutes", "45 minutes"],
              (value) => setEditableData({ ...editableData, practiceDuration: value })
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionCard}>
            {renderSwitchField(
              "Daily Reminders",
              editableData.notifications.dailyReminder,
              (value) => setEditableData({
                ...editableData,
                notifications: { ...editableData.notifications, dailyReminder: value }
              }),
              "Get reminded to practice daily"
            )}
            {renderSwitchField(
              "Weekly Progress Reports",
              editableData.notifications.weeklyProgress,
              (value) => setEditableData({
                ...editableData,
                notifications: { ...editableData.notifications, weeklyProgress: value }
              }),
              "Receive weekly progress summaries"
            )}
            {renderSwitchField(
              "Achievement Alerts",
              editableData.notifications.achievementAlerts,
              (value) => setEditableData({
                ...editableData,
                notifications: { ...editableData.notifications, achievementAlerts: value }
              }),
              "Get notified when you earn achievements"
            )}
            {renderSwitchField(
              "New Content Notifications",
              editableData.notifications.newContent,
              (value) => setEditableData({
                ...editableData,
                notifications: { ...editableData.notifications, newContent: value }
              }),
              "Be notified about new exercises and features"
            )}
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.sectionCard}>
            {renderSwitchField(
              "Share Progress",
              editableData.privacy.shareProgress,
              (value) => setEditableData({
                ...editableData,
                privacy: { ...editableData.privacy, shareProgress: value }
              }),
              "Allow sharing your progress with friends"
            )}
            {renderSwitchField(
              "Allow Analytics",
              editableData.privacy.allowAnalytics,
              (value) => setEditableData({
                ...editableData,
                privacy: { ...editableData.privacy, allowAnalytics: value }
              }),
              "Help improve the app with anonymous usage data"
            )}
            {renderSwitchField(
              "Public Profile",
              editableData.privacy.publicProfile,
              (value) => setEditableData({
                ...editableData,
                privacy: { ...editableData.privacy, publicProfile: value }
              }),
              "Make your profile visible to other learners"
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111629',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#93E893',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#111629',
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: '#93E893',
    marginBottom: 15,
  },
  sectionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Lexend-Medium',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  pickerOptionSelected: {
    backgroundColor: '#93E893',
    borderColor: '#93E893',
  },
  pickerOptionText: {
    fontSize: 14,
    fontFamily: 'Lexend-Medium',
    color: '#D1D5DB',
  },
  pickerOptionTextSelected: {
    color: '#111629',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  switchContent: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Lexend-Medium',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 20,
  },
}); 