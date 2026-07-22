// js/admin.js
import { db, auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// !!! YOUR IMGBB API KEY HERE !!!
const IMGBB_API_KEY = "PASTE_YOUR_IMGBB_API_KEY_HERE";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const authModal = document.getElementById("authModal");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const adminDashboard = document.getElementById("adminDashboard");
  const logoutBtn = document.getElementById("logoutBtn");

  const carForm = document.getElementById("carForm");
  const carIdInput = document.getElementById("carId");
  const carNameInput = document.getElementById("carName");
  const carPriceInput = document.getElementById("carPrice");
  const carDiscountInput = document.getElementById("carDiscount");
  const carAccInput = document.getElementById("carAcceleration");
  const carRangeInput = document.getElementById("carRange");
  const carTopSpeedInput = document.getElementById("carTopSpeed");
  const carDescInput = document.getElementById("carDescription");
  const carImagesInput = document.getElementById("carImages");
  
  const saveCarBtn = document.getElementById("saveCarBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const formTitle = document.getElementById("formTitle");
  const inventoryList = document.getElementById("inventoryList");

  // --- 1. Authentication State Listener ---
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authModal.classList.add("hidden");
      adminDashboard.classList.remove("hidden");
      listenToInventory();
    } else {
      authModal.classList.remove("hidden");
      adminDashboard.classList.add("hidden");
    }
  });

  // Admin Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    try {
      await signInWithEmailAndPassword(auth, document.getElementById("adminEmail").value, document.getElementById("adminPassword").value);
    } catch (err) {
      loginError.textContent = "Invalid login credentials.";
    }
  });

  // Admin Logout
  logoutBtn.addEventListener("click", () => signOut(auth));

  // --- 2. Upload Images to ImgBB ---
  async function uploadFilesToImgBB(files) {
    const urls = [];
    const filesToUpload = Array.from(files).slice(0, 5); // Limit max 5 files

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        urls.push(data.data.url);
      } else {
        throw new Error("ImgBB upload failed: " + data.error.message);
      }
    }
    return urls;
  }

  // --- 3. Save / Update Vehicle ---
  carForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveCarBtn.disabled = true;
    saveCarBtn.textContent = "Processing...";

    try {
      let imageUrls = [];
      
      // Upload new images if selected
      if (carImagesInput.files.length > 0) {
        imageUrls = await uploadFilesToImgBB(carImagesInput.files);
      }

      const carData = {
        name: carNameInput.value.trim(),
        price: Number(carPriceInput.value),
        discountPercent: carDiscountInput.value ? Number(carDiscountInput.value) : null,
        acceleration: carAccInput.value.trim(),
        range: carRangeInput.value.trim(),
        topSpeed: carTopSpeedInput.value.trim(),
        description: carDescInput.value.trim(),
        updatedAt: new Date()
      };

      const existingId = carIdInput.value;

      if (existingId) {
        // UPDATE existing car
        if (imageUrls.length > 0) {
          carData.images = imageUrls; // Only overwrite images if new ones were chosen
        }
        await updateDoc(doc(db, "cars", existingId), carData);
      } else {
        // CREATE new car
        carData.images = imageUrls;
        carData.createdAt = new Date();
        await addDoc(collection(db, "cars"), carData);
      }

      resetForm();
    } catch (err) {
      alert("Error saving vehicle: " + err.message);
    } finally {
      saveCarBtn.disabled = false;
      saveCarBtn.textContent = "Save Vehicle";
    }
  });

  // --- 4. Listen & Render Inventory List ---
  function listenToInventory() {
    onSnapshot(collection(db, "cars"), (snapshot) => {
      inventoryList.innerHTML = "";
      
      snapshot.docs.forEach((docSnap) => {
        const car = docSnap.data();
        const id = docSnap.id;
        const thumb = (car.images && car.images[0]) ? car.images[0] : 'https://via.placeholder.com/50';

        const item = document.createElement("div");
        item.className = "inventory-item";
        item.innerHTML = `
          <div class="inventory-info">
            <img src="${thumb}" class="inventory-thumb" alt="">
            <div>
              <strong>${car.name}</strong><br>
              <small style="color:var(--text-secondary);">$${Number(car.price).toLocaleString()} ${car.discountPercent ? `(${car.discountPercent}% OFF)` : ''}</small>
            </div>
          </div>
          <div>
            <button class="glass-btn btn-small" onclick="editCar('${id}')">Edit</button>
            <button class="glass-btn btn-small btn-primary" onclick="deleteCar('${id}')">Delete</button>
          </div>
        `;
        inventoryList.appendChild(item);
      });
    });
  }

  // --- 5. Edit and Delete Handlers ---
  window.editCar = async (id) => {
    const docSnap = await doc(db, "cars", id);
    // Fetch snapshot or read directly
    onSnapshot(docSnap, (s) => {
      if (!s.exists()) return;
      const car = s.data();
      carIdInput.value = id;
      carNameInput.value = car.name || '';
      carPriceInput.value = car.price || '';
      carDiscountInput.value = car.discountPercent || '';
      carAccInput.value = car.acceleration || '';
      carRangeInput.value = car.range || '';
      carTopSpeedInput.value = car.topSpeed || '';
      carDescInput.value = car.description || '';
      
      formTitle.textContent = "Edit Vehicle";
      cancelEditBtn.classList.remove("hidden");
    });
  };

  window.deleteCar = async (id) => {
    if (confirm("Are you sure you want to remove this vehicle from the database?")) {
      await deleteDoc(doc(db, "cars", id));
    }
  };

  cancelEditBtn.addEventListener("click", resetForm);

  function resetForm() {
    carForm.reset();
    carIdInput.value = "";
    formTitle.textContent = "Add New Vehicle";
    cancelEditBtn.classList.add("hidden");
  }
});
