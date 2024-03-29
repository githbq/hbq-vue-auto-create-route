import * as globby from "globby";
import * as fs from "fs-extra";
import * as path from "path";
import { hyphen } from "naming-style";
import { js as beautify } from "js-beautify";
import * as throttle from "lodash.throttle";
import template from "./template";
import jsPrettyConfig from "./js-pretty.json";

let defaultLayoutComponent = "@/components/main";
const placeholders = {
  component: "##component##",
  layoutComponent: "##layoutComponent##",
  meta: "##meta##",
  children: "##children##",
  path: "##path##",
  customPath: "##customPath##",
  name: "##name##",
  fullPath: "##fullPath##",
  redirect: "##redirect##",
};
let pagesPath = "src/pages";
const replacePathSplitForCommon = (str) => str.replace(/\\/g, "/");
const replacePathSplit = (str) => replacePathSplitForCommon(str).replace(/\//g, path.sep);

const componentTemplates = {
  emptyComponent: `
{
    render(createElement) {
        return createElement('router-view')
    }
}
  `,
  dynamicImportComponent: (filePath) => `() => import('@/${replacePathSplitForCommon(filePath)}')`,
  defaultLayoutComponent: `() => import('${defaultLayoutComponent}')`,
};

const getEmptyNode = (routePath) => ({
  asEntry: false,
  routePath,
  metaJSON: {},
  level: routePath.split("/").length,
  component: componentTemplates.emptyComponent,
});

function offsetParentMetaJSONInfo(nodes) {
  const routeDic = {};
  const newNodes = [];
  nodes.forEach((node) => {
    const pathNodes = node.routePath.split("/");
    if (pathNodes <= 1) return;
    for (let i = 1; i < pathNodes.length; i++) {
      const subPath = pathNodes.slice(0, i).join("/");
      if (routeDic[subPath]) return;
      let findedNode = nodes.find((n) => n.routePath === subPath);
      if (!findedNode) {
        findedNode = getEmptyNode(subPath);
        newNodes.push(findedNode);
      }
      routeDic[subPath] = findedNode;
    }
  });
  nodes.splice(nodes.length, 0, ...newNodes);
}

async function getMetaInfos(cwd) {
  const dic = {};
  const list = [];
  let maxLevel = 0;
  const metaInfos = await globby([replacePathSplitForCommon(path.join(pagesPath, `**/meta.json`))], { cwd });
  const promises = metaInfos.map(async (n) => {
    n = replacePathSplit(n);
    let asEntry = false;
    const entryFilePath = replacePathSplit(path.join(cwd, path.dirname(n), "index.vue"));

    asEntry = await fs.pathExists(entryFilePath);

    const filePath = replacePathSplit(path.dirname(n)).replace(/^src(\/|\\)/, "");
    let tempPath = replacePathSplit(path.relative(pagesPath, n));

    tempPath = replacePathSplitForCommon(path.dirname(tempPath));
    const routePath =
      tempPath === "."
        ? "/"
        : tempPath
            .split("/")
            .map((m) => hyphen(m))
            .join("/");
    const level = routePath.length == 1 ? 1 : routePath.split("/").length;
    if (level > maxLevel) {
      maxLevel = level;
    }

    const metaJSONPath = path.resolve(cwd, n);
    const metaJSON = await fs.readJSON(metaJSONPath);

    let component = componentTemplates.dynamicImportComponent(filePath);
    if (!asEntry) {
      component = componentTemplates.emptyComponent;
    }

    dic[routePath] = {
      asEntry,
      filePath,
      routePath,
      metaJSON: metaJSON,
      level,
      component,
    };

    list.push(dic[routePath]);
  });
  await Promise.all(promises);
  list.forEach((n) => {
    if (n.metaJSON.index === undefined) {
      n.metaJSON.index = 99;
    }
  });
  list.sort((a, b) => a.metaJSON.index - b.metaJSON.index);
  list.forEach((n) => delete n.metaJSON.index);

  offsetParentMetaJSONInfo(list);
  console.log(list);
  return { list, maxLevel };
}

function makeTree(data, level = 1, prefix = "") {
  const roots = data.filter((n) => n.level === level && n.metaJSON.hidden !== true && n.routePath.indexOf(prefix) === 0);
  const others = data.filter((n) => n.level > level);

  roots.filter((n) => !data.some((m) => m.level > n.level && m.routePath.indexOf(n.routePath) === 0)).forEach((n) => (n.isLeaf = true));

  if (others.length > 0) {
    roots.forEach((n) => {
      n.children = makeTree(others, level + 1, n.routePath);
      n.children.forEach((m) => (m.parent = n));
    });
  }

  return roots;
}

function optionsToString(options) {
  options = options || {};
  let result = JSON.stringify(options);
  result = result.replace(/^{/, "");
  result = result.replace(/}$/, "");
  result = result ? `${result},` : "";
  return result;
}

function createRouteTemplate(tree) {
  let totalString = "";
  const templateStrs = [];
  tree.forEach((node) => {
    let templateStr = template.leafNode;
    const replaceTasks = [];
    if (node.level === 1 && node.isLeaf) {
      templateStr = template.singleParentNode;
    } else if (!node.isLeaf) {
      if (node.asEntry) {
        templateStr = template.parentWithEntryNode;
      } else {
        templateStr = template.parentNode;
      }
    }
    // 通用替换部分
    const metaInfo = node.metaJSON;

    replaceTasks.push({
      key: placeholders.meta,
      value: JSON.stringify(metaInfo),
    });
    const fullPath = `/${node.routePath.replace(/^\//, "")}`;
    replaceTasks.push({ key: placeholders.fullPath, value: fullPath });
    node.fullPath = fullPath;
    const name = metaInfo.name || `/${node.routePath.replace(/^\//, "")}`;
    replaceTasks.push({ key: placeholders.name, value: name });
    node.name = name;
    replaceTasks.push({ key: placeholders.component, value: node.component });

    replaceTasks.push({
      key: placeholders.redirect,
      value: optionsToString({
        redirect: metaInfo.redirect
          ? metaInfo.redirect
              .split("/")
              .map((n) => (!n ? n : hyphen(n)))
              .join("/")
          : undefined,
      }),
    });
    delete metaInfo.redirect;
    let layoutComponentTemplate = componentTemplates.defaultLayoutComponent;
    if (node.metaJSON.layoutComponent) {
      layoutComponentTemplate = componentTemplates.dynamicImportComponent(node.metaJSON.layoutComponent);
    } else if (node.parent) {
      layoutComponentTemplate = node.parent.component;
    }

    replaceTasks.push({
      key: placeholders.layoutComponent,
      value: layoutComponentTemplate,
    });

    replaceTasks.push({
      key: placeholders.customPath,
      value: (metaInfo.path || "").replace(/^\/+/, "") || "/",
    });

    delete metaInfo.path;

    delete node.metaJSON.layoutComponent;
    // 父节点部分
    if (!node.isLeaf || node.level === 1) {
      let children = "";
      if (!node.isLeaf) {
        children = createRouteTemplate(node.children);
      }
      replaceTasks.push({ key: placeholders.children, value: children });

      let routePath = node.routePath.split("/").pop();
      if (node.level === 1) {
        routePath = `/${node.routePath}`;
      }
      replaceTasks.push({
        key: placeholders.path,
        value: routePath.replace(/\/+/g, "/"),
      });
    }
    // 子节点部分
    if (node.isLeaf) {
      const routePath = node.routePath.split("/").pop();
      replaceTasks.push({ key: placeholders.path, value: routePath });
    }
    replaceTasks.forEach((task) => {
      templateStr = templateStr.replace(new RegExp(task.key, "g"), task.value);
    });
    templateStrs.push(templateStr);
  });
  totalString = templateStrs.filter((n) => !!n).join(",");

  return totalString;
}

function createMetaJSONTree(tree) {
  const metaJSONTree = [];
  tree.forEach((node) => {
    const newNode = {
      path: `/${node.routePath.replace(/^\//, "")}`,
      fullPath: node.fullPath,
      name: node.name,
      meta: node.metaJSON,
      children: undefined,
    };
    metaJSONTree.push(newNode);
    if (node.children && node.children.length > 0) {
      newNode.children = newNode.children || [];
      newNode.children = newNode.children.concat(createMetaJSONTree(node.children));
    }
  });
  return metaJSONTree;
}

const main = async (options, hideConsole) => {
  const { cwd, outputRouteFilePath, rootLayoutComponent, entryPath } = options || {};
  if (entryPath) {
    pagesPath = path.join("src", entryPath);
  }
  defaultLayoutComponent = rootLayoutComponent || defaultLayoutComponent;
  const newCwd = replacePathSplit(cwd || path.resolve("."));

  // 1.获取所有页面元信息
  const metaInfos = await getMetaInfos(newCwd);
  // 2.转换成树形
  const metaTree = makeTree(metaInfos.list);
  // 3.生成路由JS字符串
  const finalStr = createRouteTemplate(metaTree);
  // 4.生成metaJSON字符串
  const metaJSONTreeStr = JSON.stringify(createMetaJSONTree(metaTree));
  // 4.写入文件
  const tempRouteFilePath = outputRouteFilePath || path.join(newCwd, "src", "router", "temp.router.js");

  fs.removeSync(tempRouteFilePath);
  await fs.outputFile(
    tempRouteFilePath,
    beautify(
      `
    export default [${finalStr}];

    export const metaJSONTree = ${metaJSONTreeStr};
    `,
      jsPrettyConfig
    )
  );
  // 5.完成
  hideConsole === false && console.log("\n自动生成vue路由成功@", tempRouteFilePath, "\n");
};
export const run = throttle(main, 500, { leading: false, trailing: true });
