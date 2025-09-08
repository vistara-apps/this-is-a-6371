import React from 'react'

const InputWithLabel = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseInputClasses = `
    w-full px-3 py-2 rounded-md border transition-colors duration-200
    bg-surface text-text-primary placeholder-text-secondary
    focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantClasses = {
    default: 'border-border hover:border-text-secondary',
    withHelperText: 'border-border hover:border-text-secondary'
  }

  const errorClasses = error 
    ? 'border-error focus:ring-error' 
    : variantClasses[variant]

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${baseInputClasses} ${errorClasses}`}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Textarea variant
export const TextareaWithLabel = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}) => {
  const baseTextareaClasses = `
    w-full px-3 py-2 rounded-md border transition-colors duration-200
    bg-surface text-text-primary placeholder-text-secondary
    focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed resize-vertical
  `

  const errorClasses = error 
    ? 'border-error focus:ring-error' 
    : 'border-border hover:border-text-secondary'

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`${baseTextareaClasses} ${errorClasses}`}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Select variant
export const SelectWithLabel = ({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  const baseSelectClasses = `
    w-full px-3 py-2 rounded-md border transition-colors duration-200
    bg-surface text-text-primary
    focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const errorClasses = error 
    ? 'border-error focus:ring-error' 
    : 'border-border hover:border-text-secondary'

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${baseSelectClasses} ${errorClasses}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default InputWithLabel
