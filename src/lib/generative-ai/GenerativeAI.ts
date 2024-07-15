import { genAI } from './environment.js'
import { HarmCategory, HarmBlockThreshold, GenerativeModel, Part, GenerateContentResult } from '@google/generative-ai'
import { CheckPerformance } from '../../index.js'

export interface GeminiResponse {
    usedToken: number
    latency: number
    response: {
        text: string
    }
}

export default class GeminiFlash {
    constructor() {}
    geminiModel = 'gemini-1.5-flash'
    instruction: string | undefined
    sendRequest(fileBuffer: Buffer, mimeType: string, textPrompt: string): Promise<GeminiResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const generativeModel = genAI.getGenerativeModel({
                    model: this.geminiModel,
                    safetySettings: [
                        {
                            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                        },
                    ],
                    systemInstruction: this.instruction,
                })
                const image = {
                    inlineData: {
                        data: fileBuffer.toString('base64'),
                        mimeType: mimeType,
                    },
                }
                const [result, latency] = (await CheckPerformance(async () => {
                    return await generativeModel.generateContent([textPrompt, image])
                })) as [GenerateContentResult, number]
                const text = result.response.text()
                if (text.length > 0) {
                    resolve({
                        response: {
                            text: text,
                        },
                        latency,
                        usedToken: result.response.usageMetadata?.totalTokenCount || 0,
                    })
                } else {
                    reject(new Error('Something went wrong'))
                }
            } catch (e) {
                reject(e)
            }
        })
    }
}
