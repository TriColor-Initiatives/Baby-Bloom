import { useEffect, useRef, useState } from 'react';
import './CustomSelect.css';

const CustomSelect = ({
    value = '',
    onChange,
    options = [],
    placeholder = 'Select an option',
    disabled = false,
    className = '',
    name,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (typeof onChange === 'function') {
            onChange(optionValue);
        }
        setIsOpen(false);
    };

    const selectClasses = ['custom-select', isOpen ? 'open' : '', disabled ? 'disabled' : '', className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={selectClasses} ref={containerRef}>
            <select
                tabIndex={-1}
                aria-hidden="true"
                value={value ?? ''}
                required={required}
                name={name}
                disabled={disabled}
                onChange={() => {}}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <button
                type="button"
                className="custom-select-trigger"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-required={required}
            >
                <span className={`custom-select-value ${selectedOption ? '' : 'placeholder'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="custom-select-icon" aria-hidden="true">▾</span>
            </button>

            {isOpen && (
                <ul className="custom-select-menu" role="listbox">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                            role="option"
                            aria-selected={option.value === value}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
