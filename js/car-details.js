// js/car-details.js
import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// !!! SET YOUR CONTACT INFORMATION HERE !!!
const WHATSAPP_PHONE = "1234567890"; // Include country code without '+'
const TELEGRAM_USERNAME = "YourTelegramUsername"; 

document.addEventListener("DOMContentLoaded", async () => {
  const detailsContainer = document.getElementById("detailsContainer");
  const supportFab = document.getElementById("supportFab");
  const supportMenu = document.getElementById("supportMenu");

  // Get car ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get("id");

  if (!carId) {
    detailsContainer.innerHTML = `<p style="text-align:center;">Vehicle not found. <a href="index.html" style="color:var(--tesla-red);">Return to Showroom</a></p>`;
    return;
  }

  try {
    const carDocRef = doc(db, "cars", carId);
    const carSnap = await getDoc(carDocRef);

    if (!carSnap.exists()) {
      detailsContainer.innerHTML = `<p style="text-align:center;">Vehicle record does not exist.</p>`;
      return;
    }

    const car = carSnap.data();

    // Price Calculations
    const originalPrice = Number(car.price);
    const discountPercent = car.discountPercent ? Number(car.discountPercent) : 0;
    let finalPrice = originalPrice;
    
    if (discountPercent > 0) {
      finalPrice = originalPrice - (originalPrice * (discountPercent / 100));
    }

    const images = (car.images && car.images.length > 0) 
      ? car.images 
      : ['https://via.placeholder.com/600x400?text=No+Image'];

    // Construct Pre-filled Order Card Message
    const orderCardText = 
`🚗 *NEW VEHICLE INQUIRY*
━━━━━━━━━━━━━━━━━━
• *Model:* ${car.name}
• *Price:* $${Math.round(finalPrice).toLocaleString()}${discountPercent > 0 ? ` (${discountPercent}% OFF)` : ''}
• *0-60 mph:* ${car.acceleration || 'N/A'}
• *Range:* ${car.range || 'N/A'}
• *Top Speed:* ${car.topSpeed || 'N/A'}
━━━━━━━━━━━━━━━━━━
Hello! I am interested in purchasing this model. Please provide further details.`;

    const encodedMsg = encodeURIComponent(orderCardText);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMsg}`;
    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodedMsg}`;

    // Render Vehicle Details UI
    detailsContainer.innerHTML = `
      <div class="details-grid">
        <div class="gallery-container">
          <img src="${images[0]}" id="mainDisplayImg" class="main-view-img" alt="${car.name}">
          ${images.length > 1 ? `
            <div class="gallery-thumbs">
              ${images.map((img, idx) => `
                <img src="${img}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="switchGalleryImg('${img}', this)">
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="info-container">
          <h1 style="font-size: 2.2rem; margin-bottom: 8px;">${car.name}</h1>
          
          <div class="price-container" style="margin-bottom: 20px;">
            ${discountPercent > 0 
              ? `<span class="original-price strikethrough" style="font-size:1.2rem;">$${originalPrice.toLocaleString()}</span>` 
              : ''
            }
            <span class="final-price" style="font-size:2rem;">$${Math.round(finalPrice).toLocaleString()}</span>
          </div>

          <div class="spec-strip" style="margin-bottom: 24px;">
            <div class="spec-item"><div class="val">${car.acceleration || 'N/A'}</div><div class="lbl">0-60 mph</div></div>
            <div class="spec-item"><div class="val">${car.range || 'N/A'}</div><div class="lbl">Range</div></div>
            <div class="spec-item"><div class="val">${car.topSpeed || 'N/A'}</div><div class="lbl">Top Speed</div></div>
          </div>

          <p style="color:var(--text-secondary); line-height:1.6; margin-bottom: 28px;">
            ${car.description || 'No additional description provided for this model.'}
          </p>

          <div class="order-actions">
            <a href="${whatsappUrl}" target="_blank" class="glass-btn btn-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> Order via WhatsApp Card
            </a>
            <a href="${telegramUrl}" target="_blank" class="glass-btn btn-telegram">
              <i class="fa-brands fa-telegram"></i> Order via Telegram Card
            </a>
          </div>
        </div>
      </div>
    `;

    // Global gallery switch handler
    window.switchGalleryImg = (src, el) => {
      document.getElementById("mainDisplayImg").src = src;
      document.querySelectorAll(".thumb-img").forEach(thumb => thumb.classList.remove("active"));
      el.classList.add("active");
    };

  } catch (err) {
    console.error(err);
    detailsContainer.innerHTML = `<p style="color:red; text-align:center;">Failed to load vehicle details.</p>`;
  }

  // Floating Support Menu
  if (supportFab && supportMenu) {
    supportFab.addEventListener("click", (e) => {
      e.stopPropagation();
      supportMenu.classList.toggle("show");
    });
    document.addEventListener("click", () => supportMenu.classList.remove("show"));
  }
});
