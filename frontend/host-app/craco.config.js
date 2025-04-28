const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            rtkApp: 'rtkApp@http://localhost:4001/remoteEntry.js', // ← 4001 вместо 3002
            mobxApp: 'mobxApp@http://localhost:4002/remoteEntry.js' // ← 4002 вместо 3003
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true }
          }
        })
      ]
    },
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = 'auto';
      return webpackConfig;
    }
  },
  devServer: {
    port: 4000 // ← Главное изменение!
  }
};