const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    cli: './packages/poml/cli.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      poml: path.resolve(__dirname, 'packages/poml'),
    }
  },
  externals: {
    'sharp': 'commonjs sharp',
    'pdf-parse': 'commonjs pdf-parse'
  },
  devtool: 'inline-source-map',
  target: 'node',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'python', 'poml', 'js')
  }
};
