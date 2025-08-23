const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const plugins = require('./webpack.plugins');

const pkgOutput = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  productName: pkg.productName,
  author: pkg.author,
  main: './main/index.js'
}

fs.writeFileSync('./dist/package.json', JSON.stringify(pkgOutput, null, 2));

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  target: 'web',
  entry: {
    renderer: './src/renderer/renderer.tsx',
  },
  output: {
    path: path.join(__dirname, 'dist/renderer'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2020'
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpg|png|svg|ico|icns)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
    fallback: {
      "events": require.resolve("events/"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "buffer": require.resolve("buffer/"),
      "assert": require.resolve("assert/"),
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html'
    }),
    ...plugins
  ],
  devServer: {
    port: 3000,
    hot: true,
    compress: true,
    devMiddleware: {
      writeToDisk: true,
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
  devtool: 'source-map',
};
