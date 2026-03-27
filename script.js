// 🔥 FIREBASE CONFIG (PASTE YOUR CONFIG HERE)
const firebaseConfig = {
  apiKey: "AIzaSyBp1wk246BkVM1OmtOCGq8E5jH_AbJQZFc",
  authDomain: "food--wast-app.firebaseapp.com",
  projectId: "food--wast-app",
  storageBucket:"food--wast-app.firebasestorage.app",
  messagingSenderId: "590161339531",
  appId:"1:590161339531:web:11d976f7b031f36ad1a08e",
};

// 🔥 INIT FIREBASE
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
auth.onAuthStateChanged(user => {

  let page = window.location.pathname;

  // allow login & register pages
  if(page.includes("login.html") || page.includes("register.html")){
    return;
  }

  if(!user){
    window.location = "login.html";
  }
});

// ================= REGISTER =================
function register(){
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let role = document.getElementById("role").value;

  auth.createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {

    let uid = userCredential.user.uid;

    db.collection("users").doc(uid).set({
      email: email,
      role: role
    });

    alert("Registered Successfully");
    window.location = "login.html";

  })
  .catch(err => alert(err.message));
}

// ================= LOGIN =================
function login(){
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
  .then((userCredential) => {

    let uid = userCredential.user.uid;

    db.collection("users").doc(uid).get().then(doc => {

      let role = doc.data().role;

      localStorage.setItem("role", role);

      if(role === "donor"){
        window.location = "donor.html";
      } else {
        window.location = "ngo.html";
      }

    });

  })
  .catch(err => alert(err.message));
}

// ================= LOGOUT =================
function logout(){
  auth.signOut().then(() => {
    window.location = "login.html";
  });
}


// ================= GPS LOCATION =================
function getLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(pos){
      let lat = pos.coords.latitude;
      let lon = pos.coords.longitude;
      document.getElementById("location").value = lat + "," + lon;
    });
  } else {
    alert("GPS not supported");
  }
}


// ================= ADD FOOD =================
function addFood(){

  let foodName = document.getElementById("foodName").value;
  let quantity = document.getElementById("quantity").value;
  let location = document.getElementById("location").value;
  let expiry = document.getElementById("expiry").value;

  let user = auth.currentUser;

  db.collection("foods").add({
    foodName,
    quantity,
    location,
    expiry,
    status: "Available",
    donor: user.email
  })
  .then(() => alert("Food Posted!"))
  .catch(err => alert(err.message));
}
// ================= DISPLAY FOOD (REAL-TIME) =================
function displayFood(){

  let list = document.getElementById("foodList");
  if(!list) return;

  let role = localStorage.getItem("role");

  db.collection("foods").onSnapshot(snapshot => {

    list.innerHTML = "";

    if(snapshot.empty){
      list.innerHTML = "<p>No food available</p>";
      return;
    }

    snapshot.forEach(doc => {

      let food = doc.data();
      let id = doc.id;

      let li = document.createElement("li");

      li.innerHTML = `
      <b>${food.foodName}</b><br>
      Qty: ${food.quantity}<br>
      Location: ${food.location}<br>
      Expiry: ${food.expiry}<br>
      Status: ${food.status}

      <iframe width="100%" height="200"
      src="https://www.google.com/maps?q=${food.location}&output=embed">
      </iframe>
      `;

      if(role === "ngo" && food.status === "Available"){
        li.innerHTML += `
        <br><button onclick="acceptFood('${id}')" class="btn btn-primary mt-2">
        Accept
        </button>`;
      }

      list.appendChild(li);

    });

  });
} 
// 👇 NGO can accept food
      if(role === "ngo" && food.status === "Available"){
        li.innerHTML += `
        <br><button onclick="acceptFood('${id}')" class="btn btn-primary mt-2">
        Accept
        </button>`;
      }

      list.appendChild(li);

    });

  });
}


// ================= ACCEPT FOOD =================
function acceptFood(id){
  db.collection("foods").doc(id).update({
    status: "Accepted by NGO"
  });
}
// ================= AUTO LOAD =================
displayFood();


// ================= SERVICE WORKER =================


// ================= INSTALL APP =================
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  let btn = document.getElementById("installBtn");
  if(btn) btn.style.display = "block";
});

let installBtn = document.getElementById("installBtn");
if(installBtn){
  installBtn.addEventListener("click", () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then(choice => {
        deferredPrompt = null;
      });
    }
  });
}
