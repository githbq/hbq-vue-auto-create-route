import * as chokidar from "chokidar";
import * as path from "path";
import * as core from "./core";
const replacePathSplit = (str) => str.replace(/\\/g, "/");

export default (options?, watchOptions?, isWatch = true) => {
  const newOptions = { ...options };
  const run = core.run.bind(null, newOptions, newOptions.hideConsole);
  // 生产模式不监听
  if (isWatch && process.env.NODE_ENV !== "production") {
    // 先执行一遍，以防止没有meta.json时没有走下方的监控事件
    run();
    // usePolling 开启路径轮询扫描,对文件夹名称修改仍能触发监听 ; interval 轮询间隔毫秒时长
    chokidar
      .watch(
        replacePathSplit(path.join(newOptions.cwd || ".", "**/meta.json")),
        {
          usePolling: true,
          interval: 500,
          ignored: "**/node_modules/**/*",
          ...watchOptions,
        }
      )
      .on("all", run);
  } else {
    run();
  }
};
