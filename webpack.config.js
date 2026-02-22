var path = require('path');
// import path from 'path';


module.exports = {
// export default {

	
  devServer: {
	disableHostCheck: true,
  historyApiFallback: true,
  },

  entry: './src/client/index.js',

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [
    {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel',
      query:{
        presets: ["es2015", "react", "stage-0"]
      }
    },
    {
      test: /\.css$/,
      loader: 'style!css'
    }]
  }
};
