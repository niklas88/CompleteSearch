const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: false,
    entry: {
        main: './static/js/base'
    },
    output: {
        path: path.join(__dirname, './static/js/dist/'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            __DEV__: 'true'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            _: 'underscore'
        })
    ],
    resolve: {
        extensions: ['*', '.js'],
        alias: {
            jquery: require.resolve('jquery')
        }
    },
    resolveLoader: {
        modules: [path.join(__dirname, './node_modules')]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader?presets[]=es2015',
                exclude: /(node_modules|vendor|libs|tests\/unit\/helpers)/,
                include: __dirname
            },
            {
                test: /\.jst$/,
                loader: 'underscore-template-loader'
            }
        ]
    }
};
