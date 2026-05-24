/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/blog/:slug',
        destination: '/writing/:slug',
        permanent: true,
      },
    ]
  },
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
}

class VeliteWebpackPlugin {
  static started = false
  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const dev = compiler.options.mode === 'development'
      const { build } = await import('velite')
      await build({ watch: dev, clean: !dev })
    })
  }
}

module.exports = nextConfig
