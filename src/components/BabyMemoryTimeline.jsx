import { useState, useRef, useEffect, useMemo } from 'react';
import { useBaby } from '../contexts/BabyContext';
import './BabyMemoryTimeline.css';

const STORAGE_KEY = 'baby-bloom-photos';

// Weekly suggestions based on baby's age (clickable)
const getWeeklySuggestions = (weeks) => {
    const suggestions = [
        { week: 1, icon: '👀', text: "Baby's curious eyes today", color: 'lavender' },
        { week: 2, icon: '🖐️', text: 'Tiny hand movements', color: 'peach' },
        { week: 3, icon: '😊', text: 'Early smile attempts', color: 'mint' },
        { week: 4, icon: '😴', text: 'Peaceful sleep pose', color: 'blue' },
        { week: 5, icon: '✨', text: 'Baby discovering hands', color: 'yellow' },
        { week: 6, icon: '💬', text: 'First cooing sounds', color: 'pink' },
        { week: 7, icon: '🎈', text: 'Tracking objects with eyes', color: 'lavender' },
        { week: 8, icon: '🌟', text: 'Two months milestone!', color: 'rainbow' }
    ];

    // Return suggestions for current week ± 2 weeks
    return suggestions.filter(s => Math.abs(s.week - weeks) <= 2).slice(0, 5);
};

// Monthly emotional highlights
const getMonthHighlight = (month) => {
    const highlights = [
        { month: 1, icon: '🎂', text: 'Big smiles and bright eyes ✨', color: 'peach' },
        { month: 2, icon: '💬', text: 'Tiny rolls and wiggles 🌼', color: 'lavender' },
        { month: 3, icon: '👶', text: 'Curious babbling moments 🗣️', color: 'mint' },
        { month: 4, icon: '🔄', text: 'Rolling over attempts 🌈', color: 'blue' },
        { month: 5, icon: '🧸', text: 'Reaching for toys 🎀', color: 'yellow' },
        { month: 6, icon: '🧘', text: 'Sitting with support 💫', color: 'pink' },
        { month: 7, icon: '🐛', text: 'Crawling practice begins 🌟', color: 'lavender' },
        { month: 8, icon: '🧍', text: 'Pulling up to stand 🎈', color: 'peach' },
        { month: 9, icon: '👏', text: 'Clapping hands together ✨', color: 'mint' },
        { month: 10, icon: '🚶', text: 'Cruising along furniture 🌈', color: 'blue' },
        { month: 11, icon: '🗣️', text: 'First words attempts 💬', color: 'yellow' },
        { month: 12, icon: '🎉', text: 'First birthday celebration! 🎂', color: 'rainbow' }
    ];
    return highlights.find(h => h.month === month) || { month, icon: '📷', text: `Month ${month} memories`, color: 'lavender' };
};

// Today's memory suggestions based on age
const getTodaysSuggestion = (age) => {
    if (age.days < 7) {
        return {
            icon: '🏠',
            text: 'Notice those curious eyes today 👀',
            emotion: 'Welcome home magic'
        };
    } else if (age.weeks < 4) {
        return {
            icon: '👀',
            text: 'Notice those curious eyes today 👀',
            emotion: 'First connections'
        };
    } else if (age.months < 4) {
        return {
            icon: '🔄',
            text: 'Capture your baby\'s softest smile.',
            emotion: 'Big movements'
        };
    } else if (age.months < 6) {
        return {
            icon: '🧸',
            text: 'Tiny hands exploring the world 🖐️',
            emotion: 'Growing curiosity'
        };
    } else if (age.months < 9) {
        return {
            icon: '🐛',
            text: 'Crawling adventures await! Capture those determined little moves.',
            emotion: 'On the move'
        };
    } else {
        return {
            icon: '🚶',
            text: 'Every day brings a new story—save today\'s magic.',
            emotion: 'Growing independence'
        };
    }
};

