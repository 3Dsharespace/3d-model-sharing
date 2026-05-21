import React from 'react'
import { Shield, Crown, Star, Sparkles } from 'lucide-react'

const TIER_CONFIG = {
  basic: {
    name: 'Creator',
    icon: null,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300'
  },
  verified: {
    name: 'Verified',
    icon: Shield,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300'
  },
  pro: {
    name: 'Pro',
    icon: Star,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300'
  },
  elite: {
    name: 'Elite',
    icon: Crown,
    bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300'
  }
}

export default function CreatorBadge({ tier = 'basic', size = 'sm', showText = true, className = '' }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.basic
  const Icon = config.icon

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (tier === 'basic' && !showText) {
    return null // Don't show badge for basic tier without text
  }

  return (
    <div
      className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${tier === 'elite' ? 'shadow-md' : ''}
        ${className}
      `}
      title={`${config.name} Creator`}
    >
      {Icon && (
        <Icon className={`${iconSizes[size]} ${tier === 'elite' ? 'animate-pulse' : ''}`} />
      )}
      {showText && <span>{config.name}</span>}
      {tier === 'elite' && <Sparkles className={`${iconSizes[size]} animate-pulse`} />}
    </div>
  )
}

// Individual badge components for easy use
export function VerifiedBadge({ size = 'sm', showText = true, className = '' }) {
  return <CreatorBadge tier="verified" size={size} showText={showText} className={className} />
}

export function ProBadge({ size = 'sm', showText = true, className = '' }) {
  return <CreatorBadge tier="pro" size={size} showText={showText} className={className} />
}

export function EliteBadge({ size = 'sm', showText = true, className = '' }) {
  return <CreatorBadge tier="elite" size={size} showText={showText} className={className} />
}
