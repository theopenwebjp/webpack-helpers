const webpack = require('webpack')
const minify = require('html-minifier').minify
const csso = require('csso')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

// const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // Archived. Use:
// https://github.com/webpack-contrib/terser-webpack-plugin
const TerserPlugin = require('terser-webpack-plugin'); // Included with webpack 4.

const Rules = {
  json: () => {
    // THIS IS NO LONGER REQUIRED. IN-BUILT IN NEWER VERSIONS OF WEBPACK.
  },
  htmlString: () => {
    return {
      test: /\.html$/,
      loaders: [
        'raw-loader'
      ]
    }
  },
  cssString: () => {
    return {
      test: /\.css$/,
      loaders: [
        'to-string-loader',
        'css-loader'
      ]
    }
  },
  image: () => {
    return {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'components/assets/images/'
        // the images will be emited to dist/.../components/assets/images/ folder
      }
    }
  },
  common: () => {
    return [
      Rules.json(),
      Rules.htmlString(),
      Rules.cssString(),
      Rules.image(),
    ]
  }
}

/**
 * Gets webpack mode to use.
 * Uses NODE_ENV environment variable or falls back to 'development'.
 */
 const getWebpackMode = () => {
  const ALLOWED = ['production', 'development', 'none']
  const DEFAULT = 'development'
  const env = process.env.NODE_ENV || ''
  if (!ALLOWED.includes(env)) {
    console.warn(`Valid NODE_ENV value not found. NODE_ENV value is '${env}'. Will fall to default '${DEFAULT}'.`)
    return DEFAULT
  } else {
    return env
  }
}

class WebpackRecipes {
  /**
   * @param {string} dirname Currently required. SHOULD make unnecessary in the future.
   */
  static common(dirname) {
    const mode = WebpackRecipes.getWebpackMode()

    return /** @type { import('webpack').Configuration } */ ({
      mode,
      ...(mode === 'development' ? { devtool: "source-map" } : {}),
      output: WebpackRecipes.getCommonOutput(dirname),
      module: {
        rules: [
            ...Rules.common(),
        ]
      },
      plugins: [
        ...(mode === 'production' ? [
          new CleanWebpackPlugin()
      ] : []),
      ]
    })
  }

  static getWebpackMode() {
    return getWebpackMode()
  }

  /**
   * @param {string} dirname
   */
  static getCommonOutput(dirname) {
    return {
      path: path.resolve(dirname, 'dist'),
      filename: 'bundle.js'
    }
  }

  static tsLoader() {
    return {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }
  }

  static babelLoader() {
    return {
      test: /\.(js)$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }
  }

  static tsLoaderWithBabel(babelConfig = {}) {
    return {
      test: /\.(t|j)sx?$/,
      exclude: /node_modules/,
      use: [
        { loader: 'babel-loader', options: babelConfig },
        {
          loader: 'ts-loader',
          options: { transpileOnly: true }
        }
      ]
    }
  }

  static cssLoaders() {
    return {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }
  }

  /**
   * @param {('indexHTML'|'css'|'img'|'CHANGELOG')[]} patterns 
   * @returns 
   */
  static copyWebpackPluginPatterns(patterns = []) {
    /**
     * @typedef {{ toString: () => string }} Content
     */

    const map = {
      indexHTML: () => ({ from: 'index.html', transform: /** @param {Content} content */ (content) => minify(content.toString()) }), // { from: 'index.html' },
      css: () => ({ from: path.resolve(__dirname, 'css'), to: 'css', transform: /** @param {Content} content */ (content) => csso.minify(content.toString()).css }),
      img: () => ({ from: path.resolve(__dirname, 'img'), to: 'img' }),
      CHANGELOG: () => ({ from: path.resolve(__dirname, 'CHANGELOG.md') })
    }

    return patterns.map(pattern => map[pattern]())
  }

  static webpack4UglifyDropConsole() {
    return {
      optimization: {
        minimizer: [
          /*
          new UglifyJSPlugin({
            uglifyOptions: {
              compress: {
                drop_console: true
              },
              output: {
                comments: false
              }
            },
          }),
          */
         new TerserPlugin({
           terserOptions: {
             compress: {
               drop_console: true
             },
             output: {
               comments: false
             }
           }
         })
        ],
      }
    }
  }

  static webpack4ES6DropConsole() {
    return {
      optimization: {
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
              },
            },
          }),
        ],
      },
    }
  }
}

/**
 * Each function SHOULD be grouped.
 * mode: Is still allowed because of legacy dependencies.
 */
const WebpackHelpers = {
  mode: () => {
    // https://webpack.js.org/configuration/mode/
    /**
     * @param {string} currentValue 
     * @param {string} defaultValue 
     * @returns 
     */
    function setEnvironmentVariable(currentValue, defaultValue) {
      const aliases = {
        dev: 'development',
        prod: 'production'
      }
      const value = aliases[/** @type {keyof aliases} */ (currentValue)]
      if (value) {
        currentValue = value
      }
      if (!currentValue) {
        currentValue = defaultValue
      }
      return currentValue
    }

    console.log('Current process.env.NODE_ENV:', process.env.NODE_ENV) // TODO: Logs not going through. Is this NODE_ENV even going through consider NODE_ENV might just be local to that terminal.
    const mode = setEnvironmentVariable(process.env.NODE_ENV || '', 'production')
    console.log('Set mode:', mode)
    return mode
  },
  Recipes: WebpackRecipes,
  Rules,
  Plugins: {
    jquery: () => {
      // Use the ProvidePlugin constructor to inject jquery implicit globals
      return new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': "jquery'",
        'window.$': 'jquery'
      })
    },
    bundleAnalyzer: () => {
      // https://github.com/webpack-contrib/webpack-bundle-analyzer
      return new BundleAnalyzerPlugin({
        analyzerMode: 'static'
      })
    }
  }
}

module.exports = WebpackHelpers
