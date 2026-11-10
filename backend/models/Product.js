import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [140, 'Product name cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [60, 'Category cannot exceed 60 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: null,
      validate: {
        validator(value) {
          if (value == null) return true

          const isUpdateQuery = this instanceof mongoose.Query
          const update = isUpdateQuery ? this.getUpdate() : null
          const price = isUpdateQuery
            ? (update?.$set?.price ?? update?.price)
            : this.price

          return price == null || value >= Number(price)
        },
        message: 'Original price must be greater than or equal to the price',
      },
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
      validate: {
        validator(value) {
          return Number.isInteger(value)
        },
        message: 'Stock must be a whole number',
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

productSchema.index({ category: 1, price: 1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ isFeatured: 1 })
productSchema.index({ isBestSeller: 1 })

productSchema.methods.toJSON = function toSafeJSON() {
  const product = this.toObject()
  delete product.__v
  return product
}

const Product = mongoose.model('Product', productSchema)

export default Product
