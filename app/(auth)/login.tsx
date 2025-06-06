// app/(auth)/login.tsx
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const LoginScreen: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Simulate login logic
        router.push('/(tabs)/practice' as any);
    };

    const handleRegister = () => {
        router.push('/(auth)/register');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.iconWrapper}>
                <Ionicons name="globe-outline" size={24} color="black" />
            </View>

            <View style={styles.contentWrapper}>
                <Text style={styles.title}>Welcome to our English Journey</Text>
                <Text style={styles.subtitle}>
                    Log in to continue your English learning journey.
                </Text>

                <View style={styles.inputBox}>
                    <TextInput
                        placeholder="Email Address"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputBox}>
                    <TextInput
                        placeholder="Password"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotContainer}>
                    <FontAwesome5 name="lock" size={14} color="#555" />
                    <Text style={styles.forgotText}> Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRegister}>
                    <Text style={styles.registerText}>Don't have an account? Register</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;

// (same styles as before)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fbfd',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20, // Bootstrap-style horizontal spacing
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 400, // Limit content width like Bootstrap container
    },
    iconWrapper: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
        marginBottom: 30,
    },
    inputBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dce2ea',
    },
    input: {
        fontSize: 16,
        color: '#000',
    },
    loginButton: {
        backgroundColor: '#3db5ff',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    forgotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    forgotText: {
        fontSize: 14,
        color: '#555',
    },
    registerText: {
        fontSize: 14,
        color: '#007bff',
        textAlign: 'center',
    },
});