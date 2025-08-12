// TypeScript checking disabled to avoid React 19 compatibility issues
import webpack from 'webpack';

export const plugins = [
  new webpack.DefinePlugin({
    'process.env.APP_VERSION': JSON.stringify(process.env.APP_VERSION || ''),
  }),
];
