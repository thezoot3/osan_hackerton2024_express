import express from 'express'
import CloudStorage from '../lib/CloudStorage/CloudStorage.js'
import crypto from 'crypto'
import multer from 'multer'
import { defaultBucket } from '../lib/CloudStorage/environment.js'
import GeminiFlash from '../lib/VertexAI/GeminiFlash.js'
import { GeminiRequest } from '../lib/VertexAI/VertexAI.js'
import instruction from '../prompt/instruction.js'
import garbage from '../prompt/garbage.js'
const router = express.Router()
const uploadHandler = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
})
router.post('/upload', uploadHandler.single('image'), (req, res) => {
    if (req.file?.mimetype === 'image/jpeg') {
        const gs = new CloudStorage(defaultBucket)
        const fileName = crypto.randomBytes(12).toString('hex')
        gs.upload(fileName + '.jpg', req.file.buffer)
            .then(() => {
                res.status(201).json({ imageID: fileName }).end()
            })
            .catch((err) => {
                console.error(err)
                res.status(500).end()
            })
    } else {
        res.status(400).json({ error: 'Accept only jpeg' }).end()
    }
})
router.get('/prompt/:imageID', async (req, res) => {
    if (req.params.imageID) {
        const gs = new CloudStorage(defaultBucket)
        const fileDir = req.params.imageID + '.jpg'
        if (await gs.isAvailable(fileDir)) {
            try {
                const vertexAI = new GeminiFlash()
                vertexAI.instruction = instruction.instruction.join(' ')
                const url = gs.getStorageURL(fileDir)
                const aiRequest = new GeminiRequest()
                    .addText(instruction.bodyText.join(' '))
                    .addMedia(url, 'image/jpeg')
                const aiResponse = await vertexAI.sendRequest(aiRequest)
                console.log(aiResponse.response.text)
                const output = JSON.parse(aiResponse.response.text.replace('```json', '').replace('```', ''))
                if (output.length > 0) {
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
                } else {
                    res.status(500).end()
                    return
                }
            } catch (e) {
                res.status(500).end(e)
                return
            }
        }
        res.status(404).end()
        return
    }
    res.status(400).end()
    return
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
