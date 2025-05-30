// app/_layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="onboarding/step1" />
        <Stack.Screen name="onboarding/step2" />
        <Stack.Screen name="onboarding/step3" />
        <Stack.Screen name="onboarding/stage1" />
        <Stack.Screen name="(tabs)/practice/stage0/home" />
        <Stack.Screen name="(tabs)/practice/stage0/lesson1" />
        <Stack.Screen name="(tabs)/practice/stage0/lesson2" />
        <Stack.Screen name="(tabs)/practice/stage0/lesson3" />
        <Stack.Screen name="(tabs)/practice/stage0/lesson4" />
        <Stack.Screen name="(tabs)/practice/stage0/lesson5" />
        <Stack.Screen name="(tabs)/practice/stage1/home" />
        <Stack.Screen name="(tabs)/practice/stage1/repeatAfterMe" />
        <Stack.Screen name="(tabs)/practice/stage1/quickResponse" />
        <Stack.Screen name="(tabs)/practice/stage1/listenAndReply" />
        <Stack.Screen name="(tabs)/practice/stage2/home" />
        <Stack.Screen name="(tabs)/practice/stage2/daily-routine" />
        <Stack.Screen name="(tabs)/practice/stage2/quick-answer" />
        <Stack.Screen name="(tabs)/practice/stage2/roleplay-simulation" />
        <Stack.Screen name="(tabs)/practice/stage3/home" />
        <Stack.Screen name="(tabs)/practice/stage3/storytelling" />
        <Stack.Screen name="(tabs)/practice/stage3/group-dialogue" />
        <Stack.Screen name="(tabs)/practice/stage3/problem-solving" />
        <Stack.Screen name="(tabs)/practice/stage4/home" />
        <Stack.Screen name="(tabs)/practice/stage4/abstract-topic" />
        <Stack.Screen name="(tabs)/practice/stage4/mock-interview" />
        <Stack.Screen name="(tabs)/practice/stage4/news-summary" />
        <Stack.Screen name="(tabs)/practice/stage5/home" />
        <Stack.Screen name="(tabs)/practice/stage5/critical-thinking-dialogues" />
        <Stack.Screen name="(tabs)/practice/stage5/academic-presentation" />
        <Stack.Screen name="(tabs)/practice/stage5/in-depth-interview" />
        <Stack.Screen name="(tabs)/practice/stage6/home" />
        <Stack.Screen name="(tabs)/practice/stage6/ai-guided-spontaneous-speech" />
        <Stack.Screen name="(tabs)/practice/stage6/roleplay-handle-sensitive-scenario" />
        <Stack.Screen name="(tabs)/practice/stage6/critical-opinion-builder" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
