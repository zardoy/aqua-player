import type { Configuration } from 'webpack';
import * as path from 'path';

export const remoteUIConfig: Configuration = {
  mode: 'development',
  entry: './src/remote-ui/remote-ui.tsx',
  output: {
    path: path.resolve(__dirname, '.webpack/remote-ui'),
    filename: 'remote-ui.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css']
  },
  devtool: 'source-map'
};