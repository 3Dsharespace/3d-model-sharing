#!/usr/bin/env node

/**
 * Mobile Testing Script
 * Helps test your 3D website on mobile devices during development
 */

const { execSync } = require('child_process');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function generateQRCode(url) {
  try {
    const qr = require('qrcode-terminal');
    console.log('\n📱 Scan this QR code with your mobile device:');
    qr.generate(url, { small: true });
  } catch (e) {
    console.log('\n📱 To install QR code generator: npm install qrcode-terminal');
    console.log(`📱 Or manually navigate to: ${url}`);
  }
}

function displayMobileTips() {
  console.log(`
🚀 Mobile Testing Tips:

📱 Device Testing:
   • Test on real devices when possible
   • Use Chrome DevTools device emulation
   • Test different orientations

🔧 Debug Tools:
   • Mobile debug panel available (tap 📱 button)
   • Check console for mobile-specific logs
   • Use Remote Debugging for mobile browsers

🎯 Test Areas:
   • Touch interactions and gestures
   • 3D model loading and performance
   • Form inputs (check for zoom issues)
   • Navigation and scrolling
   • PWA features (add to home screen)

⚡ Performance:
   • Check network throttling in DevTools
   • Test on slow connections
   • Monitor memory usage
   • Verify image optimization

🌐 Browser Testing:
   • Safari (iOS)
   • Chrome (Android)
   • Firefox Mobile
   • Samsung Internet
   • UC Browser (popular in Asia)

📊 Metrics to Watch:
   • First Contentful Paint < 2s
   • Largest Contentful Paint < 4s
   • Total Blocking Time < 300ms
   • Cumulative Layout Shift < 0.1
  `);
}

function main() {
  console.log('🚀 Starting Mobile Development Server...\n');
  
  const localIP = getLocalIP();
  const port = 3000;
  const localUrl = `http://${localIP}:${port}`;
  
  console.log(`🖥️  Local: http://localhost:${port}`);
  console.log(`📱 Mobile: ${localUrl}`);
  
  generateQRCode(localUrl);
  displayMobileTips();
  
  console.log('\n🏃 Starting development server...\n');
  
  try {
    // Start Vite dev server with mobile-friendly configuration
    execSync('npm run dev', { 
      stdio: 'inherit',
      env: { 
        ...process.env,
        VITE_MOBILE_DEBUG: 'true'
      }
    });
  } catch (error) {
    console.error('❌ Failed to start development server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getLocalIP, displayMobileTips };
