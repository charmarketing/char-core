/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
    responseLimit: '500mb',
  },
}
module.exports = nextConfig
