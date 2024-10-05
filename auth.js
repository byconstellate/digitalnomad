// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDyo_7FRkKgNDPGfmV38hMBTvNM-bCZcR0",
  authDomain: "constellate-13642408.firebaseapp.com",
  projectId: "constellate-13642408",
  storageBucket: "constellate-13642408.appspot.com",
  messagingSenderId: "1067431241975",
  appId: "1:1067431241975:web:ed7781dca93ca960d8cbf2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Authentication check
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    user.getIdTokenResult().then((idTokenResult) => {
      if (!!idTokenResult.claims.utopia) {
        // Show content if user has 'utopia' claim
        document.getElementById('content').style.display = 'block';
      } else {
        // No 'utopia' claim, redirect or show error
        document.body.innerHTML = '<p>Access Denied</p>';
      }
    });
  } else {
    // No user is signed in, show login UI
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#content', {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: window.location.href
    });
  }
});
