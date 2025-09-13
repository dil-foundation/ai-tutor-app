const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts.push('cjs');

// Configure transformer for better iOS compatibility
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Add resolver configuration for better module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure asset extensions
config.resolver.assetExts.push(
  // Fonts
  'otf',
  'ttf',
  'woff',
  'woff2',
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  // Audio
  'mp3',
  'wav',
  'm4a',
  'aac',
  'ogg',
  // Video
  'mp4',
  'mov',
  'avi',
  'mkv'
);

module.exports = config;
