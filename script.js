(() => {
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  const handleScroll = () => {
    if (!header) return;
    header.classList.toggle('is-sticky', window.scrollY > 12);
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  if (sections.length && navLinks.length) {
    const map = new Map(navLinks.map(link => [link.getAttribute('href')?.slice(1), link]));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('id');
          const link = map.get(id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach(section => observer.observe(section));
  }

  const forms = Array.from(document.querySelectorAll('form[data-form]'));
  forms.forEach(form => {
    const status = form.querySelector('.form-status');
    const requiredFields = Array.from(form.querySelectorAll('[required]'));

    const clearErrors = () => {
      requiredFields.forEach(field => field.classList.remove('is-invalid'));
    };

    form.addEventListener('input', event => {
      if (event.target instanceof HTMLInputElement) {
        event.target.classList.remove('is-invalid');
      }
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      clearErrors();
      let valid = true;

      requiredFields.forEach(field => {
        const isCheckbox = field.type === 'checkbox';
        const isValid = isCheckbox ? field.checked : Boolean(field.value.trim());
        if (!isValid) {
          field.classList.add('is-invalid');
          valid = false;
        }
      });

      if (!status) return;

      if (valid) {
        status.textContent = 'Спасибо! Заявка получена, мы свяжемся в рабочее время.';
        status.className = 'form-status success';
        form.reset();
      } else {
        status.textContent = 'Проверьте обязательные поля и корректность данных.';
        status.className = 'form-status error';
      }
    });
  });

  const calcButton = document.getElementById('roi-calc');
  const output = document.getElementById('roi-output');

  const toNumber = value => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatCurrency = value => new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);

  if (calcButton && output) {
    calcButton.addEventListener('click', () => {
      const volume = toNumber(document.getElementById('roi-volume')?.value);
      const manual = toNumber(document.getElementById('roi-manual')?.value);
      const machine = toNumber(document.getElementById('roi-machine')?.value);
      const rate = toNumber(document.getElementById('roi-rate')?.value);
      const defectReduction = toNumber(document.getElementById('roi-defect')?.value) ?? 0;
      const defectCost = toNumber(document.getElementById('roi-defect-cost')?.value) ?? 0;

      if (volume === null || manual === null || machine === null || rate === null) {
        output.textContent = 'Заполните объем, время ручной установки, время на станке и ставку оператора.';
        return;
      }

      const manualHours = (volume * manual) / 60;
      const machineHours = (volume * machine) / 60;
      const laborSavings = (manualHours - machineHours) * rate;
      const defectSavings = (defectReduction / 100) * defectCost;
      const total = Math.max(laborSavings + defectSavings, 0);

      output.textContent = `Оценка экономии в месяц: ${formatCurrency(total)}`;
    });
  }

  const modal = document.getElementById('demo-modal');
  const modalVideo = modal?.querySelector('video');
  const openButtons = Array.from(document.querySelectorAll('[data-modal-open=\"demo\"]'));
  const closeButtons = modal ? Array.from(modal.querySelectorAll('[data-modal-close]')) : [];

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (modalVideo) {
      modalVideo.play().catch(() => {});
    }
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (modalVideo) {
      modalVideo.pause();
    }
  };

  openButtons.forEach(button => button.addEventListener('click', openModal));
  closeButtons.forEach(button => button.addEventListener('click', closeModal));

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
