document.addEventListener("DOMContentLoaded", () => {
  // Registrar el plugin Flip de GSAP
  gsap.registerPlugin(Flip);

  const preloader = document.getElementById("preloader");
  const logoPreload = document.getElementById("logo-preload");
  const logoTarget = document.getElementById("logo-target");

  const runGsapPreloader = () => {
    if (!preloader || !logoPreload || !logoTarget) return;

    // 1. Capturar el estado inicial del logo en pantalla completa
    const state = Flip.getState(logoPreload);

    // 2. Mover visualmente el elemento del preloader hacia el contenedor final
    // Ocultamos el target original para reemplazarlo momentáneamente por el elemento animado
    logoTarget.style.visibility = "hidden";
    logoTarget.parentNode.appendChild(logoPreload);

    // Remover clases de restricciones de pantalla completa para que tome las dimensiones del destino
    logoPreload.classList.remove("max-w-[85vw]", "max-h-[85vh]", "w-auto", "h-auto");
    logoPreload.classList.add("w-60", "max-w-full");

    // 3. Crear la secuencia con GSAP
    const tl = gsap.timeline();

    // Transición de posición y tamaño usando Flip
    tl.add(
      Flip.from(state, {
        duration: 1.2,
        ease: "power3.inOut",
        absolute: true, // Evita colapsos del layout durante la trayectoria
      })
    )
    // Desvanecer el fondo rosado del preloader en paralelo o casi al final
    .to(
      preloader,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => {
          preloader.remove(); // Eliminar el fondo del DOM
          logoTarget.style.visibility = "visible"; // Mostrar el logo destino oficial
          logoPreload.remove(); // Limpiar el logo temporal
        }
      },
      "-=0.4" // Empieza 0.4 segundos antes de que termine la animación del logo
    );
  };

  // Ejecutar cuando se hayan cargado imágenes y layout
  if (document.readyState === "complete") {
    runGsapPreloader();
  } else {
    window.addEventListener("load", runGsapPreloader);
  }


document.addEventListener("DOMContentLoaded", () => { 
  // 1. Inicializar iconos
  lucide.createIcons(); 

  // Activar fondo difuminado solo cuando la barra se pega arriba al hacer scroll
  const categoryNav = document.querySelector(".category-nav");
  
  if (categoryNav) {
    const handleStickyNav = () => {
      const navTop = categoryNav.getBoundingClientRect().top;
      categoryNav.classList.toggle("is-stuck", navTop <= 0);
    };

    window.addEventListener("scroll", handleStickyNav, { passive: true });
    handleStickyNav(); 
  }

  // Variable para controlar la pausa del observador de scroll
  let isModalOpen = false;

  // 2. Navegación por Categorías
  const navButtons = [...document.querySelectorAll(".nav-pill")]; 
  const sections = navButtons.map(btn => document.getElementById(btn.dataset.target)); 
  const modalPromo = document.getElementById('modalPromociones');
  const btnCerrarPromo = document.getElementById('btnCerrarPromo');

  navButtons.forEach(button => { 
    button.addEventListener("click", () => { 
      const section = document.getElementById(button.dataset.target); 
      if (section) { 
        section.scrollIntoView({ behavior: "smooth", block: "start" }); 
      } 
    }); 
  }); 

  const activateButton = (targetId) => {
    navButtons.forEach(btn => { 
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

  const observer = new IntersectionObserver((entries) => { 
    if (isModalOpen) return; 
    
    const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10;
    if (isAtBottom) return;

    entries.forEach(entry => { 
      if (entry.isIntersecting) { 
        activateButton(entry.target.id);
      } 
    }); 
  }, { rootMargin: "-20% 0px -40% 0px", threshold: 0.1 }); 

  sections.forEach(section => { 
    if (section) observer.observe(section); 
  }); 

  // Modal Promoción Inicial
  if (modalPromo) {
    setTimeout(() => {
      isModalOpen = true;
      modalPromo.showModal();
    }, 500);

    btnCerrarPromo?.addEventListener('click', () => modalPromo.close());

    modalPromo.addEventListener('click', (e) => {
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

    modalPromo.addEventListener('close', () => {
      isModalOpen = false;
    });
  }

  // 3. Carrusel Swiper (Con Loop Infinito)
  const modalCarrusel = document.getElementById('modalCarrusel');
  const btnCerrarCarrusel = document.getElementById('btnCerrarCarrusel');
  const swiperWrapper = document.getElementById('swiperWrapper');
  let swiperInstance = null; 

  const setupFlavorGroup = (buttonSelector) => {
    const buttons = [...document.querySelectorAll(buttonSelector)];

    buttons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        isModalOpen = true;

        // Destruir la instancia previa
        if (swiperInstance) {
          swiperInstance.destroy(true, true);
        }

        // Cargar slides dinámicamente
        swiperWrapper.innerHTML = buttons.map((b) => {
          const name = b.dataset.flavorName;
          const imgSrc = b.dataset.flavorImg || 'logo_bolis.png';
          return `
            <div class="swiper-slide">
              <img src="${imgSrc}" alt="${name}" />
              <div class="swiper-txt">
                <h3>${name}</h3>
              </div>
            </div>
          `;
        }).join('');

        // Mostrar dialog
        modalCarrusel?.showModal();

        // Inicializar Swiper en modo Loop
        swiperInstance = new Swiper(".mySwiper", {
          effect: "cards",
          grabCursor: true,
          loop: true,
          centeredSlides: true,
          slidesPerView: "auto"
        });

        // Sincronizar el slide activo con el producto presionado
        swiperInstance.slideToLoop(index, 0);

        if (btnCerrarCarrusel) {
          btnCerrarCarrusel.focus({ preventScroll: true });
        }
      });
    });
  };

  // Registrar los tres grupos de botones (Bolis, Frappés y Congelados)
  setupFlavorGroup('.flavor-btn');
  setupFlavorGroup('.frappe-flavor-btn');
  setupFlavorGroup('.congelados-flavor-btn');

  const cerrarCarrusel = () => {
    modalCarrusel?.close();
  };

  btnCerrarCarrusel?.addEventListener('click', cerrarCarrusel);

  modalCarrusel?.addEventListener('click', (e) => {
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

  modalCarrusel?.addEventListener('close', () => {
    isModalOpen = false;
  });
});
