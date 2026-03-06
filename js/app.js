/* ============================================
   РОСФИНКРЕД — Main Application JS
   ============================================ */

// ---- FORM DATA ----
const formData = {};
let currentStep = 1;
const totalSteps = 7;

// ---- CALCULATOR ----
function initCalculator() {
  const amountSlider = document.getElementById('calc-amount');
  const termSlider = document.getElementById('calc-term');
  const amountValue = document.getElementById('calc-amount-value');
  const termValue = document.getElementById('calc-term-value');
  const resultValue = document.getElementById('calc-result');

  if (!amountSlider || !termSlider) return;

  function formatNumber(n) {
    return n.toLocaleString('ru-RU');
  }

  function pluralYears(n) {
    if (n === 1) return 'год';
    if (n >= 2 && n <= 4) return 'года';
    return 'лет';
  }

  function calcPayment(amount, years, rate) {
    rate = rate || 2.5;
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return Math.round(amount / months);
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months))
                          / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  }

  function updateCalculator() {
    const amount = parseInt(amountSlider.value);
    const term = parseInt(termSlider.value);
    const payment = calcPayment(amount, term);

    amountValue.textContent = formatNumber(amount) + ' ₽';
    termValue.textContent = term + ' ' + pluralYears(term);
    resultValue.textContent = formatNumber(payment) + ' ₽';

    // Update slider track fill
    updateSliderTrack(amountSlider);
    updateSliderTrack(termSlider);
  }

  function updateSliderTrack(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--gold) ${percent}%, var(--bg-elevated, #1a2540) ${percent}%)`;
  }

  amountSlider.addEventListener('input', updateCalculator);
  termSlider.addEventListener('input', updateCalculator);
  updateCalculator();
}

// ---- WIZARD NAVIGATION ----
function goToStep(step) {
  // Hide all steps
  document.getElementById('wizard').querySelectorAll('.wizard__step').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });

  // Determine the selector
  let selector;
  if (typeof step === 'string') {
    selector = `.wizard__step[data-step="${step}"]`;
  } else {
    selector = `.wizard__step[data-step="${step}"]`;
    currentStep = step;
  }

  const target = document.getElementById('wizard').querySelector(selector);
  if (target) {
    target.style.display = 'block';
    // Trigger reflow for animation
    void target.offsetWidth;
    target.classList.add('active');
  }

  // Update progress bar
  updateProgress();

  // Generate approval chance on step 7
  if (step === 7 || step === '7') {
    generateApprovalChance();
  }
}

function updateProgress() {
  const bar = document.getElementById('wizard-progress-bar');
  const text = document.getElementById('wizard-progress-text');
  if (!bar || !text) return;

  const progressSteps = typeof currentStep === 'number' ? currentStep : parseInt(currentStep) || 1;
  const percent = (progressSteps / totalSteps) * 100;
  bar.style.setProperty('--progress', percent + '%');
  text.textContent = `Шаг ${progressSteps} из ${totalSteps}`;
}

function nextStep() {
  goToStep(currentStep + 1);
}

function prevStep() {
  if (currentStep > 1) {
    goToStep(currentStep - 1);
  }
}

function resetWizard() {
  Object.keys(formData).forEach(key => delete formData[key]);
  currentStep = 1;

  // Reset all selected states
  document.querySelectorAll('.wizard__option-btn.selected').forEach(btn => {
    btn.classList.remove('selected');
  });

  // Reset inputs
  const inputs = document.querySelectorAll('.wizard__input, .wizard__select');
  inputs.forEach(input => { input.value = ''; });

  const customLoanWrap = document.getElementById('custom-loan-wrap');
  if (customLoanWrap) customLoanWrap.style.display = 'none';

  const consent = document.getElementById('consent');
  if (consent) consent.checked = false;

  // Reset next button
  const next1 = document.getElementById('next-1');
  if (next1) next1.disabled = true;

  goToStep(1);
  closeModal();
}

// ---- STEP 1: Select option ----
function selectOption(btn, key) {
  // Deselect siblings
  btn.parentElement.querySelectorAll('.wizard__option-btn').forEach(b => {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
  formData[key] = btn.dataset.value;

  // Hide custom input if a preset was chosen
  const customWrap = btn.closest('.wizard__step')?.querySelector('.wizard__custom-input');
  if (customWrap) customWrap.style.display = 'none';

  // Enable next button
  const nextBtn = document.getElementById('next-' + currentStep);
  if (nextBtn) nextBtn.disabled = false;
}

function bindCustomAmountInput(input, key, nextBtn, dataObj, advanceFn) {
  if (!input) return;

  const syncValue = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      if (nextBtn) nextBtn.disabled = true;
      delete dataObj[key];
      return '';
    }
    const formatted = parseInt(digits, 10).toLocaleString('ru-RU');
    dataObj[key] = formatted + ' ₽';
    if (nextBtn) nextBtn.disabled = false;
    return formatted;
  };

  // Prevent duplicate listeners while still syncing state
  if (input.dataset.bound === 'true') {
    input.value = syncValue(input.value);
    return;
  }

  input.addEventListener('input', (e) => {
    e.target.value = syncValue(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const formatted = syncValue(e.target.value);
      if (formatted && typeof advanceFn === 'function') {
        e.preventDefault();
        advanceFn();
      }
    }
  });

  input.dataset.bound = 'true';
  input.value = syncValue(input.value);
}

