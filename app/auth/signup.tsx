import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// Grade options for dropdown
const GRADE_OPTIONS = [
  { label: 'Grade 1', value: '1' },
  { label: 'Grade 2', value: '2' },
  { label: 'Grade 3', value: '3' },
  { label: 'Grade 4', value: '4' },
  { label: 'Grade 5', value: '5' },
  { label: 'Grade 6', value: '6' },
  { label: 'Grade 7', value: '7' },
  { label: 'Grade 8', value: '8' },
  { label: 'Grade 9', value: '9' },
  { label: 'Grade 10', value: '10' },
  { label: 'Grade 11', value: '11' },
  { label: 'Grade 12', value: '12' },
];

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading: authLoading } = useAuth();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [englishProficiency, setEnglishProficiency] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [englishProficiencyError, setEnglishProficiencyError] = useState('');
  
  // Grade dropdown state
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  
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

    // Start pulse animation for the signup button
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

  // Validation functions
  const validateFirstName = (value: string) => {
    if (!value.trim()) {
      return 'First name is required';
    }
    if (value.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }
    return '';
  };

  const validateLastName = (value: string) => {
    if (!value.trim()) {
      return 'Last name is required';
    }
    if (value.trim().length < 2) {
      return 'Last name must be at least 2 characters';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateGrade = (value: string) => {
    if (!value) {
      return 'Grade is required';
    }
    return '';
  };

  const validateEnglishProficiency = (value: string) => {
    if (!value.trim()) {
      return 'Please describe your English proficiency';
    }
    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount < 5) {
      return 'Please write at least 5 words.';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least 1 lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least 1 uppercase letter';
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least 1 number';
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) {
      return 'Password must contain at least 1 symbol';
    }
    return '';
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return 'Please confirm your password';
    }
    if (value !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const clearErrors = () => {
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setGradeError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setEnglishProficiencyError('');
  };

  const validateForm = () => {
    clearErrors();
    
    const firstNameValidation = validateFirstName(firstName);
    const lastNameValidation = validateLastName(lastName);
    const emailValidation = validateEmail(email);
    const gradeValidation = validateGrade(grade);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
    const englishProficiencyValidation = validateEnglishProficiency(englishProficiency);

    setFirstNameError(firstNameValidation);
    setLastNameError(lastNameValidation);
    setEmailError(emailValidation);
    setGradeError(gradeValidation);
    setPasswordError(passwordValidation);
    setConfirmPasswordError(confirmPasswordValidation);
    setEnglishProficiencyError(englishProficiencyValidation);

    return !firstNameValidation && !lastNameValidation && !emailValidation && 
           !gradeValidation && !passwordValidation && !confirmPasswordValidation && !englishProficiencyValidation;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting student signup...');
      const { data, error } = await signUp({
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        grade: grade,
        english_proficiency_text: englishProficiency.trim()
      });

      if (error || !data?.success) {
        // Handle failed signup
        const errorMessage = error?.message || data?.message || 'Failed to create account. Please try again.';
        Alert.alert('Sign Up Failed', errorMessage);
      } else {
        // Handle successful signup
        console.log('✅ Student signup successful:', data.message);
        Alert.alert(
          'Success', 
          'Account created successfully! Please check your email for a verification link.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form and navigate to login
                setFirstName('');
                setLastName('');
                setEmail('');
                setGrade('');
                setPassword('');
                setConfirmPassword('');
                setEnglishProficiency('');
                clearErrors();
                router.push('/auth/login');
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      console.error('🔐 Student signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const selectGrade = (gradeValue: string) => {
    setGrade(gradeValue);
    setGradeError('');
    setShowGradeDropdown(false);
  };

  const getGradeLabel = (value: string) => {
    const option = GRADE_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : 'Select your grade';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#58D68D" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.iconGradient}
              >
                <Ionicons name="school" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.mainTitle}>Join DIL Tutor</Text>
            <Text style={styles.subtitle}>
              Start your English learning journey with personalized AI tutoring
            </Text>
          </Animated.View>

          {/* Signup Form Card */}
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
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>Fill in your details to get started</Text>

              {/* Name Inputs */}
              <View style={styles.nameContainer}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <View style={[styles.inputWrapper, firstNameError ? styles.inputError : null]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter first name"
                      placeholderTextColor="#9CA3AF"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (firstNameError) setFirstNameError('');
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    <Ionicons name="person-outline" size={20} color="#58D68D" />
                  </View>
                  {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
                </View>
                
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <View style={[styles.inputWrapper, lastNameError ? styles.inputError : null]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter last name"
                      placeholderTextColor="#9CA3AF"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (lastNameError) setLastNameError('');
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    <Ionicons name="person-outline" size={20} color="#58D68D" />
                  </View>
                  {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Ionicons name="mail-outline" size={20} color="#58D68D" />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Grade Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Grade Level</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, styles.dropdownInput, gradeError ? styles.inputError : null]}
                  onPress={() => setShowGradeDropdown(true)}
                >
                  <Text style={[styles.dropdownText, !grade ? styles.placeholderText : null]}>
                    {getGradeLabel(grade)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#58D68D" />
                </TouchableOpacity>
                {gradeError ? <Text style={styles.errorText}>{gradeError}</Text> : null}
              </View>

              {/* English Proficiency Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>English Proficiency</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper, englishProficiencyError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your English level in 2-3 sentences..."
                    placeholderTextColor="#9CA3AF"
                    value={englishProficiency}
                    onChangeText={(text) => {
                      setEnglishProficiency(text);
                      if (englishProficiencyError) setEnglishProficiencyError('');
                    }}
                    multiline
                    numberOfLines={3}
                    autoCapitalize="sentences"
                    autoCorrect={true}
                  />
                </View>
                {englishProficiencyError ? <Text style={styles.errorText}>{englishProficiencyError}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                      // Re-validate confirm password if it exists
                      if (confirmPassword) {
                        const confirmValidation = validateConfirmPassword(confirmPassword);
                        setConfirmPasswordError(confirmValidation);
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={togglePasswordVisibility}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#58D68D"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[styles.inputWrapper, confirmPasswordError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={toggleConfirmPasswordVisibility}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#58D68D"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
              </View>

              {/* Sign Up Button */}
              <Animated.View
                style={[
                  styles.signUpButtonContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <TouchableOpacity 
                  style={styles.signUpButtonWrapper}
                  onPress={handleSignUp} 
                  disabled={isLoading || authLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#58D68D', '#45B7A8', '#58D68D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.signUpButtonGradient}
                  >
                    <View style={styles.signUpButtonContent}>
                      {isLoading || authLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="person-add" size={20} color="#FFFFFF" />
                          <Text style={styles.signUpText}>Create Account</Text>
                        </>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign In Link */}
              <TouchableOpacity onPress={handleSignIn} style={styles.signInLinkContainer}>
                <Text style={styles.signInText}>
                  Already have an account? <Text style={styles.signInLink}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Grade Dropdown Modal */}
      <Modal
        visible={showGradeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGradeDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGradeDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Grade</Text>
              <TouchableOpacity onPress={() => setShowGradeDropdown(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {GRADE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    grade === option.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => selectGrade(option.value)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    grade === option.value && styles.dropdownItemTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {grade === option.value && (
                    <Ionicons name="checkmark" size={20} color="#58D68D" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 30,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 15,
    marginTop: 20,
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
    fontSize: Math.min(width * 0.08, 32),
    fontFamily: 'Lexend-Bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(88, 214, 141, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Lexend-Regular',
    paddingHorizontal: 20,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 10,
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
  nameContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Lexend-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Lexend-Regular',
  },
  textAreaWrapper: {
    paddingVertical: 8,
    height: 100,
    alignItems: 'flex-start',
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Lexend-Regular',
    textAlignVertical: 'top', // For Android
    height: 80, // Adjust height for multiline
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Lexend-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Lexend-Regular',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  signUpButtonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  signUpButtonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  signUpButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  signUpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#FFFFFF',
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    marginLeft: 8,
  },
  signInLinkContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  signInText: {
    fontSize: 14,
    color: '#6C757D',
    fontFamily: 'Lexend-Regular',
  },
  signInLink: {
    color: '#58D68D',
    fontFamily: 'Lexend-Bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownItemTextSelected: {
    color: '#58D68D',
    fontWeight: '600',
  },
}); 