import { useState, useRef, useEffect } from 'react';
import './CustomDatePicker.css';

const CustomDatePicker = ({ value, onChange, maxDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayDate, setDisplayDate] = useState(value ? new Date(value) : new Date());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const pickerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
                setShowMonthPicker(false);
                setShowYearPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isOpen]);

    const formatDisplayValue = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const handleDateSelect = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        onChange(formattedDate);
        setIsOpen(false);
    };

    const goToPreviousMonth = () => {
        setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1));
    };

    const goToToday = () => {
        const today = new Date();
        setDisplayDate(today);
    };

    // Get available years (last 1 year: current year and previous year)
    const getAvailableYears = () => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1];
    };

    // Get all months
    const getMonths = () => {
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    };

    const handleYearSelect = (year) => {
        setDisplayDate(new Date(year, displayDate.getMonth(), 1));
        setShowYearPicker(false);
    };

    const handleMonthSelect = (monthIndex) => {
        setDisplayDate(new Date(displayDate.getFullYear(), monthIndex, 1));
        setShowMonthPicker(false);
    };

    const isDateDisabled = (date) => {
        if (!maxDate) return false;
        return date > new Date(maxDate);
    };

    const isSelected = (date) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        return date.toDateString() === selectedDate.toDateString();
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(displayDate);

    return (
        <div className="custom-date-picker" ref={pickerRef}>
            <div className="date-input-wrapper" onClick={() => setIsOpen(!isOpen)} ref={inputRef}>
                <input
                    type="text"
                    value={formatDisplayValue(value)}
                    placeholder="Select date of birth"
                    readOnly
                    className="date-display-input"
                />
                <span className="calendar-icon">📅</span>
            </div>

            {isOpen && (
                <div className="date-picker-dropdown">
                    <div className="picker-header">
                        <button type="button" className="nav-btn" onClick={goToPreviousMonth}>
                            ←
                        </button>
                        <div className="date-header-selectors">
                            <div className="month-selector-wrapper">
                                <button
                                    type="button"
                                    className="month-year-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMonthPicker(!showMonthPicker);
                                        setShowYearPicker(false);
                                    }}
                                >
                                    {displayDate.toLocaleDateString('default', { month: 'long' })}
                                </button>
                                {/* Month Picker Popup */}
                                {showMonthPicker && (
                                    <div className="month-picker-popup" onClick={(e) => e.stopPropagation()}>
                                        <div className="month-picker-grid">
                                            {getMonths().map((month, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className={`month-picker-item ${displayDate.getMonth() === index ? 'selected' : ''}`}
                                                    onClick={() => handleMonthSelect(index)}
                                                >
                                                    {month.substring(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="year-selector-wrapper">
                                <button
                                    type="button"
                                    className="month-year-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowYearPicker(true);
                                        setShowMonthPicker(false);
                                    }}
                                >
                                    {displayDate.getFullYear()}
                                </button>
                                {/* Year Picker Popup */}
                                {showYearPicker && (
                                    <div className="year-picker-popup" onClick={(e) => e.stopPropagation()}>
                                        <div className="year-picker-list">
                                            {getAvailableYears().map((year) => (
                                                <button
                                                    key={year}
                                                    type="button"
                                                    className={`year-picker-item ${displayDate.getFullYear() === year ? 'selected' : ''}`}
                                                    onClick={() => handleYearSelect(year)}
                                                >
                                                    {year}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button type="button" className="nav-btn" onClick={goToNextMonth}>
                            →
                        </button>
                    </div>

                    <div className="picker-weekdays">
                        <div className="weekday">Su</div>
                        <div className="weekday">Mo</div>
                        <div className="weekday">Tu</div>
                        <div className="weekday">We</div>
                        <div className="weekday">Th</div>
                        <div className="weekday">Fr</div>
                        <div className="weekday">Sa</div>
                    </div>

                    <div className="picker-days">
                        {days.map((day, index) => {
                            const disabled = isDateDisabled(day.date);
                            const selected = isSelected(day.date);
                            const today = isToday(day.date);

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${selected ? 'selected' : ''
                                        } ${today ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
                                    onClick={() => !disabled && handleDateSelect(day.date)}
                                    disabled={disabled}
                                >
                                    {day.date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="picker-footer">
                        <button type="button" className="clear-btn" onClick={() => onChange('')}>
                            Clear
                        </button>
                        <button type="button" className="today-btn" onClick={goToToday}>
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
