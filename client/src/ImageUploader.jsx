import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import { motion } from 'framer-motion'

function ImageUploader({ onTextExtracted }) {
  const [image, setImage] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    const previewURL = URL.createObjectURL(file)
    setImage({ file, previewURL })
    setError(null)
    setProgress(0)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) {
      setError('Please drop an image file')
      return
    }
    const previewURL = URL.createObjectURL(file)
    setImage({ file, previewURL })
    setError(null)
    setProgress(0)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleExtract = async () => {
    if (!image) return

    setExtracting(true)
    setProgress(0)
    setError(null)

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100))
          }
        }
      })

      const { data } = await worker.recognize(image.file)
      await worker.terminate()

      const cleaned = data.text.trim()
      if (!cleaned) {
        setError('No text found in this image. Try a clearer image.')
        return
      }

      onTextExtracted(cleaned)

    } catch (err) {
      console.error('OCR failed:', err)
      setError('OCR failed. Please try another image.')
    } finally {
      setExtracting(false)
      setProgress(100)
    }
  }

  const handleReset = () => {
    setImage(null)
    setProgress(0)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mb-6">

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !image && fileInputRef.current.click()}
        className="rounded-xl p-6 text-center transition-all duration-200"
        style={{
          border: '2px dashed rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.05)',
          cursor: image ? 'default' : 'pointer',
        }}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {image ? (
          <div>
            <img
              src={image.previewURL}
              alt="Uploaded preview"
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
            <button
              onClick={handleReset}
              className="mt-3 text-xs underline"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Remove image
            </button>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-white font-medium text-sm">
              Drop an image here or click to upload
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              PNG, JPG, WEBP supported
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-300 text-xs mt-2 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Progress Bar */}
      {extracting && (
        <div className="mt-3">
          <div
            className="flex justify-between text-xs mb-1"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <span>Extracting text...</span>
            <span>{progress}%</span>
          </div>
          <div
            className="w-full rounded-full h-1.5"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <motion.div
              className="h-1.5 rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Extract Button */}
      {image && !extracting && (
        <motion.button
          onClick={handleExtract}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="mt-3 w-full py-2 rounded-xl text-sm font-semibold text-white"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
          }}
        >
          Extract Text from Image
        </motion.button>
      )}

    </div>
  )
}

export default ImageUploader