import { GenerativeModel, Part } from '@google-cloud/vertexai'

export interface GeminiModel {
    instruction: string | undefined
    geminiModel: string | undefined
    generativeModel: GenerativeModel | undefined
    sendRequest(request: GeminiRequest): Promise<GeminiResponse>
}
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
