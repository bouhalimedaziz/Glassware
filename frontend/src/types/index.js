// TypeScript interfaces converted to JSDoc comments for reference
// These define the data structures used throughout the app

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} handle
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {string} image
 * @property {string[]} images
 * @property {string} category
 * @property {string} collection
 * @property {number} rating
 * @property {number} reviews
 * @property {Variant[]} variants
 * @property {boolean} [isFeatured]
 * @property {Review[]} [productReviews]
 * @property {string[]} [wishlistedBy]
 */

/**
 * @typedef {Object} Variant
 * @property {string} id
 * @property {string} option1
 * @property {string} [option2]
 */

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {string} variantId
 * @property {number} quantity
 */

/**
 * @typedef {Object} Cart
 * @property {CartItem[]} items
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar]
 * @property {string} [phone]
 * @property {CardInfo} [cardInfo]
 * @property {Order[]} [orders]
 * @property {string[]} [wishlist]
 */

/**
 * @typedef {Object} CardInfo
 * @property {string} cardNumber
 * @property {string} cardholderName
 * @property {string} expiryDate
 * @property {string} cvv
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {number} orderNumber
 * @property {CartItem[]} items
 * @property {number} total
 * @property {string} status
 * @property {string} date
 * @property {string} shippedDate
 * @property {TrackingUpdate[]} [tracking]
 */

/**
 * @typedef {Object} TrackingUpdate
 * @property {string} status
 * @property {string} location
 * @property {string} date
 * @property {string} description
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {number} rating
 * @property {string} comment
 * @property {string} date
 * @property {boolean} [isPurchasedByReviewer]
 */

export {}
