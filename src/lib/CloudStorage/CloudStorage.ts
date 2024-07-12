import { storage } from './environment.js'

export default class CloudStorage {
    bucketID: string | undefined
    bucket
    constructor(bucket: string) {
        this.bucketID = bucket
        this.bucket = storage.bucket(this.bucketID)
    }
    async isAvailable(fileDir: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const file = this.bucket.file(fileDir)
            file.exists({}, (err, exists) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(exists || false)
                }
            })
        })
    }
    getStorageURL(fileDir: string): string {
        return this.bucket.file(fileDir).cloudStorageURI.toString()
    }
    async upload(fileDir: string, fileData: Buffer) {
        return new Promise<void>((resolve, reject) => {
            this.bucket.file(fileDir).save(fileData, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
    async delete(fileDir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.bucket.file(fileDir).delete({}, (err, res) => {
                if (err || res?.statusCode.toString().startsWith('4')) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
}
