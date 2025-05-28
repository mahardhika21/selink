
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // Added for YouTube thumbnails
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dribbble.com', // Added for Dribbble thumbnails
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.cnn.com', // Added for CNN thumbnails
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'akcdn.detik.net.id', // Added for Detik thumbnails
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'awsimages.detik.net.id', // Added for Detik AWS images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn0-production-images-kly.akamaized.net', // Added for KLY Akamai images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk', // Added for BBC images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com', // Added for website-files.com
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'animateai.pro', // Added for animateai.pro
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'siteforge.io', // Added for siteforge.io
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pebblely.com', // Added for pebblely.com
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yastatic.net', // Added for yastatic.net
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v0chat.vercel.sh', // Added for v0chat.vercel.sh
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.pinimg.com', // Added for Pinterest images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com', // Added for CoinMarketCap images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'preview-kly.akamaized.net', // Added for preview-kly.akamaized.net images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn1-production-images-kly.akamaized.net', // Added for cdn1-production-images-kly.akamaized.net images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sc.cnbcfm.com', // Added for cnbcfm.com images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cnnindonesia.com', // Added for cnnindonesia.com images
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
