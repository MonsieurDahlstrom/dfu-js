const path = require('path');

module.exports = function(config) {
  config.set({

    basePath: '',

    browsers: ['ChromeHeadless_BLE'],
    customLaunchers: {
     ChromeHeadless_BLE: {
       base: 'ChromeHeadless',
       flags: ['--enable-experimental-web-platform-features']
     }
    },

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      'spec/specs/**/*.js',
      'src/**/*.js',
      {pattern: 'spec/data/*.zip', watched: false, included: false, served: true}
    ],

    preprocessors: {
      'src/**/*.js': ['webpack', 'sourcemap'],
      'spec/specs/**/*.js': ['webpack', 'sourcemap']
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
