import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  onToggleVisibility?: () => void;
  isPasswordVisible?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  multiline?: boolean;
  style?: object;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  secureTextEntry,
  onToggleVisibility,
  isPasswordVisible,
  error,
  multiline,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as 'absolute',
    left: 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -8],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#6C757D', error ? '#FF6B6B' : '#22C55E'],
    }),
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', '#FFFFFF']
    }),
    paddingHorizontal: 6,
    opacity: placeholder ? animatedValue : 1,
    fontFamily: 'Lexend-Medium',
  };

  const inputBoxStyles = [
    styles.inputBox,
    isFocused && styles.inputBoxFocused,
    error && styles.inputBoxError,
    multiline && styles.multilineInputBox,
  ];

  const textInputStyles = [styles.input, multiline && { textAlignVertical: 'top' as 'top' }];

  return (
    <View style={[styles.container, style]}>
      <View style={inputBoxStyles}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          style={textInputStyles}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor="#ADB5BD"
          {...props}
        />
        {onToggleVisibility && (
          <TouchableOpacity onPress={onToggleVisibility} style={styles.icon}>
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#22C55E" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  multilineInputBox: {
    height: 120,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  inputBoxFocused: {
    borderColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputBoxError: {
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    paddingHorizontal: 16,
    paddingTop: 20,
    height: '100%',
    fontFamily: 'Lexend-Regular',
  },
  icon: {
    position: 'absolute',
    right: 16,
    top: 20,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 16,
    fontFamily: 'Lexend-Regular',
  },
});

export default FloatingLabelInput; 
