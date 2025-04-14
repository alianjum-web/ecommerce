"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addFeatureImage, getFeatureImages } from '@/store/common-slice'
import ProductImageUpload, { ImageUploadHandler } from '@/components/admin-view/image-upload'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useRouteProtection } from '@/lib/hooks/useRouteProtection'

// interface AdminDashboardViewProps {
//   user?: {
//     role: string
//   }
// }

// export default function AdminDashboardView({ user }: AdminDashboardViewProps) {
export default function AdminDashboardView() {
  const router = useRouter()
  const { hasRequiredRole } = useRouteProtection(['admin', 'seller'])
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const dispatch = useAppDispatch()
  const { featureImageList, isLoading } = useAppSelector((state) => state.commonFeature)

  // Client-side protection
  useEffect(() => {
    if (!hasRequiredRole) {
      router.push('/unauth-page')
    }
  }, [hasRequiredRole, router])

  const handleUploadFeatureImage = useCallback(async () => {
    if (!uploadedImageUrl) return

    setIsUploading(true)
    try {
      const action = await dispatch(addFeatureImage(uploadedImageUrl))
      
      if (addFeatureImage.fulfilled.match(action) && action.payload.success) {
        await dispatch(getFeatureImages())
        setImageFile(null)
        setUploadedImageUrl('')
      }
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [dispatch, uploadedImageUrl])

  useEffect(() => {
    if (hasRequiredRole) {
      dispatch(getFeatureImages())
    }
  }, [dispatch, hasRequiredRole])

  const handleImageFileChange = useCallback<ImageUploadHandler>(
    (file) => {
      setImageFile(file)
    },
    []
  )

  if (!hasRequiredRole) {
    return null // Redirect will happen in useEffect
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feature Images Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={handleImageFileChange}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setIsUploading}
          imageLoadingState={isUploading}
          isCustomStyling={true}
          isEditMode={false}
        />
        
        <Button 
          onClick={handleUploadFeatureImage} 
          className="mt-5 w-full"
          disabled={!uploadedImageUrl || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-6 text-center">Loading images...</div>
      ) : featureImageList?.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureImageList.map((featureImgItem) => (
            <div 
              key={featureImgItem._id} 
              className="bg-white rounded-lg overflow-hidden shadow-md"
            >
              <Image
                src={featureImgItem.imageUrl}
                alt="Feature content"
                className="w-full h-48 object-cover"
                loading="lazy"
                width={500}
                height={192}
              />
              <div className="p-3">
                <p className="text-sm text-gray-500 truncate">
                  {featureImgItem._id}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center text-gray-500">
          No feature images available
        </div>
      )}
    </div>
  )
}