/**
 * Utility function to calculate baby's age in months
 * @param {Object} activeBaby - Baby object with dateOfBirth
 * @param {number|null} babyAgeInMonths - Optional pre-calculated age in months
 * @returns {number} Baby's age in months (defaults to 6 if unable to calculate)
 */
export const getBabyAge = (activeBaby = null, babyAgeInMonths = null) => {
    // If pre-calculated age is provided, use it
    if (babyAgeInMonths !== null) {
        return Math.floor(babyAgeInMonths);
    }

    // Calculate from activeBaby
    if (!activeBaby || !activeBaby.dateOfBirth) return 6;

    const today = new Date();
    const birthDate = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
        (today.getMonth() - birthDate.getMonth());

    return Math.max(0, months);
};

