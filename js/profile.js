// js/profile.js

const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileUserId = document.getElementById('profile-userid');
const profileCoins = document.getElementById('profile-coins');

auth.onAuthStateChanged(async (user) => {
  if(user){
    const doc = await db.collection('users').doc(user.uid).get();
    if(doc.exists){
      const data = doc.data();
      profileName.textContent = data.name || "No Name";
      profileEmail.textContent = data.email;
      profileUserId.textContent = user.uid.substring(0,8); // Example: first 8 chars
      profileCoins.textContent = data.coins || 0;
    }
  } else {
    window.location.href = "index.html";
  }
});
