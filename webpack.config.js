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
        { from: paths.node + '/rivet-uits/js/rivet.min.js', to: paths.dest + '/rivet-bundle.min.js' },
        { from: paths.node + '/rivet-uits/css/rivet.min.css', to: paths.dest + '/rivet-bundle.min.css' },
        { from: paths.node + '/rivet-icons/dist/rivet-icons.svg', to: paths.dest + '/rivet-icons.svg' },
        { from: paths.node + '/rivet-icons/dist/rivet-icon-element.js', to: paths.dest + '/rivet-icon-element.js' },
        { from: paths.node + '/rivet-icons/dist/rivet-icons.css', to: paths.dest + '/rivet-icons.css' },
        { from: paths.node + '/rivet-icons/dist/rivet-icons.js', to: paths.dest + '/rivet-icons.js' },
        { from: paths.node + '/rivet-collapsible/dist/js/rivet-collapsible.min.js', to: paths.dest + '/rivet-collapsible.min.js' },
        { from: paths.node + '/rivet-collapsible/dist/css/rivet-collapsible.min.css', to: paths.dest + '/rivet-collapsible.min.css' },
        { from: paths.node + '/rivet-clearable-input/dist/js/rivet-clearable-input.min.js', to: paths.dest + '/rivet-clearable-input.min.js' },
        { from: paths.node + '/rivet-clearable-input/dist/css/rivet-clearable-input.min.css', to: paths.dest + '/rivet-clearable-input.min.css' },
      ]
    }),
  ],
};