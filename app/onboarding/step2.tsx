import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const AITutorChatScreen = () => {
    const [message, setMessage] = useState('');
    const navigation = useNavigation(); // Initialize useNavigation
    const router = useRouter();

    const handleSend = () => {
        // if (message.trim()) {
        //     console.log('Sending message:', message);
        //     setMessage('');
        // }
        router.push('/onboarding/step3');

    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()} // Add onPress to go back
                    >
                        <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AI Tutor</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Main Title */}
                <Text style={styles.mainTitle}>Say Hello to Your AI Tutor</Text>

                {/* Chat Bubbles */}
                <View style={styles.chatContainer}>
                    <View style={styles.aiMessageContainer}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/50?img=1' }}
                            style={styles.avatar}
                        />
                        <View style={styles.aiBubble}>
                            <Text style={styles.aiBubbleText}>What's your name?</Text>
                        </View>
                    </View>

                    <View style={styles.aiMessageContainer}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/50?img=2' }}
                            style={styles.avatar}
                        />
                        <View style={styles.aiBubble}>
                            <Text style={styles.aiBubbleText}>Tell me about your school.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.spacer} />

                <Text style={styles.transcriptionPlaceholder}>
                    Voice-to-text transcription will appear here
                </Text>

                {/* Message Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message"
                        placeholderTextColor="#D2D5E1"
                        value={message}
                        onChangeText={setMessage}
                    />
                    {message.trim() ? (
                        <TouchableOpacity onPress={handleSend} style={styles.iconButton}>
                            <Ionicons name="send" size={22} color="#22C55E" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.iconButton}>
                            <FontAwesome5 name="microphone" size={22} color="#D2D5E1" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111629',
    },
    container: {
        flex: 1,
        backgroundColor: '#111629',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lexend-Bold',
        color: '#22C55E',
    },
    progressContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    stepText: {
        fontSize: 14,
        color: '#D2D5E1',
        marginBottom: 8,
        fontFamily: 'Lexend-Regular',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#1E293B',
        borderRadius: 4,
    },
    progressBarForeground: {
        height: 8,
        backgroundColor: '#22C55E',
        borderRadius: 4,
        width: '33%',
    },
    mainTitle: {
        fontSize: 26,
        fontFamily: 'Lexend-Bold',
        color: '#22C55E',
        marginBottom: 30,
    },
    chatContainer: {
        // flex: 1,
    },
    aiMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        maxWidth: '85%',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    aiBubble: {
        backgroundColor: '#1E293B',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderTopLeftRadius: 5,
    },
    aiBubbleText: {
        fontSize: 16,
        color: '#D2D5E1',
        fontFamily: 'Lexend-Regular',
    },
    spacer: {
        flex: 1,
    },
    transcriptionPlaceholder: {
        fontSize: 14,
        color: '#D2D5E1',
        textAlign: 'center',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginBottom: 20,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#D2D5E1',
        paddingVertical: 10,
        fontFamily: 'Lexend-Regular',
    },
    iconButton: {
        padding: 8,
        marginLeft: 10,
    },
});

export default AITutorChatScreen;
