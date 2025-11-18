import { createContext, useContext, useState, useEffect } from 'react';

const BabyContext = createContext();

export const useBaby = () => {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error('useBaby must be used within a BabyProvider');
  }
  return context;
};

export const BabyProvider = ({ children }) => {
  const [babies, setBabies] = useState(() => {
    const saved = localStorage.getItem('baby-bloom-profiles');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeBabyId, setActiveBabyId] = useState(() => {
    return localStorage.getItem('baby-bloom-active-baby-id') || null;
  });

  // Save babies to localStorage whenever they change
  useEffect(() => {
    if (babies.length > 0) {
      localStorage.setItem('baby-bloom-profiles', JSON.stringify(babies));
    } else {
      localStorage.removeItem('baby-bloom-profiles');
    }
  }, [babies]);

  // Save active baby ID to localStorage
  useEffect(() => {
    if (activeBabyId) {
      localStorage.setItem('baby-bloom-active-baby-id', activeBabyId);
    } else {
      localStorage.removeItem('baby-bloom-active-baby-id');
    }
  }, [activeBabyId]);

  // Get active baby
  const activeBaby = babies.find(baby => baby.id === activeBabyId);

  // Add a new baby
  const addBaby = (babyData) => {
    const newBaby = {
      id: Date.now().toString(),
      name: babyData.name,
      dateOfBirth: babyData.dateOfBirth,
      gender: babyData.gender,
      photo: babyData.photo || null,
      bloodType: babyData.bloodType || null,
      weight: babyData.weight || null,
      height: babyData.height || null,
      createdAt: new Date().toISOString()
    };

    setBabies(prev => [...prev, newBaby]);

    // If this is the first baby, make it active
    if (babies.length === 0) {
      setActiveBabyId(newBaby.id);
    }

    return newBaby;
  };

  // Update baby profile
  const updateBaby = (babyId, updates) => {
    setBabies(prev =>
      prev.map(baby =>
        baby.id === babyId ? { ...baby, ...updates } : baby
      )
    );
  };

  // Delete a baby
  const deleteBaby = (babyId) => {
    setBabies(prev => prev.filter(baby => baby.id !== babyId));

    // If deleted baby was active, switch to first remaining baby
    if (activeBabyId === babyId) {
      const remaining = babies.filter(baby => baby.id !== babyId);
      setActiveBabyId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Switch active baby
  const switchBaby = (babyId) => {
    setActiveBabyId(babyId);
  };

  const value = {
    babies,
    activeBaby,
    activeBabyId,
    addBaby,
    updateBaby,
    deleteBaby,
    switchBaby
  };

  return (
    <BabyContext.Provider value={value}>
      {children}
    </BabyContext.Provider>
  );
};
