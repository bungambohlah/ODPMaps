module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [require.resolve("expo-router/babel"), "nativewind/babel"],
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
  };
};