const BabyMemoryTimeline = () => {
    const { activeBaby } = useBaby();
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [currentPhotoSet, setCurrentPhotoSet] = useState(null); // Store which photo set we're viewing in modal
    const [favorites, setFavorites] = useState(new Set());
    const [expandedMonth, setExpandedMonth] = useState(null);
    const fileInputRef = useRef(null);
    const [photoCaptions, setPhotoCaptions] = useState({});
    const [pageLoaded, setPageLoaded] = useState(false);
    const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'timeline'

    // Advanced filtering state (age-adaptive)
    const [filterType, setFilterType] = useState('all');
    const [filterValue, setFilterValue] = useState('all');
    const [filterCaption, setFilterCaption] = useState('');

    // Calculate baby's age (more accurate)
    const babyAge = useMemo(() => {
        if (!activeBaby?.dateOfBirth) return null;
        const today = new Date();
        const dob = new Date(activeBaby.dateOfBirth);
        const diffTime = today - dob;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);

        // More accurate month calculation
        const diffMonths = (today.getFullYear() - dob.getFullYear()) * 12 +
            (today.getMonth() - dob.getMonth());
        const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const adjustedMonths = diffMonths + (today.getDate() - dob.getDate()) / daysInCurrentMonth;

        return {
            days: diffDays,
            weeks: diffWeeks,
            months: Math.floor(adjustedMonths),
            monthsDecimal: adjustedMonths
        };
    }, [activeBaby]);

    // Get age greeting
    const getAgeGreeting = () => {
        if (!babyAge) return { text: 'Welcome!', tagline: 'Start capturing precious moments' };

        if (babyAge.days < 7) {
            return {
                text: `Your baby is ${babyAge.days} day${babyAge.days !== 1 ? 's' : ''} old! 💕`,
                tagline: 'Every day brings new discoveries.'
            };
        } else if (babyAge.weeks < 4) {
            return {
                text: `Your baby is ${babyAge.weeks} week${babyAge.weeks !== 1 ? 's' : ''} old! 💕`,
                tagline: 'Every day brings new discoveries.'
            };
        } else {
            return {
                text: `Your baby is ${babyAge.months} month${babyAge.months !== 1 ? 's' : ''} old! 💕`,
                tagline: 'Every day brings new discoveries.'
            };
        }
    };

    // Load data
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setPhotos(parsed);
            }
            const savedFavorites = localStorage.getItem('baby-bloom-favorites');
            if (savedFavorites) {
                setFavorites(new Set(JSON.parse(savedFavorites)));
            }
            const savedCaptions = localStorage.getItem('baby-bloom-captions');
            if (savedCaptions) {
                setPhotoCaptions(JSON.parse(savedCaptions));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setPageLoaded(true);
    }, []);

    // Save data
    useEffect(() => {
        if (photos.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    alert('Storage limit reached! Please delete some photos to free up space.');
                }
            }
        }
        localStorage.setItem('baby-bloom-favorites', JSON.stringify([...favorites]));
        localStorage.setItem('baby-bloom-captions', JSON.stringify(photoCaptions));
    }, [photos, favorites, photoCaptions]);

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileUpload = async (event, month = null, autoCaption = null) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        try {
            const newPhotos = await Promise.all(
                files.map(async (file) => {
                    if (file.size > 2 * 1024 * 1024) {
                        alert(`${file.name} is too large. Please use images under 2MB.`);
                        return null;
                    }

                    const base64 = await convertFileToBase64(file);
                    const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

                    // Auto-set caption if provided
                    if (autoCaption) {
                        setPhotoCaptions(prev => ({
                            ...prev,
                            [photoId]: autoCaption
                        }));
                    }

                    // Auto-assign month if not provided and baby is at least 1 month old
                    const assignedMonth = month || (babyAge && babyAge.months >= 1 ? babyAge.months : null);

                    return {
                        id: photoId,
                        url: base64,
                        name: file.name,
                        date: new Date().toISOString(),
                        timestamp: Date.now(),
                        month: assignedMonth,
                        babyAge: babyAge ? { days: babyAge.days, weeks: babyAge.weeks, months: babyAge.months } : null,
                        suggestion: autoCaption || null
                    };
                })
            );

            const validPhotos = newPhotos.filter(p => p !== null);
            if (validPhotos.length > 0) {
                setPhotos(prev => [...validPhotos, ...prev]);
                triggerConfetti();
            }
        } catch (error) {
            console.error('Error uploading photos:', error);
            alert('Error uploading photos. Please try again.');
        }

        event.target.value = '';
    };

    // Handle weekly suggestion click - auto-upload with caption
    const handleSuggestionClick = (suggestion) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            handleFileUpload(e, null, suggestion.text);
        };
        input.click();
    };

    const triggerConfetti = () => {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);

        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            star.className = 'confetti-star';
            star.textContent = '⭐';
            star.style.left = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 0.5}s`;
            confettiContainer.appendChild(star);
        }

        setTimeout(() => {
            if (document.body.contains(confettiContainer)) {
                document.body.removeChild(confettiContainer);
            }
        }, 2000);
    };

    const handleFavorite = (photoId) => {
        setFavorites(prev => {
            const newFavs = new Set(prev);
            if (newFavs.has(photoId)) {
                newFavs.delete(photoId);
            } else {
                newFavs.add(photoId);
            }
            return newFavs;
        });
    };

    const handleCaptionChange = (photoId, caption) => {
        setPhotoCaptions(prev => ({
            ...prev,
            [photoId]: caption
        }));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            setPhotos(photos.filter(p => p.id !== id));
            setFavorites(prev => {
                const newFavs = new Set(prev);
                newFavs.delete(id);
                return newFavs;
            });
        }
    };

    const toggleMonthExpansion = (month) => {
        setExpandedMonth(expandedMonth === month ? null : month);
    };

    // Get photos for a specific month
    const getMonthPhotos = (month) => {
        return photos.filter(p => p.month === month);
    };

    // Generate month cards (up to current age only - no future months)
    const monthCards = useMemo(() => {
        if (!babyAge || babyAge.months < 1) return [];
        const cards = [];
        for (let month = 1; month <= Math.min(12, babyAge.months); month++) {
            const highlight = getMonthHighlight(month);
            const monthPhotos = getMonthPhotos(month);
            cards.push({ month, ...highlight, photos: monthPhotos });
        }
        return cards;
    }, [babyAge, photos]);

    const weeklySuggestions = useMemo(() => {
        if (!babyAge || babyAge.weeks < 1) return [];
        return getWeeklySuggestions(babyAge.weeks);
    }, [babyAge]);

    const todaysSuggestion = useMemo(() => {
        if (!babyAge) return null;
        return getTodaysSuggestion(babyAge);
    }, [babyAge]);

    // Group photos by caption/suggestion
    const groupedPhotos = useMemo(() => {
        const groups = {};
        photos.forEach(photo => {
            const caption = photoCaptions[photo.id] || photo.suggestion || 'Other Memories';
            if (!groups[caption]) {
                groups[caption] = [];
            }
            groups[caption].push(photo);
        });

        // Sort groups by most recent photo
        return Object.entries(groups)
            .map(([caption, groupPhotos]) => ({
                caption,
                photos: groupPhotos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
                latestPhoto: groupPhotos[0],
                count: groupPhotos.length
            }))
            .sort((a, b) => new Date(b.latestPhoto.timestamp) - new Date(a.latestPhoto.timestamp));
    }, [photos, photoCaptions]);

    // Age-adaptive filter options
    const filterOptions = useMemo(() => {
        if (!babyAge) return { weeks: [], months: [] };

        const weeks = [];
        const months = [];

        // Generate week filters (only if baby is at least 1 week old)
        if (babyAge.weeks >= 1) {
            for (let w = Math.min(babyAge.weeks, 8); w >= 1; w--) {
                weeks.push(w);
            }
        }

        // Generate month filters (only if baby is at least 1 month old)
        if (babyAge.months >= 1) {
            for (let m = Math.min(babyAge.months, 12); m >= 1; m--) {
                months.push(m);
            }
        }

        return { weeks, months };
    }, [babyAge]);

    // Get unique captions for caption filter
    const availableCaptions = useMemo(() => {
        const captions = new Set();
        photos.forEach(photo => {
            const caption = photoCaptions[photo.id] || photo.suggestion;
            if (caption) captions.add(caption);
        });
        return Array.from(captions).sort();
    }, [photos, photoCaptions]);

    // Filtered photos based on age-adaptive filters
    const filteredPhotos = useMemo(() => {
        if (!activeBaby?.dateOfBirth) return photos;

        let filtered = [...photos];

        // Filter by type
        if (filterType === 'week' && filterValue !== 'all') {
            const weekNum = parseInt(filterValue);
            const dob = new Date(activeBaby.dateOfBirth);
            filtered = filtered.filter(p => {
                // Calculate week from photo date, not upload age
                const photoDate = new Date(p.date);
                const diffTime = photoDate - dob;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const photoWeek = Math.floor(diffDays / 7);
                return photoWeek === weekNum;
            });
        } else if (filterType === 'month' && filterValue !== 'all') {
            const monthNum = parseInt(filterValue);
            filtered = filtered.filter(p => p.month === monthNum);
        } else if (filterType === 'today') {
            const today = new Date();
            filtered = filtered.filter(p => {
                const photoDate = new Date(p.date);
                return photoDate.toDateString() === today.toDateString();
            });
        } else if (filterType === 'this-week') {
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(p => {
                const photoDate = new Date(p.date);
                return photoDate >= weekAgo;
            });
        }

        // Filter by caption
        if (filterCaption) {
            filtered = filtered.filter(p => {
                const caption = photoCaptions[p.id] || p.suggestion || '';
                return caption.toLowerCase().includes(filterCaption.toLowerCase());
            });
        }

        return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [photos, filterType, filterValue, filterCaption, photoCaptions, activeBaby]);

    // Filtered grouped photos
    const filteredGroupedPhotos = useMemo(() => {
        if (filterType === 'all' && !filterCaption) return groupedPhotos;

        return groupedPhotos.filter(group => {
            if (filterCaption) {
                return group.caption.toLowerCase().includes(filterCaption.toLowerCase());
            }
            return true;
        });
    }, [groupedPhotos, filterType, filterCaption]);

    // Open photo modal
    const openPhotoModal = (photo, groupPhotos = null) => {
        const photosToShow = groupPhotos || filteredPhotos;
        setCurrentPhotoSet(photosToShow); // Store which set we're viewing
        const index = photosToShow.findIndex(p => p.id === photo.id);
        setSelectedPhotoIndex(index >= 0 ? index : 0);
        setSelectedPhoto(photo);
    };

    // Navigate modal photos
    const navigateModal = (direction) => {
        const photosToShow = currentPhotoSet || filteredPhotos; // Use stored set
        if (photosToShow.length === 0) return;

        let newIndex = selectedPhotoIndex + direction;
        if (newIndex < 0) newIndex = photosToShow.length - 1;
        if (newIndex >= photosToShow.length) newIndex = 0;

        setSelectedPhotoIndex(newIndex);
        setSelectedPhoto(photosToShow[newIndex]);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!selectedPhoto) return;
            if (e.key === 'ArrowLeft') navigateModal(-1);
            if (e.key === 'ArrowRight') navigateModal(1);
            if (e.key === 'Escape') {
                setSelectedPhoto(null);
                setCurrentPhotoSet(null);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [selectedPhoto, selectedPhotoIndex, currentPhotoSet]);

    const ageGreeting = getAgeGreeting();

    const resetFilters = () => {
        setFilterType('all');
        setFilterValue('all');
        setFilterCaption('');
    };

    const hasActiveFilters = filterType !== 'all' || filterValue !== 'all' || filterCaption;

    if (!activeBaby) {
        return (
            <div className="baby-memory-timeline">
                <div className="empty-state-large">
                    <div className="empty-icon-large">👶</div>
                    <h2>No Baby Profile</h2>
                    <p>Please create a baby profile to start capturing memories.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`baby-memory-timeline ${pageLoaded ? 'page-loaded' : ''}`}>
            {/* Floating Background Shapes */}
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="cloud cloud-1">☁️</div>
                <div className="cloud cloud-2">☁️</div>
                <div className="star star-1">⭐</div>
                <div className="star star-2">✨</div>
                <div className="heart heart-1">💕</div>
            </div>

            {/* 1. Age Header */}
            <section className="age-header">
                <h1 className="age-title">{ageGreeting.text}</h1>
                <p className="age-tagline">{ageGreeting.tagline}</p>
            </section>

            {/* 2. Today's Memory Suggestion */}
            {todaysSuggestion && (
                <section className="todays-memory-section">
                    <div className="todays-memory-card">
                        <div className="memory-icon">{todaysSuggestion.icon}</div>
                        <div className="memory-content">
                            <p className="memory-emotion">{todaysSuggestion.emotion}</p>
                            <p className="memory-text">{todaysSuggestion.text}</p>
                        </div>
                        <div className="memory-actions">
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                id="today-upload"
                            />
                            <button
                                className="btn-capture-now"
                                onClick={() => document.getElementById('today-upload')?.click()}
                            >
                                📸 Capture Now
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. This Week's Suggested Moments (Clickable!) */}
            {babyAge && babyAge.weeks >= 1 && weeklySuggestions.length > 0 ? (
                <section className="weekly-suggestions-section">
                    <h2 className="section-title">
                        <span className="section-icon">🌼</span>
                        This Week's Suggested Moments
                    </h2>
                    <p className="section-subtitle">Tap any suggestion to upload a photo with that caption</p>
                    <div className="weekly-suggestions-grid">
                        {weeklySuggestions.map((suggestion, index) => (
                            <div
                                key={suggestion.week}
                                className="weekly-suggestion-card clickable"
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <div className="suggestion-icon">{suggestion.icon}</div>
                                <p className="suggestion-text">{suggestion.text}</p>
                                <div className="suggestion-hint">Tap to upload 📸</div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : babyAge && babyAge.days < 7 ? (
                <section className="weekly-suggestions-section">
                    <div className="empty-state-early">
                        <div className="empty-icon">👶</div>
                        <h3>Your baby is just getting started!</h3>
                        <p>Weekly suggestions will appear once your baby is 1 week old.</p>
                        <p className="empty-hint">For now, use "Today's Memory Suggestion" above to capture precious moments.</p>
                    </div>
                </section>
            ) : null}

            {/* 4. Monthly Memories */}
            {monthCards.length > 0 && (
                <section className="monthly-memories-section">
                    <h2 className="section-title">
                        <span className="section-icon">📅</span>
                        Monthly Memories
                    </h2>
                    <div className="month-cards-container">
                        {monthCards.map((card, index) => {
                            const isExpanded = expandedMonth === card.month;
                            return (
                                <div
                                    key={card.month}
                                    className={`month-card ${isExpanded ? 'expanded' : ''}`}
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <div
                                        className="month-card-header"
                                        onClick={() => toggleMonthExpansion(card.month)}
                                    >
                                        <div className="month-card-content">
                                            <div className="month-icon-large">{card.icon}</div>
                                            <div className="month-info">
                                                <h3 className="month-number">Month {card.month}</h3>
                                                <p className="month-highlight">{card.text}</p>
                                            </div>
                                        </div>
                                        <div className="month-expand-icon">
                                            {isExpanded ? '▲' : '▼'}
                                        </div>
                                    </div>

                                    {/* 5. Expanded Month Dropdown */}
                                    {isExpanded && (
                                        <div className="month-dropdown">
                                            <div className="month-dropdown-header">
                                                <h3 className="month-dropdown-title">
                                                    Month {card.month} Memories 🌈
                                                </h3>
                                                <p className="month-dropdown-summary">
                                                    {card.month === 1 && "This month your baby discovered the world—so many sweet first moments!"}
                                                    {card.month === 2 && "This month your baby started babbling—those precious sounds!"}
                                                    {card.month === 3 && "This month your baby held their head up—such a big milestone!"}
                                                    {card.month === 4 && "This month your baby tried rolling over—so many sweet little attempts!"}
                                                    {card.month === 5 && "This month your baby reached for toys—growing curiosity!"}
                                                    {card.month === 6 && "This month your baby sat with support—getting stronger every day!"}
                                                    {card.month === 7 && "This month your baby started crawling—on the move!"}
                                                    {card.month === 8 && "This month your baby pulled up to stand—so determined!"}
                                                    {card.month === 9 && "This month your baby clapped hands—celebrating every moment!"}
                                                    {card.month === 10 && "This month your baby cruised along furniture—almost walking!"}
                                                    {card.month === 11 && "This month your baby tried first words—so exciting!"}
                                                    {card.month === 12 && "This month your baby turned one—what an amazing journey!"}
                                                    {!card.month && "This month's precious memories"}
                                                </p>
                                            </div>

                                            <div className="month-dropdown-actions">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleFileUpload(e, card.month)}
                                                    id={`month-upload-${card.month}`}
                                                />
                                                <button
                                                    className="btn-add-photo-month"
                                                    onClick={() => document.getElementById(`month-upload-${card.month}`)?.click()}
                                                >
                                                    📸 Add Photo to Month {card.month}
                                                </button>
                                            </div>

                                            {card.photos.length > 0 ? (
                                                <div className="month-photos-grid">
                                                    {card.photos.map((photo, photoIndex) => (
                                                        <div
                                                            key={photo.id}
                                                            className="month-photo-item"
                                                            style={{ animationDelay: `${photoIndex * 50}ms` }}
                                                            onClick={() => openPhotoModal(photo)}
                                                        >
                                                            <img src={photo.url} alt={`Month ${card.month} photo`} />
                                                            <div className="photo-overlay-mini">
                                                                <button
                                                                    className={`favorite-btn-mini ${favorites.has(photo.id) ? 'active' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleFavorite(photo.id);
                                                                    }}
                                                                >
                                                                    ❤️
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="month-empty-state">
                                                    <div className="empty-icon">📷</div>
                                                    <p>No photos yet for this month</p>
                                                    <p className="empty-hint">Click "Add Photo" above to start capturing memories!</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 6. All Uploaded Memories (with Grouping) */}
            {photos.length > 0 && (
                <section className="memories-timeline-section">
                    <div className="section-header-with-toggle">
                        <h2 className="section-title">
                            <span className="section-icon">🖼️</span>
                            All Uploaded Memories
                        </h2>
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'grouped' ? 'active' : ''}`}
                                onClick={() => setViewMode('grouped')}
                            >
                                Grouped
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                                onClick={() => setViewMode('timeline')}
                            >
                                Timeline
                            </button>
                        </div>
                    </div>

                    {/* 7. Dynamic Age-Adaptive Filters */}
                    <div className="filter-bar">
                        <div className="filter-group">
                            <label className="filter-label">Filter by</label>
                            <select
                                className="filter-select"
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setFilterValue('all');
                                }}
                            >
                                <option value="all">All Memories</option>
                                {babyAge && babyAge.days >= 1 && <option value="today">Today</option>}
                                {babyAge && babyAge.weeks >= 1 && <option value="this-week">This Week</option>}
                                {babyAge && babyAge.weeks >= 1 && filterOptions.weeks.length > 0 && (
                                    <option value="week">By Week</option>
                                )}
                                {babyAge && babyAge.months >= 1 && filterOptions.months.length > 0 && (
                                    <option value="month">By Month</option>
                                )}
                                <option value="caption">By Caption</option>
                            </select>
                        </div>

                        {filterType === 'week' && filterOptions.weeks.length > 0 && (
                            <div className="filter-group">
                                <label className="filter-label">Week</label>
                                <select
                                    className="filter-select"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                >
                                    <option value="all">All Weeks</option>
                                    {filterOptions.weeks.map(week => (
                                        <option key={week} value={week}>Week {week}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterType === 'month' && filterOptions.months.length > 0 && (
                            <div className="filter-group">
                                <label className="filter-label">Month</label>
                                <select
                                    className="filter-select"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                >
                                    <option value="all">All Months</option>
                                    {filterOptions.months.map(month => (
                                        <option key={month} value={month}>Month {month}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterType === 'caption' && (
                            <div className="filter-group">
                                <label className="filter-label">Caption</label>
                                <select
                                    className="filter-select"
                                    value={filterCaption}
                                    onChange={(e) => setFilterCaption(e.target.value)}
                                >
                                    <option value="">All Captions</option>
                                    {availableCaptions.map(caption => (
                                        <option key={caption} value={caption}>{caption}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="filter-group">
                            <label className="filter-label">Search</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Search by caption..."
                                value={filterCaption}
                                onChange={(e) => setFilterCaption(e.target.value)}
                            />
                        </div>

                        {hasActiveFilters && (
                            <button className="btn-reset-filters" onClick={resetFilters}>
                                Reset Filters
                            </button>
                        )}
                    </div>

                    {/* Grouped View */}
                    {viewMode === 'grouped' && (
                        <div className="grouped-memories-grid">
                            {filteredGroupedPhotos.length > 0 ? (
                                filteredGroupedPhotos.map((group, index) => {
                                    const visiblePhotos = group.photos.slice(0, 3);
                                    const remainingCount = group.photos.length - 3;
                                    const latestPhoto = group.latestPhoto;

                                    return (
                                        <div
                                            key={group.caption}
                                            className="grouped-memory-card"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            onClick={() => openPhotoModal(latestPhoto, group.photos)}
                                        >
                                            <div className="grouped-thumbnails">
                                                {visiblePhotos.map((photo, idx) => (
                                                    <div key={photo.id} className="grouped-thumbnail" style={{ zIndex: 3 - idx }}>
                                                        <img src={photo.url} alt={group.caption} />
                                                    </div>
                                                ))}
                                                {remainingCount > 0 && (
                                                    <div className="grouped-more">+{remainingCount}</div>
                                                )}
                                            </div>
                                            <div className="grouped-info">
                                                <div className="grouped-caption-tag">{group.caption}</div>
                                                {latestPhoto.babyAge && (
                                                    <div className="grouped-age">
                                                        {latestPhoto.babyAge.days < 7 && `${latestPhoto.babyAge.days}d`}
                                                        {latestPhoto.babyAge.days >= 7 && latestPhoto.babyAge.weeks < 4 && `${latestPhoto.babyAge.weeks}w`}
                                                        {latestPhoto.babyAge.months >= 1 && `${latestPhoto.babyAge.months}m`}
                                                    </div>
                                                )}
                                                <div className="grouped-date">
                                                    {new Date(latestPhoto.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-results">
                                    <div className="empty-icon">🔍</div>
                                    <p>No photos match your filters</p>
                                    <button className="btn-reset-filters" onClick={resetFilters}>
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline View */}
                    {viewMode === 'timeline' && (
                        <div className="photos-timeline-grid">
                            {filteredPhotos.length > 0 ? (
                                filteredPhotos.map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        className="photo-timeline-item"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                        onClick={() => openPhotoModal(photo)}
                                    >
                                        <div className="photo-wrapper">
                                            <img src={photo.url} alt={photo.name || 'Photo'} />
                                            <div className="photo-overlay">
                                                <button
                                                    className={`favorite-btn ${favorites.has(photo.id) ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFavorite(photo.id);
                                                    }}
                                                >
                                                    ❤️
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(photo.id);
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            {photo.babyAge && (
                                                <div className="photo-age-badge">
                                                    {photo.babyAge.days < 7 && `${photo.babyAge.days}d`}
                                                    {photo.babyAge.days >= 7 && photo.babyAge.weeks < 4 && `${photo.babyAge.weeks}w`}
                                                    {photo.babyAge.months >= 1 && `${photo.babyAge.months}m`}
                                                </div>
                                            )}
                                            {photo.suggestion && (
                                                <div className="photo-suggestion-badge">
                                                    {photo.suggestion}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="photo-caption-input"
                                            placeholder="Add a caption..."
                                            value={photoCaptions[photo.id] || photo.suggestion || ''}
                                            onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="photo-date">
                                            {new Date(photo.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <div className="empty-icon">🔍</div>
                                    <p>No photos match your filters</p>
                                    <button className="btn-reset-filters" onClick={resetFilters}>
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* 8. Big Photo Preview Modal (Swipeable) */}
            {selectedPhoto && (
                <div className="photo-modal-overlay" onClick={() => {
                    setSelectedPhoto(null);
                    setCurrentPhotoSet(null);
                }}>
                    <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => {
                            setSelectedPhoto(null);
                            setCurrentPhotoSet(null);
                        }}>✕</button>

                        {(currentPhotoSet || filteredPhotos).length > 1 && (
                            <>
                                <button
                                    className="modal-nav modal-nav-left"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateModal(-1);
                                    }}
                                >
                                    ‹
                                </button>
                                <button
                                    className="modal-nav modal-nav-right"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateModal(1);
                                    }}
                                >
                                    ›
                                </button>
                            </>
                        )}

                        <div className="modal-image-container">
                            <img src={selectedPhoto.url} alt={selectedPhoto.name || 'Photo'} />
                        </div>

                        <div className="modal-info">
                            {photoCaptions[selectedPhoto.id] || selectedPhoto.suggestion ? (
                                <p className="modal-caption">
                                    {photoCaptions[selectedPhoto.id] || selectedPhoto.suggestion}
                                </p>
                            ) : (
                                <input
                                    type="text"
                                    className="modal-caption-input"
                                    placeholder="Add a caption..."
                                    value={photoCaptions[selectedPhoto.id] || ''}
                                    onChange={(e) => handleCaptionChange(selectedPhoto.id, e.target.value)}
                                />
                            )}

                            <div className="modal-meta">
                                {selectedPhoto.babyAge && (
                                    <span className="modal-age">
                                        {selectedPhoto.babyAge.days < 7 && `${selectedPhoto.babyAge.days} days old`}
                                        {selectedPhoto.babyAge.days >= 7 && selectedPhoto.babyAge.weeks < 4 && `${selectedPhoto.babyAge.weeks} weeks old`}
                                        {selectedPhoto.babyAge.months >= 1 && `${selectedPhoto.babyAge.months} month${selectedPhoto.babyAge.months !== 1 ? 's' : ''} old`}
                                    </span>
                                )}
                                <span className="modal-date">
                                    {new Date(selectedPhoto.date).toLocaleDateString()}
                                </span>
                                {(currentPhotoSet || filteredPhotos).length > 1 && (
                                    <span className="modal-counter">
                                        {selectedPhotoIndex + 1} / {(currentPhotoSet || filteredPhotos).length}
                                    </span>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button
                                    className={`modal-favorite-btn ${favorites.has(selectedPhoto.id) ? 'active' : ''}`}
                                    onClick={() => handleFavorite(selectedPhoto.id)}
                                >
                                    {favorites.has(selectedPhoto.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                                </button>
                                <button
                                    className="modal-delete-btn"
                                    onClick={() => {
                                        handleDelete(selectedPhoto.id);
                                        setSelectedPhoto(null);
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BabyMemoryTimeline;
