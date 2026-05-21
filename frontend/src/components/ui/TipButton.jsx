import React, { useState } from 'react'
import { Heart, Coffee, Gift, Star } from 'lucide-react'
import TipModal from './TipModal'

const TipButton = ({ 
  creatorId, 
  creatorName, 
  modelId = null, 
  modelTitle = null,
  variant = 'default', // 'default', 'small', 'large'
  className = ''
}) => {
  const [showTipModal, setShowTipModal] = useState(false)

  const getButtonContent = () => {
    switch (variant) {
      case 'small':
        return (
          <button
            onClick={() => setShowTipModal(true)}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
          >
            <Heart className="h-4 w-4 mr-1" />
            Tip
          </button>
        )
      case 'large':
        return (
          <button
            onClick={() => setShowTipModal(true)}
            className={`inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
          >
            <Gift className="h-5 w-5 mr-2" />
            Support Creator
          </button>
        )
      default:
        return (
          <button
            onClick={() => setShowTipModal(true)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
          >
            <Coffee className="h-4 w-4 mr-2" />
            Tip Creator
          </button>
        )
    }
  }

  return (
    <>
      {getButtonContent()}
      
      {showTipModal && (
        <TipModal
          creatorId={creatorId}
          creatorName={creatorName}
          modelId={modelId}
          modelTitle={modelTitle}
          onClose={() => setShowTipModal(false)}
        />
      )}
    </>
  )
}

export default TipButton
