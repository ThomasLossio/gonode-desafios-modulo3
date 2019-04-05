const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')
    const user = await User.findById(req.userId)

    const purchase = await Purchase.create({
      ...req.body,
      interested: req.userId
    })

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.json(purchase)
  }

  async acceptPurchase (req, res) {
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { sold: true },
      {
        new: true
      }
    )

    const ad = await Ad.findByIdAndUpdate(
      purchase.ad,
      { purchasedBy: purchase.interested, sold: true },
      { new: true }
    )

    return res.json(purchase)
  }
}

module.exports = new PurchaseController()
