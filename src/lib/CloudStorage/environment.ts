import { Storage } from '@google-cloud/storage'

const storage = new Storage({
    projectId: 'seda-389608',
})

export const defaultBucket = 'semimi'

export { storage }
