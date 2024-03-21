// ONLY Node.js dependencies at top.
// Keep dependencies to a minimum. Add dependencies if required for the functions you use.
const path = require('path')

/**
 * Support the latest stable webpack version by default.
 * Add support for older versions and conversions via "Helpers".
 */
function webpack() {
  return require('webpack')
}

/**
 * Minimizing
 * // const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // Archived. Use:
 * // https://github.com/webpack-contrib/terser-webpack-plugin
 * 
 * Webpack v5 comes with the latest terser-webpack-plugin out of the box.
 * If you are using Webpack v5 or above and wish to customize the options, you will still need to install terser-webpack-plugin.
 * Using Webpack v4, you have to install terser-webpack-plugin v4.
  */
function minimize() {
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
    },
    mustache: () => {
      const Mustache = require('mustache')
      return Mustache;
    },
    circularDependencyPlugin: () => {
      const CircularDependencyPlugin = require('circular-dependency-plugin')
      return CircularDependencyPlugin
    },
    terserPlugin: () => {
      const TerserPlugin = require('terser-webpack-plugin')
      return TerserPlugin
    },
    workboxWebpackPlugin: () => {
      const WorkboxPlugin = require('workbox-webpack-plugin');
      return WorkboxPlugin
    }
  }
}

/**
 * @see https://webpack.js.org/configuration/module/#rule
 */
const Rules = {
  /**
   * @deprecated THIS IS NO LONGER REQUIRED. IN-BUILT IN NEWER VERSIONS OF WEBPACK.
   */
  json: () => {
    // SEE DEPRECATION NOTICE.
  },
  /**
   * @see https://github.com/webpack-contrib/raw-loader
   */
  htmlString: () => {
    return {
      test: /\.html$/,
      // loaders: ['raw-loader']
      use: ['raw-loader']
    }
  },
  /**
   * @see https://github.com/gajus/to-string-loader
   * @see https://github.com/webpack-contrib/css-loader
   */
  cssString: () => {
    return {
      test: /\.css$/,
      use: [ // loaders: [
        'to-string-loader',
        'css-loader'
      ]
    }
  },
  /**
   * @see https://github.com/webpack-contrib/file-loader
   * The images will be emited to dist/.../components/assets/images/ folder
   */
  image: () => {
    const options = {
      name: '[name].[ext]',
      outputPath: 'components/assets/images/'
    }
    return {
      test: /\.(jpe?g|png|gif|svg)$/i,
      // loader: 'file-loader',
      // options
      use: [
        {
          loader: 'file-loader',
          options
        }
      ]
    }
  },
  common: () => {
    return [
      // Rules.json(),
      Rules.htmlString(),
      Rules.cssString(),
      Rules.image(),
    ]
  },
  styleLoader: () => {
    /**
     * @see https://www.npmjs.com/package/style-loader
     */
    const styleLoaderRecipes = {
      styles: {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      nonLazyStyles: {
        test: /\.css$/i,
        exclude: /\.lazy\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      lazyStyles: {
        test: /\.lazy\.css$/i,
        use: [
          { loader: "style-loader", options: { injectType: "lazyStyleTag" } },
          "css-loader",
        ],
      },
      allAsLazyStyles: {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader', options: { injectType: 'lazyStyleTag' }
          },
          'css-loader'
        ]
      }
    }
    return styleLoaderRecipes
  }
}

const CONSOLE_METHOD_GROUPS = {
  /**
   * Debug logs. Other logs SHOULD be shown / or handled in app.
   */
  DEBUG: ['console.debug'],
  /**
   * All trivial. For example console.log might be outputted by other library, so can't simply not use.
   */
  TRIVIAL: ['console.trace', 'console.log', 'console.info', 'console.trace'],
  /**
   * Not fatal.
   */
  NON_FATAL: ['console.trace', 'console.log', 'console.info', 'console.trace', 'console.warn']
}

