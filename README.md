# vue-auto-create-route

> 智能识别 `vue` 项目页面结构，自动生成 vue routes 到 `@/router/temp.router.js`
> 根据 `@/src/pages/**/meta.json` 自动生成 vue routes

特点:

1. 自动递归识别生成目录层级，支持无限级
2. 结合导航组件自动生成菜单，支持无限级
3. 各路径权限单独配置，无需写成一个大文件
3. 修改页面路径直接修改文件夹名称即可
4. 自动对路径转中划线处理
5. 采用 `meta.json` 方式配置页面元信息实现更多定制化需求场景
6. 每个 `meta.json` 旁需要有 `index.vue` 才会视为可用路由，详见源码 `src/examples` 下目录结构示例
6. 监听 `src/pages` 目录下的 `meta.json` 文件变化自动重新创建路由
7. 支持 `webpackplugin` 方式使用
8. process.env.NODE_ENV 为 production 时，不会开启 watch 监听
9. 需要搭配固定根组件 `@/components/main` 作为各页面的框架组件

请保证有 `@/components/main.vue` 作为主框架容器组件，你的菜单组件可以在此应用

``` vue
<template>
  <div>
    <div>主框架页面组件</div>
    <router-view />
  </div>
</template>
```

请保证有 `@/components/empty-page-container.vue` 作为多层级页面承接容器组件

``` vue
// 空页面容器组件
<template>
  <router-view />
</template>
```

示例: meta.json

``` js
{
    "menu": { //自定义 示例，如果不需要展示主界面菜单上，则不配置 menu 项
        "title": "看板管理",
        "icon": "el-icon-s-help"
    },
    "index": 1, // 内置属性，非必须，用于干预页面路由生成的顺序
    "component": "@/components/empty-page-container.vue", //内置属性，非必须，手动改变页面对应的组件，通常不需要配置
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
        new AutoCreateVueRouteWebpackPlugin({ cwd: __dirname }, null, false)
    ]
},
    (err, stats) => {
        // console.error(err)
        // console.log(stats)
    }
)
```

注意事项：

1. 在根目录下 **.gitignore** 文件追加一行忽略匹配规则 `temp.*`
2. 在根目录下 **.eslintignore** 文件追加一行忽略匹配规则 `temp.*`

## 最终生成的 @/router/temp.route.js

你可以直接使用该文件读取对应的 `meta` 节点数据供导航菜单组件使用

``` 
export default [{
  path: '/home',
  component: () => import('@/components/main'),
  meta: {
    "menu": {
      "title": "home",
      "icon": "el-icon-s-help"
    },
    "yourCustom": "用户可以自定义任何属性",
    "index":1,
    "index_describe": "index属性决定生成的菜单顺序，非必填",
    "access": ["ADMIN", "USER VISITOR", "GUEST", "VISITOR"]
  },
  children: [{
    path: '/',
    name: 'home',
    component: () => import('@/pages/home'),
  }, ],
}]
```
