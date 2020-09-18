const pluginName = 'autoCreateVueRouteWebpackPlugin'

export default class ConsoleLogOnBuildWebpackPlugin {
    private options: any
    constructor(options) {
        this.options = options
    }
    apply(compiler) {
        compiler.hooks.beforeRun.tap(pluginName, compilation => {
            console.log('webpack 构建过程开始！')
            console.log(this.options)
        })
    }
}