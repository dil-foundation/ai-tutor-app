// Fallback for using MaterialIcons on Android and web.

import { Colors } from '../../constants/Colors'; // To access active/inactive colors
import { useColorScheme } from '../../hooks/useColorScheme';
import { useSegments } from 'expo-router'; // Import hooks to get route info
import { SymbolWeight } from 'expo-symbols';
import { Image, ImageStyle, Platform, type StyleProp } from 'react-native';

// Mapping from SF Symbol name (passed as IconSymbol's name prop) to image file and route segment
const IMAGE_MAPPING = {
  'graduationcap.fill': { image: require('@/assets/images/learn.png'), routeSegment: 'learn' },
  'rectangle.inset.filled.on.rectangle': { image: require('@/assets/images/practice.png'), routeSegment: 'practice' },
  'chart.line.uptrend.xyaxis': { image: require('@/assets/images/progress.png'), routeSegment: 'progress' },
  'person.fill': { image: require('@/assets/images/profile.png'), routeSegment: 'profile' },
  // Add other mappings if IconSymbol is used elsewhere with different names
  // For SF Symbols not in this map (e.g., house.fill), they won't render an image on web.
  // We could add a fallback to Ionicons for those if needed.
};

type MappedIconName = keyof typeof IMAGE_MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 28, // Default size from _layout.tsx
  style,
  weight, // For iOS
  color,
}: {
  name: MappedIconName; // Ensure name is one of the keys in IMAGE_MAPPING for web image rendering
  size?: number;
  style?: StyleProp<ImageStyle>; // Changed to ImageStyle
  weight?: SymbolWeight;
  color?: string;
}) {
  // console.log('[IconSymbol WEB/ANDROID] name:', name, 'size:', size);

  // iOS uses IconSymbol.ios.tsx
  if (Platform.OS === 'ios') {
    // This component (IconSymbol.tsx) shouldn't be hit on iOS if IconSymbol.ios.tsx exists and is correctly resolved.
    // However, as a fallback or if imports are ever mixed up:
    // We'd need a different rendering strategy for SF Symbols here or ensure .ios.tsx is always used.
    // For now, this path will lead to an error or misrender on iOS if it's hit.
    // Ideally, ensure your bundler correctly picks IconSymbol.ios.tsx for iOS.
    // If we must handle iOS here, we'd import and use expo-symbols' SymbolView.
    return null; // Or some placeholder, as this file is now web/android focused for images
  }

  const colorScheme = useColorScheme() ?? 'light';
  const currentActiveColor = Colors[colorScheme].tint;
  const currentInactiveColor = Colors[colorScheme].tabIconDefault;

  const segments = useSegments(); // e.g., ['(tabs)', 'learn'] or ['(tabs)', 'practice']
  // const pathname = usePathname(); // e.g., /(tabs)/learn or /(tabs)/practice/some-screen

  const iconData = IMAGE_MAPPING[name];

  if (!iconData) {
    // Fallback for icons not in IMAGE_MAPPING (e.g. if you use IconSymbol elsewhere)
    // You could render an Ionicons/MaterialIcons fallback here if desired for non-tab icons
    console.warn(`[IconSymbol] No image mapping found for name: ${name} on web/android.`);
    return null;
  }

  // Determine if current tab is active. Tabs are typically the second segment after '(tabs)'.
  const currentTabSegment = segments.length > 1 ? segments[1] : null;
  const isActive = currentTabSegment === iconData.routeSegment;

  const finalColor = color ?? (isActive ? currentActiveColor : currentInactiveColor);

  console.log(`[IconSymbol WEB] Rendering: ${name}, routeSegment: ${iconData.routeSegment}, currentTabSegment: ${currentTabSegment}, isActive: ${isActive}, final tint: ${finalColor}, image src: ${iconData.image}`);

  return (
    <Image
      source={iconData.image}
      style={[
        {
          width: size,
          height: size,
          tintColor: finalColor,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}
