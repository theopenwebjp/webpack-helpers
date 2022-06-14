// ONLY Node.js dependencies at top.
// Keep dependencies to a minimum. Add dependencies if required for the functions you use.
const path = require('path')

function webpack() {
  return require('webpack')
}

function minimize() {
  // Minimizing
  // const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // Archived. Use:
  // https://github.com/webpack-contrib/terser-webpack-plugin
  /*
  Webpack v5 comes with the latest terser-webpack-plugin out of the box.
  If you are using Webpack v5 or above and wish to customize the options, you will still need to install terser-webpack-plugin.
  Using Webpack v4, you have to install terser-webpack-plugin v4.
  */
  const TerserPlugin = require('terser-webpack-plugin'); // Included with webpack 4.
  return TerserPlugin
}

/**
 * Get dependencies from here to prevent needing to install all.
 */
function getDependencies() {
  return {
    htmlMinifier: () => {
      const { minify } = require('html-minifier')
      return minify
    },
    csso: () => {
      const csso = require('csso')
      return csso
    }
  }
}

/**
 * @see https://webpack.js.org/configuration/module/#rule
 */
const Rules = {
  json: () => {
    // THIS IS NO LONGER REQUIRED. IN-BUILT IN NEWER VERSIONS OF WEBPACK.
  },
  /**
   * https://github.com/webpack-contrib/raw-loader
   */
  htmlString: () => {
    return {
      test: /\.html$/,
      loaders: [
        'raw-loader'
      ]
    }
  },
  /**
   * https://github.com/gajus/to-string-loader
   * https://github.com/webpack-contrib/css-loader
   */
  cssString: () => {
    return {
      test: /\.css$/,
      loaders: [
        'to-string-loader',
        'css-loader'
      ]
    }
  },
  /**
   * https://github.com/webpack-contrib/file-loader
   */
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

/**
 * General helpers for things like conversions.
 * Use "WebpackRecipes" for getting presets, etc.
 */
class Helpers {
  /*
  Migration info:
  v1 => v2/v3: https://webpack.js.org/migrate/3/
  v3 => v4: https://webpack.js.org/migrate/4/
  v4 => v5: https://github.com/webpack/changelog-v5/blob/master/MIGRATION%20GUIDE.md
  */

  /**
   * @param {(import('webpack').RuleSetRule) | "..." | any} rule 
   */
  static modernizeWebpackRule(rule) {
    if (rule.loaders) {
        rule.use = rule.loaders
        delete rule.loaders
    }
    if (rule.loader) {
        rule.use = {
            loader: rule.loader
        }
        delete rule.loader
        if (rule.options) {
            rule.use.options = rule.options
            delete rule.options
        }
    }
  }

  /**
  * 
  * @param {import('webpack').Configuration} config 
  */
  static modernizeConfig(config) {
    if (config.module && config.module.rules) {
      config.module.rules.forEach(Helpers.modernizeWebpackRule)
    }
  }
}

/**
 * Use "common" for default configuration. Example: .common(__dirname)
 */
class WebpackRecipes {
  /**
   * @example .common(__dirname) // If executing form root with webpack.config.js in root directory.
   * @param {string} dirname Currently required. SHOULD make unnecessary in the future.
   * @param {{ mode?: 'development'|'production' }} [options]
   */
  static common(dirname, options = {}) {
    const { CleanWebpackPlugin } = require('clean-webpack-plugin')
    const mode = options.mode || WebpackRecipes.getWebpackMode()

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
          // CleanWebpackPlugin can be replaced with output: { clean: true }
          // https://stackoverflow.com/a/66675975/1764521
          new CleanWebpackPlugin()
      ] : []),
      ]
    })
  }

  /**
   * @see https://webpack.js.org/configuration/mode/
   */
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
   * @param {string} dirname
   */
   static copyWebpackPluginPatterns(patterns = [], dirname) {
    /**
     * @typedef {{ toString: () => string }} Content
     */

    const map = {
      indexHTML: () => ({ from: 'index.html', transform: /** @param {Content} content */ (content) => getDependencies().htmlMinifier()(content.toString()) }), // { from: 'index.html' },
      css: () => ({ from: path.resolve(dirname, 'css'), to: 'css', transform: /** @param {Content} content */ (content) => getDependencies().csso().minify(content.toString()).css }),
      img: () => ({ from: path.resolve(dirname, 'img'), to: 'img' }),
      CHANGELOG: () => ({ from: path.resolve(dirname, 'CHANGELOG.md') })
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
         new (minimize())({
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
          new (minimize())({
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
 * 
 * For quick usage: Use the example:
 * @example module.exports = WebpackHelpers.Recipes.common(__dirname);
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
  Helpers,
  Rules,
  Plugins: {
    jquery: () => {
      // Use the ProvidePlugin constructor to inject jquery implicit globals
      return new (webpack()).ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': "jquery'",
        'window.$': 'jquery'
      })
    },
    bundleAnalyzer: () => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      // https://github.com/webpack-contrib/webpack-bundle-analyzer
      return new BundleAnalyzerPlugin({
        analyzerMode: 'static'
      })
    }
  }
}

module.exports = WebpackHelpers
