import React, { useState } from 'react'
import { Heart, Coffee, Gift } from 'lucide-react'
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
            className={`tip-action-button tip-action-button--small ${className}`}
          >
            <Heart className="h-4 w-4 mr-1" />
            Tip
          </button>
        )
      case 'large':
        return (
          <button
            onClick={() => setShowTipModal(true)}
            className={`tip-action-button tip-action-button--large ${className}`}
          >
            <Gift className="h-5 w-5 mr-2" />
            Support Creator
          </button>
        )
      default:
        return (
          <button
            onClick={() => setShowTipModal(true)}
            className={`tip-action-button ${className}`}
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
