import React from 'react';

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "0", 
  className = "", 
  disabled = false,
  required = false
}) => {
  // Format number to string with dots (e.g. 10000 -> 10.000)
  const formatValue = (val: number) => {
    if (!val && val !== 0) return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove dots to get raw number
    const numericValue = rawValue.replace(/\./g, '');
    
    // Only allow digits
    if (/^\d*$/.test(numericValue)) {
      onChange(numericValue === '' ? 0 : parseInt(numericValue, 10));
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 ? '' : formatValue(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`pl-10 ${className}`}
      />
    </div>
  );
};