document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // Toggle menu on mobile
  // =============================
  const toggleButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");

  if (toggleButton && nav) {
    // stato iniziale per gli screen reader
    toggleButton.setAttribute("aria-expanded", "false");

    toggleButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("active");
      toggleButton.classList.toggle("active", isOpen);
      toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // =============================
  // Hero slider
  // =============================
  const slides = document.querySelectorAll(".slide");
  const nextBtn = document.querySelector(".slider-btn.next");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
  let current = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  if (nextBtn && prevBtn && slides.length > 0) {
    nextBtn.addEventListener("click", () => {
      current = (current + 1) % slides.length;
      showSlide(current);
    });

    prevBtn.addEventListener("click", () => {
      current = (current - 1 + slides.length) % slides.length;
      showSlide(current);
    });
  }

  // =============================
  // Validation helpers
  // =============================
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+0-9\s\-().]{7,20}$/;

  function showError(input, message) {
    const error = document.createElement("div");
    error.className = "error-message";
    error.textContent = message;
    input.classList.add("error");
    input.insertAdjacentElement("afterend", error);
  }

  function clearErrors(form) {
    form.querySelectorAll(".error-message").forEach(el => el.remove());
    form.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
  }

  // =============================
  // Contact form submission
  // =============================
  const form = document.querySelector("form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const statusDiv = document.getElementById("form-status");
      if (statusDiv) {
        statusDiv.textContent = "";
        statusDiv.className = "form-status";
      }

      // 1) Clear previous errors
      clearErrors(form);

      // 2) Validate fields
      let isValid = true;
      const name = form.elements["name"];
      const email = form.elements["email"];
      const phone = form.elements["phone"];
      const dateInfo = form.elements["dateInfo"];
      const message = form.elements["message"];

      // Name
      if (!name.value || name.value.trim().length < 2) {
        showError(name, "Your name must contain at least 2 characters.");
        isValid = false;
      }

      // Email
      if (!emailRegex.test(email.value)) {
        showError(email, "Please enter a valid email address.");
        isValid = false;
      }

      // Phone (mandatory)
      if (!phone.value.trim() || !phoneRegex.test(phone.value)) {
        showError(phone, "Please enter a valid phone number.");
        isValid = false;
      }

      // Date / Period of Interest (mandatory)
      if (!dateInfo.value || dateInfo.value.trim().length < 2) {
        showError(dateInfo, "Please specify a date or period of interest.");
        isValid = false;
      }

      // Message (optional → no validation)

      // 3) If invalid -> show error and stop
      if (!isValid) {
        if (statusDiv) {
          statusDiv.textContent = "Some fields are not valid. Please check and try again.";
          statusDiv.className = "form-status error";
        }
        return;
      }

      // 4) If valid -> send
      if (statusDiv) {
        statusDiv.innerHTML = '<span class="spinner"></span> Sending...';
        statusDiv.className = "form-status pending";
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          if (statusDiv) {
            statusDiv.textContent = result.message || "Message sent successfully!";
            statusDiv.className = "form-status success";
          }
          form.reset();
        } else {
          if (statusDiv) {
            statusDiv.textContent = result.message || "An error occurred while sending your message.";
            statusDiv.className = "form-status error";
          }
        }
      } catch (error) {
        if (statusDiv) {
          statusDiv.textContent = "A network error occurred. Please try again later.";
          statusDiv.className = "form-status error";
        }
        console.error(error);
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // Portfolio slider (desktop loop + mobile scroll)
  // =============================
  const track = document.querySelector(".slider-track");
  if (!track) return; // non siamo nella pagina portfolio

  let slides = Array.from(track.querySelectorAll("img"));
  if (slides.length === 0) return;

  const leftBtn   = document.querySelector(".arrow-left");
  const rightBtn  = document.querySelector(".arrow-right");
  const introText = document.querySelector(".slider-intro-text");

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
  let currentIndex = 0;
  let loopMode = false; // clonazione attiva solo su desktop/tablet

  // --- utils comuni ---
  function hideIntro() { if (introText) introText.classList.add("hidden"); }

  function updateActiveClasses() {
    slides.forEach((s, i) => s.classList.toggle("active", i === currentIndex));
  }

  function centerActiveDesktop() {
    const active = slides[currentIndex];
    const offset = -active.offsetLeft + (window.innerWidth - active.offsetWidth) / 2;
    track.style.transform = `translateX(${offset}px)`;
  }

  // --- LOOP DESKTOP: setup/teardown ---
  function setupDesktopLoop() {
    if (loopMode || isMobile()) return;

    const firstClone = slides[0].cloneNode(true);
    const lastClone  = slides[slides.length - 1].cloneNode(true);
    firstClone.classList.remove("active");
    lastClone.classList.remove("active");

    // Prepend clone of last, append clone of first
    track.insertBefore(lastClone, slides[0]);
    track.appendChild(firstClone);

    // Aggiorna lista e posizionati sulla prima reale
    slides = Array.from(track.querySelectorAll("img"));
    loopMode = true;
    currentIndex = 1; // prima "vera" slide
    updateActiveClasses();

    // posiziona senza "salti"
    const prev = track.style.transition;
    track.style.transition = "none";
    centerActiveDesktop();
    // forza reflow e ripristina transizione
    void track.offsetHeight;
    track.style.transition = prev || "transform 0.5s ease";
  }

  function teardownDesktopLoop() {
    if (!loopMode) return;
    // rimuovi primo e ultimo (cloni)
    track.removeChild(track.firstElementChild);
    track.removeChild(track.lastElementChild);
    slides = Array.from(track.querySelectorAll("img"));
    loopMode = false;
    currentIndex = 0;
    updateActiveClasses();
    track.style.transform = ""; // pulizia per mobile
  }

  // --- navigazione desktop/tablet ---
  function goTo(i) {
    currentIndex = (i + slides.length) % slides.length;
    updateActiveClasses();

    if (!isMobile()) {
      // assicura che ci sia la transizione
      track.style.transition = track.style.transition || "transform 0.5s ease";
      centerActiveDesktop();

      // gestione wrap invisibile quando arrivi ai cloni
      if (loopMode) {
        track.addEventListener(
          "transitionend",
          () => {
            if (currentIndex === 0) {
              // siamo sul clone di "last" → salta alla vera ultima
              currentIndex = slides.length - 2;
              const prev = track.style.transition;
              track.style.transition = "none";
              updateActiveClasses();
              centerActiveDesktop();
              void track.offsetHeight;
              track.style.transition = prev;
            } else if (currentIndex === slides.length - 1) {
              // siamo sul clone di "first" → salta alla vera prima
              currentIndex = 1;
              const prev = track.style.transition;
              track.style.transition = "none";
              updateActiveClasses();
              centerActiveDesktop();
              void track.offsetHeight;
              track.style.transition = prev;
            }
          },
          { once: true }
        );
      }
    }
  }

  if (leftBtn) {
    leftBtn.addEventListener("click", () => { goTo(currentIndex - 1); hideIntro(); });
  }
  if (rightBtn) {
    rightBtn.addEventListener("click", () => { goTo(currentIndex + 1); hideIntro(); });
  }

  // --- mobile: scroll nativo + tap per centrare ---
  function handleScrollMobile() {
    if (!isMobile()) return;

    const center = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let best = Infinity;

    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const d = Math.abs(center - slideCenter);
      if (d < best) { best = d; closestIndex = i; }
    });

    if (closestIndex !== currentIndex) {
      currentIndex = closestIndex;
      updateActiveClasses(); // toglie grigio dalla foto centrata
    }
  }
  track.addEventListener("scroll", handleScrollMobile, { passive: true });
  

  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => {
      if (!isMobile()) return;
      const left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
      track.scrollTo({ left, behavior: "smooth" });
      hideIntro(); // l'active lo aggiorna lo scroll
    });
  });

  // --- resize: switch tra modalità ---
  function onResize() {
    if (isMobile()) {
      // passa a mobile
      teardownDesktopLoop();
      track.style.transform = "";
      updateActiveClasses();
    } else {
      // passa a desktop/tablet
      setupDesktopLoop();
      centerActiveDesktop();
      updateActiveClasses();
    }
  }
  window.addEventListener("resize", onResize);

