// Apple Sign In Configuration
// This script initializes Apple Sign In for the web

(function() {
  // Only initialize on web (not in Capacitor native app)
  if (!window.Capacitor) {
    // Add Apple Sign In script
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = function() {
      // Initialize Apple Sign In
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: 'ai.biseda.web', // You'll need to register this with Apple
          scope: 'name email',
          redirectURI: window.location.origin + '/#/auth',
          state: 'biseda_auth',
          usePopup: true
        });
        console.log('✅ Apple Sign In initialized');
      }
    };
  } else {
    console.log('📱 Running in Capacitor - will use native Apple Sign In');
  }
})();

