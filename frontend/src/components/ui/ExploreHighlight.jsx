import React from 'react'
import ElectricBorder from './ElectricBorder'

const ExploreHighlight = ({ children, block = false, className = '' }) => (
  <ElectricBorder
    color="#a98bff"
    speed={0.45}
    chaos={0.035}
    borderRadius={2}
    className={`explore-electric ${block ? 'explore-electric--block' : ''} ${className}`.trim()}
  >
    {children}
  </ElectricBorder>
)

export default ExploreHighlight
