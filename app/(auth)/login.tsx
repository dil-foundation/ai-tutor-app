import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
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
import { LinearGradient } from 'expo-linear-gradient';
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
    const [slideAnim] = useState(new Animated.Value(50));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        // Animate elements on mount
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Start pulse animation for the login button
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();
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
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
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
                    <Ionicons name="language" size={20} color="#58D68D" />
                    <Text style={styles.appLanguageLabel}>App Language</Text>
                </View>
                <View style={styles.languageToggle}>
                    <Text style={styles.languageText}>English</Text>
                    <Switch
                        trackColor={{ false: '#E9ECEF', true: '#58D68D' }}
                        thumbColor={isEnglishLanguage ? '#FFFFFF' : '#FFFFFF'}
                        ios_backgroundColor="#E9ECEF"
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
                            <LinearGradient
                                colors={['#58D68D', '#45B7A8']}
                                style={styles.iconGradient}
                            >
                                <Ionicons name="school" size={32} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.mainTitle}>Welcome Back!</Text>
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
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim }
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(88, 214, 141, 0.05)', 'rgba(69, 183, 168, 0.02)']}
                            style={styles.cardGradient}
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
                                <Ionicons name="lock-open" size={14} color="#58D68D" />
                                <Text style={styles.forgotText}> Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <Animated.View
                                style={[
                                    styles.loginButtonContainer,
                                    {
                                        transform: [{ scale: pulseAnim }],
                                    },
                                ]}
                            >
                                <TouchableOpacity 
                                    style={styles.loginButtonWrapper}
                                    onPress={handleLogin} 
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#58D68D', '#45B7A8', '#58D68D']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.loginButtonGradient}
                                    >
                                        <View style={styles.loginButtonContent}>
                                            {isLoading ? (
                                                <ActivityIndicator color="#FFFFFF" size="small" />
                                            ) : (
                                                <>
                                                    <Ionicons name="log-in" size={20} color="#FFFFFF" />
                                                    <Text style={styles.loginText}>Sign In</Text>
                                                </>
                                            )}
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Register Link */}
                            <TouchableOpacity onPress={handleRegister} style={styles.registerLinkContainer}>
                                <Text style={styles.registerText}>
                                    Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
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
                                <Ionicons name="mic" size={20} color="#58D68D" />
                            </View>
                            <Text style={styles.featureText}>Voice Learning</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="chatbubbles" size={20} color="#58D68D" />
                            </View>
                            <Text style={styles.featureText}>AI Conversations</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="trending-up" size={20} color="#58D68D" />
                            </View>
                            <Text style={styles.featureText}>Progress Tracking</Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Decorative Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeCircle3} />
            <View style={styles.decorativeCircle4} />
            
            {/* Floating Particles */}
            <View style={styles.particle1} />
            <View style={styles.particle2} />
            <View style={styles.particle3} />
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    languageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: 'rgba(88, 214, 141, 0.05)',
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(88, 214, 141, 0.1)',
    },
    languageContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appLanguageLabel: {
        fontSize: 16,
        color: '#000000',
        fontFamily: 'Lexend-Medium',
        marginLeft: 8,
    },
    languageToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageText: {
        fontSize: 16,
        color: '#000000',
        marginRight: 8,
        fontFamily: 'Lexend-Regular',
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    mainTitle: {
        fontSize: 32,
        fontFamily: 'Lexend-Bold',
        color: '#000000',
        marginBottom: 12,
        textAlign: 'center',
        textShadowColor: 'rgba(88, 214, 141, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: 'Lexend-Regular',
        paddingHorizontal: 20,
    },
    formCard: {
        width: '100%',
        marginBottom: 30,
    },
    cardGradient: {
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        backgroundColor: '#F8F9FA',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    formTitle: {
        fontSize: 24,
        fontFamily: 'Lexend-Bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Lexend-Regular',
    },
    forgotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    forgotText: {
        fontSize: 14,
        color: '#58D68D',
        fontFamily: 'Lexend-Medium',
    },
    loginButtonContainer: {
        width: '100%',
        marginBottom: 20,
    },
    loginButtonWrapper: {
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    loginButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    loginButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginText: {
        color: '#FFFFFF',
        fontFamily: 'Lexend-Bold',
        fontSize: 18,
        marginLeft: 8,
    },
    registerLinkContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    registerText: {
        fontSize: 14,
        color: '#6C757D',
        fontFamily: 'Lexend-Regular',
    },
    registerLink: {
        color: '#58D68D',
        fontFamily: 'Lexend-Bold',
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(88, 214, 141, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 12,
        color: '#58D68D',
        textAlign: 'center',
        fontFamily: 'Lexend-Medium',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: height * 0.15,
        right: -60,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: height * 0.25,
        left: -40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    decorativeCircle3: {
        position: 'absolute',
        top: height * 0.7,
        right: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.015)',
    },
    decorativeCircle4: {
        position: 'absolute',
        bottom: height * 0.1,
        right: width * 0.2,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.025)',
    },
    particle1: {
        position: 'absolute',
        top: height * 0.3,
        left: width * 0.1,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#6C757D',
        opacity: 0.3,
    },
    particle2: {
        position: 'absolute',
        top: height * 0.6,
        right: width * 0.15,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#ADB5BD',
        opacity: 0.2,
    },
    particle3: {
        position: 'absolute',
        bottom: height * 0.3,
        left: width * 0.2,
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#CED4DA',
        opacity: 0.25,
    },
});