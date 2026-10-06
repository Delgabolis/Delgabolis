document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  const DEFAULT_IMAGE = "logo_bolisv2.png";

  let blurOverlay = document.getElementById("blur-overlay");
  if (!blurOverlay) {
    blurOverlay = document.createElement("div");
    blurOverlay.id = "blur-overlay";
    document.body.appendChild(blurOverlay);
  }

  const preloader = document.getElementById("preloader");
  const logoPreload = document.getElementById("logo-preload");
  const logoTarget = document.getElementById("logo-target");
  const modalPromo = document.getElementById("modalPromociones");
  const btnCerrarPromo = document.getElementById("btnCerrarPromo");

  let isModalOpen = false;

  const activarBlurFondo = (activar) => {
    if (blurOverlay) {
      blurOverlay.classList.toggle("is-active", activar);
    }
  };

  // 2. ABRIR POPUP DE PROMOCIÓN (FLUIDO Y SIN INTERRUMPIR RENDERIZADO)
  const iniciarPopupPromocion = () => {
    if (!modalPromo) return;

    isModalOpen = true;
    activarBlurFondo(true);

    gsap.killTweensOf(modalPromo);
    gsap.set(modalPromo, { opacity: 0, scale: 0.7, y: 40 });

    // Se abre en la capa superior nativa
    modalPromo.showModal();

    // Se fuerza un frame de render para garantizar fluidez total en la entrada
    requestAnimationFrame(() => {
      gsap.to(modalPromo, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.65,
        ease: "back.out(1.5)",
        force3D: true
      });
    });

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
      const bounds = modalPromo.getBoundingClientRect();
      if (
        e.clientX < bounds.left ||
        e.clientX > bounds.right ||
        e.clientY < bounds.top ||
        e.clientY > bounds.bottom
      ) {
        cerrarConAnimacion();
      }
    });

    blurOverlay?.addEventListener("click", cerrarConAnimacion);
  };

  // 3. ANIMACIÓN DE PRELOADER (CÁLCULO DE COORDENADAS FIJAS SIN BRINCOS)
  const executePreloader = () => {
    if (!preloader || !logoPreload || !logoTarget) {
      if (logoTarget) logoTarget.style.opacity = "1";
      setTimeout(iniciarPopupPromocion, 500);
      return;
    }

    // Bloquear scroll mientras el preloader está activo
    document.body.classList.add("no-scroll");

    Promise.all([
      logoPreload.complete ? Promise.resolve() : new Promise((res) => (logoPreload.onload = res)),
      logoTarget.complete ? Promise.resolve() : new Promise((res) => (logoTarget.onload = res))
    ]).then(() => {
      logoTarget.style.opacity = "0";
      logoTarget.style.visibility = "visible";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const startRect = logoPreload.getBoundingClientRect();
          const endRect = logoTarget.getBoundingClientRect();

          if (startRect.width === 0 || endRect.width === 0) {
            setTimeout(executePreloader, 50);
            return;
          }

          // Crear clon
          const clone = logoPreload.cloneNode(true);
          clone.id = "logo-clone";

          // Posicionamiento absoluto exacto inicial (sin transformaciones de escala)
          Object.assign(clone.style, {
            position: "fixed",
            top: `${startRect.top}px`,
            left: `${startRect.left}px`,
            width: `${startRect.width}px`,
            height: `${startRect.height}px`,
            margin: "0",
            padding: "0",
            zIndex: "10000",
            pointerEvents: "none",
            willChange: "top, left, width, height"
          });

          logoPreload.style.opacity = "0";
          document.body.appendChild(clone);

          // Animar dimensiones absolutas directas para evitar deformaciones
          gsap.to(clone, {
            top: endRect.top,
            left: endRect.left,
            width: endRect.width,
            height: endRect.height,
            duration: 0.95,
            ease: "power2.inOut",
            onComplete: () => {
              // PASO A: Mostrar el logo de destino y quitar el clon
              logoTarget.style.opacity = "1";
              clone.remove();

              // PASO B: Desvanecer el fondo del preloader
              gsap.to(preloader, {
                opacity: 0,
                duration: 0.35,
                ease: "power1.out",
                onComplete: () => {
                  preloader.remove();
                  document.body.classList.remove("no-scroll");

                  // PASO C: Abrir el popup de promociones
                  setTimeout(iniciarPopupPromocion, 400);
                }
              });
            }
          });
        });
      });
    });
  };

  if (document.readyState === "complete") {
    setTimeout(executePreloader, 100);
  } else {
    window.addEventListener("load", () => setTimeout(executePreloader, 100));
  }

  // 4. NAVEGACIÓN STICKY CON BLUR
  const categoryNav = document.querySelector(".category-nav");
  if (categoryNav) {
    const handleStickyNav = () => {
      const navTop = categoryNav.getBoundingClientRect().top;
      categoryNav.classList.toggle("is-stuck", navTop <= 0);
    };

    window.addEventListener("scroll", handleStickyNav, { passive: true });
    handleStickyNav();
  }

  // 5. NAVEGACIÓN E INTERSECTION OBSERVER
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
          block: "nearest"
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

  // 6. CARRUSEL SWIPER EN MODAL
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

        gsap.killTweensOf(modalCarrusel);
        gsap.set(modalCarrusel, { opacity: 0, scale: 0.6, y: 50, rotation: -3 });

        modalCarrusel?.showModal();

        gsap.to(modalCarrusel, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotation: 0,
          duration: 0.55,
          ease: "back.out(1.5)",
          clearProps: "transform"
        });

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

  modalCarrusel?.addEventListener("close", () => {
    activarBlurFondo(false);
    isModalOpen = false;
  });
});
