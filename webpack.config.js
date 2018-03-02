
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const jsFileName = 'iBuild.js';
const jsFileNameMin = 'iBuild.min.js';
const cssFileName = 'iBuild.css';
const cssFileNameMin = 'iBuild.min.css';

const pathResolver = {
    source() {
        return path.resolve.apply(path.resolve, [__dirname, 'src'].concat(Array.from(arguments)));
    },
    node_modules() {
        return path.resolve.apply(path.resolve, [__dirname, 'node_modules']);
    },
    tests() {
        return path.resolve.apply(path.resolve, [__dirname, 'tests']);
    },
    compiled() {
        return path.resolve.apply(path.resolve, [__dirname, 'dist']);
    }
};

module.exports = (options = { env: 'production' }) => {
    const PRODUCTION = options.env === 'production';
    const TEST_COVERAGE = options.env === 'test-coverage';
    const TEST = options.env === 'test' || TEST_COVERAGE;
    const UGLIFY = options.uglify || false;

    const FONT_LIMIT = PRODUCTION ? 10000 : 1000000;
    const GRAPHICS_LIMIT = PRODUCTION ? 10000 : 1000000;

    const webpackConfig = {
        mode: 'development',
        cache: true,
        devtool: TEST ? 'inline-source-map' : 'source-map',
        entry: ['babel-polyfill', pathResolver.source('index.js')],
        output: {
            path: pathResolver.compiled(),
            filename: jsFileName,
            library: 'iBuild',
            libraryTarget: 'umd'
        },
        module: {
            rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: [
                    pathResolver.node_modules()
                ],
                options: {
                    presets: ['flow', 'env']
                }
            }, {
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: [
                    pathResolver.compiled(),
                    pathResolver.node_modules(),
                    pathResolver.tests()
                ],
                options: {
                    failOnError: true
                }
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader'
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            plugins: () => {
                                const plugins = [
                                    autoprefixer({
                                        browsers: ['last 2 versions']
                                    })];
                                if (UGLIFY) {
                                    plugins.push(cssnano({
                                        preset: ['default', {
                                            discardComments: {
                                                removeAll: true
                                            }
                                        }]
                                    }));
                                }
                                return plugins;
                            }
                        }
                    }]
                })
            }, {
                test: /\.html$/,
                loader: 'html-loader'
            }, {
                test: /\.woff(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    prefix: 'fonts/',
                    name: '[path][name].[ext]',
                    limit: FONT_LIMIT,
                    mimetype: 'application/font-woff'
                }
            }, {
                test: /\.eot(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    prefix: 'fonts/',
                    name: '[path][name].[ext]',
                    limit: FONT_LIMIT,
                    mimetype: 'application/font-eot'
                }
            }, {
                test: /\.ttf(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    prefix: 'fonts/',
                    name: '[path][name].[ext]',
                    limit: FONT_LIMIT,
                    mimetype: 'application/font-ttf'
                }
            }, {
                test: /\.woff2(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    prefix: 'fonts/',
                    name: '[path][name].[ext]',
                    limit: FONT_LIMIT,
                    mimetype: 'application/font-woff2'
                }
            }, {
                test: /\.otf(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    prefix: 'fonts/',
                    name: '[path][name].[ext]',
                    limit: FONT_LIMIT,
                    mimetype: 'font/opentype'
                }
            }, {
                test: /\.svg(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    prefix: 'fonts/',
                    name: '[path][name].[ext]',
                    limit: GRAPHICS_LIMIT,
                    mimetype: 'image/svg+xml'
                }
            }, {
                test: /\.(png|jpg)$/,
                loader: 'url-loader',
                options: {
                    limit: GRAPHICS_LIMIT,
                }
            }, {
                test: /\.vue$/,
                loader: 'vue-loader'
            }]
        },
        plugins: [
            new ExtractTextPlugin({
                filename: UGLIFY ? cssFileNameMin : cssFileName
            }),
            new HtmlWebpackPlugin({
                template: pathResolver.source('index.html'),
                hash: PRODUCTION,
                filename: 'index.html',
                inject: 'body',
                minify: {
                    collapseWhitespace: false
                }
            }),
            new CleanWebpackPlugin([ pathResolver.compiled() ], {
                root: pathResolver.compiled(),
                verbose: false,
                exclude: ['localization']
            })
        ],
        resolve: {
            modules: [
                pathResolver.source(),
                pathResolver.node_modules()
            ],
            alias: {
                vue$: 'vue/dist/vue.esm.js'
            }
        },
        devServer: {
            noInfo: true,
            stats: 'minimal',
            port: 3210,
            watchContentBase: true
        }
    };

    if (TEST_COVERAGE) {
        webpackConfig.module.rules.push({
            test: /\.js$|\.jsx$/,
            enforce: 'post',
            exclude: [
                pathResolver.tests(),
                pathResolver.node_modules()
            ],
            use: {
                loader: 'istanbul-instrumenter-loader',
                options: { esModules: true }
            },
        });
    }

    if (PRODUCTION) {
        webpackConfig.output.filename = UGLIFY ? jsFileNameMin : jsFileName;
        webpackConfig.devtool = 'source-map';

        webpackConfig.plugins.push(
            new webpack.optimize.OccurrenceOrderPlugin()
        );
    }

    return webpackConfig;
};
