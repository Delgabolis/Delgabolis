document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Crear capa de Blur Overlay dinámicamente si no existe
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
    modalPromo.showModal();

    // Animación de entrada
    gsap.fromTo(
      modalPromo,
      {
        opacity: 0,
        scale: 0.7,
        y: 40
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.75,
        ease: "back.out(1.7)",
        force3D: true
      }
    );

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

  // 3. ANIMACIÓN GSAP DEL PRELOADER
  const runPreloaderAnimation = () => {
    if (!preloader || !logoPreload || !logoTarget) {
      if (logoTarget) {
        logoTarget.style.visibility = "visible";
        logoTarget.style.opacity = "1";
      }
      iniciarPopupPromocion();
      return;
    }

    requestAnimationFrame(() => {
      const targetRect = logoTarget.getBoundingClientRect();
      const currentRect = logoPreload.getBoundingClientRect();

      if (currentRect.width === 0 || targetRect.width === 0) {
        if (preloader) preloader.remove();
        logoTarget.style.visibility = "visible";
        logoTarget.style.opacity = "1";
        iniciarPopupPromocion();
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

      logoTarget.style.visibility = "hidden";

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
        delay: 1.0,
        ease: "power2.inOut",
        force3D: true
      })
      .to(preloader, {
        opacity: 0,
        duration: 0.25,
        ease: "power1.out"
      }, "-=0.2");
    });
  };

  if (document.readyState === "complete") {
    runPreloaderAnimation();
  } else {
    window.addEventListener("load", runPreloaderAnimation);
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
            
            // Si data-flavor-img está vacío, no existe o solo tiene espacios, usa la imagen por defecto
            const imgSrc = (b.dataset.flavorImg && b.dataset.flavorImg.trim() !== "")
              ? b.dataset.flavorImg
              : "logo_bolisv2.png"; // <-- Imagen por defecto / placeholder

            return `
            <div class="swiper-slide">
              <img src="${imgSrc}" alt="${name}" onerror="this.src='logo_bolisv2.png';" />
              <div class="swiper-txt">
                <h3>${name}</h3>
              </div>
            </div>
          `;
          })
          .join("");

        modalCarrusel?.showModal();

        swiperInstance = new Swiper(".mySwiper", {
          effect: "cards",
          grabCursor: true,
          loop: true,
          centeredSlides: true,
          slidesPerView: "auto",
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

  const cerrarCarrusel = () => {
    activarBlurFondo(false);
    modalCarrusel?.close();
  };

  btnCerrarCarrusel?.addEventListener("click", cerrarCarrusel);

  modalCarrusel?.addEventListener("click", (e) => {
    const dialogBounds = modalCarrusel.getBoundingClientRect();
    if (
      e.clientX < dialogBounds.left ||
      e.clientX > dialogBounds.right ||
      e.clientY < dialogBounds.top ||
      e.clientY > dialogBounds.bottom
    ) {
      cerrarCarrusel();
    }
  });

  modalCarrusel?.addEventListener("close", () => {
    activarBlurFondo(false);
    isModalOpen = false;
  });
});
