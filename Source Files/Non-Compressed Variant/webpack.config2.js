const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  mode: "development",
  devServer: {
    open: true

  },

  // resolve: {
  //   fallback: {
  //     "os": false,
  //     "timers": false,
  //     "npm": false,
  //     "dns": false,
  //     "fs": false,
  //     "tls": false,
  //     "net": false,
  //     "path": false,
  //     "zlib": false,
  //     "http": false,
  //     "https": false,
  //     "stream": false,
  //     "crypto": false,
  //     "constants": false,
  //     "child_process": false,
  //   }
  // },
  module: {
    rules: [
      {
        test: /.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /.(jpe?g|png|gif|svg|jpg)$/i,
        loader: "file-loader",
        options: {
          name: '[name].[ext]',
          outputPath: 'images'

        }
      },
      {
        test: /.xlsx$/, loader: "webpack-xlsx-loader"
      },

      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        
      }
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: "index.html"
    })
  ],

};