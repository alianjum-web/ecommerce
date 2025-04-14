module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_BASE_URL || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Cookie",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dfjytm8hy/image/upload/**",
      },
    ],
    minimumCacheTTL: 60,
  },

  async redirects() {
    return [
      {
        source: "/search",
        destination: "/shopping/search",
        permanent: true,
      },
      // Add this to prevent the reverse redirect
      {
        source: "/shopping/search",
        destination: "/shopping/search",
        permanent: false,
      },
    ];
  },

  reactStrictMode: true,

  basePath: "/app",
  assetPrefix: "/app/",
};
