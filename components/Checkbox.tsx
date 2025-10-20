import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label = "",
  className = "",
  ...props
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <label className="w-full flex items-center justify-start gap-1">
        {label && (
          <span className="text-sm font-medium text-gray-900 max-w-min">
            {label}
          </span>
        )}
        <div className="flex gap-1">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only peer static"
            {...props}
          />
          <div className="relative w-11 h-6 bg-gray-200  rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600 outline outline-gray-800"></div>
        </div>
      </label>
    </div>
  );
};
