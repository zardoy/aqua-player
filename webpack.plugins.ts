// TypeScript checking disabled to avoid React 19 compatibility issues
import webpack from 'webpack';

console.log('process.env.APP_VERSION', process.env.APP_VERSION);

export const plugins = [
  new webpack.DefinePlugin({
    'process.env.APP_VERSION': JSON.stringify(process.env.APP_VERSION || ''),
  }),
];
