/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Admin panel lets you paste any image URL, so we allow any https host
    // here rather than hardcoding a list. If you want tighter control later,
    // replace this with an explicit remotePatterns list of the hosts you
    // actually use (Cloudinary, your CDN, etc).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
