// // webpack v4
const path = require('path'),
    glob = require('glob-all'),
    JavaScriptObfuscator = require('webpack-obfuscator'),
    workboxPlugin = require('workbox-webpack-plugin'),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    CompressionPlugin = require("compression-webpack-plugin"),
    BundleTracker = require('webpack-bundle-tracker'),
    PurifyCSSPlugin = require('purifycss-webpack'),
    webpack = require('webpack');

const DIST_DIR = 'static/';

module.exports = [{
    entry: {
        ExampleSASSFile: './sass/example.scss',
        ExampleLESSFile: './sass/example.scss'
    },
    output: {
        path: path.resolve('./static/dist/css'),
        publicPath: "/static/dist/css/"
    },
    context: __dirname,
    node: {
        __dirname: false
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader"
                    },
                    //Include third party library scss files - like Material.io
                    {
                        loader: "sass-loader",
                        options: {
                            includePaths: ['./node_modules']
                        }
                    }]
            },
            // Check for local font files
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {}
                    }]
            },
            //Checks for less files
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: 'css-loader'},
                    {loader: 'less-loader'}
                ]
            }]
    },
    resolve: {
        extensions: ['.css', '.scss', '.less']
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[chunkhash].bundle.css",
            chunkFilename: "[name].css"
        }),
        //Treeshake CSS files and only include classes that you actually reference in js and html files.
        new PurifyCSSPlugin({
            // Give paths to parse for rules. These should be absolute!
            paths: glob.sync([
                path.join(__dirname, '**/*.html'),
                path.join(__dirname, '**/js/*.js'),
                path.join(__dirname, '/**/**/**/*.html'),
                path.join(__dirname, '**/*.html'),
                path.join(__dirname, '**/**/*.html')
            ]),
            minimize: true
        }),
        new BundleTracker({filename: 'webpack_css_stats.json'})
    ]
}];

module.exports.push({
    entry: {
        App: "./static/js/app.js"
    },
    optimization: {
        minimizer: [],
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial"
                }
            }
        }
    },
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve('./static/dist/'),
        publicPath: '/static/dist/',
        library: '[name]'
    },
    context: __dirname,
    node: {
        __dirname: false
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['env'],
                //Removes flow types
                plugins: ['transform-flow-comments']
            }
        }]
    },
    resolve: {
        modules: [
            'node_modules'
        ]
    },
    plugins: [
        new BundleTracker({filename: 'webpack_stats.json'}),
        new JavaScriptObfuscator({
            rotateUnicodeArray: true
        }),
        new CompressionPlugin({
            algorithm: 'gzip'
        }),
        new workboxPlugin.GenerateSW({
            globDirectory: DIST_DIR,
            globPatterns: ['/**/*.{js,css}'],
            swDest: './serviceWorker.js',
            clientsClaim: true,
            skipWaiting: true,
            exclude: [/\.(?:png|jpg|jpeg|svg)$/],
            runtimeCaching: [{
                // Match any request ends with .png, .jpg, .jpeg or .svg.
                urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
                // Apply a cache-first strategy.
                handler: 'cacheFirst',
                options: {
                    // Use a custom cache name.
                    cacheName: 'images',
                    // Only cache 10 images.
                    expiration: {
                        maxEntries: 10
                    }
                }
            }]
        })
    ]
});
