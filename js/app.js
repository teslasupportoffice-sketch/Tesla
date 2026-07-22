// js/app.js
import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const carGrid = document.getElementById("carGrid");
  const teslaLogoBtn = document.getElementById("teslaLogoBtn");
  const supportFab = document.getElementById("supportFab");
  const supportMenu = document.getElementById("supportMenu");

  // --- 1. Real-time Firestore Vehicle Fetching ---
  const carsCollection = collection(db, "cars");
  
  onSnapshot(carsCollection, (snapshot) => {
    carGrid.innerHTML = ""; // Clear loading skeleton

    if (snapshot.empty) {
      carGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No vehicles currently listed in the showroom.</p>`;
      return;
    }

    snapshot.docs.forEach((doc) => {
      const car = doc.data();
      const carId = doc.id;
      
      // Calculate Price & Discount
      const originalPrice = Number(car.price);
      const discountPercent = car.discountPercent ? Number(car.discountPercent) : 0;
      let finalPrice = originalPrice;
      
      if (discountPercent > 0) {
        finalPrice = originalPrice - (originalPrice * (discountPercent / 100));
      }

      // First image or fallback
      const primaryImg = (car.images && car.images.length > 0) 
        ? car.images[0] 
        : 'https://via.placeholder.com/400x250?text=No+Image';

      // Create Glass Card Element
      const card = document.createElement("div");
      card.className = "glass-card";
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${primaryImg}" alt="${car.name}" class="card-img">
          ${discountPercent > 0 ? `<span class="discount-tag">${discountPercent}% OFF</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="car-name">${car.name}</h3>
          <div class="price-container">
            ${discountPercent > 0 
              ? `<span class="original-price strikethrough">$${originalPrice.toLocaleString()}</span>` 
              : ''
            }
            <span class="final-price">$${Math.round(finalPrice).toLocaleString()}</span>
          </div>
          <div class="spec-strip">
            <div class="spec-item"><div class="val">${car.acceleration || 'N/A'}</div><div class="lbl">0-60 mph</div></div>
            <div class="spec-item"><div class="val">${car.range || 'N/A'}</div><div class="lbl">Range</div></div>
            <div class="spec-item"><div class="val">${car.topSpeed || 'N/A'}</div><div class="lbl">Top Speed</div></div>
          </div>
          <a href="car-details.html?id=${carId}" class="glass-btn btn-primary">View Details</a>
        </div>
      `;
      carGrid.appendChild(card);
    });
  });

  // --- 2. Floating Support Menu Toggle ---
  if (supportFab && supportMenu) {
    supportFab.addEventListener("click", (e) => {
      e.stopPropagation();
      supportMenu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      supportMenu.classList.remove("show");
    });
  }

  // --- 3. Secret 5-Tap Gesture on Tesla Logo ---
  let tapCount = 0;
  let tapTimer;

  if (teslaLogoBtn) {
    teslaLogoBtn.addEventListener("click", () => {
      tapCount++;
      clearTimeout(tapTimer);

      if (tapCount === 5) {
        tapCount = 0;
        window.location.href = "admin.html";
      } else {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 3000); // Reset tap count if 5 taps aren't completed in 3 seconds
      }
    });
  }
});
