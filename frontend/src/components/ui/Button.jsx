import React from 'react'
import clsx from 'clsx'

const baseStyles = [
  'inline-flex items-center justify-center whitespace-nowrap',
  'rounded-apple-md text-[var(--apple-text-body)] font-medium',
  'min-h-touch px-apple-4',
  'transition-colors duration-apple-fast ease-apple',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--apple-bg-primary)]',
  'disabled:pointer-events-none disabled:opacity-40',
].join(' ')

const variants = {
  solid: {
    default: 'bg-apple-blue text-white hover:bg-apple-blue-hover active:opacity-80',
    secondary: 'bg-apple-fill text-apple-label hover:bg-[var(--apple-fill-primary)]',
    success: 'bg-apple-green text-white hover:opacity-90 active:opacity-80',
    danger: 'bg-apple-red text-white hover:opacity-90 active:opacity-80',
  },
  outline: {
    default: 'border border-apple-separator text-apple-label bg-transparent hover:bg-apple-fill',
  },
  ghost: {
    default: 'text-apple-label-secondary hover:bg-apple-fill hover:text-apple-label',
  }
}

const sizes = {
  sm: 'min-h-[36px] px-3 text-[var(--apple-text-footnote)]',
  md: 'min-h-touch px-apple-4',
  lg: 'min-h-[52px] px-apple-6 text-[var(--apple-text-headline)]',
}

export const Button = ({
  variant = 'solid',
  color = 'default',
  size = 'md',
  className,
  asChild,
  ...props
}) => {
  const Comp = asChild ? 'span' : 'button'
  return (
    <Comp
      className={clsx(
        baseStyles,
        variants[variant]?.[color] || variants.solid.default,
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export default Button
