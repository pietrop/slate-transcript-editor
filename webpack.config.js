// based on https://itnext.io/how-to-package-your-react-component-for-distribution-via-npm-d32d4bf71b4f
// and http://jasonwatmore.com/post/2018/04/14/react-npm-how-to-publish-a-react-component-to-npm
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    index: './src/index.js',
    SlateTranscriptEditor: './packages/components/index.js',
    timecodeConverter: './src/util/timecode-converter/index.js'
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  optimization: {
    minimize: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDevelopment ? '[name].css' : '[name].[hash].css',
      chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.module.(sa|sc|c)ss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: true, sourceMap: isDevelopment }
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: isDevelopment }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: isDevelopment }
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: isDevelopment }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, 'packages'),
        // TODO: because it uses entry point to determine graph of dependencies, might not be needed to exclude test ans sample files?
        exclude: /(node_modules|bower_components|build|dist|demo|.storybook)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-env', '@babel/preset-react' ]
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    }
  },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    }
  }
};
