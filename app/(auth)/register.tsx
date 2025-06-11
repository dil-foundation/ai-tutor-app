import BASE_API_URL from '@/config/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
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
import { saveAuthData } from '../utils/authStorage';

const RegisterScreen: React.FC = () => {
    const router = useRouter();

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

    const toggleLanguageSwitch = () => setIsEnglishLanguage((previousState) => !previousState);

    // Calculate min and max dates for the date picker
    const today = new Date();
    const minSelectableDate = new Date();
    minSelectableDate.setFullYear(today.getFullYear() - 50);
    const maxSelectableDate = new Date();
    maxSelectableDate.setFullYear(today.getFullYear() - 5);

    const validateUsername = (text: string): string => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return 'Username is required.';
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
            return 'Email is required.';
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
            return 'Password is required.';
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
            return 'First name is required.';
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
            return 'Last name is required.';
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
            return 'Proficiency text is required.';
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
            return 'Date of Birth is required.';
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

    const onDOBChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        
        if (selectedDate) {
            setDob(selectedDate);
            setDobError(validateDOB(selectedDate));
        } else if (Platform.OS === 'android' && !dob) {
            setDobError(validateDOB(null));
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
                    await saveAuthData(String(responseData.access_token), String(responseData.user_id));
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
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
            <View style={styles.header}>
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
                        Kindly Register to begin your English learning journey.
                    </Text>

                    <FloatingLabelInput
                        label="Username *"
                        value={username}
                        onChangeText={(text) => {
                            setUsername(text);
                            setUsernameError(validateUsername(text));
                        }}
                        autoCapitalize="none"
                        error={usernameError}
                    />

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

                    <FloatingLabelInput
                        label="Password *"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setPasswordError(validatePassword(text));
                        }}
                        secureTextEntry={!isPasswordVisible}
                        onToggleVisibility={togglePasswordVisibility}
                        isPasswordVisible={isPasswordVisible}
                        error={passwordError}
                    />

                    <FloatingLabelInput
                        label="First Name *"
                        value={firstName}
                        onChangeText={(text) => {
                            setFirstName(text);
                            setFirstNameError(validateFirstName(text));
                        }}
                        error={firstNameError}
                    />

                    <FloatingLabelInput
                        label="Last Name *"
                        value={lastName}
                        onChangeText={(text) => {
                            setLastName(text);
                            setLastNameError(validateLastName(text));
                        }}
                        error={lastNameError}
                    />

                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                        <View pointerEvents="none">
                            <FloatingLabelInput
                                label="Date of Birth *"
                                value={dob ? dob.toLocaleDateString() : ''}
                                onChangeText={() => {}}
                                error={dobError}
                            />
                        </View>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' ? (
                        <Modal
                            transparent={true}
                            animationType="slide"
                            visible={showDatePicker}
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <DateTimePicker
                                        value={dob || maxSelectableDate}
                                        mode="date"
                                        display="inline"
                                        onChange={onDOBChange}
                                        minimumDate={minSelectableDate}
                                        maximumDate={maxSelectableDate}
                                        themeVariant="dark"
                                    />
                                    <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneButton}>
                                        <Text style={styles.doneButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    ) : (
                        showDatePicker && (
                            <DateTimePicker
                                value={dob || maxSelectableDate}
                                mode="date"
                                display="default"
                                onChange={onDOBChange}
                                minimumDate={minSelectableDate}
                                maximumDate={maxSelectableDate}
                            />
                        )
                    )}

                    <FloatingLabelInput
                        label="Proficiency Text *"
                        placeholder="Type 2-3 English sentences to assess your English proficiency."
                        value={proficiencyText}
                        onChangeText={(text) => {
                            setProficiencyText(text);
                            setProficiencyTextError(validateProficiencyText(text));
                        }}
                        multiline={true}
                        error={proficiencyTextError}
                    />

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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111629',
    },
    header: {
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
        fontFamily: 'Lexend-Regular',
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
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
        marginBottom: 30,
        paddingHorizontal: 15,
        fontFamily: 'Lexend-Regular',
    },
    registerButton: {
        width: '100%',
        backgroundColor: '#93E893',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        marginTop: 15,
    },
    registerButtonText: {
        color: '#111629',
        fontSize: 18,
        fontFamily: 'Lexend-SemiBold',
    },
    loginLinkContainer: {
        marginTop: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    loginLinkText: {
        fontSize: 14,
        color: '#93E893',
        fontFamily: 'Lexend-Regular',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        alignSelf: 'center',
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: '#A9A9A9',
    },
    datePickerButton: {
        backgroundColor: '#1E293B',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#111629',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 20,
    },
    doneButton: {
        backgroundColor: '#93E893',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    doneButtonText: {
        color: '#111629',
        fontSize: 16,
        fontFamily: 'Lexend-SemiBold',
    },
});