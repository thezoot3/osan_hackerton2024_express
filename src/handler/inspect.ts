import express from 'express'
import multer from 'multer'
import GeminiFlash from '../lib/generative-ai/GenerativeAI.js'
import instruction from '../prompt/instruction.js'
import garbage from '../prompt/garbage.js'
import * as fs from 'node:fs/promises'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // 업로드 경로 설정
    },
    filename: (req, file, cb) => {
        const randomUUID = uuidv4() // 랜덤 UUID 생성
        const extension = file.mimetype.split('/')[1] // 확장자 추출
        cb(null, `${randomUUID}.webp`) // 파일 이름 생성 (UUID.확장자)
    },
})
const ml = multer({ storage })

router.post('/upload', ml.single('image'), async (req, res) => {
    if (req.file?.mimetype === 'image/webp') {
        res.status(201)
            .json({ imageID: req.file.filename.split('.')[0] })
            .end()
    } else {
        res.status(400).json({ error: 'Accept only webp' }).end()
    }
})
router.get('/prompt/:imageID', async (req, res) => {
    if (req.params.imageID) {
        try {
            const vertexAI = new GeminiFlash()
            vertexAI.instruction = instruction.instruction.join(' ')
            const buffer = await fs.readFile(`./uploads/${req.params.imageID}.webp`)
            const aiResponse = await vertexAI.sendRequest(buffer, 'image/webp', instruction.bodyText.join(' '))
            const output = JSON.parse(aiResponse.response.text.replace('```json', '').replace('```', ''))
            const returnArray = (output as Array<string>).map((i) => {
                if (garbage.itemTypes.includes(i)) {
                    const index = garbage.itemSpecific.findIndex((spe) => {
                        return spe.items.includes(i)
                    })
                    return garbage.itemSpecific[index].name
                }
            })
            res.json({ result: returnArray }).status(200).end()
            return
        } catch (e) {
            res.status(500).end()
            console.log(e)
            return
        }
    } else {
        res.status(404).end()
        return
    }
})
router.get('/item/:itemID', (req, res) => {
    if (garbage.itemTypes.includes(req.params.itemID)) {
        const index = garbage.itemSpecific.findIndex((i) => {
            return i.items.includes(req.params.itemID)
        })
        res.json(garbage.itemSpecific[index]).status(200).end()
    }
})
export default router
