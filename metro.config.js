const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Add alias resolution for @ paths
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Ensure proper source map generation for production
config.serializer.createModuleIdFactory = function () {
  return function (path) {
    // Use a deterministic module ID based on the path
    return path.replace(__dirname, '').replace(/\//g, '_');
  };
};

// Optimize for production builds
if (process.env.NODE_ENV === 'production') {
  config.transformer.minifierConfig = {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  };
}

module.exports = config;
