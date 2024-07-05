import { GeminiModel, GeminiRequest, GeminiResponse, ParseGeminiRequest } from './VertexAI.js'
import { vertexAI } from './environment.js'
import { GenerateContentResult, GenerativeModel } from '@google-cloud/vertexai'
import { CheckPerformance } from '../../index.js'

export default class GeminiFlash implements GeminiModel {
    constructor() {
        this.generativeModel = vertexAI.getGenerativeModel({
            model: this.geminiModel,
        })
    }
    generativeModel: GenerativeModel
    geminiModel = 'gemini-1.5-flash-001'
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
                if (result.response.candidates && result.response.candidates.length > 0) {
                    const responseText = result.response.candidates[0].content.parts.find((item) => {
                        return !!item.text
                    })?.text
                    resolve({
                        response: {
                            text: responseText || '',
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
