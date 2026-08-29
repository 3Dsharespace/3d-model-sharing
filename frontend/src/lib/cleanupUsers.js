// Firebase User Cleanup Script
// WARNING: This will permanently delete data - use with caution!

import { auth, db, storage } from './firebase'
import { 
  collection, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  writeBatch 
} from 'firebase/firestore'
import { 
  ref, 
  deleteObject, 
  listAll 
} from 'firebase/storage'

export const cleanupUsers = {
  // Delete a single user and all their data
  async deleteUser(userId) {
    try {
      console.log(`Starting cleanup for user: ${userId}`)
      
      // 1. Delete user's models from Firestore
      await this.deleteUserModels(userId)
      
      // 2. Delete user's profile from Firestore
      await this.deleteUserProfile(userId)
      
      // 3. Delete user's files from Storage
      await this.deleteUserFiles(userId)
      
      // 4. Delete user's downloads tracking
      await this.deleteUserDownloads(userId)
      
      console.log(`✅ User ${userId} cleanup completed successfully`)
      return { success: true }
      
    } catch (error) {
      console.error(`❌ Error cleaning up user ${userId}:`, error)
      return { success: false, error: error.message }
    }
  },

  // Delete all models uploaded by a user
  async deleteUserModels(userId) {
    try {
      const modelsRef = collection(db, 'models')
      const q = query(modelsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      const batch = writeBatch(db)
      let deletedCount = 0
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref)
        deletedCount++
      })
      
      if (deletedCount > 0) {
        await batch.commit()
        console.log(`🗑️ Deleted ${deletedCount} models for user ${userId}`)
      }
      
    } catch (error) {
      console.error('Error deleting user models:', error)
      throw error
    }
  },

  // Delete user profile document
  async deleteUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId)
      await deleteDoc(userRef)
      console.log(`🗑️ Deleted profile for user ${userId}`)
    } catch (error) {
      console.error('Error deleting user profile:', error)
      throw error
    }
  },

  // Delete user's uploaded files from Storage
  async deleteUserFiles(userId) {
    try {
      const userFolderRef = ref(storage, `users/${userId}`)
      const files = await listAll(userFolderRef)
      
      let deletedCount = 0
      for (const file of files.items) {
        await deleteObject(file)
        deletedCount++
      }
      
      if (deletedCount > 0) {
        console.log(`🗑️ Deleted ${deletedCount} files for user ${userId}`)
      }
      
    } catch (error) {
      console.error('Error deleting user files:', error)
      // Don't throw here as files might not exist
    }
  },

  // Delete user's download tracking records
  async deleteUserDownloads(userId) {
    try {
      const downloadsRef = collection(db, 'downloads')
      const q = query(downloadsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      const batch = writeBatch(db)
      let deletedCount = 0
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref)
        deletedCount++
      })
      
      if (deletedCount > 0) {
        await batch.commit()
        console.log(`🗑️ Deleted ${deletedCount} download records for user ${userId}`)
      }
      
    } catch (error) {
      console.error('Error deleting user downloads:', error)
      // Don't throw here as downloads might not exist
    }
  },

  // Bulk delete multiple users
  async bulkDeleteUsers(userIds) {
    try {
      console.log(`Starting bulk cleanup for ${userIds.length} users`)
      
      const results = []
      for (const userId of userIds) {
        const result = await this.deleteUser(userId)
        results.push({ userId, ...result })
      }
      
      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length
      
      console.log(`✅ Bulk cleanup completed: ${successCount} successful, ${failureCount} failed`)
      return { success: true, results }
      
    } catch (error) {
      console.error('Error in bulk cleanup:', error)
      return { success: false, error: error.message }
    }
  },

  // Clean up orphaned data (data without corresponding users)
  async cleanupOrphanedData() {
    try {
      console.log('Starting orphaned data cleanup...')
      
      // Get all users
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      const validUserIds = new Set(usersSnapshot.docs.map(doc => doc.id))
      
      // Clean up orphaned models
      const modelsRef = collection(db, 'models')
      const modelsSnapshot = await getDocs(modelsRef)
      const batch = writeBatch(db)
      let orphanedModels = 0
      
      modelsSnapshot.forEach((doc) => {
        const modelData = doc.data()
        if (!validUserIds.has(modelData.userId)) {
          batch.delete(doc.ref)
          orphanedModels++
        }
      })
      
      if (orphanedModels > 0) {
        await batch.commit()
        console.log(`🗑️ Deleted ${orphanedModels} orphaned models`)
      }
      
      // Clean up orphaned downloads
      const downloadsRef = collection(db, 'downloads')
      const downloadsSnapshot = await getDocs(downloadsRef)
      const downloadBatch = writeBatch(db)
      let orphanedDownloads = 0
      
      downloadsSnapshot.forEach((doc) => {
        const downloadData = doc.data()
        if (!validUserIds.has(downloadData.userId)) {
          downloadBatch.delete(doc.ref)
          orphanedDownloads++
        }
      })
      
      if (orphanedDownloads > 0) {
        await downloadBatch.commit()
        console.log(`🗑️ Deleted ${orphanedDownloads} orphaned download records`)
      }
      
      console.log('✅ Orphaned data cleanup completed')
      return { success: true, orphanedModels, orphanedDownloads }
      
    } catch (error) {
      console.error('Error cleaning up orphaned data:', error)
      return { success: false, error: error.message }
    }
  },

  // Get cleanup statistics
  async getCleanupStats() {
    try {
      const stats = {
        totalUsers: 0,
        totalModels: 0,
        totalDownloads: 0,
        totalFiles: 0
      }
      
      // Count users
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      stats.totalUsers = usersSnapshot.size
      
      // Count models
      const modelsRef = collection(db, 'models')
      const modelsSnapshot = await getDocs(modelsRef)
      stats.totalModels = modelsSnapshot.size
      
      // Count downloads
      const downloadsRef = collection(db, 'downloads')
      const downloadsSnapshot = await getDocs(downloadsRef)
      stats.totalDownloads = downloadsSnapshot.size
      
      console.log('📊 Cleanup Statistics:', stats)
      return { success: true, stats }
      
    } catch (error) {
      console.error('Error getting cleanup stats:', error)
      return { success: false, error: error.message }
    }
  }
}

// Usage Examples:
/*
// Delete a single user
await cleanupUsers.deleteUser('user123')

// Bulk delete multiple users
await cleanupUsers.bulkDeleteUsers(['user1', 'user2', 'user3'])

// Clean up orphaned data
await cleanupUsers.cleanupOrphanedData()

// Get statistics
await cleanupUsers.getCleanupStats()
*/
