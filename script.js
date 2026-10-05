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

  // 2. ABRIR EL POPUP DE PROMOCIÓN (ANIMACIÓN GSAP BACK.OUT)
  const iniciarPopupPromocion = () => {
    if (!modalPromo) return;

    isModalOpen = true;
    modalPromo.showModal();

    // Animación de entrada: Opacidad, Escala y Desplazamiento elástico
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
      // 1. Obtener dimensiones y posiciones exactas
      const targetRect = logoTarget.getBoundingClientRect();
      const currentRect = logoPreload.getBoundingClientRect();

      if (currentRect.width === 0 || targetRect.width === 0) {
        if (preloader) preloader.remove();
        logoTarget.style.visibility = "visible";
        logoTarget.style.opacity = "1";
        iniciarPopupPromocion();
        return;
      }

      // 2. Crear clon flotante alineado en pantalla
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

      // Reemplazar visualmente el logo original
      logoPreload.style.opacity = "0";
      document.body.appendChild(clone);

      // Mantener oculto el logo de destino mientras la animación sucede
      logoTarget.style.visibility = "hidden";

      // 3. Calcular distancia y escala
      const scaleX = targetRect.width / currentRect.width;
      const scaleY = targetRect.height / currentRect.height;
      const deltaX = targetRect.left - currentRect.left;
      const deltaY = targetRect.top - currentRect.top;

      const tl = gsap.timeline({
        onComplete: () => {
          // Mostrar el logo final real
          logoTarget.style.visibility = "visible";
          logoTarget.style.opacity = "1";

          // Limpiar clon y preloader
          const activeClone = document.getElementById("logo-clone");
          if (activeClone) activeClone.remove();
          if (preloader) preloader.remove();

          // Lanzar popup
          setTimeout(iniciarPopupPromocion, 150);
        }
      });

      // Secuencia limpia: Pausa inicial -> Desplazamiento -> Desvanecido de fondo
      tl.to(clone, {
        x: deltaX,
        y: deltaY,
        scaleX: scaleX,
        scaleY: scaleY,
        transformOrigin: "0% 0%",
        duration: 0.85,
        delay: 1.0, // Retención inicial de 1 segundo
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
