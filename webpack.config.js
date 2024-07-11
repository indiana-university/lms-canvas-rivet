/* global __dirname */
const webpack = require('webpack')
const path = require('path')

const paths = {
  dest: path.join(__dirname, '/target/classes/META-INF/resources/jsrivet'),
  node: path.join(__dirname, '/node_modules')
}

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './public/app.js',
  output: {
      filename: 'empty.js',
      path: paths.dest
    },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: paths.node + '/rivet-core/js', to: paths.dest + '/rivet-core' },
        { from: paths.node + '/rivet-core/css', to: paths.dest + '/rivet-core' },
        { from: paths.node + '/rivet-icons/dist', to: paths.dest + '/rivet-icons' },
        { from: paths.node + '/rivet-stickers/dist', to: paths.dest + '/rivet-stickers' },
        { from: paths.node + '/rivet-clearable-input/dist/js/rivet-clearable-input.min.js', to: paths.dest + '/rivet-clearable-input' },
        { from: paths.node + '/rivet-clearable-input/dist/css/rivet-clearable-input.min.css', to: paths.dest + '/rivet-clearable-input' },
        { from: './public/scrolltotop', to: paths.dest + '/scrolltotop' },
        { from: './public/datatables-ext', to: paths.dest + '/datatables-ext' },
      ]
    }),
  ],
};