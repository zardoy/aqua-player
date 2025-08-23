// TypeScript checking disabled to avoid React 19 compatibility issues
const webpack = require('webpack');

console.log('process.env.APP_VERSION', process.env.APP_VERSION);

module.exports = [
  new webpack.DefinePlugin({
    'process.env.APP_VERSION': JSON.stringify(process.env.APP_VERSION || ''),
  }),
];