// --- mobile loop mode ---
function setupMobileLoop() {
  if (!isMobile() || loopMode) return;

  const originals = Array.from(track.querySelectorAll("img"));
  const totalClones = 3;

  for (let i = 0; i < totalClones; i++) {
    originals.forEach(img => {
      const clone = img.cloneNode(true);
      clone.classList.remove("active");
      track.appendChild(clone);
    });
  }

  slides = Array.from(track.querySelectorAll("img"));
  loopMode = true;

  // scroll centrale
  const middleIndex = originals.length;
  const centerImg = slides[middleIndex];
  const left = centerImg.offsetLeft - (track.clientWidth - centerImg.clientWidth) / 2;
  track.scrollTo({ left });
}

function correctScrollLoopMobile() {
  if (!isMobile() || !loopMode) return;

  const scrollLeft = track.scrollLeft;
  const center = track.scrollWidth / 2;
  const singleWidth = slides[0].clientWidth;
  const viewport = track.clientWidth;
  const range = singleWidth * slides.length / 3;

  const fix = () => {
    const prev = track.style.scrollBehavior;
    track.style.scrollBehavior = "auto";

    if (scrollLeft < range / 2 || scrollLeft > track.scrollWidth - range / 2 - viewport) {
      const newScrollLeft = center - viewport / 2;
      track.scrollLeft = newScrollLeft;
    }

    track.style.scrollBehavior = prev;
  };

  requestAnimationFrame(fix);
}

