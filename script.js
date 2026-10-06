document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Ruta de imagen por defecto / placeholder
  const DEFAULT_IMAGE = "logo_bolisv2.png";

  // Crear capa de Blur Overlay dinámicamente si no existe en la página
  let blurOverlay = document.getElementById("blur-overlay");
  if (!blurOverlay) {
    blurOverlay = document.createElement("div");
    blurOverlay.id = "blur-overlay";
    document.body.appendChild(blurOverlay);
  }

  // Elementos principales
  const preloader = document.getElementById("preloader");
  const logoPreload = document.getElementById("logo-preload");
  const logoTarget = document.getElementById("logo-target");
  const modalPromo = document.getElementById("modalPromociones");
  const btnCerrarPromo = document.getElementById("btnCerrarPromo");

  let isModalOpen = false;

  const activarBlurFondo = (activar) => {
    if (blurOverlay) {
      if (activar) {
        blurOverlay.classList.add("is-active");
      } else {
        blurOverlay.classList.remove("is-active");
      }
    }
  };

  // 2. ABRIR EL POPUP DE PROMOCIÓN
  const iniciarPopupPromocion = () => {
    if (!modalPromo) return;

    isModalOpen = true;
    activarBlurFondo(true);

    gsap.killTweensOf(modalPromo);
    gsap.set(modalPromo, {
      opacity: 0,
      scale: 0.7,
      y: 40
    });

    modalPromo.showModal();

    // Animación de entrada
    gsap.to(modalPromo, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.75,
      ease: "back.out(1.7)",
      force3D: true
    });

    // Animación de salida al cerrar
    const cerrarConAnimacion = () => {
      activarBlurFondo(false);
      gsap.to(modalPromo, {
        opacity: 0,
        scale: 0.8,
        y: 20,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          modalPromo.close();
          isModalOpen = false;
        }
      });
    };

    btnCerrarPromo?.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarConAnimacion();
    });

    modalPromo.addEventListener("click", (e) => {
      const dialogBounds = modalPromo.getBoundingClientRect();
      if (
        e.clientX < dialogBounds.left ||
        e.clientX > dialogBounds.right ||
        e.clientY < dialogBounds.top ||
        e.clientY > dialogBounds.bottom
      ) {
        cerrarConAnimacion();
      }
    });

    blurOverlay.addEventListener("click", cerrarConAnimacion);
  };

  // 3. ANIMACIÓN GSAP DEL PRELOADER (CORREGIDA)
  const executePreloader = () => {
    if (!preloader || !logoPreload || !logoTarget) {
      if (logoTarget) {
        logoTarget.style.visibility = "visible";
        logoTarget.style.opacity = "1";
      }
      iniciarPopupPromocion();
      return;
    }

    const targetRect = logoTarget.getBoundingClientRect();
    const currentRect = logoPreload.getBoundingClientRect();

    if (currentRect.width === 0 || targetRect.width === 0) {
      setTimeout(executePreloader, 50);
      return;
    }

    // Preparar target
    logoTarget.style.visibility = "visible";
    logoTarget.style.opacity = "0";

    // Crear clon para la animación
    const clone = logoPreload.cloneNode(true);
    clone.id = "logo-clone";
    clone.style.position = "fixed";
    clone.style.left = `${currentRect.left}px`;
    clone.style.top = `${currentRect.top}px`;
    clone.style.width = `${currentRect.width}px`;
    clone.style.height = `${currentRect.height}px`;
    clone.style.margin = "0";
    clone.style.transform = "none";
    clone.style.zIndex = "60";

    logoPreload.style.opacity = "0";
    document.body.appendChild(clone);

    const deltaX = targetRect.left - currentRect.left;
    const deltaY = targetRect.top - currentRect.top;

    const tl = gsap.timeline({
      onComplete: () => {
        const activeClone = document.getElementById("logo-clone");
        if (activeClone) activeClone.remove();
        if (preloader) preloader.remove();

        setTimeout(iniciarPopupPromocion, 100);
      }
    });

    // Traslación y escala unificada
    tl.to(clone, {
      x: deltaX,
      y: deltaY,
      width: targetRect.width,
      height: targetRect.height,
      duration: 0.85,
      delay: 0.4,
      ease: "power3.inOut",
      force3D: true
    })
    .to(preloader, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.6")
    // Transición suave entre el clon y el logo objetivo
    .to(clone, {
      opacity: 0,
      duration: 0.15,
      ease: "power1.out"
    }, "-=0.15")
    .to(logoTarget, {
      opacity: 1,
      duration: 0.15,
      ease: "power1.in"
    }, "<");
  };

  if (document.readyState === "complete") {
    setTimeout(executePreloader, 100);
  } else {
    window.addEventListener("load", () => setTimeout(executePreloader, 100));
  }

  // 4. Fondo difuminado en Navegación al hacer scroll
  const categoryNav = document.querySelector(".category-nav");
  if (categoryNav) {
    const handleStickyNav = () => {
      const navTop = categoryNav.getBoundingClientRect().top;
      categoryNav.classList.toggle("is-stuck", navTop <= 0);
    };

    window.addEventListener("scroll", handleStickyNav, { passive: true });
    handleStickyNav();
  }

  // 5. Navegación por Categorías e Intersection Observer
  const navButtons = [...document.querySelectorAll(".nav-pill")];
  const sections = navButtons.map((btn) => document.getElementById(btn.dataset.target));

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = document.getElementById(button.dataset.target);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  const activateButton = (targetId) => {
    navButtons.forEach((btn) => {
      const isTarget = btn.dataset.target === targetId;
      btn.classList.toggle("is-active", isTarget);

      if (isTarget) {
        btn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (isModalOpen) return;

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      if (isAtBottom) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateButton(entry.target.id);
        }
      });
    },
    { rootMargin: "-20% 0px -40% 0px", threshold: 0.1 }
  );

  sections.forEach((section) => {
    if (section) observer.observe(section);
  });

  // 6. Carrusel Swiper (Modal Dinámico)
  const modalCarrusel = document.getElementById("modalCarrusel");
  const btnCerrarCarrusel = document.getElementById("btnCerrarCarrusel");
  const swiperWrapper = document.getElementById("swiperWrapper");
  let swiperInstance = null;

  const cerrarCarruselConAnimacion = () => {
    if (!modalCarrusel || !modalCarrusel.open) return;

    gsap.killTweensOf(modalCarrusel);
    gsap.to(modalCarrusel, {
      opacity: 0,
      scale: 0.85,
      y: 20,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        modalCarrusel.close();
        activarBlurFondo(false);
        isModalOpen = false;
      }
    });
  };

  const setupFlavorGroup = (buttonSelector) => {
    const buttons = [...document.querySelectorAll(buttonSelector)];

    buttons.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        isModalOpen = true;
        activarBlurFondo(true);

        if (swiperInstance) {
          swiperInstance.destroy(true, true);
        }

        swiperWrapper.innerHTML = buttons
          .map((b) => {
            const name = b.dataset.flavorName || "Sabor";
            const hasCustomImg = b.dataset.flavorImg && b.dataset.flavorImg.trim() !== "";
            const imgSrc = hasCustomImg ? b.dataset.flavorImg : DEFAULT_IMAGE;
            const imgClass = hasCustomImg ? "" : "img-placeholder";

            return `
            <div class="swiper-slide">
              <img 
                src="${imgSrc}" 
                alt="${name}" 
                class="${imgClass}" 
                onerror="this.src='${DEFAULT_IMAGE}'; this.classList.add('img-placeholder');" 
              />
              <div class="swiper-txt">
                <h3>${name}</h3>
              </div>
            </div>
          `;
          })
          .join("");

        // Estado inicial de animación para el modal
        gsap.killTweensOf(modalCarrusel);
        gsap.set(modalCarrusel, {
          opacity: 0,
          scale: 0.6,
          y: 50,
          rotation: -3
        });

        modalCarrusel?.showModal();

        // Animación de entrada
        gsap.to(modalCarrusel, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotation: 0,
          duration: 0.55,
          ease: "back.out(1.5)",
          clearProps: "transform"
        });

        // Inicialización de Swiper
        swiperInstance = new Swiper(".mySwiper", {
          effect: "cards",
          grabCursor: true,
          loop: true,
          centeredSlides: true,
          slidesPerView: "auto",
          cardsEffect: {
            perSlideRotate: 4,
            perSlideOffset: 8,
            slideShadows: false
          },
          on: {
            slideChangeTransitionStart: function () {
              const activeSlide = this.slides[this.activeIndex];
              if (activeSlide) {
                const title = activeSlide.querySelector(".swiper-txt h3");
                if (title) {
                  gsap.fromTo(
                    title,
                    { opacity: 0, y: 12 },
                    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
                  );
                }
              }
            }
          }
        });

        swiperInstance.slideToLoop(index, 0);

        if (btnCerrarCarrusel) {
          btnCerrarCarrusel.focus({ preventScroll: true });
        }
      });
    });
  };

  setupFlavorGroup(".flavor-btn");
  setupFlavorGroup(".frappe-flavor-btn");
  setupFlavorGroup(".congelados-flavor-btn");

  // EVENTOS DE CIERRE DEL CARRUSEL
  btnCerrarCarrusel?.addEventListener("click", (e) => {
    e.preventDefault();
    cerrarCarruselConAnimacion();
  });

  modalCarrusel?.addEventListener("click", (e) => {
    if (
      e.target === modalCarrusel || 
      e.target.classList.contains("swiper-wrapper") || 
      e.target.classList.contains("mySwiper")
    ) {
      cerrarCarruselConAnimacion();
    }
  });

  blurOverlay?.addEventListener("click", () => {
    if (modalCarrusel && modalCarrusel.open) {
      cerrarCarruselConAnimacion();
    }
  });

  modalCarrusel?.addEventListener("close", () => {
    activarBlurFondo(false);
    isModalOpen = false;
  });
});
