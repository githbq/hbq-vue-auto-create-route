import * as  globby from 'globby'
import * as  fs from 'fs-extra'
import * as  path from 'path'
import { hyphen } from 'naming-style'
import { js as beautify } from 'js-beautify'
import * as  throttle from 'lodash.throttle'
import template from './template'


const defaultComponent = '@/components/main'
const placeholders = {
  component: '##component##',
  meta: '##meta##',
  children: '##children##',
  path: '##path##',
  name: '##name##',
  filePath: '##filePath##',
}

function replacePathSplit(dir) {
  return (dir || '').replace(/\\/g, '/')
}

async function getMetaInfos(cwd) {
  const pagesPath = 'src/pages'
  const dic = {}
  const list = []
  let maxLevel = 0
  const metaInfos = await globby([path.join(pagesPath, `**/meta.json`), '!**/components/**/*'], { cwd })
  const promises = metaInfos.map(async n => {
    n = replacePathSplit(n)
    let asEntry = false
    const entryFilePath = replacePathSplit(path.resolve(path.dirname(n), 'index.vue'))
    asEntry = await fs.pathExists(entryFilePath)
    const filePath = replacePathSplit(path.dirname(n)).replace(/^src\//, '')
    let tempPath = replacePathSplit(path.relative(pagesPath, n))

    tempPath = replacePathSplit(path.dirname(tempPath))
    const routePath = tempPath.split('/').map(m => hyphen(m)).join('/')
    const level = routePath.split('/').length
    if (level > maxLevel) {
      maxLevel = level
    }

    const metaJSONPath = path.resolve(cwd, n)
    const metaJSON = await fs.readJSON(metaJSONPath)

    dic[routePath] = { asEntry, filePath, routePath, metaJSON: metaJSON, level: routePath.split('/').length }
    list.push(dic[routePath])
  })
  await Promise.all(promises)
  list.forEach(n => {
    if (n.metaJSON.index === undefined) {
      n.metaJSON.index = 99
    }
  })
  list.sort((a, b) => a.metaJSON.index - b.metaJSON.index)
  list.forEach(n => delete n.metaJSON.index)
  return { dic, list, maxLevel }
}

function makeTree(data, level = 1, prefix = '') {
  const roots = data.filter(n => n.level === level && n.metaJSON.hidden !== true && n.routePath.indexOf(prefix) === 0)
  const others = data.filter(n => n.level > level)
  if (others.length > 0) {
    roots.forEach(n => {
      n.children = makeTree(others, level + 1, n.routePath)
    })
  }
  return roots
}

function createRouteTemplate(tree) {
  let totalString = ''
  const templateStrs = []
  tree.forEach(node => {
    let isParent = false
    let templateStr = template.node
    const hasChildren = node.children && node.children.length > 0
    const replaceTasks = []
    if (node.level === 1 && !hasChildren) {
      templateStr = template.singleParentNode
    } else if (hasChildren) {
      templateStr = node.asEntry ? template.parentWithEntryNode : template.parentNode
      isParent = true
    }
    // 通用替换部分
    const metaInfo = node.metaJSON

    replaceTasks.push({ key: placeholders.meta, value: JSON.stringify(metaInfo) })
    replaceTasks.push({ key: placeholders.filePath, value: node.filePath })
    replaceTasks.push({ key: placeholders.name, value: node.routePath })

    const componentPath = node.metaJSON.component || defaultComponent
    replaceTasks.push({ key: placeholders.component, value: componentPath })
    delete node.metaJSON.componentPath
    // 父节点部分
    if (isParent || node.level === 1) {
      let children = ''
      if (hasChildren) {
        children = createRouteTemplate(node.children)
      }
      replaceTasks.push({ key: placeholders.children, value: children })

      let routePath = node.routePath.split('/').pop()
      if (node.level === 1) {
        routePath = `/${node.routePath}`
      }
      replaceTasks.push({ key: placeholders.path, value: routePath })
    }
    // 子节点部分
    if (!isParent) {
      const routePath = node.routePath.split('/').pop()
      replaceTasks.push({ key: placeholders.path, value: routePath })
    }
    replaceTasks.forEach(task => {
      templateStr = templateStr.replace(new RegExp(task.key, 'g'), task.value)
    })
    templateStrs.push(templateStr)
  })
  totalString = templateStrs.filter(n => !!n).join(',')

  return totalString
}


const main = async ({ cwd, outputRouteFilePath }, hideConsole) => {
  let newCwd = replacePathSplit(cwd || path.resolve('.'))
  // 1.获取所有页面元信息
  const metaInfos = await getMetaInfos(newCwd)
  // 2.转换成树形
  const metaTree = makeTree(metaInfos.list)
  // 3.生成路由JS字符串
  const finalStr = createRouteTemplate(metaTree)
  // 4.写入文件
  const tempRouteFilePath = outputRouteFilePath || path.join(cwd, 'src', 'router', 'temp.router.js')
  await fs.outputFile(
    tempRouteFilePath,
    beautify(`export default [${finalStr}]`, { indent_size: 2, space_in_empty_paren: true }),
  )
  // 5.完成
  !hideConsole && console.log('\n自动生成vue路由成功@', tempRouteFilePath, '\n')
}
export const run = throttle(main, 100, {leading: true, trailing: false}) 
