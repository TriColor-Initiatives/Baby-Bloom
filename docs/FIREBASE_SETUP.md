# Firebase Configuration Guide

## Realtime Database Rules

Use these security rules for your Firebase Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "profile": {
          ".validate": "newData.hasChildren(['name', 'email'])"
        },
        "babies": {
          "$babyId": {
            ".validate": "newData.hasChildren(['name', 'birthdate'])"
          }
        },
        "feeding": {
          "$entryId": {
            ".validate": "newData.hasChildren(['timestamp', 'type'])"
          }
        },
        "sleep": {
          "$entryId": {
            ".validate": "newData.hasChildren(['timestamp', 'duration'])"
          }
        },
        "diaper": {
          "$entryId": {
            ".validate": "newData.hasChildren(['timestamp', 'type'])"
          }
        },
        "health": {
          "$entryId": {
            ".validate": "newData.hasChildren(['timestamp'])"
          }
        },
        "growth": {
          "$entryId": {
            ".validate": "newData.hasChildren(['timestamp', 'weight'])"
          }
        },
        "milestones": {
          "$milestoneId": {
            ".validate": "newData.hasChildren(['title', 'achieved'])"
          }
        },
        "activities": {
          "$activityId": {
            ".validate": "newData.hasChildren(['timestamp', 'type'])"
          }
        },
        "reminders": {
          "$reminderId": {
            ".validate": "newData.hasChildren(['title', 'time'])"
          }
        }
      }
    }
  }
}
```

## Storage Rules

Use these security rules for Firebase Storage (for photo uploads):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Limit file size to 5MB
      allow write: if request.resource.size < 5 * 1024 * 1024;
      
      // Only allow image uploads
      allow write: if request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Database Structure

Your data will be organized like this:

```
users/
  {userId}/
    profile/
      name: "John Doe"
      email: "john@example.com"
      photoURL: "https://..."
    
    babies/
      {babyId}/
        name: "Baby Name"
        birthdate: "2024-04-15"
        gender: "male" | "female" | "other"
        photoURL: "https://..."
    
    feeding/
      {entryId}/
        timestamp: 1234567890
        type: "bottle" | "breast" | "solid"
        amount: "180ml"
        duration: "15min"
        notes: "Fed well"
    
    sleep/
      {entryId}/
        timestamp: 1234567890
        type: "nap" | "night"
        duration: "2h 30m"
        quality: "excellent" | "good" | "fair" | "poor"
    
    diaper/
      {entryId}/
        timestamp: 1234567890
        type: "wet" | "dirty" | "both"
        notes: "Normal"
    
    health/
      {entryId}/
        timestamp: 1234567890
        type: "checkup" | "medication" | "symptom" | "vaccination"
        details: {...}
    
    growth/
      {entryId}/
        timestamp: 1234567890
        weight: 8.5 (kg)
        height: 71 (cm)
        headCircumference: 45 (cm)
    
    milestones/
      {milestoneId}/
        title: "First steps"
        age: "9 months"
        achieved: true
        date: "2024-01-15"
        photoURL: "https://..."
    
    activities/
      {activityId}/
        timestamp: 1234567890
        type: "tummy-time" | "play" | "reading" | etc
        duration: "15min"
        notes: "Enjoyed it"
    
    reminders/
      {reminderId}/
        title: "Next feeding"
        time: 1234567890
        type: "feeding" | "medication" | "appointment" | etc
        enabled: true
```

## Indexes (for better query performance)

Add these indexes to your Realtime Database for better performance:

In Firebase Console > Realtime Database > Rules tab, add:

```json
{
  "rules": {
    "users": {
      "$uid": {
        "feeding": {
          ".indexOn": ["timestamp", "type"]
        },
        "sleep": {
          ".indexOn": ["timestamp", "type"]
        },
        "diaper": {
          ".indexOn": ["timestamp"]
        },
        "health": {
          ".indexOn": ["timestamp", "type"]
        },
        "growth": {
          ".indexOn": ["timestamp"]
        },
        "activities": {
          ".indexOn": ["timestamp", "type"]
        },
        "reminders": {
          ".indexOn": ["time", "enabled"]
        }
      }
    }
  }
}
```

## Firebase SDK Service File

The app uses these Firebase services (already configured in `src/services/firebase.js`):

- **Authentication**: Google Sign-In
- **Realtime Database**: Real-time data sync
- **Storage**: Photo uploads

## Environment Variables

Make sure your `.env` file has all required Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BASE_PATH=/
```

## Testing

To test your Firebase setup:

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000/
3. Click "Continue with Google"
4. Check Firebase Console > Authentication to see your user
5. Check Realtime Database to see user data structure created

## Production Deployment

For production deployment:

1. Build the app: `npm run build`
2. Deploy to Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

3. Update authorized domains in Firebase Console:
   - Go to Authentication > Settings > Authorized domains
   - Add your production domain

## Security Best Practices

- ✅ User data is isolated per user ID
- ✅ Only authenticated users can access the app
- ✅ Users can only read/write their own data
- ✅ File uploads limited to 5MB
- ✅ Only image files allowed for upload
- ✅ All data encrypted in transit (HTTPS)
- ✅ All data encrypted at rest (Firebase default)

## Backup Strategy

Enable Firebase backups:

1. Go to Firebase Console > Realtime Database
2. Click "Backup" tab
3. Enable automatic daily backups
4. Choose backup location

This ensures user data is never lost!
