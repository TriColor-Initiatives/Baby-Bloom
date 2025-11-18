/**
 * Storage Migration Utility
 * Migrates old localStorage keys to new standardized keys
 */

const MIGRATION_MAP = {
    'babyFeedings': 'baby-bloom-feedings',
    'babySleep': 'baby-bloom-sleep',
    'babyDiapers': 'baby-bloom-diapers',
    'baby_profiles': 'baby-bloom-profiles',
    'active_baby_id': 'baby-bloom-active-baby-id',
    'babyAppointments': 'baby-bloom-appointments',
    'babyEmergencyInfo': 'baby-bloom-emergency-info'
};

const MIGRATION_VERSION_KEY = 'baby-bloom-storage-version';
const CURRENT_VERSION = '1.0.0';

/**
 * Migrates old localStorage keys to new standardized keys
 * @returns {Object} Migration results
 */
export const migrateStorage = () => {
    const results = {
        migrated: [],
        errors: [],
        skipped: []
    };

    // Check if migration already completed
    const lastVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
    if (lastVersion === CURRENT_VERSION) {
        console.log('Storage migration already completed');
        return results;
    }

    try {
        // Migrate each old key to new key
        Object.entries(MIGRATION_MAP).forEach(([oldKey, newKey]) => {
            try {
                const oldData = localStorage.getItem(oldKey);

                if (oldData) {
                    // Check if new key already exists
                    const newData = localStorage.getItem(newKey);

                    if (!newData) {
                        // Migrate data to new key
                        localStorage.setItem(newKey, oldData);
                        results.migrated.push({ from: oldKey, to: newKey });
                        console.log(`Migrated ${oldKey} to ${newKey}`);
                    } else {
                        // New key exists, keep both for now
                        results.skipped.push({ from: oldKey, to: newKey, reason: 'New key already exists' });
                    }
                }
            } catch (error) {
                results.errors.push({ key: oldKey, error: error.message });
                console.error(`Error migrating ${oldKey}:`, error);
            }
        });

        // Mark migration as complete
        localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);
        console.log('Storage migration completed successfully');

    } catch (error) {
        console.error('Storage migration failed:', error);
        results.errors.push({ key: 'general', error: error.message });
    }

    return results;
};

/**
 * Cleans up old keys after migration (use with caution)
 * Only call this after confirming migration was successful
 */
export const cleanupOldKeys = () => {
    Object.keys(MIGRATION_MAP).forEach((oldKey) => {
        try {
            localStorage.removeItem(oldKey);
            console.log(`Removed old key: ${oldKey}`);
        } catch (error) {
            console.error(`Error removing old key ${oldKey}:`, error);
        }
    });
};

export default migrateStorage;

