const path = require('path');
const common = require('./webpack.common');
const {merge} = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin({
      filename: '[name].[contentHash].css',
    }),
    new HtmlWebpackPlugin({
      template: './widget.html',
      filename: 'widget.html',
      chunks: ['widget']
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['widget', 'index']
    })
  ],
});
