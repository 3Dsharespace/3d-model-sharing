import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Your Firebase config - you'll need to get this from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Debug logs
console.log('🔧 Firebase initialized')
console.log('🔧 Auth domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)

// Expose for debugging
window.firebase = { app, auth, db, storage }

export { auth, db, storage }

// Helper functions
export const firebaseHelpers = {
  // Auth helpers
  async signUp(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Create profile
      await setDoc(doc(db, 'profiles', user.uid), {
        username,
        avatar_url: null,
        created_at: new Date().toISOString()
      })
      
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { user: userCredential.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  async signOut() {
    try {
      await signOut(auth)
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Profile helpers
  async getProfile(userId) {
    try {
      const docRef = doc(db, 'profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { profile: docSnap.data(), error: null }
      } else {
        return { profile: null, error: 'Profile not found' }
      }
    } catch (error) {
      return { profile: null, error: error.message }
    }
  },

  async getProfileByUsername(username) {
    try {
      const q = query(
        collection(db, 'profiles'),
        where('username', '==', username),
        limit(1)
      )
      
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { profile: { id: doc.id, ...doc.data() }, error: null }
      } else {
        return { profile: null, error: 'Profile not found' }
      }
    } catch (error) {
      return { profile: null, error: error.message }
    }
  },

  async ensureProfile(userId, username) {
    try {
      const profileRef = doc(db, 'profiles', userId)
      const profileSnap = await getDoc(profileRef)
      
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          username,
          avatar_url: null,
          created_at: new Date().toISOString()
        })
        return { profile: { username, avatar_url: null, created_at: new Date().toISOString() }, error: null }
      }
      
      return { profile: profileSnap.data(), error: null }
    } catch (error) {
      return { profile: null, error: error.message }
    }
  },

  // Model helpers
  async getModels(limitCount = 20) {
    try {
      const q = query(
        collection(db, 'models'),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const models = []
      querySnapshot.forEach((doc) => {
        const modelData = { id: doc.id, ...doc.data() }
        // Filter for public models only (to avoid index requirement)
        if (modelData.is_public === true) {
          models.push(modelData)
        }
      })
      
      return { models, error: null }
    } catch (error) {
      return { models: [], error: error.message }
    }
  },

  async getModelById(modelId) {
    try {
      const docRef = doc(db, 'models', modelId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { model: { id: docSnap.id, ...docSnap.data() }, error: null }
      } else {
        return { model: null, error: 'Model not found' }
      }
    } catch (error) {
      return { model: null, error: error.message }
    }
  },

  async getUserModels(userId) {
    try {
      const q = query(
        collection(db, 'models'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const models = []
      querySnapshot.forEach((doc) => {
        models.push({ id: doc.id, ...doc.data() })
      })
      
      return { models, error: null }
    } catch (error) {
      return { models: [], error: error.message }
    }
  },

  async uploadModel(modelData, file, thumbnail) {
    try {
      // Upload file
      const fileRef = ref(storage, `models/${file.name}`)
      const fileSnapshot = await uploadBytes(fileRef, file)
      const fileUrl = await getDownloadURL(fileSnapshot.ref)
      
      // Upload thumbnail
      const thumbnailRef = ref(storage, `thumbnails/${thumbnail.name}`)
      const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnail)
      const thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref)
      
      // Save model data
      const modelRef = await addDoc(collection(db, 'models'), {
        ...modelData,
        file_path: fileUrl,
        thumbnail_path: thumbnailUrl,
        file_size: file.size,
        file_type: file.type,
        downloads_count: 0,
        created_at: new Date().toISOString()
      })
      
      return { modelId: modelRef.id, error: null }
    } catch (error) {
      return { modelId: null, error: error.message }
    }
  },

  // Download helpers
  async recordDownload(userId, modelId) {
    try {
      await addDoc(collection(db, 'downloads'), {
        user_id: userId,
        model_id: modelId,
        created_at: new Date().toISOString()
      })
      
      // Update download count
      const modelRef = doc(db, 'models', modelId)
      const modelSnap = await getDoc(modelRef)
      if (modelSnap.exists()) {
        const currentCount = modelSnap.data().downloads_count || 0
        await updateDoc(modelRef, { downloads_count: currentCount + 1 })
      }
      
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }
}
