import * as React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

/**
 * FormInput component with fix for keyboard closing issue on mobile
 * Uses useCallback and proper event handling to prevent focus loss
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helpText, className, onBlur, onChange, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      // Prevent default blur behavior that might close keyboard
      e.preventDefault();
      if (onBlur) {
        onBlur(e);
      }
    }, [onBlur]);

    return (
      <div className="w-full">
        {label && (
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            w-full rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-foreground 
            placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/60 
            transition-shadow disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
