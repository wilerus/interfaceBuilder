
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
        cache: true,
        devtool: TEST ? 'inline-source-map' : 'source-map',
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
            }]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': PRODUCTION ? '"production"' : '"development"',
                __DEV__: !PRODUCTION,
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            }),
            new ExtractTextPlugin({
                filename: UGLIFY ? cssFileNameMin : cssFileName
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new HtmlWebpackPlugin({
                template: pathResolver.source('index.html'),
                hash: PRODUCTION,
                filename: 'index.html',
                inject: 'body',
                minify: {
                    collapseWhitespace: false
                }
            }),
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

    if (!TEST) {
        webpackConfig.entry = ['babel-polyfill', pathResolver.source('index.js')];
        webpackConfig.output = {
            path: pathResolver.compiled(),
            filename: jsFileName,
            library: 'iBuild',
            libraryTarget: 'umd'
        };
        if (options.clean !== false) {
            webpackConfig.plugins.push(
                new CleanWebpackPlugin([ pathResolver.compiled() ], {
                    root: pathResolver.compiled(),
                    verbose: false,
                    exclude: ['localization']
                })
            );
        }
    }
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

        if (UGLIFY) {
            webpackConfig.plugins.push(
                new webpack.optimize.UglifyJsPlugin({
                    uglifyOptions: {
                        compress: {
                            warnings: true,
                            dead_code: true,
                            properties: true,
                            conditionals: true,
                            evaluate: true,
                            comparisons: true
                        }
                    },
                    sourceMap: true,
                    parallel: true,
                    output: {
                        comments: false
                    }
                }));
        }
    }

    return webpackConfig;
};
