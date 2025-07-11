export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: any; // Image source
  currentLevel: string; // e.g., "A2 Elementary"
  memberSince: string;
  nativeLanguage: string;
  learningGoals: string;
  preferredTime: string; // "Morning", "Afternoon", "Evening"
  difficultyLevel: string; // "Easy", "Medium", "Hard"
  practiceDuration: string; // "15 minutes", "30 minutes", "45 minutes"
  notifications: {
    dailyReminder: boolean;
    weeklyProgress: boolean;
    achievementAlerts: boolean;
    newContent: boolean;
  };
  privacy: {
    shareProgress: boolean;
    allowAnalytics: boolean;
    publicProfile: boolean;
  };
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  learningGoals?: string;
  preferredTime?: string;
  difficultyLevel?: string;
  practiceDuration?: string;
  notifications?: Partial<UserProfile['notifications']>;
  privacy?: Partial<UserProfile['privacy']>;
} 