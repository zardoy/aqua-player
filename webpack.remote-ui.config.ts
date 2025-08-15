import type { Configuration } from 'webpack';
import * as path from 'path';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const remoteUIConfig: Configuration = {
  mode: 'development',
  entry: './src/remote-ui/remote-ui.tsx',
  output: {
    path: path.resolve(__dirname, '.webpack/remote-ui'),
    filename: 'remote-ui.js',
    publicPath: '/'
  },
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  devtool: 'source-map'
};