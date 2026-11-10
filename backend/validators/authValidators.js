import { body } from 'express-validator'

const nameValidator = () =>
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters')

const emailValidator = () =>
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })

const passwordValidator = () =>
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters')

export const registerValidators = [
  nameValidator(),
  emailValidator(),
  passwordValidator(),
  body('role')
    .optional()
    .custom((value) => value === 'customer')
    .withMessage('You cannot register with this role'),
]

export const adminRegisterValidators = [
  nameValidator(),
  emailValidator(),
  passwordValidator(),
]

export const loginValidators = [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').isString().notEmpty().withMessage('Password is required'),
]
