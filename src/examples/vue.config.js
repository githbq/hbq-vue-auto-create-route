const { AutoCreateVueRouteWebpackPlugin } = require('../../build/plugin')

module.exports = {
    devServer: {
        open: true,
        host: '0.0.0.0',
        port: 8080,
    },
    configureWebpack: {
        plugins: [
            new AutoCreateVueRouteWebpackPlugin({cwd:__dirname})
        ] 
    }
} 