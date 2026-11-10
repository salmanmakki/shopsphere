import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email is too long'],
      match: [emailPattern, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [72, 'Password cannot exceed 72 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true },
)

userSchema.index({ role: 1 })

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return
  }
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toJSON = function toSafeJSON() {
  const user = this.toObject()
  delete user.password
  delete user.__v
  return user
}

const User = mongoose.model('User', userSchema)

export default User
