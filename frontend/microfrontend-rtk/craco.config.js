const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          name: 'rtkApp',
          filename: 'remoteEntry.js',
          exposes: {
            './App': './src/App'
          },
          shared: ['react', 'react-dom', '@reduxjs/toolkit']
        })
      ]
    },
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = 'auto';
      return webpackConfig;
    },
    devServer: {
        port: 4001 // Для RTK (4002 для MobX)
      }
    
  }
};