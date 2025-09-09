const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Add alias resolution for @ paths
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

module.exports = config;
