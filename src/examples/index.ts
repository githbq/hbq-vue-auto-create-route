import * as webpack from 'webpack'
import VueAutoCreateRoute from '../plugin'
import * as path from 'path'


webpack({
    context: __dirname,
    output: { path: path.join(__dirname, 'dist') },
    entry: path.join(__dirname, 'entry'),
    plugins: [
        new VueAutoCreateRoute({ cwd: __dirname }, null, false)
    ]
},
    (err, stats) => {
        // console.error(err)
        // console.log(stats)
    }
)