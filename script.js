document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Elementos principales
  const preloader = document.getElementById("preloader");
  const logoPreload = document.getElementById("logo-preload");
  const logoTarget = document.getElementById("logo-target");
  const modalPromo = document.getElementById("modalPromociones");
  const btnCerrarPromo = document.getElementById("btnCerrarPromo");

  let isModalOpen = false;

  // 2. ABRIR EL POPUP DE PROMOCIÓN
  const iniciarPopupPromocion = () => {
    if (!modalPromo) return;

    isModalOpen = true;
    modalPromo.showModal();

    btnCerrarPromo?.addEventListener("click", () => modalPromo.close());

    modalPromo.addEventListener("click", (e) => {
      const dialogBounds = modalPromo.getBoundingClientRect();
      if (
        e.clientX < dialogBounds.left ||
        e.clientX > dialogBounds.right ||
        e.clientY < dialogBounds.top ||
        e.clientY > dialogBounds.bottom
      ) {
        modalPromo.close();
      }
    });

    modalPromo.addEventListener("close", () => {
      isModalOpen = false;
    });
  };

  // 3. ANIMACIÓN GSAP DEL PRELOADER
  const runPreloaderAnimation = () => {
    if (!preloader || !logoPreload || !logoTarget) {
      iniciarPopupPromocion();
      return;
    }

    requestAnimationFrame(() => {
      // Remover cualquier transición en línea de CSS que genere conflicto
      logoPreload.style.transition = "none";

      const targetRect = logoTarget.getBoundingClientRect();
      const currentRect = logoPreload.getBoundingClientRect();

      if (currentRect.width === 0 || targetRect.width === 0) {
        if (preloader) preloader.remove();
        logoTarget.classList.remove("opacity-0");
        iniciarPopupPromocion();
        return;
      }

      const deltaX = (targetRect.left + targetRect.width / 2) - (currentRect.left + currentRect.width / 2);
      const deltaY = (targetRect.top + targetRect.height / 2) - (currentRect.top + currentRect.height / 2);
      const scale = targetRect.width / currentRect.width;

      const tl = gsap.timeline({
        onComplete: () => {
          if (preloader) preloader.remove();
          setTimeout(iniciarPopupPromocion, 650);
        }
      });

      // 1. Mover y escalar el logo flotante sin cortes intermedios
      tl.to(logoPreload, {
        x: deltaX,
        y: deltaY,
        scale: scale,
        duration: 0.9,
        ease: "power2.inOut",
        transformOrigin: "50% 50%"
      })
      // 2. Revelar el logo real y desvanecer la capa rosada al mismo tiempo al finalizar el trayecto
      .set(logoTarget, { opacity: 1, onComplete: () => logoTarget.classList.remove("opacity-0") })
      .to(preloader, {
        opacity: 0,
        duration: 0.35,
        ease: "power1.out"
      });
    });
  };

  // Ejecutar cuando la ventana y sus imágenes se carguen por completo
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

        if (swiperInstance) {
          swiperInstance.destroy(true, true);
        }

        swiperWrapper.innerHTML = buttons
          .map((b) => {
            const name = b.dataset.flavorName;
            const imgSrc = b.dataset.flavorImg || "logo_bolisv2.png";
            return `
            <div class="swiper-slide">
              <img src="${imgSrc}" alt="${name}" />
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
    isModalOpen = false;
  });
});
