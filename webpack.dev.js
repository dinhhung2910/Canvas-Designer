const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: "development",
  devtool: "none",
  output: {
    filename: "widget.min.js",
    path: path.resolve(__dirname, "dist")
  }
});