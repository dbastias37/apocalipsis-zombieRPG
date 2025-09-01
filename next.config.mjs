/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Salida estática para GitHub/Render
  output: 'export',

  // Evita optimización de imágenes (requerido para export estático)
  images: {
    unoptimized: true,
  },

  // URLs con “/” final para hosting estático más simple
  trailingSlash: true,
};

export default nextConfig;
