const path = require('path');

module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      'test/unit/**/*.js',
      'src/**/*.js',
      {pattern: 'test/unit/data/*.zip', watched: false, included: false, served: true}
    ],

    preprocessors: {
      'src/**/*.js': ['webpack', 'sourcemap'],
      'test/**/*.js': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: path.resolve(__dirname, 'node_modules'),
            query: {
              plugins: ["transform-regenerator","transform-runtime"],
              presets: ['env']
            }
          },
          {
            test: /\.json$/,
            loader: 'json-loader',
          },
        ]
      },
      externals: {
      }
    },

    webpackServer: {
      noInfo: true
    },

    reporters: ['progress', 'istanbul'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: false
  })
}
