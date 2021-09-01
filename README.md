# vue-auto-create-route

> 根据 `@/src/pages/**/meta.json` 作为路由特征,智能识别 `vue` 项目页面结构，自动生成 vue routes 到 `@/router/temp.router.js`
 


> 2021-02-27 更新，支持多层级父组件模块自动继承嵌套，详见 `src/examples` 示例，`npm run examples` 运行查看效果 (需要在src/examples/下装包)

> 2021-3-30 更新，只要叶子节点有 `meta.json` 父路径会自动补全，详见 `src/examples`

> 2021-9-1 更新，支持自定义页面入口目录对应参数: `entryPath`,示例: `new AutoCreateVueRouteWebpackPlugin({entryPath:'views'})` (以当前工程的 `./src` 为根目录,定义为 `./src/view`)

特点:

1. 实现工程路由以约定大于配置哲学进行定义
1. 自动递归识别生成目录层级，支持无限级
2. 结合导航组件自动生成菜单，支持无限级
3. 支持各路径权限单独配置，无需写成一个大文件
4. 修改页面路径直接修改文件夹名称即可
5. 自动对路径转中划线处理
6. 采用 `meta.json` 方式配置页面元信息实现更多定制化需求场景
7. 每个 `meta.json` 旁需要有 `index.vue` 才会视为可用路由，详见源码 `src/examples` 下目录结构示例
8. 监听 `src/pages` 目录下的 `meta.json` 文件变化自动重新创建路由
9. 支持 `webpackplugin` 方式使用
10. process.env.NODE_ENV 为 production 时，不会开启 watch 监听
11. 需要搭配固定根组件 `@/components/main` 作为各页面的框架组件

请保证有 `@/components/main.vue` 作为主框架容器组件，你的菜单组件可以在此应用

``` vue
<template>
  <div>
    <div>主框架页面组件</div>
    <router-view />
  </div>
</template>
``` 

示例: meta.json

``` js
{
    "name": "you custom name", // 内置属性，非必须，可以覆盖默认生成的路由名 
    "path":":a/:b", // 内置属性，非必须，可以用来支持路径参数，如：/page1/:a/:b ,参数 this.$route.params.a 取值 
    "redirect":"default-child", //内置属性，非必须，父页面可以设置redirect定义默认子页面     -
    "menu": { //自定义 示例，如果不需要展示主界面菜单上，则不配置 menu 项
        "title": "看板",
        "icon": "el-icon-s-help"
    },
    "index": 1, // 内置属性，非必须，用于干预页面路由生成的顺序
    "layoutComponent": "@/components/[other-layout-component]", //内置属性，非必须，手动改变页面对应的容器组件，通常不需要配置
    "access": [ //自定义 示例，用于页面权限定义
        "ADMIN",
        "USER VISITOR",
        "GUEST",
        "VISITOR"
    ]
}
```

# 使用

## 直接使用

``` js
 ...ts
 import AutoCreateVueRouteWebpackPlugin from 'vue-auto-create-route'
 // 在任意文件中执行
 AutoCreateVueRouteWebpackPlugin()
     ...
```

## webpack plugin 模式使用

``` ts
import * as webpack from 'webpack'
import AutoCreateVueRouteWebpackPlugin from 'vue-auto-create-route/build/plugin'
import * as path from 'path'

webpack({
    context: __dirname,
    output: { path: path.join(__dirname, 'dist') },
    entry: path.join(__dirname, 'entry'),
    plugins: [
        // 可省略，第一个参数 cwd, outputRouteFilePath, rootLayoutComponent
        // 可省略，第二个参数监听选项 chokidar watchOptions
        // 可省略，第三个参数代表是否watch实时生成，process.env.NODE_ENV为production时强制不监听
        // new AutoCreateVueRouteWebpackPlugin({ cwd: __dirname }, null, true) 
        new AutoCreateVueRouteWebpackPlugin() 
    ]
},
    (err, stats) => {
        // console.error(err)
        // console.log(stats)
    }
)
```

## vue.config.js @2.0

```js
const AutoCreateVueRouteWebpackPlugin = require("vue-auto-create-route/build/plugin").default;
module.exports = {
  configureWebpack: {
    plugins: [new AutoCreateVueRouteWebpackPlugin()],
  },
};

```

## vue.config.js @3.0

```js
const AutoCreateVueRouteWebpackPlugin = require("vue-auto-create-route/build/plugin").default;
module.exports = {
  configureWebpack: {
    plugins: [new AutoCreateVueRouteWebpackPlugin({entryPath:'views'})],
  },
};

```


