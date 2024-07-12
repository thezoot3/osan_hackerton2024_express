import { VertexAI } from '@google-cloud/vertexai'

const project: string = 'seda-389608'
const location: string = 'asia-northeast3'
export const vertexAI = new VertexAI({
    project,
    location,
    googleAuthOptions: { keyFilename: './seda-389608-e56fb5332d8c.json' },
})
