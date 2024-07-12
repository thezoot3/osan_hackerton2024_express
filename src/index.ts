import Express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import GeminiFlash from './lib/VertexAI/GeminiFlash.js'
import { GeminiRequest } from './lib/VertexAI/VertexAI.js'
import inspect from './handler/inspect.js'
import cors from 'cors'
import map from './handler/map.js'

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
app.use(morgan('dev'))
app.use(cors())
app.use('/inspect', inspect)
app.use('/map', map)
app.get('/', (req: Express.Request, res: Express.Response) => {
    const vertexAI = new GeminiFlash()
    vertexAI.instruction =
        '당신은 쓰레기 사진인 주어지는 이미지를 보고 이를 분석해 제공해야합니다. 출력값은 JSON 규격입니다. 출력값에는 쓰래기에 대한 데이터를 배열 형식으로 반환하여 모든 쓰레기에 대한 데이터를 분석해야합니다. 쓰레기에 대한 데이터 형식은 {"type":"쓰레기 종류","specific":"쓰레기 세부 종류","significant":["쓰레기의 특이 사항"]} 입니다. 쓰레기 종류는 "일반쓰레기", "대형쓰레기", "의류쓰레기"가 있으며, 대형쓰레기는 쇼파, 냉장고, 책상 등 일반적으로 버릴 수 없는 큰 쓰레기 종류이고, 의류쓰레기는 옷과 관련된 쓰레기, 일반쓰레기는 그 이외의 모든 쓰레기를 의미합니다. 일반쓰레기의 쓰레기 세부 종류에는 "플라스틱", "종이", "비닐" 이 있으며, 대형쓰레기의 쓰레기 세부 종류에는 "소파", "냉장고", "책상", "서랍장"이 있습니다. 쓰레기의 특이사항은 해당 쓰레기가 가지고 있는 특이사항으로 "오염됨"과 "부서짐", "라벨이 붙음"이 있습니다. 오염됨은 일반쓰레기에서 음식물이나 오염물이 뭍은 경우이며, 라벨이 붙음은 플라스틱 병에 라벨이 붙어있거나 택배 상자에 송장이 붙어 있는 경우를 의미합니다. 만약 두 가지 이상의 쓰레기 특이사항이 발견된 경우 배열에 넣어 모두 출력해야합니다. 만약 같은 세부 종류의 쓰레기가 있다면 한 번 이상 출력해서는 안됩니다.'
    const geminiRequest = new GeminiRequest()
        .addMedia('gs://semimi/images.jpg', 'image/jpeg')
        .addText('해당 이미지를 분석해주십시오')
    try {
        vertexAI.sendRequest(geminiRequest).then((r) => {
            res.json(JSON.stringify(r))
        })
    } catch (e) {
        console.log(e)
    }
})
app.listen(8080)
