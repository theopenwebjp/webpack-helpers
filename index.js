const webpack = require('webpack')

const WebpackHelpers = {
    mode: () => {
        // https://webpack.js.org/configuration/mode/
        function setEnvironmentVariable(currentValue, defaultValue) {
            const aliases = {
                dev: 'development',
                prod: 'production'
            }
            if (aliases[currentValue]) {
                currentValue = aliases[currentValue]
            }
            if (!currentValue) {
                currentValue = defaultValue
            }
            return currentValue
        }

        console.log('Current process.env.NODE_ENV:', process.env.NODE_ENV) // TODO: Logs not going through. Is this NODE_ENV even going through consider NODE_ENV might just be local to that terminal.
        const mode = setEnvironmentVariable(process.env.NODE_ENV, 'production') // TODO: Use constants.
        console.log('Set mode:', mode)
        return mode
    },
    Rules: {
        json: () => {
            const {
                delimitedArrayToReadableStringMap
            } = (require('js-functions')).BaseUtility

            return {
                test: /messages\.json$/,
                loaders: [{
                    loader: 'content-loader',
                    options: {
                        /**
                         * @param {string} data
                         */
                        function: (data) => { // TODO: Name this as automatic way of setting keys.
                            /**
                             * @type {Object}
                             */
                            const object = JSON.parse(data)
                            const keys = Object.keys(object)
                            const map = delimitedArrayToReadableStringMap(keys, '-')
                            return JSON.stringify(map)
                        }
                    }
                }]
            }
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
        }
    },
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
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
                // https://github.com/webpack-contrib/webpack-bundle-analyzer
            return new BundleAnalyzerPlugin({
                analyzerMode: 'static'
            })
        }
    }
}

module.exports = WebpackHelpers