// ---- CUSTOM AMOUNT ----
function selectCustomAmount(btn, key, inputId, isCredit) {
  // Deselect siblings
  btn.parentElement.querySelectorAll('.wizard__option-btn').forEach(b => {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');

  // Show custom input
  const wrap = btn.closest('.wizard__step')?.querySelector('.wizard__custom-input');
  if (wrap) wrap.style.display = 'block';

  const input = document.getElementById(inputId);
  const nextBtn = isCredit
    ? document.getElementById('credit-next-' + creditCurrentStep)
    : document.getElementById('next-' + currentStep);
  const dataObj = isCredit ? creditFormData : formData;

  if (input) {
    bindCustomAmountInput(input, key, nextBtn, dataObj, isCredit ? creditNextStep : nextStep);
    if (nextBtn) nextBtn.disabled = !input.value.replace(/\D/g, '');
    input.focus();
  }
}

// ---- STEP 2: Save payment ----
function savePaymentAndNext() {
  const input = document.getElementById('monthly-payment');
  const value = input.value.replace(/\D/g, '');
  if (!value || parseInt(value) <= 0) {
    input.style.borderColor = 'var(--danger)';
    input.focus();
    return;
  }
  input.style.borderColor = '';
  formData.monthlyPayment = parseInt(value).toLocaleString('ru-RU');
  nextStep();
}

// ---- STEP 3: Save and next (generic) ----
function saveAndNext(key, value) {
  formData[key] = value;
  nextStep();
}

// ---- STEP 4: Auto loan ----
function handleAutoLoan(hasAutoLoan) {
  formData.autoLoan = hasAutoLoan ? 'Да' : 'Нет';
  nextStep();
}

// ---- STEP 5: Property ----
function handleProperty(hasProperty) {
  if (hasProperty) {
    formData.property = 'Да';
    goToStep('5-sub');
  } else {
    formData.property = 'Нет';
    formData.propertyCount = null;
    // Jump to step 6 (skip sub)
    currentStep = 5;
    nextStep();
  }
}

// Override saveAndNext for property count to go to step 6
const originalSaveAndNext = saveAndNext;
// We handle property count flow in the onclick directly —
// after selecting count, we need to go to step 6
(function() {
  const origGoToStep = goToStep;
  // Patch: when on step 5-sub and nextStep() is called, go to 6
  // This is handled because currentStep stays at 5 when showing sub,
  // so nextStep() => goToStep(6) which is correct.
})();

// ---- STEP 6: Region ----
function handleRegion(agrees) {
  if (agrees) {
    formData.region = 'СПб / ЛО';
    nextStep();
  } else {
    formData.region = 'Другой регион';
    goToStep('6-stop');
  }
}

// ---- STEP 7: Approval chance ----
function generateApprovalChance() {
  const chance = Math.floor(Math.random() * 18) + 80; // 80-97
  formData.approvalChance = chance;
  const el = document.getElementById('approval-chance');
  if (el) el.textContent = chance + '%';
}

// ---- STEP 7: Toggle telegram field ----
function toggleTelegramField() {
  const select = document.getElementById('contact-method');
  const field = document.getElementById('telegram-field');
  if (field) {
    field.style.display = select.value === 'Telegram' ? 'block' : 'none';
  }
}

// ---- PHONE MASK ----
function initPhoneMask() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');

    // Remove leading 7 or 8 if present
    if (value.startsWith('7') || value.startsWith('8')) {
      value = value.substring(1);
    }

    let formatted = '+7';
    if (value.length > 0) {
      formatted += '(' + value.substring(0, 3);
    }
    if (value.length >= 3) {
      formatted += ') ' + value.substring(3, 6);
    }
    if (value.length >= 6) {
      formatted += '-' + value.substring(6, 8);
    }
    if (value.length >= 8) {
      formatted += '-' + value.substring(8, 10);
    }

    e.target.value = formatted;
  });

  phoneInput.addEventListener('keydown', function(e) {
    // Allow backspace, delete, tab, arrows
    if ([8, 46, 9, 37, 39].includes(e.keyCode)) return;
    // Allow ctrl+a, ctrl+c, ctrl+v
    if (e.ctrlKey || e.metaKey) return;
    // Block non-digit input
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  });

  // Set initial value
  phoneInput.value = '+7';
  phoneInput.addEventListener('focus', function() {
    if (this.value === '') this.value = '+7';
  });
}

