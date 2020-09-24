import vueAutoCreateRoute from './index'
const pluginName = 'autoCreateVueRouteWebpackPlugin'

export class AutoCreateVueRouteWebpackPlugin {
    private options: any
    private isWatch: any
    private watchOptions: any
    constructor(options, watchOptions?, isWatch = true) {
        this.options = options
        this.isWatch = isWatch
        this.watchOptions = watchOptions
    }
    apply(compiler) {
        compiler.hooks.beforeRun.tap(pluginName, compilation => {
            vueAutoCreateRoute(this.options, this.watchOptions, this.isWatch)
        })
    }
}

export default AutoCreateVueRouteWebpackPlugin