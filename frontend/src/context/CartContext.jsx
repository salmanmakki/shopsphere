import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { CART_STORAGE_KEY } from '../utils/constants'

const CartContext = createContext(null)

const sanitizeProduct = (product) => {
  if (!product?._id) return null

  const stock = Math.max(0, Math.floor(Number(product.stock) || 0))
  if (stock <= 0) return null

  return {
    productId: product._id,
    name: product.name,
    category: product.category,
    price: Number(product.price) || 0,
    originalPrice:
      product.originalPrice == null ? null : Number(product.originalPrice),
    image: product.image || '',
    stock,
  }
}

const createCartItem = (product, quantity = 1) => {
  const base = sanitizeProduct(product)
  if (!base) return null

  const requested = Math.floor(Number(quantity)) || 1
  return {
    ...base,
    quantity: Math.min(Math.max(requested, 1), base.stock),
  }
}

const parseStoredCart = (value) => {
  try {
    if (!value) return []

    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) return []

    const seen = new Set()
    return parsed.reduce((items, stored) => {
      if (!stored || seen.has(stored.productId)) return items
      const item = createCartItem(
        {
          _id: stored.productId,
          name: stored.name,
          category: stored.category,
          price: stored.price,
          originalPrice: stored.originalPrice,
          image: stored.image,
          stock: stored.stock,
        },
        stored.quantity,
      )
      if (item) {
        seen.add(item.productId)
        items.push(item)
      }
      return items
    }, [])
  } catch {
    return []
  }
}

const readCart = () => {
  try {
    return parseStoredCart(localStorage.getItem(CART_STORAGE_KEY))
  } catch {
    return []
  }
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const incoming = createCartItem(action.payload.product, action.payload.quantity)
      if (!incoming) return state

      const existing = state.find(
        (item) => item.productId === incoming.productId,
      )

      if (!existing) {
        return [...state, incoming]
      }

      return state.map((item) =>
        item.productId === incoming.productId
          ? {
              ...item,
              ...incoming,
              quantity: Math.min(item.quantity + incoming.quantity, incoming.stock),
            }
          : item,
      )
    }
    case 'REMOVE':
      return state.filter((item) => item.productId !== action.payload)
    case 'SET_QUANTITY':
      return state.map((item) => {
        if (item.productId !== action.payload.productId) return item
        const quantity = Math.floor(Number(action.payload.quantity))
        if (!Number.isFinite(quantity) || quantity < 1) return item
        return { ...item, quantity: Math.min(quantity, item.stock) }
      })
    case 'INCREMENT':
      return state.map((item) =>
        item.productId === action.payload && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    case 'DECREMENT':
      return state.map((item) =>
        item.productId === action.payload && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
    case 'SYNC': {
      const products = new Map(
        action.payload
          .filter(Boolean)
          .map((product) => [product._id, product]),
      )

      return state.reduce((items, item) => {
        const product = products.get(item.productId)
        if (!product) {
          items.push(item)
          return items
        }

        const base = sanitizeProduct(product)
        if (!base) return items

        items.push({
          ...item,
          ...base,
          quantity: Math.min(item.quantity, base.stock),
        })
        return items
      }, [])
    }
    case 'REPLACE':
      return parseStoredCart(action.payload)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, readCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage may be unavailable (private mode/quota); the cart still works in memory.
    }
  }, [items])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CART_STORAGE_KEY) {
        dispatch({ type: 'REPLACE', payload: event.newValue })
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback((product, quantity = 1) => {
    if (!product || Number(product.stock) <= 0) return false
    dispatch({ type: 'ADD', payload: { product, quantity } })
    return true
  }, [])

  const removeItem = useCallback((productId) => {
    dispatch({ type: 'REMOVE', payload: productId })
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    dispatch({ type: 'SET_QUANTITY', payload: { productId, quantity } })
  }, [])

  const incrementItem = useCallback((productId) => {
    dispatch({ type: 'INCREMENT', payload: productId })
  }, [])

  const decrementItem = useCallback((productId) => {
    dispatch({ type: 'DECREMENT', payload: productId })
  }, [])

  const removeAll = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const syncProducts = useCallback((products) => {
    if (!Array.isArray(products) || products.length === 0) return
    dispatch({ type: 'SYNC', payload: products })
  }, [])

  const totals = useMemo(() => {
    return items.reduce(
      (accumulator, item) => {
        accumulator.subtotal += item.price * item.quantity
        accumulator.itemCount += item.quantity
        return accumulator
      },
      { subtotal: 0, itemCount: 0 },
    )
  }, [items])

  const value = useMemo(
    () => ({
      items,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      addItem,
      removeItem,
      updateQuantity,
      incrementItem,
      decrementItem,
      removeAll,
      syncProducts,
    }),
    [
      items,
      totals,
      addItem,
      removeItem,
      updateQuantity,
      incrementItem,
      decrementItem,
      removeAll,
      syncProducts,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
