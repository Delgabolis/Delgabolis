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

  // 3. ANIMACIÓN GSAP DEL PRELOADER (TÉCNICA FLIP CORREGIDA)
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
      // 1. Obtener las posiciones exactas en pantalla
      const targetRect = logoTarget.getBoundingClientRect();
      const currentRect = logoPreload.getBoundingClientRect();

      if (currentRect.width === 0 || targetRect.width === 0) {
        if (preloader) preloader.remove();
        logoTarget.classList.remove("invisible", "opacity-0");
        logoTarget.style.visibility = "visible";
        logoTarget.style.opacity = "1";
        iniciarPopupPromocion();
        return;
      }

      // 2. Crear un clon exacto alineado al logo inicial
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

      // Reemplazar el logo del preloader con el clon
      logoPreload.replaceWith(clone);

      // 3. Ocultar la visibilidad del logo destino durante la transición
      logoTarget.style.visibility = "hidden";

      // 4. Calcular desplazamiento y escala exacta hacia el destino
      const scaleX = targetRect.width / currentRect.width;
      const scaleY = targetRect.height / currentRect.height;
      const deltaX = targetRect.left - currentRect.left;
      const deltaY = targetRect.top - currentRect.top;

      const tl = gsap.timeline({
        onComplete: () => {
          // 5. HACER VISIBLE EL LOGO REAL EN SU POSICIÓN FINAL
          logoTarget.classList.remove("invisible", "opacity-0");
          logoTarget.style.visibility = "visible";
          logoTarget.style.opacity = "1";

          // Eliminar el clon flotante y el preloader
          const activeClone = document.getElementById("logo-clone");
          if (activeClone) activeClone.remove();

          if (preloader) preloader.remove();
          setTimeout(iniciarPopupPromocion, 200);
        }
      });

      // Animar el clon desde su origen hacia el destino exacto
      tl.to(clone, {
        x: deltaX,
        y: deltaY,
        scaleX: scaleX,
        scaleY: scaleY,
        transformOrigin: "0% 0%",
        duration: 0.85,
        ease: "power2.inOut"
      })
      // Desvanecer el fondo del preloader manteniendo la imagen sólida
      .to(preloader, {
        opacity: 0,
        duration: 0.25,
        ease: "power1.out"
      }, "-=0.15");
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
