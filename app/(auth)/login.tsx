import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import BASE_API_URL from '../../config/api';
import { saveAuthData } from '../utils/authStorage';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isEnglishLanguage, setIsEnglishLanguage] = useState(true);

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));

    useEffect(() => {
        // Subtle animations for professional feel
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

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
                    router.push('/(tabs)/learn' as any);
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
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            
            {/* Language Toggle Header */}
            <Animated.View 
                style={[
                    styles.languageHeader,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View style={styles.languageContent}>
                    <Ionicons name="language" size={20} color={Colors.primary} />
                    <Text style={styles.appLanguageLabel}>App Language</Text>
                </View>
                <View style={styles.languageToggle}>
                    <Text style={styles.languageText}>English</Text>
                    <Switch
                        trackColor={{ false: Colors.borderLight, true: Colors.primary }}
                        thumbColor={Colors.background}
                        ios_backgroundColor={Colors.borderLight}
                        onValueChange={toggleLanguageSwitch}
                        value={isEnglishLanguage}
                    />
                </View>
            </Animated.View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <Animated.View
                        style={[
                            styles.headerSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="school" size={24} color={Colors.primary} />
                            </View>
                        </View>
                        <Text style={styles.mainTitle}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Continue your English learning journey with personalized AI tutoring
                        </Text>
                    </Animated.View>

                    {/* Login Form Card */}
                    <Animated.View
                        style={[
                            styles.formCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.formTitle}>Sign In</Text>
                        <Text style={styles.formSubtitle}>Enter your credentials to continue</Text>

                        <FloatingLabelInput
                            label="Email Address"
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
                            label="Password"
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

                        <TouchableOpacity
                            style={styles.forgotContainer}
                            onPress={() => router.push('/(auth)/forgot-password' as any)}
                        >
                            <Ionicons name="lock-open-outline" size={14} color={Colors.primary} />
                            <Text style={styles.forgotText}> Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity 
                            style={styles.loginButton}
                            onPress={handleLogin} 
                            disabled={isLoading}
                            activeOpacity={1}
                        >
                            <LinearGradient
                                colors={Gradients.success}
                                style={styles.loginButtonGradient}
                            >
                                <View style={styles.loginButtonContent}>
                                    {isLoading ? (
                                        <ActivityIndicator color={Colors.textOnPrimary} size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="log-in" size={20} color={Colors.textOnPrimary} />
                                            <Text style={styles.loginText}>Sign In</Text>
                                        </>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Register Link */}
                        <TouchableOpacity onPress={handleRegister} style={styles.registerLinkContainer}>
                            <Text style={styles.registerText}>
                                Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Feature Highlights */}
                    <Animated.View
                        style={[
                            styles.featuresContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="mic-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.featureText}>Voice Learning</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.featureText}>AI Conversations</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="trending-up-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.featureText}>Progress Tracking</Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    languageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.base,
        backgroundColor: Colors.backgroundSecondary,
        marginHorizontal: Spacing.base,
        marginTop: Spacing.base,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    languageContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appLanguageLabel: {
        fontSize: Typography.fontSize.base,
        color: Colors.textPrimary,
        fontWeight: Typography.fontWeight.medium,
        marginLeft: Spacing.sm,
    },
    languageToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageText: {
        fontSize: Typography.fontSize.base,
        color: Colors.textPrimary,
        marginRight: Spacing.sm,
        fontWeight: Typography.fontWeight.normal,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        paddingBottom: Spacing['2xl'],
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.lg,
    },
    iconContainer: {
        marginBottom: Spacing.md,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    mainTitle: {
        fontSize: Typography.fontSize['4xl'],
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.fontSize.base,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
        paddingHorizontal: Spacing.md,
    },
    formCard: {
        width: '100%',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.base,
    },
    formTitle: {
        fontSize: Typography.fontSize['2xl'],
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    formSubtitle: {
        fontSize: Typography.fontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    forgotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.base,
        marginBottom: Spacing.lg,
    },
    forgotText: {
        fontSize: Typography.fontSize.sm,
        color: Colors.primary,
        fontWeight: Typography.fontWeight.medium,
    },
    loginButton: {
        width: '100%',
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        ...Shadows.md,
    },
    loginButtonGradient: {
        paddingVertical: Spacing.base,
        paddingHorizontal: Spacing.lg,
    },
    loginButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    loginText: {
        color: Colors.textOnPrimary,
        fontWeight: Typography.fontWeight.semibold,
        fontSize: Typography.fontSize.lg,
    },
    registerLinkContainer: {
        alignItems: 'center',
        marginTop: Spacing.base,
    },
    registerText: {
        fontSize: Typography.fontSize.sm,
        color: Colors.textSecondary,
    },
    registerLink: {
        color: Colors.primary,
        fontWeight: Typography.fontWeight.semibold,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: Spacing.md,
        gap: Spacing.base,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    featureText: {
        fontSize: Typography.fontSize.xs,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontWeight: Typography.fontWeight.medium,
    },
});
