import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Input, Textarea } from '../../components/ui/FormControls'
import StockBadge from '../../components/product/StockBadge'
import Badge from '../../components/ui/Badge'
import PageLoader from '../../components/ui/PageLoader'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { getCategories, getProduct } from '../../services/productService'
import {
  createProduct,
  updateProduct,
  uploadImage,
} from '../../services/adminService'
import { toProductPayload } from '../../utils/productPayload'
import { formatCurrency } from '../../utils/format'
import { PLACEHOLDER_IMAGE } from '../../utils/constants'
import { cn } from '../../utils/cn'

const emptyForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: '0',
  image: '',
  isFeatured: false,
  isBestSeller: false,
}

const isValidUrl = (value) => {
  if (!value) return true
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  useDocumentTitle(isEdit ? 'Edit product' : 'Add product')

  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.data || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!isEdit) return undefined

    let active = true
    setLoading(true)
    setLoadError('')

    getProduct(id)
      .then((response) => {
        if (!active) return
        const product = response.data
        setForm({
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          price: String(product.price ?? ''),
          originalPrice:
            product.originalPrice == null ? '' : String(product.originalPrice),
          stock: String(product.stock ?? 0),
          image: product.image || '',
          isFeatured: Boolean(product.isFeatured),
          isBestSeller: Boolean(product.isBestSeller),
        })
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, isEdit])

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview)
    }
  }, [filePreview])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
    if (submitError) setSubmitError('')
  }

  const toggleFlag = (field) => {
    setForm((current) => ({ ...current, [field]: !current[field] }))
  }

  const handleFile = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    if (!selected.type.startsWith('image/')) {
      toast.error('Choose an image file (JPEG, PNG, WebP).')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Images must be 5MB or smaller.')
      return
    }

    if (filePreview) URL.revokeObjectURL(filePreview)
    setFile(selected)
    setFilePreview(URL.createObjectURL(selected))
    setUploadProgress(0)
  }

  const clearFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFile(null)
    setFilePreview('')
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Product name is required.'
    } else if (form.name.trim().length > 140) {
      nextErrors.name = 'Name cannot exceed 140 characters.'
    }

    if (!form.category.trim()) {
      nextErrors.category = 'Category is required.'
    } else if (form.category.trim().length > 60) {
      nextErrors.category = 'Category cannot exceed 60 characters.'
    }

    if (form.description.length > 5000) {
      nextErrors.description = 'Description cannot exceed 5000 characters.'
    }

    const price = Number(form.price)
    if (form.price === '' || !Number.isFinite(price) || price < 0) {
      nextErrors.price = 'Enter a valid price of 0 or more.'
    }

    if (form.originalPrice !== '') {
      const original = Number(form.originalPrice)
      if (!Number.isFinite(original) || original < 0) {
        nextErrors.originalPrice = 'Enter a valid original price.'
      } else if (Number.isFinite(price) && original < price) {
        nextErrors.originalPrice =
          'Original price must be greater than or equal to the price.'
      }
    }

    const stock = Number(form.stock)
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) {
      nextErrors.stock = 'Enter a whole number of 0 or more.'
    }

    if (!isValidUrl(form.image.trim())) {
      nextErrors.image = 'Image must be a valid http(s) URL.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      toast.error('Please check the highlighted fields.')
      return
    }

    setSaving(true)
    setSubmitError('')

    try {
      let imageUrl = form.image.trim()

      if (file) {
        const uploadResponse = await uploadImage(file, (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            )
          }
        })
        imageUrl = uploadResponse.data?.url || imageUrl
        setForm((current) => ({ ...current, image: imageUrl }))
      }

      const payload = toProductPayload({ ...form, image: imageUrl })

      if (isEdit) {
        await updateProduct(id, payload)
        toast.success('Product updated successfully.')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully.')
      }

      navigate('/admin/products')
    } catch (requestError) {
      setSubmitError(requestError.message)

      if (Array.isArray(requestError.errors) && requestError.errors.length) {
        setErrors((current) => {
          const next = { ...current }
          requestError.errors.forEach((item) => {
            if (item.field) next[item.field] = item.message
          })
          return next
        })
      }
      toast.error(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoader label="Loading product" />
  }

  if (loadError) {
    return (
      <div className="border border-line bg-paper px-6 py-16 text-center">
        <p className="text-sm text-muted">{loadError}</p>
        <Link
          to="/admin/products"
          className="mt-5 inline-flex h-10 items-center gap-2 border border-ink px-5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to products
        </Link>
      </div>
    )
  }

  const previewImage = filePreview || form.image
  const previewPrice = Number(form.price)
  const previewStock = Number(form.stock)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3" aria-hidden="true" />
            Back to products
          </Link>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
            {isEdit ? 'Edit product' : 'Add a new product'}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {isEdit
              ? 'Update details, pricing, inventory, and storefront visibility.'
              : 'Create a listing and publish it to the storefront.'}
          </p>
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <form
        id="product-form"
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start"
      >
        <div className="space-y-6">
          <section className="border border-line bg-paper p-5 sm:p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Basics
            </h3>
            <div className="mt-5 space-y-5">
              <Input
                label="Product name"
                required
                value={form.name}
                onChange={updateField('name')}
                error={errors.name}
                placeholder="Linen overshirt"
                maxLength={140}
              />
              <Input
                label="Category"
                required
                list="product-category-options"
                value={form.category}
                onChange={updateField('category')}
                error={errors.category}
                placeholder="Apparel"
                hint="Choose an existing category or type a new one."
                maxLength={60}
              />
              <datalist id="product-category-options">
                {categories.map((category) => (
                  <option key={category.name} value={category.name} />
                ))}
              </datalist>
              <Textarea
                label="Description"
                value={form.description}
                onChange={updateField('description')}
                error={errors.description}
                placeholder="Materials, fit, care instructions, and the story behind the piece."
                rows={7}
                maxLength={5000}
              />
              <p className="-mt-2 text-right text-[11px] text-muted">
                {form.description.length} / 5000
              </p>
            </div>
          </section>

          <section className="border border-line bg-paper p-5 sm:p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Pricing & inventory
            </h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <Input
                label="Price (USD)"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={updateField('price')}
                error={errors.price}
                placeholder="0.00"
              />
              <Input
                label="Original price"
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={updateField('originalPrice')}
                error={errors.originalPrice}
                placeholder="Optional"
                hint="Shows a sale badge when higher."
              />
              <Input
                label="Stock"
                type="number"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={updateField('stock')}
                error={errors.stock}
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Stock of 1–5 is flagged as low; zero marks the product out of
              stock on the storefront.
            </p>
          </section>

          <section className="border border-line bg-paper p-5 sm:p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Media
            </h3>
            <div className="mt-5 space-y-5">
              <Input
                label="Image URL"
                type="url"
                value={form.image}
                onChange={updateField('image')}
                error={errors.image}
                placeholder="https://res.cloudinary.com/..."
                hint="Paste a hosted image URL, or upload a file below."
              />

              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
                  or upload
                </span>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  id="product-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="sr-only"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="product-image-file"
                    className="inline-flex h-10 cursor-pointer items-center gap-2 border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink"
                  >
                    <Upload className="size-3.5" aria-hidden="true" />
                    Choose image
                  </label>
                  {file ? (
                    <>
                      <span className="max-w-56 truncate text-xs text-muted">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={clearFile}
                        aria-label="Remove selected image"
                        className="flex size-8 items-center justify-center text-muted transition-colors hover:text-danger"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted">
                      JPEG, PNG, or WebP · max 5MB
                    </span>
                  )}
                </div>

                {file && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted">
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full bg-surface">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {previewImage && (
                <div className="relative inline-block border border-line bg-surface">
                  <img
                    src={previewImage}
                    alt="Selected product preview"
                    onError={(event) => {
                      event.currentTarget.src = PLACEHOLDER_IMAGE
                    }}
                    className="h-32 w-28 object-cover"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="border border-line bg-paper p-5 sm:p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Merchandising
            </h3>
            <div className="mt-5 space-y-3">
              {[
                {
                  field: 'isFeatured',
                  title: 'Feature on the homepage',
                  copy: 'Appears in the “Featured this season” section.',
                },
                {
                  field: 'isBestSeller',
                  title: 'Mark as best seller',
                  copy: 'Appears in the “Best sellers” homepage section.',
                },
              ].map((option) => (
                <div
                  key={option.field}
                  className="flex items-start justify-between gap-4 border border-line p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{option.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {option.copy}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form[option.field]}
                    aria-label={option.title}
                    onClick={() => toggleFlag(option.field)}
                    className={cn(
                      'relative mt-0.5 h-6 w-11 shrink-0 border transition-colors',
                      form[option.field]
                        ? 'border-ink bg-ink'
                        : 'border-line bg-surface',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 size-3.5 transition-transform',
                        form[option.field]
                          ? 'left-6 bg-paper'
                          : 'left-1 bg-muted',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="border border-line bg-paper">
            <div className="border-b border-line px-5 py-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Storefront preview
              </h3>
            </div>

            <div className="p-5">
              <div className="aspect-[4/5] w-full overflow-hidden border border-line bg-surface">
                <img
                  src={previewImage || PLACEHOLDER_IMAGE}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_IMAGE
                  }}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="eyebrow truncate">
                  {form.category || 'Category'}
                </p>
                <StockBadge
                  stock={Number.isFinite(previewStock) ? previewStock : 0}
                  className="shrink-0"
                />
              </div>
              <p className="mt-2 font-display text-sm font-semibold leading-snug">
                {form.name || 'Product name'}
              </p>
              <p className="mt-1.5 text-sm font-semibold">
                {formatCurrency(Number.isFinite(previewPrice) ? previewPrice : 0)}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {form.isFeatured && <Badge variant="accent">Featured</Badge>}
                {form.isBestSeller && <Badge variant="dark">Best seller</Badge>}
              </div>
            </div>
          </div>

          <div className="border border-line bg-paper p-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-full items-center justify-center gap-2 border border-ink bg-ink text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  {file && uploadProgress > 0 && uploadProgress < 100
                    ? `Uploading ${uploadProgress}%`
                    : 'Saving…'}
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden="true" />
                  {isEdit ? 'Save changes' : 'Create product'}
                </>
              )}
            </button>
            <Link
              to="/admin/products"
              className="mt-2 inline-flex h-10 w-full items-center justify-center border border-line text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink"
            >
              Cancel
            </Link>
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
              <ImagePlus className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              Uploaded images are stored on Cloudinary when configured.
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}

export default AdminProductFormPage
