/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.io', 'ipfs.thirdweb.com', 'bafybeidtkw5pp2534yv7cz6dckf5z3ooowpwdio7yauezmd4devghmttve.ipfs.cf-ipfs.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipfs.cf-ipfs.com',
        port: '',
        pathname: '/**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig