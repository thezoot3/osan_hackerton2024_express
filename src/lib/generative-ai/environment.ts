import { GoogleGenerativeAI } from '@google/generative-ai'
import secret from '../../secret.js'

export const genAI = new GoogleGenerativeAI(secret)