track.addEventListener("scroll", () => {
  correctScrollLoopMobile();
});

// MODIFICA onResize PER INCLUDERE SETUP MOBILE
function onResize() {
  if (isMobile()) {
    teardownDesktopLoop();
    setupMobileLoop();
    updateActiveClasses();
  } else {
    teardownMobileLoop();
    setupDesktopLoop();
    centerActiveDesktop();
    updateActiveClasses();
  }
}

function teardownMobileLoop() {
  if (!loopMode) return;
  const count = slides.length / 4; // originale + 3 cloni
  for (let i = 0; i < count * 3; i++) {
    track.removeChild(track.lastElementChild);
  }
  slides = Array.from(track.querySelectorAll("img"));
  loopMode = false;
}

// MODIFICA onResize PER INCLUDERE SETUP MOBILE
function onResize() {
  if (isMobile()) {
    teardownDesktopLoop();
    setupMobileLoop();
    updateActiveClasses();
  } else {
    teardownMobileLoop();
    setupDesktopLoop();
    centerActiveDesktop();
    updateActiveClasses();
  }
}

function teardownMobileLoop() {
  if (!loopMode) return;
  track.removeChild(track.firstElementChild);
  track.removeChild(track.lastElementChild);
  slides = Array.from(track.querySelectorAll("img"));
  loopMode = false;
}

// MODIFICA onResize PER INCLUDERE SETUP MOBILE
function onResize() {
  if (isMobile()) {
    teardownDesktopLoop();
    setupMobileLoop();
    updateActiveClasses();
  } else {
    teardownMobileLoop();
    setupDesktopLoop();
    centerActiveDesktop();
    updateActiveClasses();
  }
}

function teardownMobileLoop() {
  if (!loopMode) return;
  track.removeChild(track.firstElementChild);
  track.removeChild(track.lastElementChild);
  slides = Array.from(track.querySelectorAll("img"));
  loopMode = false;
}

// MODIFICA onResize PER INCLUDERE SETUP MOBILE
function onResize() {
  if (isMobile()) {
    teardownDesktopLoop();
    setupMobileLoop();
    updateActiveClasses();
  } else {
    teardownMobileLoop();
    setupDesktopLoop();
    centerActiveDesktop();
    updateActiveClasses();
  }
}

function teardownMobileLoop() {
  if (!loopMode) return;
  track.removeChild(track.firstElementChild);
  track.removeChild(track.lastElementChild);
  slides = Array.from(track.querySelectorAll("img"));
  loopMode = false;
}







  // --- init ---
  onResize();              // prepara modalità corretta (e loop su desktop)
  updateActiveClasses();   // marca attiva la slide corrente
});

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");

  if (!localStorage.getItem("cookiesAccepted") && banner) {
    banner.classList.remove("hidden");
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem("cookiesAccepted", "true");
      banner.classList.add("hidden");
    });
  }
});

// --- autoplay per hero slider nella homepage ---
setInterval(() => {
  const slides = document.querySelectorAll(".slide");
  const currentSlide = document.querySelector(".slide.active");
  const currentIndex = Array.from(slides).indexOf(currentSlide);
  const nextIndex = (currentIndex + 1) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === nextIndex);
  });
}, 3000); // ogni 4 secondi
