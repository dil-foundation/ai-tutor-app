import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RoleplaySensitiveScenarioScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Empathy & Conflict Simulation</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/roleplay-simulation-1.png")} // Update this path
          style={styles.mainImage}
        />
        {/* <View style={styles.imageOverlay}>
          <Text style={styles.overlayText}>
            You are an HR Manager. An employee is upset about a missed
            promotion. Respond with tact
          </Text>
        </View> */}
      </View>

      <ScrollView style={styles.chatContainer}>
        <View style={styles.chatBubbleAI}>
          <Image source={require("../../../../assets/images/ai-interviewer-avatar.png")} style={styles.avatar} />
          <View style={styles.chatBubbleContentAI}>
            <Text style={styles.chatTextAI}>
              I'm really disappointed about not getting the promotion. I've
              worked so hard and feel overlooked.
            </Text>
          </View>
        </View>

        <View style={styles.chatBubbleUser}>
          <View style={styles.chatBubbleContentUser}>
            <Text style={styles.chatTextUser}>
              I understand your disappointment, Ethan. Your dedication is
              valued, and I want to discuss this further.
            </Text>
          </View>
          <Image source={require("../../../../assets/images/user_avatar.png")} style={styles.avatar} />
        </View>
        {/* Add more chat bubbles as needed */}
      </ScrollView>

      <Text style={styles.feedbackTitle}>Feedback</Text>
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackItemTitle}>Tone & Empathy Score</Text>
          <Text style={styles.feedbackItemValue}>Your response showed understanding and a willingness to address the employee's concerns.</Text>
        </View>
        <Image source={require("../../../../assets/images/feedback-clarity-nuance-1.png")} style={styles.feedbackImage} />
      </View>
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackItemTitle}>Conflict Resolution</Text>
          <Text style={styles.feedbackItemValue}>You initiated a constructive dialogue, focusing on understanding the employee's perspective.</Text>
        </View>
        <Image source={require("../../../../assets/images/feedback-depth-ideas-1.png")} style={styles.feedbackImage} />
      </View>
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackItemTitle}>Professional Language Clarity</Text>
          <Text style={styles.feedbackItemValue}>Your language was clear, respectful, and maintained a professional tone throughout.</Text>
        </View>
        <Image source={require("../../../../assets/images/feedback-fluency-1.png")} style={styles.feedbackImage} />
      </View>


      <TouchableOpacity style={styles.speakButton}>
        <Text style={styles.speakButtonText}>🎤 Speak</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50, // Adjust as per status bar height
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 24,
    marginRight: 10,
    fontFamily: 'Lexend-Regular',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 10,
  },
  mainImage: {
    width: "100%",
    height: 200, // Adjust as needed
  },
  imageOverlay: {
    position: "absolute",
    bottom: 20, // Adjust to position text correctly
    left: "10%",
    right: "10%",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 8,
  },
  overlayText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontFamily: 'Lexend-Bold',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  chatBubbleAI: {
    flexDirection: "row",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  chatBubbleUser: {
    flexDirection: "row",
    marginBottom: 10,
    alignSelf: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  chatBubbleContentAI: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  chatBubbleContentUser: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  chatTextAI: {
    fontSize: 14,
    color: "#000",
    fontFamily: 'Lexend-Regular',
  },
  chatTextUser: {
    fontSize: 14,
    color: "#fff",
    fontFamily: 'Lexend-Regular',
  },
  feedbackTitle: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  feedbackCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  feedbackTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  feedbackItemTitle: {
    fontSize: 13,
    fontFamily: 'Lexend-Bold',
  },
  feedbackItemValue: {
    fontSize: 11,
    color: "#444",
    marginTop: 2,
    fontFamily: 'Lexend-Regular',
  },
  feedbackImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  speakButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: "25%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20, // Ensure button is above navigation or edges
  },
  speakButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
});

export default RoleplaySensitiveScenarioScreen; 