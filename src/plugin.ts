import vueAutoCreateRoute from './index'
const pluginName = 'autoCreateVueRouteWebpackPlugin'
let first = true
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
        compiler.hooks.beforeCompile.tap(pluginName, compilation => { 
            if (first) {
                first = false
                vueAutoCreateRoute(this.options, this.watchOptions, this.isWatch)
            }
        })
    }
}

export default AutoCreateVueRouteWebpackPlugin