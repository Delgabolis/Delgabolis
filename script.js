document.addEventListener("DOMContentLoaded", () => {
  // 0. Registrar Plugin de GSAP
  if (typeof gsap !== "undefined" && typeof Flip !== "undefined") {
    gsap.registerPlugin(Flip);
  }

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

  // 2. FUNCIÓN EXCLUSIVA PARA MOSTRAR EL POPUP (Solo se llama al finalizar el preloader)
  const iniciarPopupPromocion = () => {
    if (!modalPromo) return;

    // Abrir modal
    isModalOpen = true;
    modalPromo.showModal();

    // Eventos de cierre
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

  // 3. ANIMACIÓN GSAP PRELOADER
  const runGsapPreloader = () => {
    if (!preloader || !logoPreload || !logoTarget) return;

    // Asegurar ocultar target visualmente durante la transición
    logoTarget.style.visibility = "hidden";

    // Mover nodo de logo al contenedor destino dentro del DOM
    const state = Flip.getState(logoPreload);
    logoTarget.parentNode.appendChild(logoPreload);

    // Reasignar clases de tamaño
    logoPreload.classList.remove("max-w-[85vw]", "max-h-[85vh]", "w-auto", "h-auto");
    logoPreload.classList.add("w-60", "max-w-full");

    // Construir la línea de tiempo GSAP
    const tl = gsap.timeline({
      onComplete: () => {
        // Limpieza final del preloader
        preloader.remove();
        logoTarget.style.visibility = "visible";

        // AHORA SÍ: Disparar el popup únicamente después de remover el preloader
        setTimeout(iniciarPopupPromocion, 300);
      }
    });

    tl.add(
      Flip.from(state, {
        duration: 1.2,
        ease: "power3.inOut",
        absolute: true,
      })
    ).to(
      preloader,
      {
        opacity: 0,
        duration: 0.4,
        ease: "power1.out",
      },
      "-=0.3"
    );
  };

  // Esperar a la carga total de imágenes antes de ejecutar el preloader
  if (document.readyState === "complete") {
    runGsapPreloader();
  } else {
    window.addEventListener("load", runGsapPreloader);
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