注意事项：

1. 在根目录下 **.gitignore** 文件追加一行忽略匹配规则 `temp.*`
2. 在根目录下 **.eslintignore** 文件追加一行忽略匹配规则 `temp.*`

## 最终生成的 @/router/temp.route.js

你可以直接使用该文件读取对应的 `meta` 节点数据供导航菜单组件使用

``` javascript
export default [{
        path: '/',
        component: () => import('@/components/main'),
        children: [{
            path: '/',
            "redirect": "parent",
            name: '/',
            fullPath: '/',
            component: {
                render(createElement) {
                    return createElement('router-view')
                }
            },
            meta: {
                "redirect": "parent",
                "menu": {
                    "title": "home",
                    "icon": "el-icon-s-help"
                },
                "yourCustom": "用户可以自定义任何属性",
                "index_describe": "index属性决定生成的菜单顺序，非必填",
                "access": ["ADMIN", "USER VISITOR", "GUEST", "VISITOR"]
            },
        }, ],
    },
    {
        path: '/parent',
        "redirect": "son-2",
        component: () => import('@/components/main'),
        children: [{
                path: '/',
                "redirect": "son-2",
                name: '/parent',
                fullPath: '/parent',
                component: {
                    render(createElement) {
                        return createElement('router-view')
                    }
                },
                meta: {
                    "redirect": "son2",
                    "menu": {
                        "title": "parent",
                        "icon": "el-icon-s-help"
                    },
                    "yourCustom": "用户可以自定义任何属性",
                    "index_describe": "index属性决定生成的菜单顺序，非必填",
                    "access": ["ADMIN", "USER VISITOR", "GUEST", "VISITOR"]
                },
            },

            {
                path: 'son-2',
                "redirect": "son2-1/xx/yyy",
                component: {
                    render(createElement) {
                        return createElement('router-view')
                    }
                },
                children: [{
                        path: '/',
                        "redirect": "son2-1/xx/yyy",
                        name: '/parent/son-2',
                        fullPath: '/parent/son-2',
                        component: {
                            render(createElement) {
                                return createElement('router-view')
                            }
                        },
                        meta: {
                            "redirect": "son2-1/xx/yyy",
                            "menu": {
                                "title": "son2",
                                "icon": "el-icon-s-help"
                            }
                        },
                    },

                    {
                        path: 'son2-1',
                        component: {
                            render(createElement) {
                                return createElement('router-view')
                            }
                        },
                        children: [{
                            path: ':a/:b',
                            name: 'mycustom-name',
                            fullPath: '/parent/son-2/son2-1',
                            component: () => import('@/pages/parent/son2/son2-1'),
                            meta: {
                                "name": "mycustom-name",
                                "path": ":a/:b",
                                "menu": {
                                    "title": "son2-1",
                                    "icon": "el-icon-s-help"
                                }
                            },
                        }, ],
                    }

                ],
            }

        ],
    }
];

export const metaJSONTree = [{
    "path": "/",
    "fullPath": "/",
    "name": "/",
    "meta": {
        "menu": {
            "title": "home",
            "icon": "el-icon-s-help"
        },
        "yourCustom": "用户可以自定义任何属性",
        "index_describe": "index属性决定生成的菜单顺序，非必填",
        "access": ["ADMIN", "USER VISITOR", "GUEST", "VISITOR"]
    }
}, {
    "path": "/parent",
    "fullPath": "/parent",
    "name": "/parent",
    "meta": {
        "menu": {
            "title": "parent",
            "icon": "el-icon-s-help"
        },
        "yourCustom": "用户可以自定义任何属性",
        "index_describe": "index属性决定生成的菜单顺序，非必填",
        "access": ["ADMIN", "USER VISITOR", "GUEST", "VISITOR"]
    },
    "children": [{
        "path": "/parent/son-2",
        "fullPath": "/parent/son-2",
        "name": "/parent/son-2",
        "meta": {
            "menu": {
                "title": "son2",
                "icon": "el-icon-s-help"
            }
        },
        "children": [{
            "path": "/parent/son-2/son2-1",
            "fullPath": "/parent/son-2/son2-1",
            "name": "mycustom-name",
            "meta": {
                "name": "mycustom-name",
                "menu": {
                    "title": "son2-1",
                    "icon": "el-icon-s-help"
                }
            }
        }]
    }]
}];
```
