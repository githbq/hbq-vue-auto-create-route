const chokidar = require('chokidar')
const core = require('./core')
const replacePathSplit = (str) => str.replace(/\\/g, '')

export default (options, watchOptions, isWatch) => {
  const newOptions = { ...options }
  const run = core.run.bind(null, newOptions, newOptions.hideConsole)
  // 生产模式不监听
  if (isWatch && process.env.NODE_ENV !== 'production') {
    // usePolling 开启路径轮询扫描,对文件夹名称修改仍能触发监听 ; interval 轮询间隔毫秒时长
    chokidar.watch(replacePathSplit(path.join(newOptions.cwd || '.', '**/meta.json')), {
      usePolling: true,
      interval: 500,
      ignored: '**/node_modules/**/*',
      ...watchOptions
    }).on('all', run)
  } else {
    run()
  }
} 
