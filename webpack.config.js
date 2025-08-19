const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

// Read the original package.json
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Create a production package.json
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  author: pkg.author,
  main: './main.js'
};

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    main: './src/electron/index.ts',
    preload: './src/electron/preload.ts',
  },
  target: 'electron-main',
  output: {
    path: path.join(__dirname, 'dist'),
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
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
  },
  optimization: {
    nodeEnv: process.env.NODE_ENV || 'development',
    minimize: process.env.NODE_ENV === 'production',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'package.json',
          to: 'package.json',
          transform: (content) => {
            return JSON.stringify(prodPkg, null, 2);
          },
        },
      ],
    }),
  ],
  devtool: 'source-map',
};
