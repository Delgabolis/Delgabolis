document.addEventListener("DOMContentLoaded", () => {
  // Registrar el plugin Flip de GSAP
  gsap.registerPlugin(Flip);

  // 1. Inicializar iconos
  lucide.createIcons();

  const preloader = document.getElementById("preloader");
  const logoPreload = document.getElementById("logo-preload");
  const logoTarget = document.getElementById("logo-target");
  const modalPromo = document.getElementById("modalPromociones");
  const btnCerrarPromo = document.getElementById("btnCerrarPromo");

  let isModalOpen = false;

  // Función para abrir el modal de promociones al terminar la animación
  const triggerPromoModal = () => {
    if (modalPromo) {
      isModalOpen = true;
      modalPromo.showModal();
    }
  };

  // Lógica de la animación GSAP
  const runGsapPreloader = () => {
    if (!preloader || !logoPreload || !logoTarget) return;

    // Capturar el estado inicial del logo en pantalla completa
    const state = Flip.getState(logoPreload);

    // Ocultar la imagen de destino temporalmente y mover la del preloader a la posición de la cabecera
    logoTarget.style.visibility = "hidden";
    logoTarget.parentNode.appendChild(logoPreload);

    // Ajustar clases CSS para que adopte el tamaño final del header
    logoPreload.classList.remove("max-w-[85vw]", "max-h-[85vh]", "w-auto", "h-auto");
    logoPreload.classList.add("w-60", "max-w-full");

    // Timeline de GSAP
    const tl = gsap.timeline();

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
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => {
          preloader.remove();
          logoTarget.style.visibility = "visible";
          logoPreload.remove();
          
          // Lanzar el popup de promociones únicamente después del loader
          triggerPromoModal();
        },
      },
      "-=0.4"
    );
  };

  // Ejecutar el preloader según el estado de carga del documento
  if (document.readyState === "complete") {
    runGsapPreloader();
  } else {
    window.addEventListener("load", runGsapPreloader);
  }

  // 2. Barra de navegación pegajosa (Sticky)
  const categoryNav = document.querySelector(".category-nav");
  if (categoryNav) {
    const handleStickyNav = () => {
      const navTop = categoryNav.getBoundingClientRect().top;
      categoryNav.classList.toggle("is-stuck", navTop <= 0);
    };

    window.addEventListener("scroll", handleStickyNav, { passive: true });
    handleStickyNav();
  }

  // 3. Navegación por Categorías
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

      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
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

  // Eventos del Modal Promoción
  if (modalPromo) {
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
  }

  // 4. Carrusel Swiper
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
            const imgSrc = b.dataset.flavorImg || "logo_bolis.png";
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
