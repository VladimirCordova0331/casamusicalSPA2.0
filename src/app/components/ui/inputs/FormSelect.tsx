import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, placeholder, className, onChange, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    return (
      <div className="w-full">
        {label && (
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            onChange={handleChange}
            className={`
              w-full rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-foreground 
              placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/60 
              transition-shadow disabled:opacity-50 disabled:cursor-not-allowed appearance-none
              ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
