import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import BASE_API_URL from '../config/api';
import { saveAuthData } from '../utils/authStorage';

type RootStackParamList = {
    Register: undefined;
    Login: undefined;
    Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen: React.FC = () => {
    const router = useRouter();

    const navigation = useNavigation<NavigationProp>();

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [proficiencyText, setProficiencyText] = useState('');
    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [dob, setDob] = useState<Date | null>(null);
    const [dobError, setDobError] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [proficiencyTextError, setProficiencyTextError] = useState('');
    const [isEnglishLanguage, setIsEnglishLanguage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [registrationError, setRegistrationError] = useState('');

    const toggleLanguageSwitch = () => setIsEnglishLanguage(previousState => !previousState);

    // Calculate min and max dates for the date picker
    const today = new Date();
    const minSelectableDate = new Date();
    minSelectableDate.setFullYear(today.getFullYear() - 50);
    const maxSelectableDate = new Date();
    maxSelectableDate.setFullYear(today.getFullYear() - 5);

    const validateUsername = (text: string): string => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return 'Username cannot be empty.';
        }
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(trimmedText)) {
            return 'Username can only contain letters and numbers.';
        }
        if (trimmedText.length < 5) {
            return 'Username must be at least 5 characters long.';
        }
        if (trimmedText.length > 16) {
            return 'Username cannot be more than 16 characters long.';
        }
        return '';
    };

    const validateEmail = (text: string): string => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return 'Email cannot be empty.';
        }
        // Basic email format validation using a common regex
        const emailRegex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9_-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
        if (!emailRegex.test(trimmedText)) {
            return 'Please enter a valid email address.';
        }
        return '';
    };

    const validatePassword = (text: string): string => {
        if (!text) {
            return 'Password cannot be empty.';
        }
        if (text.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (text.length > 32) {
            return 'Password cannot be more than 32 characters long.';
        }
        if (!/[A-Z]/.test(text)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/[a-z]/.test(text)) {
            return 'Password must contain at least one lowercase letter.';
        }
        if (!/[0-9]/.test(text)) {
            return 'Password must contain at least one number.';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(text)) {
            return 'Password must contain at least one special character.';
        }
        return '';
    };

    const validateFirstName = (text: string): string => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return 'First name cannot be empty.';
        }
        const nameRegex = /^[a-zA-Z]+$/; // Allows only letters
        if (!nameRegex.test(trimmedText)) {
            return 'First name can only contain letters.';
        }
        if (trimmedText.length < 2) {
            return 'First name must be at least 2 characters long.';
        }
        if (trimmedText.length > 25) {
            return 'First name cannot be more than 25 characters long.';
        }
        return '';
    };

    const validateLastName = (text: string): string => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return 'Last name cannot be empty.';
        }
        const nameRegex = /^[a-zA-Z]+$/; // Allows only letters
        if (!nameRegex.test(trimmedText)) {
            return 'Last name can only contain letters.';
        }
        if (trimmedText.length > 25) {
            return 'Last name cannot be more than 25 characters long.';
        }
        return '';
    };

    const validateProficiencyText = (text: string): string => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return 'Proficiency text cannot be empty.';
        }
        if (trimmedText.length < 25) {
            return 'Proficiency text must be at least 25 characters long.';
        }
        if (trimmedText.length > 1000) {
            return 'Proficiency text cannot exceed 1000 characters.';
        }
        // Allows letters, numbers, spaces, periods, commas, and plus signs.
        const proficiencyRegex = /^[a-zA-Z0-9\s.,\+]+$/;
        if (!proficiencyRegex.test(trimmedText)) {
            return 'Proficiency text can only contain letters, numbers, spaces, and the characters: . , +';
        }
        return '';
    };

    const validateDOB = (date: Date | null): string => {
        if (!date) {
            return 'Date of Birth cannot be empty.';
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
            return 'Date of Birth cannot be in the future.';
        }
        
        // Calculate age
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
        }

        if (age < 5) {
            return 'You must be at least 5 years old.';
        }
        if (age > 50) {
            return 'You cannot be more than 50 years old.';
        }
           
        return '';
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleUsernameChange = (text: string) => {
        setUsername(text);
        setUsernameError(validateUsername(text));
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        setEmailError(validateEmail(text));
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setPasswordError(validatePassword(text));
    };

    const handleFirstNameChange = (text: string) => {
        setFirstName(text);
        setFirstNameError(validateFirstName(text));
    };

    const handleLastNameChange = (text: string) => {
        setLastName(text);
        setLastNameError(validateLastName(text));
    };

    const handleProficiencyTextChange = (text: string) => {
        setProficiencyText(text);
        setProficiencyTextError(validateProficiencyText(text));
    };

    const onDOBChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDob(selectedDate);
            setDobError(validateDOB(selectedDate));
        } else {
            if (!dob) { 
                setDobError(validateDOB(null));
            }
        }
    };

    const handleRegister = async () => {
        setRegistrationError('');
        const finalUsernameError = validateUsername(username);
        const finalEmailError = validateEmail(email);
        const finalPasswordError = validatePassword(password);
        const finalFirstNameError = validateFirstName(firstName);
        const finalLastNameError = validateLastName(lastName);
        const finalProficiencyTextError = validateProficiencyText(proficiencyText);
        const finalDOBError = validateDOB(dob);

        let hasError = false;
        if (finalUsernameError) { setUsernameError(finalUsernameError); hasError = true; }
        if (finalEmailError) { setEmailError(finalEmailError); hasError = true; }
        if (finalPasswordError) { setPasswordError(finalPasswordError); hasError = true; }
        if (finalFirstNameError) { setFirstNameError(finalFirstNameError); hasError = true; }
        if (finalLastNameError) { setLastNameError(finalLastNameError); hasError = true; }
        if (finalProficiencyTextError) { setProficiencyTextError(finalProficiencyTextError); hasError = true; }
        if (finalDOBError) { setDobError(finalDOBError); hasError = true; }

        if (hasError) {
            return;
        }

        setIsLoading(true);

        const formattedDOB = dob ? `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}` : null;

        const payload = {
            username: username,
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: formattedDOB,
            english_assessment_text: proficiencyText,
        };

        try {
            const response = await fetch(`${BASE_API_URL}/user/register-wordpress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('Registration successful:', responseData);
                if (responseData.access_token && responseData.user_id) {
                    await saveAuthData(responseData.access_token, responseData.user_id);
                }
                Alert.alert('Success', 'Registration successful!');
                router.push('/(tabs)/practice');
            } else {
                console.error('Registration failed:', responseData);
                setRegistrationError(responseData.message || 'Registration failed. Please try again.');
                Alert.alert('Error', responseData.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration API error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected network error occurred.';
            setRegistrationError(errorMessage);
            Alert.alert('Error', errorMessage);
        }
        finally {
            setIsLoading(false);
        }
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

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.mainTitle}>Welcome to our English Journey</Text>
                <Text style={styles.subtitle}>
                    Kindly Register to begin your English learning journey.
                </Text>

                {/* Input Fields */}
                <TextInput
                    placeholder="Username"
                    style={styles.input}
                    value={username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                />
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                
                {/* Password Input with Visibility Toggle */}
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        placeholder="Password"
                        style={styles.passwordTextInput}
                        value={password}
                        onChangeText={handlePasswordChange}
                        secureTextEntry={!isPasswordVisible} 
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordVisibilityIcon}>
                        <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="grey" />
                    </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                <TextInput
                    placeholder="First Name"
                    style={styles.input}
                    value={firstName}
                    onChangeText={handleFirstNameChange}
                />
                {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
                <TextInput
                    placeholder="Last Name"
                    style={styles.input}
                    value={lastName}
                    onChangeText={handleLastNameChange}
                />
                {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}

                {/* Date of Birth Input */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <Text style={styles.datePickerText}>
                        {dob ? dob.toLocaleDateString() : 'Date of Birth'}
                    </Text>
                </TouchableOpacity>
                {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}
                {showDatePicker && (
                    <DateTimePicker
                        value={dob || maxSelectableDate} // Default to max selectable if dob is null
                        mode="date"
                        display="default"
                        onChange={onDOBChange}
                        minimumDate={minSelectableDate}
                        maximumDate={maxSelectableDate}
                    />
                )}

                <TextInput
                    placeholder="Type 2-3 English sentences to assess your English proficiency."
                    style={[styles.input, styles.proficiencyInput]}
                    value={proficiencyText}
                    onChangeText={handleProficiencyTextChange}
                    multiline={true} // Allow multiple lines for sentences
                    textAlignVertical="top" // Align text to the top on Android
                />
                {proficiencyTextError ? <Text style={styles.errorText}>{proficiencyTextError}</Text> : null}

                {registrationError ? <Text style={[styles.errorText, {alignSelf: 'center', marginBottom:15}]}>{registrationError}</Text> : null}

                <TouchableOpacity style={[styles.registerButton, isLoading && styles.disabledButton]} onPress={handleRegister} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.registerButtonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLinkContainer}>
                    <Text style={styles.loginLinkText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </ScrollView>
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
        paddingHorizontal: 15,
        alignItems: 'center', // Center content horizontally
        paddingBottom: 10, // Added padding at the bottom of the scrollable content
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
        marginBottom: 50, // Increased margin for spacing (was 40)
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
        marginBottom: 40, // Space before the button (was 30)
    },
    registerButton: {
        width: '100%',
        backgroundColor: '#38A3FF', // Blue color from the image
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25, // Space from bottom (was 15)
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loginLinkContainer: {
        marginTop: 10, // Adjusted from 15
        alignItems: 'center',
        marginBottom: 15, // Significantly increased margin
    },
    loginLinkText: {
        fontSize: 14,
        color: '#007bff',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        alignSelf: 'flex-start',
        marginBottom: 10, // Add some space before the next input if error is shown
        // marginLeft: 5, // Optional: if inputs have specific padding/margin
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 20, 
        marginBottom: 15, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    passwordTextInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
    },
    passwordVisibilityIcon: {
        padding: 10, 
    },
    datePickerText: {
        fontSize: 16,
        color: '#000', // Adjust color to match placeholder/input text
        // Add paddingVertical if needed to align with other inputs, but styles.input provides it
    },
    disabledButton: {
        backgroundColor: '#A9A9A9', // Darker grey for disabled state
    }
});