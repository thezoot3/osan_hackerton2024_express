import { genAI } from './environment'
import { HarmCategory, HarmBlockThreshold, GenerativeModel, Part, GenerateContentResult } from '@google/generative-ai'
import { CheckPerformance } from '../../index'

export type GeminiRequestMineType = 'image/jpeg' | 'image/png' | 'image/webp'
export class GeminiRequest {
    partList: any[]
    constructor() {
        this.partList = []
    }
    addMedia(url: string, mimeType: GeminiRequestMineType) {
        this.partList.push({
            fileUri: url,
            mimeType: mimeType,
        })
        return this
    }
    addText(text: string) {
        this.partList.push({ text })
        return this
    }
}
export interface GeminiResponse {
    usedToken: number
    latency: number
    response: {
        text: string
    }
}
export function ParseGeminiRequest(req: GeminiRequest): Array<Part> {
    return req.partList.map((item) => {
        if ('fileUri' in item) {
            return {
                fileData: item,
            }
        } else {
            return item
        }
    })
}

export default class GeminiFlash {
    constructor() {
        this.generativeModel = genAI.getGenerativeModel({
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
                    category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
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
    }
    generativeModel: GenerativeModel
    geminiModel = 'gemini-1.5-flash'
    instruction: string | undefined
    sendRequest(request: GeminiRequest): Promise<GeminiResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const [result, latency] = (await CheckPerformance(async () => {
                    return this.generativeModel.generateContent({
                        contents: [{ role: 'user', parts: ParseGeminiRequest(request) }],
                        systemInstruction: this.instruction,
                    })
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
