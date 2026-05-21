// Import only essential Firebase services to reduce bundle size
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, orderBy, limit, increment, writeBatch, arrayUnion, arrayRemove, serverTimestamp, addDoc, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtaQ7-1Hd5e_OgQ5eLT94-WVYodWcJ6mM",
  authDomain: "dsharespace-v2.firebaseapp.com",
  projectId: "dsharespace-v2",
  storageBucket: "dsharespace-v2.firebasestorage.app",
  messagingSenderId: "752132224763",
  appId: "1:752132224763:web:12caa9830fca0288f5225e",
  measurementId: "G-DVE3KJ3EWJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize only essential Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Pin region explicitly to avoid cross-origin edge cases
const functions = getFunctions(app, 'us-central1');

const makeSeoFileName = (title = 'free-3d-model-render', originalName = '', index = 0) => {
  const extension = String(originalName).split('?')[0].split('.').pop() || 'jpg';
  const safeExtension = extension === originalName ? 'jpg' : extension.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const slug = String(title || 'free-3d-model-render')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'free-3d-model-render';

  return `${slug}-free-3d-model-render-${index + 1}.${safeExtension}`;
};

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines when you want to use emulators
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}

// Lazy load optional Firebase services when needed
export const getFirebaseService = async (serviceName) => {
  switch (serviceName) {
    case 'analytics':
      const { getAnalytics } = await import('firebase/analytics');
      return getAnalytics(app);
    case 'functions':
      const { getFunctions } = await import('firebase/functions');
      return getFunctions(app, 'us-central1');
    case 'messaging':
      const { getMessaging } = await import('firebase/messaging');
      return getMessaging(app);
    case 'performance':
      const { getPerformance } = await import('firebase/performance');
      return getPerformance(app);
    default:
      throw new Error(`Unknown Firebase service: ${serviceName}`);
  }
};

// Firebase helper functions
const getNotificationPreferenceKey = (type) => {
  const preferenceKeys = {
    follow: 'follows',
    like: 'likes',
    comment: 'comments',
    download: 'downloads',
    tip: 'tips',
    achievement: 'achievements',
    view_milestone: 'milestones',
    featured: 'featured',
    review: 'reviews',
    share: 'shares',
    collaboration: 'collaborations',
    collection_add: 'collections',
    system: 'system',
    security: 'security',
    report: 'system'
  };

  return preferenceKeys[type] || type;
};

