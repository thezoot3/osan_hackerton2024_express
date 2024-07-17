import Express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import inspect from './handler/inspect.js'
import cors from 'cors'
import map from './handler/map.js'
import cp from 'cookie-parser'
export function CheckPerformance(func: () => Promise<any>): Promise<[any, number]> {
    return new Promise((resolve, reject) => {
        const start = performance.now()
        try {
            func().then((result) => {
                const end = performance.now()
                resolve([result, end - start])
            })
        } catch (e) {
            reject(e)
        }
    })
}
const app = Express()
app.use(Express.json())
app.use(helmet())
app.use(cp())
app.use(morgan('dev'))
app.use(cors())
app.use('/inspect', inspect)
app.use('/map', map)
app.listen(80)