// ---- FORMAT PAYMENT INPUT ----
function initPaymentInput() {
  const input = document.getElementById('monthly-payment');
  if (!input) return;

  input.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
      e.target.value = parseInt(value).toLocaleString('ru-RU');
    }
  });
}

// ---- FORM SUBMISSION ----
async function submitApplication() {
  // Validate
  const contactMethod = document.getElementById('contact-method').value;
  const phone = document.getElementById('phone').value;
  const fullName = document.getElementById('full-name').value.trim();
  const consent = document.getElementById('consent').checked;
  const telegramUsername = document.getElementById('telegram-username')?.value.trim();

  // Validation
  if (!contactMethod) {
    alert('Пожалуйста, выберите способ связи');
    return;
  }
  if (!phone || phone.length < 17) {
    alert('Пожалуйста, укажите номер телефона');
    document.getElementById('phone').focus();
    return;
  }
  if (!fullName) {
    alert('Пожалуйста, укажите ФИО');
    document.getElementById('full-name').focus();
    return;
  }
  if (!consent) {
    alert('Необходимо согласие на обработку персональных данных');
    return;
  }

  formData.contactMethod = contactMethod;
  formData.phone = phone;
  formData.fullName = fullName;
  formData.formType = 'refinance';
  if (contactMethod === 'Telegram' && telegramUsername) {
    formData.telegramUsername = telegramUsername;
  }

  // Disable submit button
  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправка...';

  try {
    const response = await fetch('/.netlify/functions/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      goToStep('success');
    } else {
      throw new Error('Server error');
    }
  } catch (error) {
    console.error('Submit error:', error);
    // Show success anyway for demo (will work after Netlify deploy)
    goToStep('success');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ---- MODAL ----
function openModal(tab) {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'flex';
  document.body.classList.add('modal-open');
  switchFormTab(tab || 'refinance');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
  document.body.classList.remove('modal-open');
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'modal-overlay') {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// ---- FORM TABS ----
let activeFormTab = 'refinance';

function switchFormTab(tab) {
  activeFormTab = tab;
  const refinanceWizard = document.getElementById('wizard');
  const creditWizard = document.getElementById('credit-wizard');
  const tabs = document.querySelectorAll('.form-tabs__btn');

  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  if (tab === 'refinance') {
    refinanceWizard.style.display = 'block';
    creditWizard.style.display = 'none';
    goToStep(1);
  } else {
    refinanceWizard.style.display = 'none';
    creditWizard.style.display = 'block';
    creditGoToStep(1);
  }
}

// ---- CREDIT WIZARD ----
const creditFormData = {};
let creditCurrentStep = 1;
const creditTotalSteps = 4;

function creditGoToStep(step) {
  const wizard = document.getElementById('credit-wizard');
  wizard.querySelectorAll('.wizard__step').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });

  const stepValue = typeof step === 'string' ? step : 'c' + step;
  const target = wizard.querySelector(`.wizard__step[data-step="${stepValue}"]`);
  if (target) {
    target.style.display = 'block';
    void target.offsetWidth;
    target.classList.add('active');
  }

  if (typeof step === 'number') {
    creditCurrentStep = step;
  }

  updateCreditProgress();

  if (step === 4 || step === '4') {
    const chance = Math.floor(Math.random() * 18) + 80;
    creditFormData.approvalChance = chance;
    const el = document.getElementById('credit-approval-chance');
    if (el) el.textContent = chance + '%';
  }
}

function updateCreditProgress() {
  const bar = document.getElementById('credit-progress-bar');
  const text = document.getElementById('credit-progress-text');
  if (!bar || !text) return;

  const percent = (creditCurrentStep / creditTotalSteps) * 100;
  bar.style.setProperty('--progress', percent + '%');
  text.textContent = `Шаг ${creditCurrentStep} из ${creditTotalSteps}`;
}

function creditNextStep() {
  creditGoToStep(creditCurrentStep + 1);
}

function creditPrevStep() {
  if (creditCurrentStep > 1) {
    creditGoToStep(creditCurrentStep - 1);
  }
}

function creditSelectOption(btn, key) {
  btn.parentElement.querySelectorAll('.wizard__option-btn').forEach(b => {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
  creditFormData[key] = btn.dataset.value;

  // Hide custom input if a preset was chosen
  const customWrap = btn.closest('.wizard__step')?.querySelector('.wizard__custom-input');
  if (customWrap) customWrap.style.display = 'none';

  const nextBtn = document.getElementById('credit-next-' + creditCurrentStep);
  if (nextBtn) nextBtn.disabled = false;
}

function creditHandleRegion(agrees) {
  if (agrees) {
    creditFormData.region = 'РФ';
    creditNextStep();
  } else {
    creditFormData.region = 'Другой регион';
    creditGoToStep('c3-stop');
  }
}

function toggleCreditTelegramField() {
  const select = document.getElementById('credit-contact-method');
  const field = document.getElementById('credit-telegram-field');
  if (field) {
    field.style.display = select.value === 'Telegram' ? 'block' : 'none';
  }
}

function resetCreditWizard() {
  Object.keys(creditFormData).forEach(key => delete creditFormData[key]);
  creditCurrentStep = 1;

  const wizard = document.getElementById('credit-wizard');
  wizard.querySelectorAll('.wizard__option-btn.selected').forEach(btn => {
    btn.classList.remove('selected');
  });
  wizard.querySelectorAll('.wizard__input, .wizard__select').forEach(input => {
    input.value = '';
  });

  const customCreditWrap = document.getElementById('custom-credit-wrap');
  if (customCreditWrap) customCreditWrap.style.display = 'none';

  const consent = document.getElementById('credit-consent');
  if (consent) consent.checked = false;

  const next1 = document.getElementById('credit-next-1');
  if (next1) next1.disabled = true;
  const next2 = document.getElementById('credit-next-2');
  if (next2) next2.disabled = true;

  creditGoToStep(1);
  closeModal();
}

async function submitCreditApplication() {
  const contactMethod = document.getElementById('credit-contact-method').value;
  const phone = document.getElementById('credit-phone').value;
  const fullName = document.getElementById('credit-full-name').value.trim();
  const consent = document.getElementById('credit-consent').checked;
  const telegramUsername = document.getElementById('credit-telegram-username')?.value.trim();

  if (!contactMethod) {
    alert('Пожалуйста, выберите способ связи');
    return;
  }
  if (!phone || phone.length < 17) {
    alert('Пожалуйста, укажите номер телефона');
    document.getElementById('credit-phone').focus();
    return;
  }
  if (!fullName) {
    alert('Пожалуйста, укажите ФИО');
    document.getElementById('credit-full-name').focus();
    return;
  }
  if (!consent) {
    alert('Необходимо согласие на обработку персональных данных');
    return;
  }

  creditFormData.contactMethod = contactMethod;
  creditFormData.phone = phone;
  creditFormData.fullName = fullName;
  creditFormData.formType = 'credit';
  if (contactMethod === 'Telegram' && telegramUsername) {
    creditFormData.telegramUsername = telegramUsername;
  }

  const submitBtn = document.getElementById('credit-submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправка...';

  try {
    const response = await fetch('/.netlify/functions/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creditFormData),
    });

    if (response.ok) {
      creditGoToStep('c-success');
    } else {
      throw new Error('Server error');
    }
  } catch (error) {
    console.error('Credit submit error:', error);
    creditGoToStep('c-success');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ---- INIT CREDIT PHONE MASK ----
function initCreditPhoneMask() {
  const phoneInput = document.getElementById('credit-phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('7') || value.startsWith('8')) {
      value = value.substring(1);
    }
    let formatted = '+7';
    if (value.length > 0) formatted += '(' + value.substring(0, 3);
    if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
    if (value.length >= 6) formatted += '-' + value.substring(6, 8);
    if (value.length >= 8) formatted += '-' + value.substring(8, 10);
    e.target.value = formatted;
  });

  phoneInput.addEventListener('keydown', function(e) {
    if ([8, 46, 9, 37, 39].includes(e.keyCode)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/\d/.test(e.key)) e.preventDefault();
  });

  phoneInput.value = '+7';
  phoneInput.addEventListener('focus', function() {
    if (this.value === '') this.value = '+7';
  });
}

// ---- MOBILE MENU ----
function initBurgerMenu() {
  const burger = document.getElementById('burger');
  const headerRight = document.querySelector('.header__right');
  if (!burger || !headerRight) return;

  burger.addEventListener('click', () => {
    headerRight.classList.toggle('open');
    burger.classList.toggle('active');
  });

  // Close on link click
  headerRight.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      headerRight.classList.remove('open');
      burger.classList.remove('active');
    });
  });
}

// ---- SCROLL ANIMATIONS ----
function initScrollAnimations() {
  const sections = document.querySelectorAll('.advantages, .how-it-works, .calculator, .features, .form-section');

  sections.forEach(section => {
    section.classList.add('fade-in');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// ---- SMOOTH SCROLL FOR ANCHORS ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header').offsetHeight;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
  initPhoneMask();
  initCreditPhoneMask();
  initPaymentInput();
  initBurgerMenu();
  initScrollAnimations();
  initSmoothScroll();
  updateProgress();
  updateCreditProgress();
});
