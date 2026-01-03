# Panduan Setup Firebase untuk MindPilot AI

## Langkah 1: Buat Project Firebase

1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Create a project"** atau **"Add project"**
3. Masukkan nama project: `mindpilot-ai`
4. Disable Google Analytics (optional)
5. Klik **Create project**

## Langkah 2: Setup Authentication

1. Di sidebar, klik **Build** → **Authentication**
2. Klik **Get started**
3. Pilih **Email/Password** → Enable → Save
4. (Optional) Pilih **Google** → Enable → Masukkan email support → Save

## Langkah 3: Setup Firestore Database

1. Di sidebar, klik **Build** → **Firestore Database**
2. Klik **Create database**
3. Pilih **Start in test mode** (untuk development)
4. Pilih region terdekat (asia-southeast1 untuk Malaysia)
5. Klik **Enable**

## Langkah 4: Dapatkan Firebase Config

1. Di sidebar, klik ikon gear ⚙️ → **Project settings**
2. Scroll ke bawah ke **Your apps**
3. Klik ikon **</>** (Web)
4. Masukkan nama app: `mindpilot-web`
5. Klik **Register app**
6. Copy config object yang dipaparkan

## Langkah 5: Update Config dalam Code

Buka file `client/src/lib/firebase.ts` dan gantikan:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← Ganti dengan API key anda
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",     // ← Ganti dengan project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Contoh config sebenar:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "mindpilot-ai-12345.firebaseapp.com",
  projectId: "mindpilot-ai-12345",
  storageBucket: "mindpilot-ai-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Langkah 6: Setup Firestore Rules (Production)

Di Firestore → Rules, gantikan dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /wellness/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /chatHistory/{chatId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

## Langkah 7: Test

1. Restart dev server: `npm run dev`
2. Buka app dan cuba register
3. Check Firebase Console → Authentication untuk lihat user baru
4. Check Firestore untuk lihat data

## Struktur Database

```
users/
  {userId}/
    - email
    - firstName
    - lastName
    - isPremium
    - trialStartDate
    - trialEndDate
    - aiResponsesUsedToday
    - createdAt

tasks/
  {taskId}/
    - userId
    - title
    - priority
    - status
    - category
    - createdAt

transactions/
  {transactionId}/
    - userId
    - description
    - amount
    - type (income/expense)
    - category
    - date
    - createdAt

wellness/
  {entryId}/
    - userId
    - mood
    - energy
    - sleep
    - notes
    - date
    - createdAt

goals/
  {goalId}/
    - userId
    - title
    - category
    - status
    - progress
    - targetDate
    - createdAt

chatHistory/
  {chatId}/
    - userId
    - message
    - response
    - createdAt
```

## Soalan?

Jika ada masalah, pastikan:
1. Firebase config betul
2. Authentication enabled
3. Firestore database created
4. Internet connection OK
