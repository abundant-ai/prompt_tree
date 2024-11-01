/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.ignoreWarnings = [
            { module: /node_modules\/punycode/ }
        ];
        return config;
    }
};

module.exports = nextConfig; 