import { useEffect } from 'react'

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} — ShopSphere` : 'ShopSphere'

    return () => {
      document.title = previousTitle
    }
  }, [title])
}
