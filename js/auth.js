// js/auth.js
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Sign Up
const signupBtn = document.getElementById("signupBtn");
if(signupBtn){
  signupBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMsg = document.getElementById("error-msg");

    if(password !== confirmPassword){
      errorMsg.textContent = "Passwords do not match!";
      return;
    }
    if(password.length !== 6){
      errorMsg.textContent = "Password must be exactly 6 characters.";
      return;
    }

    try{
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        coins: 0
      });
      window.location = "home.html";
    } catch(error){
      errorMsg.textContent = error.message;
    }
  });
}

// Login
const loginBtn = document.getElementById("loginBtn");
if(loginBtn){
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    try{
      await signInWithEmailAndPassword(auth, email, password);
      window.location = "home.html";
    } catch(error){
      errorMsg.textContent = error.message;
    }
  });
}
