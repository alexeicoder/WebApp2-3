const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          name: 'mobxApp',
          filename: 'remoteEntry.js',
          exposes: {
            './App': './src/App'
          },
          shared: ['react', 'react-dom', 'mobx']
        })
      ]
    },
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = 'auto';
      return webpackConfig;
    },
    devServer: {
        port: 4002 // Для RTK (4002 для MobX)
      }
    
  }
};