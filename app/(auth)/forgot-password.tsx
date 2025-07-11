import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import { WORDPRESS_API_URL } from '../../config/api';

const ForgotPasswordScreen: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!text) {
            return "Email is required.";
        } else if (!emailRegex.test(text)) {
            return "Please enter a valid email address.";
        } else {
            return "";
        }
    };

    const handleSendResetLink = async () => {
        const emailError = validateEmail(email);
        if (emailError) {
            setEmailError(emailError);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${WORDPRESS_API_URL}/wp-json/custom/v1/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const responseData = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Reset Link Sent',
                    'If an account with that email exists, a password reset link has been sent.',
                    [{ text: 'OK', onPress: () => router.push('/(auth)/login' as any) }]
                );
            } else {
                Alert.alert('Forgot Password Failed', responseData.message || 'An error occurred.');
            }
        } catch (error) {
            console.error('Forgot Password API error:', error);
            Alert.alert('Forgot Password Error', 'An unexpected network error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.mainTitle}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>

                    <FloatingLabelInput
                        label="Email Address *"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setEmailError(validateEmail(text));
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={emailError}
                    />

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSendResetLink}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.actionButtonText}>Send Reset Link</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} style={styles.backLinkContainer}>
                        <FontAwesome5 name="arrow-left" size={14} color="#22C55E" />
                        <Text style={styles.backLinkText}> Back to Login</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111629',
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 20,
        justifyContent: 'center',
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: 'Lexend-Bold',
        color: '#22C55E',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#D2D5E1',
        textAlign: 'center',
        marginBottom: 50,
        paddingHorizontal: 15,
        fontFamily: 'Lexend-Regular',
    },
    actionButton: {
        width: '100%',
        backgroundColor: '#22C55E',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 25,
    },
    actionButtonText: {
        color: '#111629',
        fontFamily: 'Lexend-Bold',
        fontSize: 18,
    },
    backLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    backLinkText: {
        fontSize: 14,
        color: '#22C55E',
        fontFamily: 'Lexend-Regular',
    },
}); 
