

const nextConfig = {
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };

    config.ignoreWarnings = [
      /Circular dependency.*cofhe_sdk/,
      /Circular dependency.*tfhe_snippets/,
    ];

    return config;
  },
};

export default nextConfig;
