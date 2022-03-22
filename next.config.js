/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: [
      'abs.twimg.com',
      'avatars.githubusercontent.com',
      'pbs.twimg.com',
      'res.cloudinary.com',
      's.gravatar.com'
    ]
  },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: false // Required to fix: https://nextjs.org/docs/messages/failed-loading-swc
}