const Constants = {
  CONSOLE_METHOD_GROUPS
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
 * 
 * Migration info:
 * v1 => v2/v3: https://webpack.js.org/migrate/3/
 * v3 => v4: https://webpack.js.org/migrate/4/
 * v4 => v5: https://github.com/webpack/changelog-v5/blob/master/MIGRATION%20GUIDE.md
 */
class Helpers {
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
  * @param {import('webpack').Configuration} config 
  */
  static modernizeConfig(config) {
    if (config.module && config.module.rules) {
      config.module.rules.forEach(Helpers.modernizeWebpackRule)
    }
  }

  /**
   * @see https://github.com/survivejs/webpack-merge
   * @param {Parameters<import('webpack-merge').merge>} args
   */
  static merge(...args) {
    const merge = require('webpack-merge').merge
    return merge(...args)
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
    // @ts-ignore
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
      // loader: 'babel-loader'
      use: 'babel-loader'
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
  /**
   * @param {string} html 
   */
  static htmlMinifier(html) {
    return getDependencies().htmlMinifier()(html.toString())
  }

/**
 * @typedef {Record<string, any>} MustacheData
 */

/**
 * @see https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/types/index.d.ts#L79
 * @param {{ from: string, transform?: (content: string) => string }} options TODO: Once imported, reference proper type: ObjectPattern
 * @param {MustacheData} data
 */
  static mustacheCopyWebpackPluginPattern(options, data) {
    return {
      from: options.from,
      transform: (/** @type {{ toString: () => string; }} */ content) => {
        const rendered = getDependencies().mustache().render(content.toString(), data)
        return options.transform ? options.transform(rendered) : rendered
      }
    }
  }

  /**
   * @param {RegExp} include /src/
   */
  static circularDependencyPlugin(include) {
    return new (getDependencies().circularDependencyPlugin())({
      /**
       * exclude detection of files based on a RegExp
       */
      exclude: /node_modules/,
      /**
       * include specific files based on a RegExp
       */
      include,
      /**
       * add errors to webpack instead of warnings
       */
      failOnError: true,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      /**
       * set the current working directory for displaying module paths
       */
      cwd: process.cwd(),
    })
  }

  /**
   * @see https://stackoverflow.com/a/60876651/1764521
   * @see https://github.com/terser/terser
   * @see https://zenn.dev/kalubi/articles/bc77cf71d1ffce Webpack 5
   * 
   * @param {string[]} [dropMethods] Custom method array or one of CONSOLE_METHOD_GROUPS.
   */
  static disableConsole(dropMethods = []) {
    const compress = {}
    if (dropMethods && dropMethods.length > 0) {
      // https://github.com/webpack-contrib/terser-webpack-plugin/issues/57#issuecomment-498549997
      // pure_funcs: ['console.info', 'console.debug', 'console.warn'] // Filter only these.
      compress.pure_funcs = dropMethods
    } else {
      compress.drop_console = true
    }

    const TerserPlugin = getDependencies().terserPlugin()
    const optimization = {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress
          }
        })
      ]
    }
    return optimization
  }

  /**
   * @see https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/
   * @see https://developer.chrome.com/docs/workbox/modules/workbox-recipes/
   */
  static workbox() {
    const WorkboxPlugin = getDependencies().workboxWebpackPlugin()
    return new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      /**
       * @see https://developer.chrome.com/docs/workbox/reference/workbox-webpack-plugin/
       * @see https://stackoverflow.com/a/53597107/1764521
       */
      runtimeCaching: [
        {
          urlPattern: ({ }) => { return true },
          handler: 'NetworkFirst',
          method: 'GET'
        }
      ],
      /**
       * Currently have 4MB img file.
       */
      maximumFileSizeToCacheInBytes: 1024 * 1024 * 10,
      //
    })
  }

  /**
   * @see https://stackoverflow.com/a/73627935/1764521
   * @example Helpers.merge(config, Recipes.es6Module())
   */
  static es6Module() {
    return {
      experiments: {
        outputModule: true,
      },
    
      output: {
        library: {
          type: "module",
        },
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
  /**
   * @see https://webpack.js.org/configuration/mode/
   */
  mode: () => {
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
  constants: Constants,
  Recipes: WebpackRecipes,
  Helpers,
  Rules,
  /**
   * @see https://webpack.js.org/concepts/plugins/
   * @see https://webpack.js.org/plugins/
   */
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
    /**
     * @see https://github.com/webpack-contrib/webpack-bundle-analyzer
     */
    bundleAnalyzer: () => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      return new BundleAnalyzerPlugin({
        analyzerMode: 'static'
      })
    }
  }
}

module.exports = WebpackHelpers
