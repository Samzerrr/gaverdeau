/* =====================================================
   GAVER D'EAU — Main JavaScript
   Animations, interactions & form handling
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ── DOM References ── */
  const header = document.getElementById('header');
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelectorAll('.header__nav-link');
  const backToTop = document.getElementById('back-to-top');
  const quoteForm = document.getElementById('quote-form');
  const formSuccess = document.getElementById('form-success');
  const galleryFilters = document.querySelectorAll('.gallery__filter');
  const galleryItems = document.querySelectorAll('.gallery__item');
  const revealElements = document.querySelectorAll('[data-reveal]');
  const countElements = document.querySelectorAll('[data-count]');

  /* ═══════════════════════════════════════════════════════
     PRELOADER CONTROLLER
     ═══════════════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');
  const preloaderRing = document.getElementById('preloader-ring');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPct = document.getElementById('preloader-pct');

  if (preloader) {
    const circumference = 2 * Math.PI * 56; // r=56
    let currentPct = 0;
    let isWindowLoaded = document.readyState === 'complete';
    let isFinished = false;

    if (!isWindowLoaded) {
      window.addEventListener('load', () => { isWindowLoaded = true; });
    }

    function updatePreloader(pct) {
      if (isFinished) return;
      currentPct = pct;
      const offset = circumference - (circumference * currentPct / 100);
      if (preloaderRing) preloaderRing.style.strokeDashoffset = offset;
      if (preloaderBar) preloaderBar.style.width = `${currentPct}%`;
      if (preloaderPct) preloaderPct.textContent = `${Math.round(currentPct)}%`;

      if (currentPct >= 100) {
        isFinished = true;
        setTimeout(() => {
          preloader.classList.add('preloader--done');
          document.body.classList.remove('preloader-active');
          setTimeout(() => { preloader.style.display = 'none'; }, 700);
        }, 250);
      }
    }

    const timer = setInterval(() => {
      if (isFinished) { clearInterval(timer); return; }
      if (isWindowLoaded) {
        updatePreloader(Math.min(currentPct + Math.floor(Math.random() * 12) + 8, 100));
      } else if (currentPct < 80) {
        const step = currentPct < 40 ? (Math.random() * 5 + 3) : (Math.random() * 2 + 1);
        updatePreloader(Math.min(currentPct + step, 80));
      }
    }, 50);

    setTimeout(() => { if (!isFinished) { isWindowLoaded = true; updatePreloader(100); } }, 2500);
  }


  /* ═══════════════════════════════════════════════════════
     HEADER — Scroll effect & active link
     ═══════════════════════════════════════════════════════ */
  let lastScroll = 0;

  function handleHeaderScroll() {
    const scrollY = window.scrollY;

    // Add/remove scrolled class
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = scrollY;

    // Update active nav link
    updateActiveNavLink();

    // Back to top visibility
    if (scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  function updateActiveNavLink() {
    const sections = document.querySelectorAll('main section[id]');
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Initial call


  /* ═══════════════════════════════════════════════════════
     MOBILE NAVIGATION
     ═══════════════════════════════════════════════════════ */
  function toggleMobileMenu() {
    const isOpen = navbar.classList.toggle('open');
    mobileToggle.classList.toggle('active', isOpen);
    header.classList.toggle('menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    mobileToggle.classList.remove('active');
    navbar.classList.remove('open');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  mobileToggle.addEventListener('click', toggleMobileMenu);

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Also close mobile nav on CTA clicks inside menu
  const mobileCtas = navbar.querySelectorAll('.header__nav-mobile-cta a');
  mobileCtas.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar.classList.contains('open')) {
      closeMobileMenu();
    }
  });


  /* ═══════════════════════════════════════════════════════
     BACK TO TOP
     ═══════════════════════════════════════════════════════ */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ═══════════════════════════════════════════════════════
     SCROLL REVEAL ANIMATION
     ═══════════════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.revealDelay) || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ═══════════════════════════════════════════════════════
     COUNTER ANIMATION
     ═══════════════════════════════════════════════════════ */
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero__stats');
  if (statsSection) {
    counterObserver.observe(statsSection);
  }

  function animateCounters() {
    countElements.forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 2000;
      const startTime = performance.now();

      function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        el.textContent = formatNumber(current);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = formatNumber(target);
        }
      }

      requestAnimationFrame(updateCount);
    });
  }

  function formatNumber(num) {
    if (num >= 1000) {
      return num.toLocaleString('fr-FR');
    }
    return num.toString();
  }


  /* ═══════════════════════════════════════════════════════
     GALLERY FILTER
     ═══════════════════════════════════════════════════════ */
  galleryFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      // Update active filter
      galleryFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');

      const category = filter.dataset.filter;

      // Filter items with animation
      galleryItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Add fadeIn keyframe dynamically
  const fadeInStyle = document.createElement('style');
  fadeInStyle.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(fadeInStyle);


  /* ═══════════════════════════════════════════════════════
     FORM HANDLING (Formspree AJAX)
     ═══════════════════════════════════════════════════════ */
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate form
      const isValid = validateForm();

      if (isValid) {
        const submitBtn = quoteForm.querySelector('.form__submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';

        try {
          // Send data to Formspree
          const formData = new FormData(quoteForm);
          const response = await fetch(quoteForm.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            // Hide form, show success
            quoteForm.hidden = true;
            formSuccess.hidden = false;

            // Scroll to success message
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Reset form
            quoteForm.reset();
          } else {
            throw new Error('Erreur serveur');
          }
        } catch (error) {
          alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter par téléphone.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Envoyer ma demande';
        }
      }
    });

    // Real-time validation
    const formInputs = quoteForm.querySelectorAll('.form__input, .form__select, .form__textarea');
    formInputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateField(input);
      });

      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });
  }

  function validateForm() {
    const requiredFields = quoteForm.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // If not valid, scroll to first error
    if (!isValid) {
      const firstError = quoteForm.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }

    return isValid;
  }

  function validateField(field) {
    let isValid = true;

    // Check required
    if (field.required && !field.value.trim()) {
      isValid = false;
    }

    // Check email format
    if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        isValid = false;
      }
    }

    // Check phone format (basic)
    if (field.type === 'tel' && field.value.trim()) {
      const phoneRegex = /^[\d\s+\-().]{10,}$/;
      if (!phoneRegex.test(field.value.trim())) {
        isValid = false;
      }
    }

    // Update UI
    if (isValid) {
      field.classList.remove('error');
    } else {
      field.classList.add('error');
    }

    return isValid;
  }


  /* ═══════════════════════════════════════════════════════
     SMOOTH SCROLL for anchor links
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });


  /* ═══════════════════════════════════════════════════════
     PARALLAX — Subtle background shift on hero
     ═══════════════════════════════════════════════════════ */
  const heroBg = document.querySelector('.hero__bg');

  if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrollY * 0.2}px)`;
      }
    }, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════
     PERFORMANCE — Lazy loading images
     ═══════════════════════════════════════════════════════ */
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading is supported
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      img.src = img.src;
    });
  } else {
    // Fallback for older browsers
    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          lazyImageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      lazyImageObserver.observe(img);
    });
  }


  /* ═══════════════════════════════════════════════════════
     HERO VIDEO PLAYBACK ASSURANCE
     ═══════════════════════════════════════════════════════ */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    heroVideo.muted = true;
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy prevented playback, start on first user interaction
        const startVideo = () => {
          heroVideo.play();
          window.removeEventListener('touchstart', startVideo);
          window.removeEventListener('scroll', startVideo);
          window.removeEventListener('click', startVideo);
        };
        window.addEventListener('touchstart', startVideo, { passive: true });
        window.addEventListener('scroll', startVideo, { passive: true });
        window.addEventListener('click', startVideo, { passive: true });
      });
    }
  }

});
