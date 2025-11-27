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
    multiple = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const isSelected = (optValue) => {
        if (multiple && Array.isArray(value)) return value.includes(optValue);
        return value === optValue;
    };

    const selectedLabels = () => {
        if (multiple && Array.isArray(value)) {
            return options
                .filter((opt) => value.includes(opt.value))
                .map((opt) => opt.label);
        }
        const found = options.find((opt) => opt.value === value);
        return found ? [found.label] : [];
    };

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
            if (multiple) {
                const current = Array.isArray(value) ? value : [];
                const exists = current.includes(optionValue);
                const next = exists ? current.filter((v) => v !== optionValue) : [...current, optionValue];
                onChange(next);
            } else {
                onChange(optionValue);
                setIsOpen(false);
            }
        }
        if (!multiple) {
            setIsOpen(false);
        }
    };

    const selectClasses = ['custom-select', isOpen ? 'open' : '', disabled ? 'disabled' : '', multiple ? 'multiple' : '', className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={selectClasses} ref={containerRef}>
            <select
                tabIndex={-1}
                aria-hidden="true"
                multiple={multiple}
                value={value ?? (multiple ? [] : '')}
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
                <span className={`custom-select-value ${selectedLabels().length ? '' : 'placeholder'}`}>
                    {selectedLabels().length ? selectedLabels().join(', ') : placeholder}
                </span>
                <span className="custom-select-icon" aria-hidden="true">▾</span>
            </button>

            {isOpen && (
                <ul className="custom-select-menu" role="listbox">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className={`custom-select-option ${isSelected(option.value) ? 'selected' : ''}`}
                            role="option"
                            aria-selected={isSelected(option.value)}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span>{option.label}</span>
                            {multiple && (
                                <span className="custom-select-check" aria-hidden="true">
                                    {isSelected(option.value) ? '✓' : ''}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
