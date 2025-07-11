import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBackButton = true }) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Handle the case where there's no screen to go back to, 
      // e.g., navigate to a default screen or do nothing.
      // For now, let's assume we always want to try and go back if a back button is shown.
      // If router.canGoBack() is false, this might mean it's the first screen in a stack.
      // You might want to navigate to a specific fallback route e.g. router.replace('/home')
      console.log("Cannot go back");
    }
  };

  return (
    <View style={styles.headerContainer}>
      {showBackButton && (
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {/* Optional: Add a spacer if showBackButton is true to keep title centered */}
      {showBackButton && <View style={styles.spacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distribute space
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    backgroundColor: "#111629",
    // Add padding for Android status bar
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 12,
  },
  backButton: {
    padding: 8, // Make it easier to tap
    marginRight: 8, // Add some space between button and title
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-SemiBold',
    color: "#22C55E",
    textAlign: "center",
    flex: 1, // Allow title to take up available space and center itself
  },
  spacer: {
    width: 24 + 16, // Width of icon + padding of back button, to balance the title
  },
}); 
