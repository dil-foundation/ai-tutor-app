import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Assuming these types are defined in your project
type RootStackParamList = {
    Register: undefined;
    Login: undefined;
    Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen: React.FC = () => {
    const router = useRouter();

    const navigation = useNavigation<NavigationProp>();

    const [username, setUsername] = useState(''); // Changed from name to username
    const [password, setPassword] = useState('');
    const [proficiencyText, setProficiencyText] = useState('');
    const [name, setName] = useState(''); // New state for Name
    const [age, setAge] = useState(''); // New state for Age
    const [isEnglishLanguage, setIsEnglishLanguage] = useState(true); // State for the language switch
    const toggleLanguageSwitch = () => setIsEnglishLanguage(previousState => !previousState);
    const handleRegister = () => {
        // TODO: Replace this with your API call or Firebase registration logic
        console.log('Register:', { username, password, proficiencyText, name, age });
        router.push('/onboarding/step3');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F6F7" />
            <View style={styles.header}>
                <Text style={styles.appLanguageLabel}>App Language</Text>
                <View style={styles.languageToggle}>
                    <Text style={styles.languageText}>English</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isEnglishLanguage ? "#f4f3f4" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleLanguageSwitch}
                        value={isEnglishLanguage}
                    />
                </View>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.mainTitle}>Welcome to our English Journey</Text>
                <Text style={styles.subtitle}>
                    Kindly Register to begin your English learning journey.
                </Text>

                {/* Input Fields */}
                <TextInput
                    placeholder="Username"
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Password"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    placeholder="Name"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    placeholder="Age"
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                />

                <TextInput
                    placeholder="Type 2-3 English sentences to assess your English proficiency."
                    style={[styles.input, styles.proficiencyInput]}
                    value={proficiencyText}
                    onChangeText={setProficiencyText}
                    multiline={true} // Allow multiple lines for sentences
                    textAlignVertical="top" // Align text to the top on Android
                />

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLinkContainer}>
                    <Text style={styles.loginLinkText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F6F7', // Light gray background to match the image
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20, // Adjusted padding
        paddingBottom: 10,
    },
    appLanguageLabel: {
        fontSize: 16,
        color: '#333',
    },
    languageToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageText: {
        fontSize: 16,
        color: '#333',
        marginRight: 8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center', // Center content horizontally
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 40, // Increased margin to push it down
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40, // Increased margin for spacing
        paddingHorizontal: 15, // Add horizontal padding for better readability
    },
    input: {
        width: '100%',
        backgroundColor: '#FFFFFF', // White background for inputs
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 15,
        shadowColor: '#000', // Subtle shadow for input fields
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1, // For Android shadow
    },
    proficiencyInput: {
        height: 120, // Taller for multi-line input
        paddingTop: 15, // Ensure text starts from the top
        marginBottom: 30, // Space before the button
    },
    registerButton: {
        width: '100%',
        backgroundColor: '#38A3FF', // Blue color from the image
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15, // Space from bottom
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loginLinkContainer: {
        marginTop: 10, // Adjusted from 15
        alignItems: 'center',
        marginBottom: 20, // Added some margin at the bottom of the screen
    },
    loginLinkText: {
        fontSize: 14,
        color: '#007bff',
    },
});