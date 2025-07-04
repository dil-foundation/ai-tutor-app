import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import BASE_API_URL from '../../config/api';
import { saveAuthData } from '../utils/authStorage';


const LoginScreen: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isEnglishLanguage, setIsEnglishLanguage] = useState(true);

    const toggleLanguageSwitch = () => setIsEnglishLanguage((previousState) => !previousState);

    const handleLogin = async () => {
        setEmailError('');
        setPasswordError('');

        let hasError = false;
        if (!email.trim()) {
            setEmailError('Email is required.');
            hasError = true;
        }
        if (!password) {
            setPasswordError('Password is required.');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_API_URL}/user/login-wordpress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const responseData = await response.json();

            if (response.ok) {
                if (responseData.access_token && responseData.user_id) {
                    await saveAuthData(String(responseData.access_token), String(responseData.user_id));
                    router.push('/(tabs)/practice' as any);
                } else {
                    Alert.alert('Login Failed', 'Invalid response from server.');
                }
            } else {
                Alert.alert('Login Failed', responseData.message || 'An error occurred.');
            }
        } catch (error) {
            console.error('Login API error:', error);
            Alert.alert('Login Error', 'An unexpected network error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        router.push('/(auth)/register');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
            <View style={styles.languageHeader}>
                <Text style={styles.appLanguageLabel}>App Language</Text>
                <View style={styles.languageToggle}>
                    <Text style={styles.languageText}>English</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isEnglishLanguage ? '#f4f3f4' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleLanguageSwitch}
                        value={isEnglishLanguage}
                    />
                </View>
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.mainTitle}>Welcome to our English Journey</Text>
                    <Text style={styles.subtitle}>
                        Log in to continue your English learning journey.
                    </Text>

                    <FloatingLabelInput
                        label="Email Address *"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={emailError}
                    />

                    <FloatingLabelInput
                        label="Password *"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        secureTextEntry={!isPasswordVisible}
                        onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
                        isPasswordVisible={isPasswordVisible}
                        error={passwordError}
                    />

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.forgotContainer}
                        onPress={() => router.push('/(auth)/forgot-password' as any)}
                    >
                        <FontAwesome5 name="lock" size={14} color="#D2D5E1" />
                        <Text style={styles.forgotText}> Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleRegister} style={styles.registerLinkContainer}>
                        <Text style={styles.registerText}>Don't have an account? Register</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111629',
    },
    languageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    appLanguageLabel: {
        fontSize: 16,
        color: '#D2D5E1',
        fontFamily: 'Lexend-Regular',
    },
    languageToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageText: {
        fontSize: 16,
        color: '#D2D5E1',
        marginRight: 8,
        fontFamily: 'Lexend-Regular',
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 20,
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: 'Lexend-Bold',
        color: '#93E893',
        marginTop: 40,
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
    loginButton: {
        width: '100%',
        backgroundColor: '#93E893',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 25,
    },
    loginText: {
        color: '#111629',
        fontFamily: 'Lexend-Bold',
        fontSize: 18,
    },
    forgotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    forgotText: {
        fontSize: 14,
        color: '#D2D5E1',
        fontFamily: 'Lexend-Regular',
    },
    registerLinkContainer: {
        marginTop: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    registerText: {
        fontSize: 14,
        color: '#93E893',
        fontFamily: 'Lexend-Regular',
    },
});