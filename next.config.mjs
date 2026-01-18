/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        resolveAlias: {
            'canvas': './lib/canvas-stub.js',
        },
    },
};

export default nextConfig;
