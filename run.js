require('ts-node/register')

const main = require('./src/index.ts').default
//tsconfig 帮助文档地址
//https://zhongsp.gitbooks.io/typescript-handbook/content/doc/handbook/tsconfig.json.html
//https://tslang.cn/docs/handbook/compiler-options.html+


main({ cwd: './src/examples' },null,false)