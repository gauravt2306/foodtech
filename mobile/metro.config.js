const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-skia': '@shopify/react-native-skia',
};

// Add extra node_modules paths for nested resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  ...config.resolver.nodeModulesPaths,
];

// Ensure resolver uses alias for all requests
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-skia') {
    return context.resolveRequest(context, '@shopify/react-native-skia', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });