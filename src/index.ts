const chokidar = require('chokidar')
const core = require('./core')

// 生产模式不监听
if (process.env.NODE_ENV !== 'production') {
  // usePolling 开启路径轮询扫描,对文件夹名称修改仍能触发监听 ; interval 轮询间隔毫秒时长
  chokidar.watch('src/**/meta.json', { usePolling: true, interval: 500 }).on('all', core.run)
} else {
  core.run()
}
