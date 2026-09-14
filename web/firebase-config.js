/* ==================== Firebase 配置（Compat 版） ==================== */
/* 使用 Compat SDK，不依赖 ES Module，确保同步加载 */

const firebaseConfig = {
  apiKey: "AIzaSyD1u-LPCrG2IJLkFRf_sqVLzVXW7dSg1uw",
  authDomain: "studyhub-bf4b3.firebaseapp.com",
  projectId: "studyhub-bf4b3",
  storageBucket: "studyhub-bf4b3.firebasestorage.app",
  messagingSenderId: "899326814809",
  appId: "1:899326814809:web:0c554ba40f587ccbbddf48",
  measurementId: "G-869TK1ZL99"
};

try {
  firebase.initializeApp(firebaseConfig);
} catch(e) {
  console.error('Firebase init error:', e);
}

// Analytics 在本地 file:// 协议下会报错，用 try-catch 保护
try {
  firebase.analytics();
} catch(e) {
  console.warn('Analytics skipped (expected on local file):', e.message);
}

window.firebaseConfig = firebaseConfig;

