import { VertexAI } from '@google-cloud/vertexai'

const project: string = 'seda-389608'
const location: string = 'asia-northeast3'
export const vertexAI = new VertexAI({ project, location })
