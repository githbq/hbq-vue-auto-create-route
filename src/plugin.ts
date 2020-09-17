const pluginName = 'autoCreateVueRouteWebpackPlugin'

class ConsoleLogOnBuildWebpackPlugin {
    apply(compiler) {
        compiler.hooks.run.tap(pluginName, compilation => {
            console.log('webpack 构建过程开始！')
        })
    }
}