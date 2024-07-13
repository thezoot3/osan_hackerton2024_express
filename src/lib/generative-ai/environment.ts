import { GoogleGenerativeAI } from '@google/generative-ai'
import secret from '../../secret'

export const genAI = new GoogleGenerativeAI(secret)