export const firebaseHelpers = {
  // Subscribe to users collection in real-time
  subscribeToUsers: (callback) => {
    try {
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(docSnap => ({ uid: docSnap.id, ...docSnap.data() }));
        callback(users);
      }, (error) => {
        console.error('❌ subscribeToUsers error:', error);
      });
      return unsubscribe;
    } catch (error) {
      console.error('❌ subscribeToUsers initialization error:', error);
      return () => {};
    }
  },
  // Authentication
  signUp: async (email, password, username) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        displayName: username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: false,
        totalDownloads: 0,
        totalLikes: 0,
        totalViews: 0
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signIn: async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signOutUser: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Google Authentication
  signInWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile for new Google users
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isVerified: true, // Google accounts are verified
          totalDownloads: 0,
          totalLikes: 0,
          totalViews: 0,
          provider: 'google'
        });
      }
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signInWithGoogleRedirect: async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithRedirect(auth, provider);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getGoogleRedirectResult: async () => {
    try {
      const result = await getRedirectResult(auth);
      
      if (result) {
        const { user } = result;
        
        // Check if user profile exists, if not create one
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // Create user profile for new Google users
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            username: user.displayName || user.email.split('@')[0],
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isVerified: true, // Google accounts are verified
            totalDownloads: 0,
            totalLikes: 0,
            totalViews: 0,
            provider: 'google'
          });
        }
        
        return { success: true, user };
      }
      
      return { success: false, user: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // User Management
  getUsers: async (filters = {}) => {
    try {
      console.log('🔍 getUsers called with filters:', filters);
      
      let usersQuery = collection(db, 'users');
      const constraints = [];
      
      // Apply filters if provided
      if (filters.role) {
        constraints.push(where('role', '==', filters.role));
      }
      
      if (filters.isVerified !== undefined) {
        constraints.push(where('isVerified', '==', filters.isVerified));
      }
      
      if (filters.provider) {
        constraints.push(where('provider', '==', filters.provider));
      }
      
      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'));
      
      // Apply limit if specified
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      if (constraints.length > 0) {
        usersQuery = query(usersQuery, ...constraints);
      }
      
      const querySnapshot = await getDocs(usersQuery);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          uid: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ getUsers returning:', users.length, 'users');
      return { success: true, users };
      
    } catch (error) {
      console.error('💥 Error in getUsers:', error);
      return { success: false, error: error.message, users: [] };
    }
  },

  // User Profile Management
  getUserProfile: async (identifier) => {
    try {
      console.log('🔍 getUserProfile called with identifier:', identifier);
      
      // First try to find profile by the identifier directly (could be UID or username)
      let docRef = doc(db, 'users', identifier);
      let docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Profile found by direct identifier:', identifier);
        return { success: true, profile: docSnap.data() };
      }
      
      // If not found, try to find by username in the users collection
      console.log('🔍 Profile not found by direct identifier, searching by username...');
      const usersQuery = query(collection(db, 'users'), where('username', '==', identifier));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        console.log('✅ Profile found by username:', identifier, 'UID:', userDoc.id);
        return { success: true, profile: { ...userDoc.data(), id: userDoc.id } };
      }
      
      // If still not found, try to find by displayName
      console.log('🔍 Profile not found by username, searching by displayName...');
      const displayNameQuery = query(collection(db, 'users'), where('displayName', '==', identifier));
      const displayNameSnapshot = await getDocs(displayNameQuery);
      
      if (!displayNameSnapshot.empty) {
        const userDoc = displayNameSnapshot.docs[0];
        console.log('✅ Profile found by displayName:', identifier, 'UID:', userDoc.id);
        return { success: true, profile: { ...userDoc.data(), id: userDoc.id } };
      }
      
      console.log('❌ Profile not found by any method:', identifier);
      return { success: false, error: 'Profile not found' };
    } catch (error) {
      console.error('💥 Error in getUserProfile:', error);
      return { success: false, error: error.message };
    }
  },

  updateUserProfile: async (uid, updates) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  uploadAvatar: async (uid, file, onProgress) => {
    try {
      // Create a unique filename for the avatar
      const fileExtension = file.name.split('.').pop();
      const avatarFileName = `avatar_${uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `avatars/${uid}/${avatarFileName}`);
      
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Track upload progress if callback provided
      if (onProgress) {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Avatar upload error:', error);
            throw error;
          }
        );
      }
      
      // Wait for upload to complete
      const uploadResult = await uploadTask;
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return { success: true, downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin Management
  setUserAsAdmin: async (uid, isAdmin = true) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isAdmin: isAdmin,
        role: isAdmin ? 'admin' : 'user',
        role_updated_by: auth.currentUser?.uid || 'admin',
        role_updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await firebaseHelpers.logAdminAction('user_role_updated', {
        targetUserId: uid,
        role: isAdmin ? 'admin' : 'user'
      });
      return { success: true };
    } catch (error) {
      console.error('Error tracking download:', error);
      return { success: false, error: error.message };
    }
  },

  updateUserStatus: async (uid, status) => {
    try {
      const allowedStatuses = ['active', 'inactive', 'banned', 'pending'];
      if (!allowedStatuses.includes(status)) {
        throw new Error('Invalid user status');
      }

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status,
        statusUpdatedBy: auth.currentUser?.uid || 'admin',
        statusUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await firebaseHelpers.logAdminAction('user_status_updated', {
        targetUserId: uid,
        status
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logAdminAction: async (action, metadata = {}) => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'Admin is not signed in' };
      }

      await addDoc(collection(db, 'logs'), {
        type: 'admin_action',
        action,
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email || null,
        metadata,
        createdAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Admin log error:', error);
      return { success: false, error: error.message };
    }
  },

  checkAdminStatus: async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        return { 
          success: true, 
          isAdmin: profile.isAdmin === true || profile.role === 'admin' 
        };
      } else {
        return { success: false, isAdmin: false };
      }
    } catch (error) {
      return { success: false, isAdmin: false, error: error.message };
    }
  },

  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const users = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt || userData.created_at,
          updatedAt: userData.updatedAt || userData.updated_at
        });
      });
      
      // Sort by creation date (newest first)
      users.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return { success: true, users };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message, users: [] };
    }
  },

  // Update user role (Admin only)
  updateUserRole: async (userId, newRole) => {
    try {
      const updateUserRole = httpsCallable(functions, 'updateUserRole');
      const result = await updateUserRole({ userId, newRole });
      return result.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    try {
      const deleteUser = httpsCallable(functions, 'deleteUser');
      const result = await deleteUser({ userId });
      return result.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  },

  // Analytics API Integration
  getAnalyticsData: async (timeRange = '30d') => {
    try {
      const getAnalyticsData = httpsCallable(functions, 'getAnalyticsData');
      const result = await getAnalyticsData({ timeRange });
      return result.data;
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return { success: false, error: error.message };
    }
  },

  trackUserActivity: async (action, metadata = {}) => {
    try {
      const trackUserActivity = httpsCallable(functions, 'trackUserActivity');
      const result = await trackUserActivity({ action, metadata });
      return result.data;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      return { success: false, error: error.message };
    }
  },

  // 3D Model Management
  uploadModel: async (modelData, file, previewImages = [], onProgress) => {
    try {
      console.log('🚀 Starting upload process...');
      console.log('📁 Model data:', modelData);
      console.log('📄 File:', file.name, file.size, file.type);
      console.log('🖼️ Preview images:', previewImages.length);
      
      // Upload main model file to Storage with progress tracking
      const storageRef = ref(storage, `models/${modelData.userId}/${modelData.uid}/${file.name}`);
      console.log('📂 Storage path:', `models/${modelData.userId}/${modelData.uid}/${file.name}`);
      
      // Create upload task for progress tracking
      const modelMetadata = {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          ownerId: modelData.userId,
          modelId: modelData.uid
        }
      };
      const uploadTask = uploadBytesResumable(storageRef, file, modelMetadata);
      console.log('📤 Upload task created');
      
      // Track upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('📊 Upload progress:', progress + '%');
          if (onProgress) onProgress('uploading', progress, 'Uploading 3D model...');
        },
        (error) => {
          console.error('❌ Upload error:', error);
          throw error;
        }
      );
      
      // Wait for upload to complete
      console.log('⏳ Waiting for upload to complete...');
      const uploadResult = await uploadTask;
      console.log('✅ Upload completed:', uploadResult);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('🔗 Download URL:', downloadURL);
      
      if (onProgress) onProgress('processing', 50, 'Processing model...');

      // Upload preview images if provided
      const previewURLs = []
      if (previewImages.length > 0) {
        if (onProgress) onProgress('uploading', 60, `Uploading ${previewImages.length} preview images...`);
        
        for (let i = 0; i < previewImages.length; i++) {
          const image = previewImages[i]
          const seoImageName = makeSeoFileName(modelData.title || modelData.name, image.file.name, i)
          const imageRef = ref(storage, `models/${modelData.userId}/${modelData.uid}/previews/${seoImageName}`)
          
          // Upload preview image with progress
          const imageUploadTask = uploadBytesResumable(imageRef, image.file, {
            contentType: image.file.type || 'image/jpeg',
            customMetadata: {
              ownerId: modelData.userId,
              modelId: modelData.uid
            }
          });
          await imageUploadTask;
          
          const imageURL = await getDownloadURL(imageRef)
          previewURLs.push({
            url: imageURL,
            name: seoImageName,
            originalName: image.file.name,
            order: i
          })
          
          // Update progress for each image
          if (onProgress) {
            const imageProgress = 60 + ((i + 1) / previewImages.length) * 20;
            onProgress('uploading', imageProgress, `Uploaded ${i + 1}/${previewImages.length} preview images...`);
          }
        }
      }
      
      if (onProgress) onProgress('processing', 80, 'Saving model metadata...');

      // Save model metadata to Firestore
      const modelRef = doc(db, 'models', modelData.uid);
      await setDoc(modelRef, {
        ...modelData,
        user_id: modelData.user_id || modelData.userId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || '',
        fileFormat: file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : '',
        fileURL: downloadURL,
        file_url: downloadURL,
        previewImages: previewURLs,
        is_private: modelData.is_private ?? modelData.isPublic === false,
        createdAt: new Date().toISOString(),
        created_at: modelData.created_at || modelData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        downloads: 0,
        likes: 0,
        views: 0,
        // Platform model tracking
        isPlatformModel: modelData.isPlatformModel || false,
        platformRevenue: modelData.platformRevenue || false,
        revenueShare: modelData.isPlatformModel ? 0 : 0.3, // 0% for platform models, 30% for user models
        platformEarnings: 0,
        creatorEarnings: 0
      });
      
      if (onProgress) onProgress('complete', 100, 'Upload complete!');

      return { success: true, modelId: modelData.uid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getModels: async (filters = {}) => {
    try {
      console.log('🔍 getModels called with filters:', filters);
      
      // Get all models first
      const modelsRef = collection(db, 'models');
      const querySnapshot = await getDocs(modelsRef);
      
      let models = [];
      querySnapshot.forEach((doc) => {
        const modelData = { id: doc.id, ...doc.data() };
        models.push(modelData);
      });
      
      // Apply filters manually
      if (filters.userId) {
        console.log('🔍 Filtering by userId:', filters.userId);
        
        // Check if the userId is actually a username, if so, find the real UID
        let actualUserId = filters.userId;
        
        // First try to find user profile by the identifier directly
        let userDoc = await getDoc(doc(db, 'users', filters.userId));
        
        if (!userDoc.exists()) {
          // If not found, try to find by username
          console.log('🔍 User profile not found by direct identifier, searching by username...');
          const usersQuery = query(collection(db, 'users'), where('username', '==', filters.userId));
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            userDoc = usersSnapshot.docs[0];
            actualUserId = userDoc.id;
            console.log('✅ User profile found by username:', filters.userId, 'UID:', actualUserId);
          } else {
            // Try by displayName as last resort
            console.log('🔍 User profile not found by username, searching by displayName...');
            const displayNameQuery = query(collection(db, 'users'), where('displayName', '==', filters.userId));
            const displayNameSnapshot = await getDocs(displayNameQuery);
            
            if (!displayNameSnapshot.empty) {
              userDoc = displayNameSnapshot.docs[0];
              actualUserId = userDoc.id;
              console.log('✅ User profile found by displayName:', filters.userId, 'UID:', actualUserId);
            }
          }
        }
        
        // Filter models by the actual UID
        models = models.filter(model => model.userId === actualUserId);
        console.log('🔍 Filtered models by actual UID:', actualUserId, 'Found:', models.length, 'models');
      }
      
      if (filters.category) {
        console.log('🔍 Filtering by category:', filters.category);
        models = models.filter(model => model.category === filters.category);
      }
      
      // Sort by createdAt (newest first)
      models.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('✅ getModels returning:', models.length, 'models');
      return { success: true, models };
    } catch (error) {
      console.error('❌ getModels error:', error);
      return { success: false, error: error.message };
    }
  },

  getLikedModels: async (userId) => {
    try {
      console.log('🔍 getLikedModels called for userId:', userId);
      
      // Get all likes for this user
      const likesQuery = query(collection(db, 'likes'), where('userId', '==', userId));
      const likesSnapshot = await getDocs(likesQuery);
      
      if (likesSnapshot.empty) {
        console.log('✅ No liked models found for user:', userId);
        return { success: true, models: [] };
      }
      
      // Get the model IDs from the likes
      const modelIds = [];
      likesSnapshot.forEach((doc) => {
        const likeData = doc.data();
        if (likeData.modelId) {
          modelIds.push(likeData.modelId);
        }
      });
      
      console.log('🔍 Found liked model IDs:', modelIds);
      
      // Fetch the actual models
      const models = [];
      for (const modelId of modelIds) {
        try {
          const modelDoc = await getDoc(doc(db, 'models', modelId));
          if (modelDoc.exists()) {
            const modelData = { id: modelDoc.id, ...modelDoc.data() };
            models.push(modelData);
          }
        } catch (error) {
          console.error('❌ Error fetching model:', modelId, error);
        }
      }
      
      // Sort by creation date (newest first)
      models.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('✅ getLikedModels returning:', models.length, 'models');
      return { success: true, models };
    } catch (error) {
      console.error('❌ getLikedModels error:', error);
      return { success: false, error: error.message };
    }
  },

  getModel: async (modelId) => {
    try {
      const docRef = doc(db, 'models', modelId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, model: docSnap.data() };
      } else {
        return { success: false, error: 'Model not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateModel: async (modelId, modelData) => {
    try {
      const modelRef = doc(db, 'models', modelId);
      await updateDoc(modelRef, {
        ...modelData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteModel: async (modelId, userId) => {
    try {
      // If no userId provided, use Firebase Cloud Function (admin context)
      if (!userId) {
        const deleteModelFunction = httpsCallable(functions, 'deleteModel');
        const result = await deleteModelFunction({ modelId });
        return result.data;
      }
      
      // First, get the model data to access file URLs
      const modelDoc = await getDoc(doc(db, 'models', modelId));
      if (!modelDoc.exists()) {
        return { success: false, error: 'Model not found' };
      }
      
      const modelData = modelDoc.data();
      
      // Check if user is authorized to delete this model
      if (modelData.userId !== userId) {
        return { success: false, error: 'Unauthorized to delete this model' };
      }
      
      const batch = writeBatch(db);
      
      // Delete the model document
      batch.delete(doc(db, 'models', modelId));
      
      // Delete associated likes
      const likesQuery = query(collection(db, 'likes'), where('modelId', '==', modelId));
      const likesSnapshot = await getDocs(likesQuery);
      likesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete associated comments
      const commentsQuery = query(collection(db, 'comments'), where('modelId', '==', modelId));
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete associated downloads
      const downloadsQuery = query(collection(db, 'downloads'), where('modelId', '==', modelId));
      const downloadsSnapshot = await getDocs(downloadsQuery);
      downloadsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete associated bookmarks
      const bookmarksQuery = query(collection(db, 'bookmarks'), where('modelId', '==', modelId));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      bookmarksSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Commit all Firestore deletions
      await batch.commit();
      
      // Delete files from Storage (if they exist)
      try {
        if (modelData.fileUrl) {
          const fileRef = ref(storage, modelData.fileUrl);
          await deleteObject(fileRef);
        }
        
        // Delete preview images
        if (modelData.previewImages && modelData.previewImages.length > 0) {
          for (const image of modelData.previewImages) {
            if (image.url) {
              const imageRef = ref(storage, image.url);
              await deleteObject(imageRef);
            }
          }
        }
        
        // Delete thumbnail
        if (modelData.thumbnail) {
          const thumbnailRef = ref(storage, modelData.thumbnail);
          await deleteObject(thumbnailRef);
        }
      } catch (storageError) {
        console.warn('Some files could not be deleted from storage:', storageError);
        // Continue with deletion even if storage cleanup fails
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting model:', error);
      return { success: false, error: error.message };
    }
  },

  // Download tracking
  trackDownload: async (modelId, userId) => {
    try {
      // Read model to get owner for notification (no permission issues on reads)
      const modelRef = doc(db, 'models', modelId);
      const modelSnap = await getDoc(modelRef);
      const modelData = modelSnap.exists() ? modelSnap.data() : {};
      const modelOwnerId = modelData.userId || modelData.user_id || modelData.ownerId || userId;
      const now = new Date().toISOString();

      // 1) Record download event (allowed by rules)
      await addDoc(collection(db, 'downloads'), {
        modelId,
        model_id: modelId,
        userId,
        user_id: userId,
        creatorId: modelOwnerId,
        creator_id: modelOwnerId,
        downloadedAt: now,
        createdAt: now,
        created_at: now,
        verified_download: true
      });

      // 2) Increment user's total downloads (user can update own doc)
      try {
        await updateDoc(doc(db, 'users', userId), {
          totalDownloads: increment(1)
        });
      } catch (e) {
        // Non-fatal: continue even if user doc missing or blocked
        console.warn('Non-fatal: failed to increment user totalDownloads', e);
      }

      // 3) Optional: Notify model owner
      try {
        if (modelOwnerId && modelOwnerId !== userId) {
          const downloaderProfile = await firebaseHelpers.getUserProfile(userId);
          const downloaderName = downloaderProfile.success ?
            (downloaderProfile.profile.displayName || downloaderProfile.profile.username || 'Someone') :
            'Someone';

          await firebaseHelpers.createNotification({
            type: 'download',
            recipientId: modelOwnerId,
            actorId: userId,
            actorName: downloaderName,
            modelId: modelId,
            modelTitle: modelData.title || 'Untitled Model',
            message: `${downloaderName} downloaded your model "${modelData.title || 'Untitled Model'}"`
          });
        }
      } catch (notificationError) {
        console.error('⚠️ Failed to create download notification:', notificationError);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // View tracking
  incrementViews: async (modelId) => {
    try {
      const modelRef = doc(db, 'models', modelId);
      await updateDoc(modelRef, {
        views: increment(1)
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Like/Unlike functionality
  toggleLike: async (modelId, userId) => {
    try {
      console.log('❤️ Toggling like for model:', modelId, 'user:', userId);
      
      // Check if user already liked this model by querying
      const likesQuery = query(
        collection(db, 'likes'), 
        where('userId', '==', userId), 
        where('modelId', '==', modelId)
      );
      const likesSnapshot = await getDocs(likesQuery);
      
      if (!likesSnapshot.empty) {
        // Unlike: remove all like documents for this user-model combination
        const batch = writeBatch(db);
        likesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        // Decrement like count
        const modelRef = doc(db, 'models', modelId);
        batch.update(modelRef, {
          likes: increment(-1),
          updatedAt: new Date().toISOString()
        });
        
        await batch.commit();
        console.log('💔 Like removed successfully');
        return { success: true, liked: false };
      } else {
        // Like: create like document with unique ID
        const likeId = `${userId.slice(0, 8)}_${modelId.slice(0, 8)}_${Date.now()}`;
        const likeRef = doc(db, 'likes', likeId);
        
        await setDoc(likeRef, {
          userId: userId,
          modelId: modelId,
          createdAt: new Date().toISOString()
        });
        
        // Increment like count
        const modelRef = doc(db, 'models', modelId);
        await updateDoc(modelRef, {
          likes: increment(1),
          updatedAt: new Date().toISOString()
        });
        
        console.log('❤️ Like added successfully');
        return { success: true, liked: true };
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user has liked a model
  hasUserLiked: async (modelId, userId) => {
    try {
      const likesQuery = query(
        collection(db, 'likes'), 
        where('userId', '==', userId), 
        where('modelId', '==', modelId)
      );
      const likesSnapshot = await getDocs(likesQuery);
      return { success: true, liked: !likesSnapshot.empty };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Bookmark functionality
  toggleBookmark: async (modelId, userId) => {
    try {
      const bookmarkRef = doc(db, 'bookmarks', `${modelId}_${userId}`);
      const bookmarkDoc = await getDoc(bookmarkRef);
      
      if (bookmarkDoc.exists()) {
        // Remove bookmark
        await deleteDoc(bookmarkRef);
        return { success: true, bookmarked: false };
      } else {
        // Add bookmark
        await setDoc(bookmarkRef, {
          modelId,
          userId,
          createdAt: new Date().toISOString()
        });
        return { success: true, bookmarked: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if user has bookmarked a model
  hasUserBookmarked: async (modelId, userId) => {
    try {
      const bookmarkRef = doc(db, 'bookmarks', `${modelId}_${userId}`);
      const bookmarkDoc = await getDoc(bookmarkRef);
      return { success: true, bookmarked: bookmarkDoc.exists() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Comments functionality
  addComment: async (modelId, userId, commentText, userDisplayName) => {
    try {
      const commentRef = doc(collection(db, 'comments'));
      await setDoc(commentRef, {
        modelId,
        userId,
        userDisplayName: userDisplayName || 'Anonymous',
        comment: commentText,
        createdAt: new Date().toISOString(),
        likes: 0
      });

      // Create notification for the model owner (if not commenting on own model)
      try {
        const modelRef = doc(db, 'models', modelId);
        const modelDoc = await getDoc(modelRef);
        if (modelDoc.exists()) {
          const modelData = modelDoc.data();
          const modelOwnerId = modelData.userId;
          
          if (modelOwnerId !== userId) {
            await firebaseHelpers.createNotification({
              type: 'comment',
              recipientId: modelOwnerId,
              actorId: userId,
              actorName: userDisplayName || 'Anonymous',
              modelId: modelId,
              modelTitle: modelData.title || 'Untitled Model',
              message: `${userDisplayName || 'Anonymous'} commented on your model "${modelData.title || 'Untitled Model'}"`
            });
          }
        }
      } catch (notificationError) {
        console.error('⚠️ Failed to create comment notification:', notificationError);
        // Don't fail the comment operation if notification fails
      }

      return { success: true, commentId: commentRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get comments for a model
  getComments: async (modelId) => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('modelId', '==', modelId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const comments = [];
      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, comments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get related models using title words and tags first, then category as a fallback signal.
  getRelatedModels: async (modelId, category, userId, pageLimit = 8, currentModel = null) => {
    try {
      const modelsRef = collection(db, 'models');
      const snapshots = [];

      snapshots.push(await getDocs(modelsRef));

      const candidates = new Map();
      snapshots.forEach((snapshot) => {
        snapshot.forEach((document) => {
          if (document.id !== modelId && !candidates.has(document.id)) {
            candidates.set(document.id, { id: document.id, ...document.data() });
          }
        });
      });

      const normalizeTerm = (term) => {
        const value = String(term || '').toLowerCase().trim();
        if (!value) return '';
        if (value.endsWith('ies') && value.length > 4) return `${value.slice(0, -3)}y`;
        if (value.endsWith('oes') && value.length > 4) return value.slice(0, -2);
        if (value.endsWith('s') && value.length > 3) return value.slice(0, -1);
        return value;
      };

      const relatedTerms = {
        shoe: ['shoes', 'sneaker', 'sneakers', 'footwear', 'trainer', 'trainers', 'boot', 'boots', 'sole'],
        sneaker: ['shoe', 'shoes', 'sneakers', 'footwear', 'trainer', 'trainers'],
        footwear: ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'sandals'],
        car: ['cars', 'vehicle', 'vehicles', 'automotive', 'auto'],
        vehicle: ['car', 'cars', 'truck', 'trucks', 'transport', 'automotive'],
        chair: ['chairs', 'seat', 'seating', 'furniture'],
        table: ['tables', 'desk', 'desks', 'furniture'],
        bag: ['bags', 'luggage', 'suitcase', 'suitcases', 'travel'],
        luggage: ['bag', 'bags', 'suitcase', 'suitcases', 'travel'],
        building: ['buildings', 'architecture', 'house', 'cityscape'],
        character: ['characters', 'person', 'people', 'human', 'creature'],
        prop: ['props', 'asset', 'assets']
      };

      const getTokens = (item) => {
        const raw = [
          item?.title,
          item?.name,
          item?.category,
          item?.format,
          ...(Array.isArray(item?.tags) ? item.tags : [])
        ].filter(Boolean).join(' ');

        const baseTokens = raw
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .map(normalizeTerm)
          .filter((word) => word.length > 2);

        return new Set(baseTokens);
      };

      const currentTokens = getTokens(currentModel);
      const expandedCurrentTokens = new Set(currentTokens);

      currentTokens.forEach((token) => {
        (relatedTerms[token] || []).forEach((relatedTerm) => {
          expandedCurrentTokens.add(normalizeTerm(relatedTerm));
        });
      });

      const scoreModel = (item) => {
        const itemTokens = getTokens(item);
        const exactMatches = [...itemTokens].filter((token) => currentTokens.has(token)).length;
        const semanticMatches = [...itemTokens].filter((token) => expandedCurrentTokens.has(token)).length;
        const currentTitle = String(currentModel?.title || '').toLowerCase();
        const itemTitle = String(item.title || '').toLowerCase();
        const titlePhraseMatch = [...currentTokens].some((token) => token.length > 4 && currentTitle.includes(token) && itemTitle.includes(token)) ? 10 : 0;
        const categoryMatch = category && item.category === category ? 1.5 : 0;
        const creatorMatch = userId && item.userId === userId ? 0.75 : 0;
        const popularity = Math.min(4, (Number(item.downloads || 0) * 0.25) + (Number(item.likes || 0) * 0.4) + (Number(item.views || 0) * 0.025));
        const recency = item.createdAt ? Math.max(0, 1.5 - ((Date.now() - new Date(item.createdAt).getTime()) / 86400000 / 45)) : 0;

        return titlePhraseMatch + (exactMatches * 8) + (semanticMatches * 4) + categoryMatch + creatorMatch + popularity + recency;
      };

      const models = [...candidates.values()]
        .filter((item) => item.is_private !== true && item.isPublic !== false && item.status !== 'draft')
        .map((item) => ({ item, score: scoreModel(item) }))
        .filter(({ score }) => score > 1)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item)
        .slice(0, pageLimit);

      return { success: true, models };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user statistics (models count, downloads, followers)
  getUserStats: async (identifier) => {
    try {
      console.log('📊 getUserStats called with identifier:', identifier);
      
      // First try to find user profile by the identifier directly
      let userDoc = await getDoc(doc(db, 'users', identifier));
      let actualUserId = identifier;
      
      if (!userDoc.exists()) {
        // If not found, try to find by username
        console.log('🔍 User profile not found by direct identifier, searching by username...');
        const usersQuery = query(collection(db, 'users'), where('username', '==', identifier));
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          userDoc = usersSnapshot.docs[0];
          actualUserId = userDoc.id;
          console.log('✅ User profile found by username:', identifier, 'UID:', actualUserId);
        } else {
          // Try by displayName as last resort
          console.log('🔍 User profile not found by username, searching by displayName...');
          const displayNameQuery = query(collection(db, 'users'), where('displayName', '==', identifier));
          const displayNameSnapshot = await getDocs(displayNameQuery);
          
          if (!displayNameSnapshot.empty) {
            userDoc = displayNameSnapshot.docs[0];
            actualUserId = userDoc.id;
            console.log('✅ User profile found by displayName:', identifier, 'UID:', actualUserId);
          } else {
            console.log('❌ User profile not found by any method:', identifier);
            return { success: false, error: 'User not found' };
          }
        }
      }
      
      // Get user's models count using the actual UID
      const modelsQuery = query(collection(db, 'models'), where('userId', '==', actualUserId));
      const modelsSnapshot = await getDocs(modelsQuery);
      const modelsCount = modelsSnapshot.size;
      console.log('📦 Found', modelsCount, 'models for user:', actualUserId);

      // Get user's total downloads from profile
      const userData = userDoc.data();
      const totalDownloads = userData.totalDownloads || 0;

      // Get followers count (users who follow this user)
      const followersQuery = query(collection(db, 'followers'), where('followingId', '==', actualUserId));
      const followersSnapshot = await getDocs(followersQuery);
      const followersCount = followersSnapshot.size;

      console.log('📊 Stats calculated - Models:', modelsCount, 'Downloads:', totalDownloads, 'Followers:', followersCount);

      return {
        success: true,
        stats: {
          models: modelsCount,
          downloads: totalDownloads,
          followers: followersCount
        }
      };
    } catch (error) {
      console.error('💥 Error in getUserStats:', error);
      return { success: false, error: error.message };
    }
  },

  // Increment view count for a model
  incrementViews: async (modelId) => {
    try {
      console.log('👁️ Incrementing views for model:', modelId);
      
      // Increment view count in Firestore
      const modelRef = doc(db, 'models', modelId);
      await updateDoc(modelRef, {
        views: increment(1),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ View count incremented successfully');
      return { success: true, alreadyViewed: false };
    } catch (error) {
      console.error('❌ Error incrementing views:', error);
      // Return success even if view increment fails to avoid blocking the UI
      return { success: true, alreadyViewed: false, error: error.message };
    }
  },

  // Toggle like for a model
  toggleLike: async (modelId, userId) => {
    try {
      console.log('❤️ Toggling like for model:', modelId, 'user:', userId);
      
      // Check if user already liked this model by querying
      const likesQuery = query(
        collection(db, 'likes'), 
        where('userId', '==', userId), 
        where('modelId', '==', modelId)
      );
      const likesSnapshot = await getDocs(likesQuery);
      console.log('🔍 Found existing likes:', likesSnapshot.size);
      
      if (!likesSnapshot.empty) {
        // Unlike: remove all like documents for this user-model combination
        console.log('💔 Attempting to unlike...');
        
        try {
          // Try batch operation first
          const batch = writeBatch(db);
          likesSnapshot.forEach((doc) => {
            console.log('🗑️ Deleting like document:', doc.id);
            batch.delete(doc.ref);
          });
          
          // Decrement like count
          const modelRef = doc(db, 'models', modelId);
          batch.update(modelRef, {
            likes: increment(-1),
            updatedAt: new Date().toISOString()
          });
          
          await batch.commit();
          console.log('✅ Batch unlike successful');
          return { success: true, liked: false };
        } catch (batchError) {
          console.log('⚠️ Batch operation failed, trying individual operations:', batchError.message);
          
          // Fallback: individual operations
          try {
            // Delete like documents individually
            for (const doc of likesSnapshot.docs) {
              await deleteDoc(doc.ref);
              console.log('🗑️ Deleted like document:', doc.id);
            }
            
            // Decrement like count
            const modelRef = doc(db, 'models', modelId);
            await updateDoc(modelRef, {
              likes: increment(-1),
              updatedAt: new Date().toISOString()
            });
            
            console.log('✅ Individual unlike successful');
            return { success: true, liked: false };
          } catch (individualError) {
            console.error('❌ Individual operations also failed:', individualError.message);
            throw individualError;
          }
        }
      } else {
        // Like: create like document with unique ID
        console.log('❤️ Attempting to like...');
        const likeId = `${userId.slice(0, 8)}_${modelId.slice(0, 8)}_${Date.now()}`;
        const likeRef = doc(db, 'likes', likeId);
        
        await setDoc(likeRef, {
          userId: userId,
          modelId: modelId,
          createdAt: new Date().toISOString()
        });
        
        // Increment like count
        const modelRef = doc(db, 'models', modelId);
        await updateDoc(modelRef, {
          likes: increment(1),
          updatedAt: new Date().toISOString()
        });

        // Create notification for the model owner (if not liking own model)
        try {
          const modelDoc = await getDoc(modelRef);
          if (modelDoc.exists()) {
            const modelData = modelDoc.data();
            const modelOwnerId = modelData.userId;
            
            if (modelOwnerId !== userId) {
              // Get the liker's profile for the notification
              const likerProfile = await firebaseHelpers.getUserProfile(userId);
              const likerName = likerProfile.success ? 
                (likerProfile.profile.displayName || likerProfile.profile.username || 'Someone') : 
                'Someone';
              
              await firebaseHelpers.createNotification({
                type: 'like',
                recipientId: modelOwnerId,
                actorId: userId,
                actorName: likerName,
                actorAvatar: likerProfile.profile?.avatar || null,
                modelId: modelId,
                modelTitle: modelData.title || 'Untitled Model',
                modelThumbnail: modelData.thumbnail || null,
                message: `${likerName} liked your model "${modelData.title || 'Untitled Model'}"`,
                actionUrl: `/model/${modelId}`,
                priority: 'low'
              });
            }
          }
        } catch (notificationError) {
          console.error('⚠️ Failed to create like notification:', notificationError);
          // Don't fail the like operation if notification fails
        }
        
        console.log('✅ Like added successfully');
        return { success: true, liked: true };
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user has liked a model
  checkIfLiked: async (modelId, userId) => {
    try {
      const likesQuery = query(
        collection(db, 'likes'), 
        where('userId', '==', userId), 
        where('modelId', '==', modelId)
      );
      const likesSnapshot = await getDocs(likesQuery);
      return { success: true, liked: !likesSnapshot.empty };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get real-time model statistics
  getModelStats: async (modelId) => {
    try {
      const modelDoc = await getDoc(doc(db, 'models', modelId));
      const modelData = modelDoc.exists() ? modelDoc.data() : {};

      // Get comments count
      const commentsQuery = query(collection(db, 'comments'), where('modelId', '==', modelId));
      const commentsSnapshot = await getDocs(commentsQuery);

      return {
        success: true,
        stats: {
          likes: modelData.likes || modelData.likes_count || 0,
          downloads: modelData.downloads || modelData.downloads_count || 0,
          comments: modelData.comments || modelData.comments_count || commentsSnapshot.size
        }
      };
    } catch (error) {
      console.error('Error getting model stats:', error);
      // Return default stats if there's an error
      return {
        success: true,
        stats: {
          likes: 0,
          downloads: 0,
          comments: 0
        }
      };
    }
  },

  // Tip System Functions
  sendTip: async (tipData) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      
      const sendTipFunction = httpsCallable(functions, 'sendTip');
      const result = await sendTipFunction(tipData);
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error sending tip:', error);
      return { success: false, error: error.message };
    }
  },

  // Razorpay: create order
  createRazorpayOrder: async ({ amount, currency = 'INR', creatorId, message, type = 'tip', testMode = false }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'createRazorpayOrder');
      const res = await fn({ amount, currency, creatorId, message, type, testMode });
      return { success: true, ...res.data };
    } catch (error) {
      console.error('createRazorpayOrder error:', error);
      return { success: false, error: error.message };
    }
  },

  // Razorpay: verify payment
  verifyRazorpayPayment: async ({ paymentId, orderId, signature, creatorId, amount, message = '', testMode = false }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'verifyRazorpayPayment');
      const res = await fn({ paymentId, orderId, signature, creatorId, amount, message, testMode });
      return { success: true, ...res.data };
    } catch (error) {
      console.error('verifyRazorpayPayment error:', error);
      return { success: false, error: error.message };
    }
  },

  getTipHistory: async (userId, type = 'sent') => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const getTipHistoryFunction = httpsCallable(functions, 'getTipHistory');
      const result = await getTipHistoryFunction({ userId, type });
      return { success: true, tips: result.data.tips || [] };
    } catch (error) {
      console.error('Error getting tip history:', error);
      // Fallback: query Firestore directly if callable is unavailable/CORS-blocked
      try {
        const tipsCol = collection(db, 'tips');
        const q = type === 'received'
          ? query(tipsCol, where('toUserId', '==', userId), orderBy('createdAt', 'desc'))
          : query(tipsCol, where('fromUserId', '==', userId), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const tips = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), timestamp: docSnap.data().createdAt?.toDate?.() || null }));
        return { success: true, tips };
      } catch (fallbackErr) {
        console.error('Fallback Firestore tip history failed:', fallbackErr);
        return { success: false, error: fallbackErr.message };
      }
    }
  },

  getCreatorEarnings: async (userId, timeRange = '30d') => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const getEarningsFunction = httpsCallable(functions, 'getCreatorEarnings');
      const result = await getEarningsFunction({ userId, timeRange });
      return { success: true, earnings: result.data };
    } catch (error) {
      console.error('Error getting creator earnings:', error);
      // Fallback: compute from Firestore tips
      try {
        let startDate;
        const now = new Date();
        switch (timeRange) {
          case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
          case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
          case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
          case 'all': default: startDate = new Date(0);
        }
        const tipsCol = collection(db, 'tips');
        const q = query(
          tipsCol,
          where('toUserId', '==', userId),
          where('createdAt', '>=', startDate),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const tips = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || null }));
        const totalEarnings = tips.reduce((sum, t) => sum + (t.creatorAmount || t.amount || 0), 0);
        const totalTips = tips.length;
        const averageTip = totalTips > 0 ? totalEarnings / totalTips : 0;
        const recentTips = tips.slice(0, 5).map(t => ({ id: t.id, amount: t.amount || t.creatorAmount || 0, createdAt: t.createdAt }));
        return { success: true, earnings: { totalEarnings, totalTips, averageTip, recentTips } };
      } catch (fallbackErr) {
        console.error('Fallback Firestore creator earnings failed:', fallbackErr);
        return { success: false, error: fallbackErr.message };
      }
    }
  },

  // Earnings & Withdrawals
  getDownloadsAndVerification: async (userId) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'getUserDownloadsAndVerification');
      const result = await fn({ userId });
      return { success: true, ...result.data };
    } catch (error) {
      console.error('Error getting downloads/verification:', error);
      return { success: false, error: error.message };
    }
  },

  createWithdrawRequest: async ({ userId, amount, method, accountDetails }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'createWithdrawRequest');
      const result = await fn({ userId, amount, method, accountDetails });
      return { success: true, ...result.data };
    } catch (error) {
      console.error('Error creating withdraw request:', error);
      return { success: false, error: error.message };
    }
  },

  // Advanced Withdrawal System
  createWithdrawalRequest: async ({ userId, amount, paymentMethod, accountDetails, schedule = 'instant' }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'createWithdrawalRequest');
      const result = await fn({ userId, amount, paymentMethod, accountDetails, schedule });
      return result.data;
    } catch (error) {
      console.error('💰 createWithdrawalRequest error:', error);
      throw new Error(error.message || 'Failed to create withdrawal request');
    }
  },

  getWithdrawalHistory: async ({ userId, limit = 20, offset = 0 }) => {
    try {
      // Try the new HTTPS endpoint first
      const response = await fetch('https://us-central1-dsharespace-v2.cloudfunctions.net/getWithdrawalHistoryWeb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { userId, limit, offset }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('📊 getWithdrawalHistory HTTPS error:', error);
      
      // Fallback to callable function
      try {
        const { httpsCallable } = await import('firebase/functions');
        const functions = await getFirebaseService('functions');
        const fn = httpsCallable(functions, 'getWithdrawalHistory');
        const result = await fn({ userId, limit, offset });
        return result.data;
      } catch (callableError) {
        console.error('📊 getWithdrawalHistory callable error:', callableError);
        
        // Final fallback to Firestore query
        try {
          const { collection, query, where, orderBy, limit: firestoreLimit, getDocs } = await import('firebase/firestore');
          const withdrawalsRef = collection(db, 'withdrawal_requests');
          const q = query(
            withdrawalsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            firestoreLimit(limit)
          );
          const snapshot = await getDocs(q);
          const withdrawals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
          }));
          return { withdrawals };
        } catch (fallbackError) {
          console.error('📊 Withdrawal history fallback error:', fallbackError);
          return { withdrawals: [] };
        }
      }
    }
  },

  // UPI VPA verification
  verifyUpiVpa: async ({ userId, upiId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'verifyUpiVpa');
      const result = await fn({ userId, upiId });
      return { success: true, ...result.data };
    } catch (error) {
      console.error('🔍 verifyUpiVpa error:', error);
      return { success: false, error: error.message };
    }
  },

  // Micro payout test
  initiateMicroPayout: async ({ userId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'initiateMicroPayout');
      const result = await fn({ userId });
      return { success: true, ...result.data };
    } catch (error) {
      console.error('💸 initiateMicroPayout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update payout settings
  updatePayoutSettings: async ({ userId, schedule, defaultMethod }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'updatePayoutSettings');
      const result = await fn({ userId, schedule, defaultMethod });
      return { success: true, ...result.data };
    } catch (error) {
      console.error('⚙️ updatePayoutSettings error:', error);
      return { success: false, error: error.message };
    }
  },

  // Set withdrawal PIN
  setWithdrawalPin: async ({ userId, pin }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'setWithdrawalPin');
      const result = await fn({ userId, pin });
      return { success: true, ...result.data };
    } catch (error) {
      console.error('🔐 setWithdrawalPin error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update KYC lite
  updateKycLite: async ({ userId, legalName, pan }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'updateKycLite');
      const result = await fn({ userId, legalName, pan });
      return { success: true, ...result.data };
    } catch (error) {
      console.error('📋 updateKycLite error:', error);
      return { success: false, error: error.message };
    }
  },

  processWithdrawal: async ({ withdrawalId, action = 'approve' }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'processWithdrawal');
      const result = await fn({ withdrawalId, action });
      return result.data;
    } catch (error) {
      console.error('⚡ processWithdrawal error:', error);
      throw new Error(error.message || 'Failed to process withdrawal');
    }
  },

  // Creator Analytics
  getCreatorAnalytics: async (userId, timeRange = '30d') => {
    try {
      // For now return mock data - would be implemented as Cloud Function
      return {
        thisMonth: 0,
        lastMonth: 0,
        totalTips: 0,
        avgTipAmount: 0,
        topModels: []
      };
    } catch (error) {
      console.error('📈 getCreatorAnalytics error:', error);
      return {
        thisMonth: 0,
        lastMonth: 0,
        totalTips: 0,
        avgTipAmount: 0,
        topModels: []
      };
    }
  },

  // Premium Creator System
  getCreatorTier: async ({ userId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'getCreatorTier');
      const result = await fn({ userId });
      return result.data;
    } catch (error) {
      console.error('🎯 getCreatorTier error:', error);
      throw new Error(error.message || 'Failed to get creator tier');
    }
  },

  updateCreatorTier: async ({ userId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'updateCreatorTier');
      const result = await fn({ userId });
      return result.data;
    } catch (error) {
      console.error('⭐ updateCreatorTier error:', error);
      throw new Error(error.message || 'Failed to update creator tier');
    }
  },

  verifyCreator: async ({ userId, verify = true }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'verifyCreator');
      const result = await fn({ userId, verify });
      return result.data;
    } catch (error) {
      console.error('✅ verifyCreator error:', error);
      throw new Error(error.message || 'Failed to verify creator');
    }
  },

  featureModel: async ({ modelId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'featureModel');
      const result = await fn({ modelId });
      return result.data;
    } catch (error) {
      console.error('🌟 featureModel error:', error);
      throw new Error(error.message || 'Failed to feature model');
    }
  },

  getPremiumCreatorStats: async () => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'getPremiumCreatorStats');
      const result = await fn();
      return result.data;
    } catch (error) {
      console.error('📊 getPremiumCreatorStats error:', error);
      throw new Error(error.message || 'Failed to get premium creator stats');
    }
  },

  // Advertising System
  getAdsForPlacement: async ({ placement, limit = 5 }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'getAdsForPlacement');
      const result = await fn({ placement, limit });
      return result.data;
    } catch (error) {
      console.error('📺 getAdsForPlacement error:', error);
      return { ads: [] }; // Fallback to empty ads
    }
  },

  trackAdImpression: async ({ adId, placement, modelId, userId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'trackAdImpression');
      const result = await fn({ adId, placement, modelId, userId });
      return result.data;
    } catch (error) {
      console.error('👁️ trackAdImpression error:', error);
      return { success: false };
    }
  },

  trackAdClick: async ({ adId, placement, modelId, userId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'trackAdClick');
      const result = await fn({ adId, placement, modelId, userId });
      return result.data;
    } catch (error) {
      console.error('🖱️ trackAdClick error:', error);
      return { success: false };
    }
  },

  createSponsoredPlacement: async ({ title, description, targetUrl, imageUrl, placement, budget, duration, targetAudience, campaignType }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'createSponsoredPlacement');
      const result = await fn({ title, description, targetUrl, imageUrl, placement, budget, duration, targetAudience, campaignType });
      return result.data;
    } catch (error) {
      console.error('📢 createSponsoredPlacement error:', error);
      throw new Error(error.message || 'Failed to create sponsored placement');
    }
  },

  // Social Commerce System
  createCreatorStorefront: async ({ name, description, customUrl, theme, branding, featuredModels, socialLinks }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'createCreatorStorefront');
      const result = await fn({ name, description, customUrl, theme, branding, featuredModels, socialLinks });
      return result.data;
    } catch (error) {
      console.error('🏪 createCreatorStorefront error:', error);
      throw new Error(error.message || 'Failed to create creator storefront');
    }
  },

  getCreatorStorefront: async ({ creatorId, customUrl }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'getCreatorStorefront');
      const result = await fn({ creatorId, customUrl });
      return result.data;
    } catch (error) {
      console.error('🏪 getCreatorStorefront error:', error);
      throw new Error(error.message || 'Failed to get creator storefront');
    }
  },

  createModelCollection: async ({ name, description, type, modelIds, tags, coverImageUrl }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'createModelCollection');
      const result = await fn({ name, description, type, modelIds, tags, coverImageUrl });
      return result.data;
    } catch (error) {
      console.error('📚 createModelCollection error:', error);
      throw new Error(error.message || 'Failed to create model collection');
    }
  },

  saveModelToDefaultCollection: async (modelId, userId, model = {}) => {
    try {
      const collectionId = `${userId}_saved_models`;
      const collectionRef = doc(db, 'collections', collectionId);
      const collectionSnap = await getDoc(collectionRef);
      const now = new Date().toISOString();
      const coverImageUrl = Array.isArray(model?.previewImages) && model.previewImages[0]
        ? (model.previewImages[0].url || model.previewImages[0].downloadURL || model.previewImages[0].src || '')
        : (model?.thumbnail || model?.thumbnailUrl || model?.imageUrl || '');

      if (!collectionSnap.exists()) {
        await setDoc(collectionRef, {
          name: 'Saved 3D Models',
          description: 'Models saved while browsing 3D ShareSpace.',
          type: 'saved',
          user_id: userId,
          userId,
          modelIds: [modelId],
          models: [modelId],
          tags: ['saved', '3d models'],
          coverImageUrl,
          cover_image_url: coverImageUrl,
          is_public: false,
          isPublic: false,
          created_at: now,
          createdAt: now,
          updated_at: now,
          updatedAt: now
        });
      } else {
        await updateDoc(collectionRef, {
          modelIds: arrayUnion(modelId),
          models: arrayUnion(modelId),
          coverImageUrl: coverImageUrl || collectionSnap.data().coverImageUrl || '',
          cover_image_url: coverImageUrl || collectionSnap.data().cover_image_url || '',
          updated_at: now,
          updatedAt: now
        });
      }

      return { success: true, collectionId };
    } catch (error) {
      console.error('Error saving model to collection:', error);
      return { success: false, error: error.message };
    }
  },

  generateReferralCode: async () => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'generateReferralCode');
      const result = await fn();
      return result.data;
    } catch (error) {
      console.error('🎯 generateReferralCode error:', error);
      throw new Error(error.message || 'Failed to generate referral code');
    }
  },

  processReferralSignup: async ({ referralCode, newUserId }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'processReferralSignup');
      const result = await fn({ referralCode, newUserId });
      return result.data;
    } catch (error) {
      console.error('👥 processReferralSignup error:', error);
      throw new Error(error.message || 'Failed to process referral signup');
    }
  },

  getSocialCommerceAnalytics: async ({ userId, timeRange = '30d' }) => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const functions = await getFirebaseService('functions');
      const fn = httpsCallable(functions, 'getSocialCommerceAnalytics');
      const result = await fn({ userId, timeRange });
      return result.data;
    } catch (error) {
      console.error('📈 getSocialCommerceAnalytics error:', error);
      throw new Error(error.message || 'Failed to get social commerce analytics');
    }
  },

  // Follow System Functions
  followUser: async (userIdToFollow) => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const currentUserId = auth.currentUser.uid;
      
      if (currentUserId === userIdToFollow) {
        return { success: false, error: 'Cannot follow yourself' };
      }

      console.log('🔍 FOLLOW ACTION: Following user:', userIdToFollow, 'by:', currentUserId);

      // Create follow relationship
      const followData = {
        follower_id: currentUserId,
        followed_id: userIdToFollow,
        created_at: serverTimestamp()
      };

      await addDoc(collection(db, 'follows'), followData);

      // Update follower's following list
      await updateDoc(doc(db, 'users', currentUserId), {
        following_list: arrayUnion(userIdToFollow),
        updated_at: serverTimestamp()
      });

      // Update followed user's followers list
      await updateDoc(doc(db, 'users', userIdToFollow), {
        followers_list: arrayUnion(currentUserId),
        updated_at: serverTimestamp()
      });

      // Create notification for the followed user
      try {
        console.log('🔔 Creating follow notification for user:', userIdToFollow);
        const followerProfile = await firebaseHelpers.getUserProfile(currentUserId);
        const followerName = followerProfile.success ? 
          (followerProfile.profile.displayName || followerProfile.profile.username || 'Someone') : 
          'Someone';
        
        console.log('🔔 Follower name:', followerName);
        
        const notificationResult = await firebaseHelpers.createNotification({
          type: 'follow',
          recipientId: userIdToFollow,
          actorId: currentUserId,
          actorName: followerName,
          actorAvatar: followerProfile.profile?.avatar || null,
          message: `${followerName} started following you`,
          actionUrl: `/profile/${currentUserId}`,
          priority: 'medium'
        });
        
        console.log('🔔 Follow notification result:', notificationResult);
      } catch (notificationError) {
        console.error('⚠️ Failed to create follow notification:', notificationError);
        // Don't fail the follow operation if notification fails
      }

      return { success: true };
    } catch (error) {
      console.error('Error following user:', error);
      return { success: false, error: error.message };
    }
  },

  unfollowUser: async (userIdToUnfollow) => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const currentUserId = auth.currentUser.uid;
      
      if (currentUserId === userIdToUnfollow) {
        return { success: false, error: 'Cannot unfollow yourself' };
      }

      // Find and delete the follow relationship
      const followQuery = query(
        collection(db, 'follows'),
        where('follower_id', '==', currentUserId),
        where('followed_id', '==', userIdToUnfollow)
      );
      
      const followSnapshot = await getDocs(followQuery);
      
      if (!followSnapshot.empty) {
        const followDoc = followSnapshot.docs[0];
        await deleteDoc(followDoc.ref);
      }

      // Update follower's following list
      await updateDoc(doc(db, 'users', currentUserId), {
        following_list: arrayRemove(userIdToUnfollow),
        updated_at: serverTimestamp()
      });

      // Update unfollowed user's followers list
      await updateDoc(doc(db, 'users', userIdToUnfollow), {
        followers_list: arrayRemove(currentUserId),
        updated_at: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error: error.message };
    }
  },

  checkFollowStatus: async (userIdToCheck) => {
    try {
      if (!auth.currentUser) {
        return { success: false, isFollowing: false };
      }

      const currentUserId = auth.currentUser.uid;

      if (currentUserId === userIdToCheck) {
        return { success: true, isFollowing: false, isOwnProfile: true };
      }

      // Check if current user follows the target user
      const followQuery = query(
        collection(db, 'follows'),
        where('follower_id', '==', currentUserId),
        where('followed_id', '==', userIdToCheck)
      );
      
      const followSnapshot = await getDocs(followQuery);
      const isFollowing = !followSnapshot.empty;

      return { success: true, isFollowing, isOwnProfile: false };
    } catch (error) {
      console.error('Error checking follow status:', error);
      return { success: false, isFollowing: false };
    }
  },

  getFollowStats: async (userId) => {
    try {
      console.log('🔍 Getting follow stats for userId:', userId);

      // Get followers count
      const followersQuery = query(
        collection(db, 'follows'),
        where('followed_id', '==', userId)
      );
      const followersSnapshot = await getDocs(followersQuery);
      const followersCount = followersSnapshot.size;
      console.log('👥 Followers count:', followersCount, 'for user:', userId);

      // Get following count
      const followingQuery = query(
        collection(db, 'follows'),
        where('follower_id', '==', userId)
      );
      const followingSnapshot = await getDocs(followingQuery);
      const followingCount = followingSnapshot.size;
      console.log('➡️ Following count:', followingCount, 'for user:', userId);

      // Debug: Log all follow records for this user
      console.log('📊 All follow records where user is being followed:');
      followersSnapshot.forEach(doc => {
        console.log('  - Follower:', doc.data().follower_id, 'Following:', doc.data().following_id);
      });

      console.log('📊 All follow records where user is following:');
      followingSnapshot.forEach(doc => {
        console.log('  - Follower:', doc.data().follower_id, 'Following:', doc.data().following_id);
      });

      return {
        success: true,
        followers: followersCount,
        following: followingCount
      };
    } catch (error) {
      console.error('Error getting follow stats:', error);
      return { success: false, error: error.message };
    }
  },

  getFollowersList: async (userId) => {
    try {
      console.log('🔍 Getting followers list for userId:', userId);

      // Get all follow records where this user is being followed
      const followersQuery = query(
        collection(db, 'follows'),
        where('followed_id', '==', userId)
      );
      const followersSnapshot = await getDocs(followersQuery);
      
      // Get user profiles for all followers
      const followersList = [];
      for (const followDoc of followersSnapshot.docs) {
        const followData = followDoc.data();
        const followerId = followData.follower_id;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', followerId));
          if (userDoc.exists()) {
            followersList.push({
              uid: followerId,
              ...userDoc.data()
            });
          }
        } catch (error) {
          console.error('Error getting follower profile:', error);
        }
      }

      console.log('👥 Found followers:', followersList.length);
      return {
        success: true,
        followers: followersList
      };
    } catch (error) {
      console.error('Error getting followers list:', error);
      return { success: false, error: error.message };
    }
  },

  getFollowingList: async (userId) => {
    try {
      console.log('🔍 Getting following list for userId:', userId);

      // Get all follow records where this user is following others
      const followingQuery = query(
        collection(db, 'follows'),
        where('follower_id', '==', userId)
      );
      const followingSnapshot = await getDocs(followingQuery);
      
      // Get user profiles for all users being followed
      const followingList = [];
      for (const followDoc of followingSnapshot.docs) {
        const followData = followDoc.data();
        const followingId = followData.followed_id;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', followingId));
          if (userDoc.exists()) {
            followingList.push({
              uid: followingId,
              ...userDoc.data()
            });
          }
        } catch (error) {
          console.error('Error getting following profile:', error);
        }
      }

      console.log('➡️ Found following:', followingList.length);
      return {
        success: true,
        following: followingList
      };
    } catch (error) {
      console.error('Error getting following list:', error);
      return { success: false, error: error.message };
    }
  },

  // Initialize collections if they don't exist (helper function)
  ensureCollectionsExist: async () => {
    try {
      // This is a helper function to ensure collections exist
      // Firestore creates collections automatically when documents are added
      console.log('✅ Collections will be created automatically when needed');
      return { success: true };
    } catch (error) {
      console.error('❌ Error ensuring collections exist:', error);
      return { success: false, error: error.message };
    }
  },

  // Smart Alerts System Functions
  getAlerts: async () => {
    try {
      const getAlerts = httpsCallable(functions, 'getAlerts');
      const result = await getAlerts();
      return result.data;
    } catch (error) {
      console.error('❌ Error getting alerts:', error);
      return { success: false, error: error.message };
    }
  },

  createAlert: async (alertData) => {
    try {
      const createAlert = httpsCallable(functions, 'createAlert');
      const result = await createAlert(alertData);
      return result.data;
    } catch (error) {
      console.error('❌ Error creating alert:', error);
      return { success: false, error: error.message };
    }
  },

  updateAlertStatus: async (alertId, read) => {
    try {
      const updateAlertStatus = httpsCallable(functions, 'updateAlertStatus');
      const result = await updateAlertStatus({ alertId, read });
      return result.data;
    } catch (error) {
      console.error('❌ Error updating alert status:', error);
      return { success: false, error: error.message };
    }
  },

  // Email Management Functions
  getEmailManagement: async () => {
    try {
      const getEmailManagement = httpsCallable(functions, 'getEmailManagement');
      const result = await getEmailManagement();
      return result.data;
    } catch (error) {
      console.error('❌ Error getting email management data:', error);
      return { success: false, error: error.message };
    }
  },

  sendEmailCampaign: async (campaignId, recipients) => {
    try {
      const sendEmailCampaign = httpsCallable(functions, 'sendEmailCampaign');
      const result = await sendEmailCampaign({ campaignId, recipients });
      return result.data;
    } catch (error) {
      console.error('❌ Error sending email campaign:', error);
      return { success: false, error: error.message };
    }
  },

  // Security Management Functions
  getSecurityData: async () => {
    try {
      const getSecurityData = httpsCallable(functions, 'getSecurityData');
      const result = await getSecurityData();
      return result.data;
    } catch (error) {
      console.error('❌ Error getting security data:', error);
      return { success: false, error: error.message };
    }
  },

  blockIP: async (ip, reason, type = 'blocked') => {
    try {
      const blockIP = httpsCallable(functions, 'blockIP');
      const result = await blockIP({ ip, reason, type });
      return result.data;
    } catch (error) {
      console.error('❌ Error blocking IP:', error);
      return { success: false, error: error.message };
    }
  },

  whitelistIP: async (ip, description) => {
    try {
      const whitelistIP = httpsCallable(functions, 'whitelistIP');
      const result = await whitelistIP({ ip, description });
      return result.data;
    } catch (error) {
      console.error('❌ Error whitelisting IP:', error);
      return { success: false, error: error.message };
    }
  },

  // Featured model notifications
  featureModel: async (modelId, featuredBy = 'admin') => {
    try {
      console.log('⭐ Featuring model:', modelId);
      
      // Get model data
      const modelDoc = await getDoc(doc(db, 'models', modelId));
      if (!modelDoc.exists()) {
        return { success: false, error: 'Model not found' };
      }
      
      const modelData = modelDoc.data();
      
      // Update model as featured
      await updateDoc(doc(db, 'models', modelId), {
        featured: true,
        featuredAt: serverTimestamp(),
        featuredBy: featuredBy
      });
      
      // Create notification for model owner
      await firebaseHelpers.createNotification({
        type: 'featured',
        recipientId: modelData.userId,
        modelId: modelId,
        modelTitle: modelData.title || 'Untitled Model',
        modelThumbnail: modelData.thumbnail || null,
        message: `🎉 Congratulations! Your model "${modelData.title || 'Untitled Model'}" is now featured on our homepage!`,
        actionUrl: `/model/${modelId}`,
        priority: 'high'
      });
      
      console.log('⭐ Model featured successfully:', modelId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error featuring model:', error);
      return { success: false, error: error.message };
    }
  },

  // Review and rating notifications
  addModelReview: async (modelId, reviewData, reviewerId) => {
    try {
      console.log('⭐ Adding review for model:', modelId);
      
      // Get model data
      const modelDoc = await getDoc(doc(db, 'models', modelId));
      if (!modelDoc.exists()) {
        return { success: false, error: 'Model not found' };
      }
      
      const modelData = modelDoc.data();
      
      // Create review document
      const reviewRef = await addDoc(collection(db, 'reviews'), {
        modelId: modelId,
        reviewerId: reviewerId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: serverTimestamp()
      });
      
      // Update model's average rating
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('modelId', '==', modelId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      let totalRating = 0;
      let reviewCount = 0;
      reviewsSnapshot.forEach(doc => {
        totalRating += doc.data().rating;
        reviewCount++;
      });
      
      const averageRating = totalRating / reviewCount;
      
      await updateDoc(doc(db, 'models', modelId), {
        averageRating: averageRating,
        reviewCount: reviewCount,
        lastReviewedAt: serverTimestamp()
      });
      
      // Create notification for model owner (if different from reviewer)
      if (modelData.userId !== reviewerId) {
        const reviewerProfile = await firebaseHelpers.getUserProfile(reviewerId);
        const reviewerName = reviewerProfile.success ? 
          (reviewerProfile.profile.displayName || reviewerProfile.profile.username || 'Someone') : 
          'Someone';
        
        await firebaseHelpers.createNotification({
          type: 'review',
          recipientId: modelData.userId,
          actorId: reviewerId,
          actorName: reviewerName,
          actorAvatar: reviewerProfile.profile?.avatar || null,
          modelId: modelId,
          modelTitle: modelData.title || 'Untitled Model',
          modelThumbnail: modelData.thumbnail || null,
          message: `${reviewerName} gave your model "${modelData.title || 'Untitled Model'}" a ${reviewData.rating}-star review!`,
          actionUrl: `/model/${modelId}`,
          rating: reviewData.rating,
          priority: 'medium'
        });
      }
      
      console.log('⭐ Review added successfully:', reviewRef.id);
      return { success: true, reviewId: reviewRef.id };
    } catch (error) {
      console.error('❌ Error adding review:', error);
      return { success: false, error: error.message };
    }
  },

  // System notifications
  sendSystemNotification: async (recipientId, message, type = 'system', priority = 'low') => {
    try {
      console.log('⚙️ Sending system notification to:', recipientId);
      
      await firebaseHelpers.createNotification({
        type: type,
        recipientId: recipientId,
        message: message,
        priority: priority,
        actionUrl: type === 'security' ? '/settings/security' : '/notifications'
      });
      
      console.log('⚙️ System notification sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending system notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Security notifications
  sendSecurityNotification: async (userId, event, details = {}) => {
    try {
      console.log('🔒 Sending security notification to:', userId);
      
      const securityMessages = {
        login_new_device: `New login detected from ${details.device || 'unknown device'} at ${details.location || 'unknown location'}`,
        password_changed: 'Your password has been successfully changed',
        email_changed: 'Your email address has been changed',
        two_factor_enabled: 'Two-factor authentication has been enabled',
        two_factor_disabled: 'Two-factor authentication has been disabled',
        suspicious_activity: 'Suspicious activity detected on your account',
        account_locked: 'Your account has been temporarily locked for security reasons',
        account_unlocked: 'Your account has been unlocked'
      };
      
      const message = securityMessages[event] || `Security event: ${event}`;
      
      await firebaseHelpers.createNotification({
        type: 'security',
        recipientId: userId,
        message: message,
        priority: 'high',
        actionUrl: '/settings/security',
        securityEvent: event,
        details: details
      });
      
      console.log('🔒 Security notification sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending security notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Collaboration notifications
  requestCollaboration: async (modelId, requesterId, message = '') => {
    try {
      console.log('🤝 Requesting collaboration for model:', modelId);
      
      // Get model data
      const modelDoc = await getDoc(doc(db, 'models', modelId));
      if (!modelDoc.exists()) {
        return { success: false, error: 'Model not found' };
      }
      
      const modelData = modelDoc.data();
      
      // Create collaboration request
      const collabRef = await addDoc(collection(db, 'collaboration_requests'), {
        modelId: modelId,
        requesterId: requesterId,
        message: message,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Create notification for model owner
      const requesterProfile = await firebaseHelpers.getUserProfile(requesterId);
      const requesterName = requesterProfile.success ? 
        (requesterProfile.profile.displayName || requesterProfile.profile.username || 'Someone') : 
        'Someone';
      
      await firebaseHelpers.createNotification({
        type: 'collaboration',
        recipientId: modelData.userId,
        actorId: requesterId,
        actorName: requesterName,
        actorAvatar: requesterProfile.profile?.avatar || null,
        modelId: modelId,
        modelTitle: modelData.title || 'Untitled Model',
        modelThumbnail: modelData.thumbnail || null,
        message: `${requesterName} wants to collaborate on your model "${modelData.title || 'Untitled Model'}"`,
        actionUrl: `/collaboration/${collabRef.id}`,
        priority: 'high'
      });
      
      console.log('🤝 Collaboration request sent successfully');
      return { success: true, requestId: collabRef.id };
    } catch (error) {
      console.error('❌ Error requesting collaboration:', error);
      return { success: false, error: error.message };
    }
  },

  // User notification preferences
  getUserNotificationPreferences: async (userId) => {
    try {
      console.log('⚙️ Getting notification preferences for user:', userId);
      
      const prefsDoc = await getDoc(doc(db, 'notification_preferences', userId));
      
      if (prefsDoc.exists()) {
        return { success: true, preferences: prefsDoc.data() };
      } else {
        // Return default preferences
        const defaultPrefs = {
          email: {
            follows: true,
            likes: false,
            comments: true,
            downloads: true,
            tips: true,
            achievements: true,
            milestones: true,
            featured: true,
            reviews: true,
            shares: false,
            collaborations: true,
            system: true,
            security: true
          },
          inApp: {
            follows: true,
            likes: true,
            comments: true,
            downloads: true,
            tips: true,
            achievements: true,
            milestones: true,
            featured: true,
            reviews: true,
            shares: true,
            collaborations: true,
            system: true,
            security: true
          },
          frequency: 'realtime', // realtime, hourly, daily, weekly
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
            timezone: 'UTC'
          }
        };
        
        return { success: true, preferences: defaultPrefs };
      }
    } catch (error) {
      // If we cannot read someone else's preferences due to security rules,
      // silently fall back to defaults to avoid noisy console errors
      if (error?.code === 'permission-denied') {
        const defaultPrefs = {
          email: {
            follows: true,
            likes: false,
            comments: true,
            downloads: true,
            tips: true,
            achievements: true,
            milestones: true,
            featured: true,
            reviews: true,
            shares: false,
            collaborations: true,
            system: true,
            security: true
          },
          inApp: {
            follows: true,
            likes: true,
            comments: true,
            downloads: true,
            tips: true,
            achievements: true,
            milestones: true,
            featured: true,
            reviews: true,
            shares: true,
            collaborations: true,
            system: true,
            security: true
          },
          frequency: 'realtime',
          quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'UTC' }
        };
        return { success: true, preferences: defaultPrefs };
      }
      console.error('❌ Error getting notification preferences:', error);
      return { success: false, error: error.message };
    }
  },

  updateUserNotificationPreferences: async (userId, preferences) => {
    try {
      console.log('⚙️ Updating notification preferences for user:', userId);
      
      await setDoc(doc(db, 'notification_preferences', userId), {
        ...preferences,
        updatedAt: serverTimestamp()
      });
      
      console.log('⚙️ Notification preferences updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user wants to receive notification
  shouldSendNotification: async (userId, type, channel = 'inApp') => {
    try {
      const prefsResult = await firebaseHelpers.getUserNotificationPreferences(userId);
      
      if (!prefsResult.success) {
        return true; // Default to sending if we can't get preferences
      }
      
      const preferences = prefsResult.preferences;
      const preferenceKey = getNotificationPreferenceKey(type);
      return preferences[channel] && preferences[channel][preferenceKey] !== false;
    } catch (error) {
      console.error('❌ Error checking notification preferences:', error);
      return true; // Default to sending
    }
  },

  // Smart notification grouping
  groupSimilarNotifications: async (userId, type, timeWindow = 300000) => { // 5 minutes
    try {
      console.log('🔄 Grouping similar notifications for user:', userId);
      
      const cutoffTime = new Date(Date.now() - timeWindow);
      
      // Get recent notifications of the same type
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('type', '==', type),
        where('createdAt', '>', cutoffTime),
        where('grouped', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(notificationsQuery);
      
      if (snapshot.size <= 1) {
        return { success: true, grouped: false };
      }
      
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      
      // Group by model or actor
      const groups = {};
      notifications.forEach(notif => {
        const key = notif.modelId || notif.actorId || 'general';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(notif);
      });
      
      // Create grouped notifications
      for (const [key, group] of Object.entries(groups)) {
        if (group.length > 1) {
          const firstNotif = group[0];
          const count = group.length;
          
          let groupedMessage = '';
          if (type === 'like') {
            groupedMessage = `${count} people liked your model "${firstNotif.modelTitle}"`;
          } else if (type === 'follow') {
            groupedMessage = `${count} people started following you`;
          } else if (type === 'comment') {
            groupedMessage = `${count} people commented on your model "${firstNotif.modelTitle}"`;
          } else {
            groupedMessage = `${count} ${type} notifications`;
          }
          
          // Create grouped notification
          await firebaseHelpers.createNotification({
            type: type,
            recipientId: userId,
            message: groupedMessage,
            actionUrl: firstNotif.actionUrl,
            modelId: firstNotif.modelId,
            modelTitle: firstNotif.modelTitle,
            modelThumbnail: firstNotif.modelThumbnail,
            priority: firstNotif.priority,
            grouped: true,
            groupCount: count,
            groupIds: group.map(n => n.id)
          });
          
          // Mark original notifications as grouped
          const batch = writeBatch(db);
          group.forEach(notif => {
            batch.update(doc(db, 'notifications', notif.id), { grouped: true });
          });
          await batch.commit();
        }
      }
      
      console.log('🔄 Notifications grouped successfully');
      return { success: true, grouped: true };
    } catch (error) {
      console.error('❌ Error grouping notifications:', error);
      return { success: false, error: error.message };
    }
  },

  // Social sharing notifications
  shareModel: async (modelId, platform, sharerId) => {
    try {
      console.log('📤 Sharing model:', modelId, 'on', platform);
      
      // Get model data
      const modelDoc = await getDoc(doc(db, 'models', modelId));
      if (!modelDoc.exists()) {
        return { success: false, error: 'Model not found' };
      }
      
      const modelData = modelDoc.data();
      
      // Create share record
      await addDoc(collection(db, 'shares'), {
        modelId: modelId,
        sharerId: sharerId,
        platform: platform,
        sharedAt: serverTimestamp()
      });
      
      // Update model share count
      await updateDoc(doc(db, 'models', modelId), {
        shares: increment(1),
        lastSharedAt: serverTimestamp()
      });
      
      // Create notification for model owner (if different from sharer)
      if (modelData.userId !== sharerId) {
        const sharerProfile = await firebaseHelpers.getUserProfile(sharerId);
        const sharerName = sharerProfile.success ? 
          (sharerProfile.profile.displayName || sharerProfile.profile.username || 'Someone') : 
          'Someone';
        
        await firebaseHelpers.createNotification({
          type: 'share',
          recipientId: modelData.userId,
          actorId: sharerId,
          actorName: sharerName,
          actorAvatar: sharerProfile.profile?.avatar || null,
          modelId: modelId,
          modelTitle: modelData.title || 'Untitled Model',
          modelThumbnail: modelData.thumbnail || null,
          message: `${sharerName} shared your model "${modelData.title || 'Untitled Model'}" on ${platform}`,
          actionUrl: `/model/${modelId}`,
          platform: platform,
          priority: 'low'
        });
      }
      
      console.log('📤 Model shared successfully on', platform);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sharing model:', error);
      return { success: false, error: error.message };
    }
  },

  // Achievement notifications
  checkUserAchievements: async (userId) => {
    try {
      console.log('🏆 Checking achievements for user:', userId);
      
      // Get user's models count
      const modelsQuery = query(
        collection(db, 'models'),
        where('userId', '==', userId)
      );
      const modelsSnapshot = await getDocs(modelsQuery);
      const modelsCount = modelsSnapshot.size;
      
      // Get user's followers count
      const followersQuery = query(
        collection(db, 'follows'),
        where('followed_id', '==', userId)
      );
      const followersSnapshot = await getDocs(followersQuery);
      const followersCount = followersSnapshot.size;
      
      // Get total views across all models
      let totalViews = 0;
      modelsSnapshot.forEach(doc => {
        totalViews += doc.data().views || 0;
      });
      
      // Check for new achievements
      const achievements = [
        { type: 'models_uploaded', milestones: [1, 5, 10, 25, 50, 100], current: modelsCount },
        { type: 'followers', milestones: [10, 50, 100, 500, 1000, 5000], current: followersCount },
        { type: 'total_views', milestones: [1000, 5000, 10000, 50000, 100000, 500000], current: totalViews }
      ];
      
      for (const achievement of achievements) {
        const reachedMilestone = achievement.milestones.find(milestone => 
          achievement.current >= milestone
        );
        
        if (reachedMilestone) {
          // Check if user already has this achievement
          const achievementDoc = await getDoc(doc(db, 'achievements', `${userId}_${achievement.type}_${reachedMilestone}`));
          
          if (!achievementDoc.exists()) {
            // Create achievement notification
            const achievementMessages = {
              models_uploaded: `🎉 Achievement Unlocked! You've uploaded ${reachedMilestone} models!`,
              followers: `🎉 Achievement Unlocked! You have ${reachedMilestone} followers!`,
              total_views: `🎉 Achievement Unlocked! Your models have ${reachedMilestone.toLocaleString()} total views!`
            };
            
            await firebaseHelpers.createNotification({
              type: 'achievement',
              recipientId: userId,
              message: achievementMessages[achievement.type],
              actionUrl: `/profile/${userId}`,
              achievementType: achievement.type,
              milestone: reachedMilestone,
              priority: 'medium'
            });
            
            // Mark achievement as unlocked
            await setDoc(doc(db, 'achievements', `${userId}_${achievement.type}_${reachedMilestone}`), {
              userId: userId,
              type: achievement.type,
              milestone: reachedMilestone,
              unlockedAt: serverTimestamp()
            });
            
            console.log(`🏆 Achievement unlocked: ${achievement.type} - ${reachedMilestone}`);
          }
        }
      }
      
      return { success: true, modelsCount, followersCount, totalViews };
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
      return { success: false, error: error.message };
    }
  },

  // Collection notifications
  addToCollection: async (collectionId, modelId, userId) => {
    try {
      console.log('📁 Adding model to collection:', { collectionId, modelId, userId });
      
      // Get collection and model data
      const [collectionDoc, modelDoc] = await Promise.all([
        getDoc(doc(db, 'collections', collectionId)),
        getDoc(doc(db, 'models', modelId))
      ]);
      
      if (!collectionDoc.exists() || !modelDoc.exists()) {
        return { success: false, error: 'Collection or model not found' };
      }
      
      const collectionData = collectionDoc.data();
      const modelData = modelDoc.data();
      
      // Add model to collection
      await updateDoc(doc(db, 'collections', collectionId), {
        models: arrayUnion(modelId),
        updatedAt: serverTimestamp()
      });
      
      // Create notification for model owner (if different from collection owner)
      if (modelData.userId !== userId) {
        const collectorProfile = await firebaseHelpers.getUserProfile(userId);
        const collectorName = collectorProfile.success ? 
          (collectorProfile.profile.displayName || collectorProfile.profile.username || 'Someone') : 
          'Someone';
        
        await firebaseHelpers.createNotification({
          type: 'collection_add',
          recipientId: modelData.userId,
          actorId: userId,
          actorName: collectorName,
          actorAvatar: collectorProfile.profile?.avatar || null,
          modelId: modelId,
          modelTitle: modelData.title || 'Untitled Model',
          modelThumbnail: modelData.thumbnail || null,
          collectionId: collectionId,
          collectionName: collectionData.name || 'Untitled Collection',
          message: `${collectorName} added your model "${modelData.title || 'Untitled Model'}" to their collection "${collectionData.name || 'Untitled Collection'}"`,
          actionUrl: `/collection/${collectionId}`,
          priority: 'low'
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding model to collection:', error);
      return { success: false, error: error.message };
    }
  },

  // View milestone tracking
  trackModelView: async (modelId) => {
    try {
      console.log('👁️ Tracking view for model:', modelId);
      
      // Get current view count
      const modelDoc = await getDoc(doc(db, 'models', modelId));
      if (!modelDoc.exists()) return { success: false, error: 'Model not found' };
      
      const modelData = modelDoc.data();
      const currentViews = modelData.views || 0;
      const newViews = currentViews + 1;
      
      // Update view count
      await updateDoc(doc(db, 'models', modelId), {
        views: newViews,
        lastViewedAt: serverTimestamp()
      });
      
      // Check for milestone notifications
      const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
      const reachedMilestone = milestones.find(milestone => 
        currentViews < milestone && newViews >= milestone
      );
      
      if (reachedMilestone && modelData.userId) {
        // Create milestone notification
        await firebaseHelpers.createNotification({
          type: 'view_milestone',
          recipientId: modelData.userId,
          modelId: modelId,
          modelTitle: modelData.title || 'Untitled Model',
          modelThumbnail: modelData.thumbnail || null,
          message: `🎉 Your model "${modelData.title || 'Untitled Model'}" reached ${reachedMilestone.toLocaleString()} views!`,
          actionUrl: `/model/${modelId}`,
          milestone: reachedMilestone,
          priority: 'medium'
        });
        
        console.log(`🎉 View milestone reached: ${reachedMilestone} views for model ${modelId}`);
      }
      
      return { success: true, views: newViews, milestone: reachedMilestone };
    } catch (error) {
      console.error('❌ Error tracking model view:', error);
      return { success: false, error: error.message };
    }
  },

  // Notification functions
  createNotification: async (notificationData) => {
    try {
      console.log('🔔 createNotification called with data:', notificationData);
      
      // Check if user wants to receive this notification
      const shouldSend = await firebaseHelpers.shouldSendNotification(
        notificationData.recipientId, 
        notificationData.type, 
        'inApp'
      );
      
      if (!shouldSend) {
        console.log('🔔 Notification skipped due to user preferences:', notificationData.type);
        return { success: true, skipped: true };
      }
      // Create with a pre-generated document ID to avoid a follow-up update
      const docRef = doc(collection(db, 'notifications'));
      const notification = {
        ...notificationData,
        user_id: notificationData.user_id || notificationData.recipientId,
        createdAt: serverTimestamp(),
        created_at: serverTimestamp(),
        read: false,
        id: docRef.id
      };

      console.log('🔔 Notification object to create:', notification);

      await setDoc(docRef, notification);

      console.log('✅ Notification created successfully:', docRef.id);
      console.log('🔔 Notification data saved:', {
        id: docRef.id,
        recipientId: notificationData.recipientId,
        type: notificationData.type,
        message: notificationData.message
      });
      
      // Trigger smart grouping for certain notification types
      if (['like', 'follow', 'comment'].includes(notificationData.type)) {
        setTimeout(() => {
          // Best-effort; ignore permission errors client-side
          firebaseHelpers.groupSimilarNotifications(notificationData.recipientId, notificationData.type).catch(() => {});
        }, 1000);
      }
      
      return { success: true, notificationId: docRef.id };
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  },

  getUserNotifications: async (userId, limitCount = 50) => {
    try {
      console.log('🔔 Getting notifications for user:', userId);
      
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const notifications = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('🔔 Processing notification document:', {
          docId: doc.id,
          data: data,
          hasId: data.id !== undefined
        });
        
        const notification = {
          ...data,
          id: doc.id, // Ensure document ID takes precedence over any id field in data
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        };
        
        console.log('🔔 Final notification object:', {
          id: notification.id,
          type: notification.type,
          message: notification.message
        });
        
        notifications.push(notification);
      });
      
      console.log('✅ Retrieved notifications:', notifications.length);
      return { success: true, notifications };
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return { success: false, error: error.message };
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      console.log('🔔 markNotificationAsRead called with ID:', notificationId);
      
      // Validate notification ID
      if (!notificationId || notificationId === null || notificationId === undefined) {
        console.error('❌ Invalid notification ID:', notificationId);
        return { success: false, error: 'Invalid notification ID' };
      }
      
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp(),
        read_at: serverTimestamp()
      });
      
      console.log('✅ Notification marked as read successfully:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        notificationId: notificationId
      });
      return { success: false, error: error.message };
    }
  },

  markAllNotificationsAsRead: async (userId) => {
    try {
      console.log('🔔 markAllNotificationsAsRead called for user:', userId);
      
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      console.log('🔔 Found', snapshot.size, 'unread notifications to mark as read');
      
      if (snapshot.size === 0) {
        console.log('✅ No unread notifications to mark as read');
        return { success: true, count: 0 };
      }
      
      const batch = writeBatch(db);
      
      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp(),
          read_at: serverTimestamp()
        });
      });
      
      await batch.commit();
      
      console.log('✅ All notifications marked as read for user:', userId);
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        userId: userId
      });
      return { success: false, error: error.message };
    }
  },

  getUnreadNotificationCount: async (userId) => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      
      console.log('🔔 Unread notifications count:', snapshot.size);
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('❌ Error getting unread notification count:', error);
      return { success: false, error: error.message };
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      console.log('🔔 deleteNotification called with ID:', notificationId);
      
      // Validate notification ID
      if (!notificationId || notificationId === null || notificationId === undefined) {
        console.error('❌ Invalid notification ID:', notificationId);
        return { success: false, error: 'Invalid notification ID' };
      }
      
      await deleteDoc(doc(db, 'notifications', notificationId));
      console.log('✅ Notification deleted successfully:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        notificationId: notificationId
      });
      return { success: false, error: error.message };
    }
  },

  markAllNotificationsRead: async (userId) => {
    try {
      console.log('🔔 Marking all notifications as read for user:', userId);
      
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);
      
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true, readAt: serverTimestamp(), read_at: serverTimestamp() });
      });
      
      await batch.commit();
      console.log('✅ Marked', snapshot.size, 'notifications as read');
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('❌ Error marking notifications as read:', error);
      return { success: false, error: error.message };
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true, readAt: serverTimestamp(), read_at: serverTimestamp() });
      console.log('✅ Notification marked as read:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Content Moderation Functions
  createReport: async (reportData) => {
    try {
      const docRef = await addDoc(collection(db, 'reports'), {
        type: reportData.type || 'other',
        modelId: reportData.modelId || '',
        url: reportData.url || '',
        email: reportData.email || '',
        details: reportData.details || '',
        status: reportData.status || 'pending',
        priority: reportData.priority || (reportData.type === 'ip_infringement' ? 'high' : 'medium'),
        reporterId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Report created successfully:', docRef.id);
      return { success: true, reportId: docRef.id };
    } catch (error) {
      console.error('❌ Error creating report:', error);
      return { success: false, error: error.message };
    }
  },

  submitReport: async (reportData) => {
    return firebaseHelpers.createReport(reportData);
  },

  getReports: async () => {
    try {
      const q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      console.log('✅ Reports fetched successfully:', reports.length);
      return { success: true, reports };
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      return { success: false, error: error.message };
    }
  },

  getModerationStats: async () => {
    try {
      const reportsQuery = query(collection(db, 'reports'));
      const reportsSnapshot = await getDocs(reportsQuery);
      
      let total = 0;
      let pending = 0;
      let resolved = 0;
      let highPriority = 0;
      
      reportsSnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        if (data.status === 'pending') pending++;
        if (data.status === 'resolved') resolved++;
        if (data.priority === 'high') highPriority++;
      });
      
      const stats = { total, pending, resolved, highPriority };
      console.log('✅ Moderation stats fetched successfully:', stats);
      return { success: true, stats };
    } catch (error) {
      console.error('❌ Error fetching moderation stats:', error);
      return { success: false, error: error.message };
    }
  },

  processReport: async (reportId, action, notes, moderatorId) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      const updateData = {
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        action,
        moderatorNotes: notes,
        moderatorId,
        processedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(reportRef, updateData);
      await firebaseHelpers.logAdminAction('report_processed', {
        reportId,
        action
      });
      console.log('✅ Report processed successfully:', reportId, action);
      return { success: true };
    } catch (error) {
      console.error('❌ Error processing report:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export only essential Firebase instances
export { 
  app, 
  auth, 
  db, 
  storage
};

// Export Firebase helper functions
export default firebaseHelpers;
