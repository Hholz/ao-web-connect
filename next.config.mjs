import webpack from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    images: {
        domains: ['images.unsplash.com'],
    },
    trailingSlash: true,
    //导入svg
    webpack(config, { isServer }) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(/^\/(.*)$/, function(resource) {
                resource.request = './' + resource.request.substr(1);
            })
        );
        return config;
    },
};

export default nextConfig;
