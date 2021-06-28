const path = require('path');

module.exports = {
  entry: './webpack/index.js',
  output: {
    path: path.resolve(__dirname, 'src/assets/js/'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
      ]
  }
};
