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
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#D2D5E1', error ? 'red' : '#93E893'],
    }),
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', '#111629']
    }),
    paddingHorizontal: 4,
    opacity: placeholder ? animatedValue : 1,
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
          placeholderTextColor="#A9A9A9"
          {...props}
        />
        {onToggleVisibility && (
          <TouchableOpacity onPress={onToggleVisibility} style={styles.icon}>
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#D2D5E1" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D2D5E1',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  multilineInputBox: {
    height: 120,
    justifyContent: 'flex-start',
    paddingTop: 15,
  },
  inputBoxFocused: {
    borderColor: '#93E893',
  },
  inputBoxError: {
    borderColor: 'red',
  },
  input: {
    fontSize: 16,
    color: '#D2D5E1',
    paddingHorizontal: 16,
    paddingTop: 18,
    height: '100%',
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
});

export default FloatingLabelInput; 