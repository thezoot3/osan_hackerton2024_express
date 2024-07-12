import { Storage } from '@google-cloud/storage'

// @ts-ignore
const storage = new Storage({
    projectId: 'seda-389608',
    keyFilename: './seda-389608-e56fb5332d8c.json',
})

export const defaultBucket = 'semimi'

export { storage }
