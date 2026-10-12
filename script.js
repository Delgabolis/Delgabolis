document.addEventListener("DOMContentLoaded", () => {
  const hasGSAP = () => typeof window.gsap !== "undefined";
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
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

    if (hasGSAP()) {
      gsap.killTweensOf(modalPromo);
      gsap.set(modalPromo, { opacity: 0, scale: 0.7, y: 40 });
    }

    if (!modalPromo.open) modalPromo.showModal();

    // Animación de entrada; el modal sigue funcionando si GSAP no carga.
    if (hasGSAP()) {
      gsap.to(modalPromo, {
        opacity: 1, scale: 1, y: 0, duration: 0.75,
        ease: "back.out(1.7)", force3D: true
      });
    }

    // Animación de salida al cerrar
    const cerrarConAnimacion = () => {
      if (!modalPromo.open) {
        activarBlurFondo(false);
        isModalOpen = false;
        return;
      }
      activarBlurFondo(false);
      const finalizarCierre = () => {
        if (modalPromo.open) modalPromo.close();
        isModalOpen = false;
      };
      if (hasGSAP()) {
        gsap.killTweensOf(modalPromo);
        gsap.to(modalPromo, {
          opacity: 0, scale: 0.8, y: 20, duration: 0.25,
          ease: "power2.in", onComplete: finalizarCierre
        });
      } else {
        finalizarCierre();
      }
    };

    btnCerrarPromo?.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarConAnimacion();
    });

    // Evita que Escape cierre el diálogo sin limpiar el overlay/estado.
    modalPromo.addEventListener("cancel", (e) => {
      e.preventDefault();
      cerrarConAnimacion();
    });
    modalPromo.addEventListener("close", () => {
      activarBlurFondo(false);
      isModalOpen = false;
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

    blurOverlay.addEventListener("click", () => {
      if (modalPromo.open) cerrarConAnimacion();
    });
  };

  // 3. ANIMACIÓN GSAP DEL PRELOADER
  const executePreloader = () => {
    if (!preloader || !logoPreload || !logoTarget) {
      if (logoTarget) {
        logoTarget.style.visibility = "visible";
        logoTarget.style.opacity = "1";
      }
      iniciarPopupPromocion();
      return;
    }

    if (!hasGSAP()) {
      logoTarget.style.visibility = "visible";
      logoTarget.style.opacity = "1";
      preloader.remove();
      iniciarPopupPromocion();
      return;
    }

    logoTarget.style.visibility = "hidden";
    logoTarget.style.opacity = "1";

    const targetRect = logoTarget.getBoundingClientRect();
    const currentRect = logoPreload.getBoundingClientRect();

    if (currentRect.width === 0 || targetRect.width === 0) {
      requestAnimationFrame(executePreloader);
      return;
    }

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

    const scaleX = targetRect.width / currentRect.width;
    const scaleY = targetRect.height / currentRect.height;
    const deltaX = targetRect.left - currentRect.left;
    const deltaY = targetRect.top - currentRect.top;

    const tl = gsap.timeline({
      onComplete: () => {
        logoTarget.style.visibility = "visible";
        logoTarget.style.opacity = "1";

        const activeClone = document.getElementById("logo-clone");
        if (activeClone) activeClone.remove();
        if (preloader) preloader.remove();

        setTimeout(iniciarPopupPromocion, 150);
      }
    });

    tl.to(clone, {
      x: deltaX,
      y: deltaY,
      scaleX: scaleX,
      scaleY: scaleY,
      transformOrigin: "0% 0%",
      duration: 0.85,
      delay: 0.4,
      ease: "power2.inOut",
      force3D: true
    })
    .to(preloader, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out"
    }, "-=0.2");
  };

  requestAnimationFrame(() => {
    setTimeout(executePreloader, 100);
  });

  // 4. Fondo difuminado en Navegación al hacer scroll
  const categoryNav = document.querySelector(".category-nav");
  if (categoryNav) {
    const handleStickyNav = () => {
      if (window.innerWidth >= 768) {
        const navTop = categoryNav.getBoundingClientRect().top;
        categoryNav.classList.toggle("is-stuck", navTop <= 12);
      } else {
        categoryNav.classList.remove("is-stuck");
      }
    };

    window.addEventListener("scroll", handleStickyNav, { passive: true });
    window.addEventListener("resize", handleStickyNav, { passive: true });
    handleStickyNav();
  }

  // 5. LÓGICA DE NAVEGACIÓN Y SINCRONIZACIÓN SIN GLITCH
  const navButtons = [...document.querySelectorAll(".nav-pill")];
  const sections = navButtons.map((btn) => document.getElementById(btn.dataset.target)).filter(Boolean);

  let isManualScroll = false;
  let scrollTimeout = null;

  const navScroll = document.querySelector(".nav-scroll");

  // Actualiza el resaltado sin desplazar la página. El desplazamiento horizontal
  // de la barra solo se solicita al hacer clic, nunca desde el observer de scroll.
  const activateButton = (targetId, centerInNav = false) => {
    navButtons.forEach((btn) => {
      const isTarget = btn.dataset.target === targetId;
      btn.classList.toggle("is-active", isTarget);

      if (isTarget && centerInNav && navScroll) {
        const buttonCenter = btn.offsetLeft + (btn.offsetWidth / 2);
        const targetLeft = buttonCenter - (navScroll.clientWidth / 2);
        navScroll.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: "smooth",
        });
      }
    });
  };

  const observer = "IntersectionObserver" in window ? new IntersectionObserver(
    (entries) => {
      if ((typeof isModalOpen !== "undefined" && isModalOpen) || isManualScroll) return;

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 15;
      if (isAtBottom) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) activateButton(lastSection.id);
        return;
      }

      const visibleEntries = entries.filter((e) => e.isIntersecting);

      if (visibleEntries.length > 0) {
        const mostVisible = visibleEntries.reduce((prev, current) =>
          prev.intersectionRatio > current.intersectionRatio ? prev : current
        );
        activateButton(mostVisible.target.id);
      }
    },
    {
      rootMargin: "-10% 0px -25% 0px",
      threshold: [0.1, 0.3, 0.5, 0.7, 0.9]
    }
  ) : null;

  if (observer) {
    sections.forEach((section) => observer.observe(section));
  } else {
    // Alternativa sencilla para navegadores sin IntersectionObserver.
    window.addEventListener("scroll", () => {
      if (isModalOpen || isManualScroll) return;
      const current = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.35);
      if (current) activateButton(current.id);
    }, { passive: true });
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = button.dataset.target;
      const section = document.getElementById(targetId);

      if (section) {
        isManualScroll = true;
        if (scrollTimeout) clearTimeout(scrollTimeout);

        activateButton(targetId, true);
        section.scrollIntoView({ behavior: "smooth", block: "start" });

        // Margen aumentado para cubrir saltos de larga distancia (Frappe -> Omnilife)
        scrollTimeout = setTimeout(() => {
          isManualScroll = false;
        }, 1000);
      }
    });
  });

  // 6. Carrusel Swiper (Modal Dinámico)
  const modalCarrusel = document.getElementById("modalCarrusel");
  const btnCerrarCarrusel = document.getElementById("btnCerrarCarrusel");
  const swiperWrapper = document.getElementById("swiperWrapper");
  let swiperInstance = null;

  const cerrarCarruselConAnimacion = () => {
    if (!modalCarrusel || !modalCarrusel.open) return;

    const finalizarCierre = () => {
      if (modalCarrusel.open) modalCarrusel.close();
      activarBlurFondo(false);
      isModalOpen = false;
    };
    if (hasGSAP()) {
      gsap.killTweensOf(modalCarrusel);
      gsap.to(modalCarrusel, {
        opacity: 0, scale: 0.85, y: 20, duration: 0.25,
        ease: "power2.in", onComplete: finalizarCierre
      });
    } else {
      finalizarCierre();
    }
  };

  const setupFlavorGroup = (buttonSelector) => {
    const buttons = [...document.querySelectorAll(buttonSelector)];

    buttons.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!modalCarrusel || !swiperWrapper) return;
        isModalOpen = true;
        activarBlurFondo(true);

        if (swiperInstance) {
          swiperInstance.destroy(true, true);
          swiperInstance = null;
        }

        swiperWrapper.innerHTML = buttons
          .map((b) => {
            const name = b.dataset.flavorName || "Sabor";
            const hasCustomImg = b.dataset.flavorImg && b.dataset.flavorImg.trim() !== "";
            const imgSrc = escapeHTML(hasCustomImg ? b.dataset.flavorImg : DEFAULT_IMAGE);
            const safeName = escapeHTML(name);
            const imgClass = hasCustomImg ? "" : "img-placeholder";

            return `
            <div class="swiper-slide">
              <img 
                src="${imgSrc}" 
                alt="${safeName}" 
                class="${imgClass}" 
                onerror="if(this.dataset.fallbackApplied){this.style.visibility='hidden';}else{this.dataset.fallbackApplied='1';this.onerror=null;this.src='${DEFAULT_IMAGE}';this.classList.add('img-placeholder');this.onerror=function(){this.style.visibility='hidden';};}" 
              />
              <div class="swiper-txt">
                <h3>${safeName}</h3>
              </div>
            </div>
          `;
          })
          .join("");

        if (hasGSAP()) {
          gsap.killTweensOf(modalCarrusel);
          gsap.set(modalCarrusel, { opacity: 0, scale: 0.6, y: 50, rotation: -3 });
        }

        if (!modalCarrusel.open) modalCarrusel.showModal();

        if (hasGSAP()) {
          gsap.to(modalCarrusel, {
            opacity: 1, scale: 1, y: 0, rotation: 0,
            duration: 0.55, ease: "back.out(1.5)", clearProps: "transform"
          });
        }

        if (typeof window.Swiper === "function") {
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
                if (title && hasGSAP()) {
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
        } else {
          // Sin Swiper, mostrar el sabor elegido y conservar el cierre del modal.
          const slides = [...swiperWrapper.querySelectorAll(".swiper-slide")];
          slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== index; });
        }

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

  modalCarrusel?.addEventListener("cancel", (e) => {
    e.preventDefault();
    cerrarCarruselConAnimacion();
  });

  modalCarrusel?.addEventListener("close", () => {
    activarBlurFondo(false);
    isModalOpen = false;
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
  });
});
