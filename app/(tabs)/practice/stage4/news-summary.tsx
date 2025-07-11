import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const NewsSummaryScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>News Summary</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Ionicons name="newspaper-outline" size={32} color={Colors.primary} />
          <Text style={styles.pageTitle}>Summarize the News</Text>
        </View>
        
        <View style={styles.newsContainer}>
          <Text style={styles.newsTitle}>Climate Change and Renewable Energy</Text>
          <Text style={styles.newsText}>
            Recent studies show that renewable energy sources are becoming more cost-effective than traditional fossil fuels. 
            Solar and wind power installations have increased by 40% this year, leading to reduced carbon emissions globally.
          </Text>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={20} color={Colors.textOnPrimary} />
            <Text style={styles.playButtonText}>Listen to News</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Your Task:</Text>
          <Text style={styles.instructionsText}>
            Listen to the news article and provide a clear summary in 2-3 sentences. 
            Focus on the main points and key information.
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Summary Tips:</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Include the main topic</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Mention key statistics or facts</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Keep it concise and clear</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic-outline" size={24} color={Colors.textOnPrimary} />
          <Text style={styles.speakButtonText}>Start Summary</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.base,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  titleCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  newsContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  newsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  newsText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.base,
  },
  playButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  playButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },
  instructionsCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  instructionsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  instructionsText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  tipsContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  bottomBar: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  speakButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.base,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.md,
  },
  speakButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
});

export default NewsSummaryScreen; 
