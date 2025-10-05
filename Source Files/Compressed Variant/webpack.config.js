const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");


module.exports = {
  entry: './src/index.js',
  mode: "development",
  devServer:{
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    }
  },

  module:{
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

    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins:[
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        template: 'src/index.html',
        filename: "index.html"
    })
]
};