import express from 'express'
import seller from '../mapData/seller.js'
import cloth from '../mapData/cloth.js'
const router = express.Router()
router.get('/sellers/abstract', async (req, res) => {
    const arr = seller.map((r) => {
        return {
            name: r.name,
            lat: r.lat,
            lng: r.lng,
        }
    })
    res.json(arr).status(200).end()
})
router.get('/sellers/:sellerId', async (req, res) => {
    const arr = seller.find((r) => {
        return r.name === req.params.sellerId
    })
    if (arr) {
        res.json(arr).status(200).end()
    } else {
        res.status(404).end()
    }
})
router.get('/cloth/abstract', async (req, res) => {
    const arr = cloth.map((r) => {
        return {
            name: r.name,
            lat: r.lat,
            lng: r.lng,
        }
    })
    res.json(arr).status(200).end()
})
export default router
