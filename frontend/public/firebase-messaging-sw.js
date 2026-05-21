/**
 * Firebase Messaging Service Worker
 * Handles background push notifications
 */

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by providing
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyCtaQ7-1Hd5e_OgQ5eLT94-WVYodWcJ6mM",
  authDomain: "dsharespace-v2.firebaseapp.com",
  projectId: "dsharespace-v2",
  storageBucket: "dsharespace-v2.firebasestorage.app",
  messagingSenderId: "752132224763",
  appId: "1:752132224763:web:12caa9830fca0288f5225e",
  measurementId: "G-DVE3KJ3EWJ"
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  if (action === 'dismiss') {
    notification.close();
    return;
  }

  // Determine the URL to open based on notification type
  let urlToOpen = '/';
  
  if (data.type === 'comment' || data.type === 'like' || data.type === 'download') {
    urlToOpen = `/model/${data.modelId}`;
  } else if (data.type === 'follow') {
    urlToOpen = `/profile/${data.followerId}`;
  } else if (data.type === 'tip') {
    urlToOpen = '/earnings';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      const existingClient = clientList.find(client => 
        client.url.includes(urlToOpen) && 'focus' in client
      );

      if (existingClient) {
        // Focus existing tab
        return existingClient.focus();
      }

      // Check if there's any client open
      if (clientList.length > 0 && 'navigate' in clientList[0]) {
        // Navigate existing tab
        return clientList[0].navigate(urlToOpen).then(client => client.focus());
      }

      // Open new tab
      return clients.openWindow(urlToOpen);
    }).then(() => {
      notification.close();
    })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('📱 Push subscription changed');
  
  event.waitUntil(
    // Re-subscribe with new subscription
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BPdUFQTiqcEkFFnW6wO37seXMG29xF0rZgUJocTyFJ4sZ4VCGYL4Nh5h7J1YJRGpO24p1RUGYK0lafCe-DxRDy4'
    }).then((subscription) => {
      console.log('✅ Re-subscribed to push notifications');
      // Send new subscription to server
    })
  );
});

console.log('🔧 Firebase Messaging Service Worker loaded');
