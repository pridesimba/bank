# РОСФИНКРЕД Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page loan application landing site for РОСФИНКРЕД with a 7-step form wizard, interactive loan calculator, and Telegram notification via Netlify Functions.

**Architecture:** Static HTML/CSS/JS site hosted on Netlify. A single Netlify Function handles form submission by forwarding data to a Telegram bot. No frameworks, no build step — just clean vanilla code.

**Tech Stack:** HTML5, CSS3, Vanilla JS, Netlify Functions (Node.js), Telegram Bot API, Google Fonts (Inter)

---

### Task 1: Project Init & Base HTML Shell

**Files:**
- Create: `index.html`
- Create: `.gitignore`
- Create: `netlify.toml`

**Step 1: Init git repo**

```bash
cd /Users/maksimaremenko/bank
git init
```

**Step 2: Create .gitignore**

```
node_modules/
.env
.DS_Store
```

**Step 3: Create netlify.toml**

```toml
[build]
  functions = "netlify/functions"
  publish = "."

[functions]
  node_bundler = "esbuild"
```

**Step 4: Create index.html with full semantic skeleton**

All sections as empty containers with correct IDs:
- `#header`, `#hero`, `#advantages`, `#how-it-works`, `#calculator`, `#application-form`, `#footer`
- Link to `css/style.css`, `js/app.js`
- Google Fonts: Inter
- Meta viewport for mobile

**Step 5: Commit**

```bash
git add .gitignore netlify.toml index.html
git commit -m "init: project skeleton with HTML shell and Netlify config"
```

---

### Task 2: Header + Hero Section HTML & CSS

**Files:**
- Modify: `index.html` — fill `#header` and `#hero`
- Create: `css/style.css` — base reset, variables, header, hero styles

**Step 1: Add CSS variables and reset**

CSS custom properties:
- `--primary: #1a56db` (main blue)
- `--primary-dark: #1440a8`
- `--accent: #f59e0b` (gold accent)
- `--text: #1f2937`
- `--text-light: #6b7280`
- `--bg: #ffffff`
- `--bg-light: #f3f4f6`
- `--radius: 12px`

Box-sizing reset, body font-family Inter, smooth scroll.

**Step 2: Build header**

- Logo text "РОСФИНКРЕД" (bold, primary color)
- Phone placeholder
- CTA button → scrolls to `#application-form`
- Sticky on scroll, subtle shadow

**Step 3: Build hero section**

- Large heading, subheading, CTA button
- Background gradient or subtle pattern
- Responsive: stack on mobile

**Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: header and hero section with styling"
```

---

### Task 3: Advantages + How It Works Sections

**Files:**
- Modify: `index.html` — fill `#advantages` and `#how-it-works`
- Modify: `css/style.css` — card grid, step indicators

**Step 1: Advantages section**

4 cards in a CSS grid:
1. Без справок и залогов
2. Работаем с ипотекой
3. Отсрочка платежей 3-6 мес
4. От 250 000 рублей

Each card: icon (SVG inline or emoji), title, short description. Hover effect.

**Step 2: How It Works section**

4 numbered steps with connecting line:
1. Выберите сумму кредита
2. Укажите комфортный платёж
3. Заполните короткую анкету
4. Получите решение онлайн

**Step 3: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: advantages and how-it-works sections"
```

---

### Task 4: Loan Calculator

**Files:**
- Modify: `index.html` — fill `#calculator`
- Modify: `css/style.css` — calculator styles
- Create: `js/app.js` — calculator logic

**Step 1: Calculator HTML**

- Range slider: сумма кредита (250,000 — 3,000,000, step 50,000)
- Range slider: срок (1 — 15 лет)
- Display: текущая сумма, срок, ежемесячный платёж
- Ставка displayed as "от 5.5% годовых"

**Step 2: Calculator JS**

Annuity formula:
```js
function calcPayment(amount, years, rate = 5.5) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months))
                        / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
}
```

- Event listeners on both sliders
- Format numbers with spaces (toLocaleString('ru-RU'))
- Update on every input event (smooth)

**Step 3: Style sliders**

Custom styled range inputs (track + thumb), output display as large card with payment amount.

**Step 4: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: interactive loan calculator with annuity formula"
```

---

### Task 5: Form Wizard — Steps 1-3

**Files:**
- Modify: `index.html` — form wizard container + steps 1-3
- Modify: `js/app.js` — wizard navigation logic
- Modify: `css/style.css` — wizard styles

**Step 1: Wizard container HTML**

```html
<div id="application-form">
  <div class="wizard">
    <div class="wizard-progress"></div>
    <div class="wizard-steps">
      <div class="step" data-step="1">...</div>
      <!-- steps 2-7 -->
    </div>
  </div>
</div>
```

Progress bar showing current step / total steps.

**Step 2: Step 1 — Сумма кредита**

3 option buttons (radio-style cards):
- 250 000 — 500 000 ₽
- 500 000 — 1 000 000 ₽
- 1 000 000 — 3 000 000 ₽

Clicking one highlights it and enables "Далее".

**Step 3: Step 2 — Ежемесячный платёж**

- Number input with label "Сумма платежа в месяц"
- Validation: must be > 0
- Button "Далее"

**Step 4: Step 3 — Отсрочка**

- Two buttons: Да / Нет
- Either choice → next step

**Step 5: Wizard JS navigation**

```js
const formData = {};
let currentStep = 1;

function goToStep(n) { /* hide current, show n, update progress */ }
function saveAndNext(key, value) { formData[key] = value; goToStep(currentStep + 1); }
```

Smooth CSS transitions between steps (slide or fade).

**Step 6: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: form wizard steps 1-3 with navigation"
```

---

### Task 6: Form Wizard — Steps 4-6 (with branching logic)

**Files:**
- Modify: `index.html` — steps 4-6
- Modify: `js/app.js` — branching logic
- Modify: `css/style.css` — stop screens

**Step 1: Step 4 — Автокредит**

- Да / Нет buttons
- If **Да**: show stop-screen "К сожалению, мы не работаем с автокредитами" with a "Закрыть" button
- If **Нет**: next step

**Step 2: Step 5 — Имущество**

- Да / Нет buttons
- If **Да**: sub-question "Количество имущества:" with options 1 / 1-3 / Более 3
- If **Нет**: skip sub-question, next step

**Step 3: Step 6 — Регион**

- "Согласен" / "Не согласен, я из другого региона"
- If **Не согласен**: stop-screen "Мы работаем исключительно с жителями Санкт-Петербурга и Ленинградской области"
- If **Согласен**: next step

**Step 4: Style stop-screens**

Red/orange accent, icon, clear message, button to close form or go back.

**Step 5: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: form wizard steps 4-6 with branching and stop screens"
```

---

### Task 7: Form Wizard — Step 7 (Final + Submission UI)

**Files:**
- Modify: `index.html` — step 7 + success screen
- Modify: `js/app.js` — validation, phone mask, dynamic fields
- Modify: `css/style.css` — final step styles

**Step 1: Step 7 HTML**

- Display: "Вероятность одобрения: XX%" (random 80-97)
- Select dropdown: способ связи (Telegram / WhatsApp / Звонок сотрудника РОСФИНКРЕД)
- Input: Номер телефона (masked +7(___) ___-__-__)
- Input: ФИО
- Conditional input: Username Telegram (shown only when Telegram selected)
- Checkbox: согласие на обработку персональных данных
- Button: "Отправить заявку"

**Step 2: Phone mask JS**

Implement input mask for phone: `+7(XXX) XXX-XX-XX`
- Only digits allowed after +7
- Auto-format as user types

**Step 3: Dynamic Telegram field**

```js
contactSelect.addEventListener('change', () => {
  telegramField.style.display =
    contactSelect.value === 'telegram' ? 'block' : 'none';
});
```

**Step 4: Success screen**

- "Поздравляем! Ваша заявка успешно принята!"
- "Мы свяжемся с вами в ближайшее время"
- Button "Написать менеджеру" → opens t.me/clackson_tg
- Styled with green accent, checkmark icon

**Step 5: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: final form step with phone mask, validation, success screen"
```

---

### Task 8: Netlify Function — Telegram Integration

**Files:**
- Create: `netlify/functions/send-telegram.js`
- Create: `.env.example`
- Modify: `js/app.js` — form submit handler

**Step 1: Create .env.example**

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

**Step 2: Create Netlify Function**

```js
// netlify/functions/send-telegram.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const message = formatMessage(data);

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    }
  );

  if (!response.ok) {
    return { statusCode: 500, body: 'Telegram API error' };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};

function formatMessage(d) {
  let msg = `<b>NEW APPLICATION</b>\n\n`;
  msg += `<b>Сумма:</b> ${d.loanAmount}\n`;
  msg += `<b>Платёж/мес:</b> ${d.monthlyPayment} руб.\n`;
  msg += `<b>Отсрочка:</b> ${d.deferral}\n`;
  msg += `<b>Имущество:</b> ${d.property || 'Нет'}\n`;
  msg += `<b>Регион:</b> СПб/ЛО\n`;
  msg += `<b>Вероятность:</b> ${d.approvalChance}%\n\n`;
  msg += `<b>ФИО:</b> ${d.fullName}\n`;
  msg += `<b>Телефон:</b> ${d.phone}\n`;
  msg += `<b>Связь:</b> ${d.contactMethod}\n`;
  if (d.telegramUsername) msg += `<b>Telegram:</b> @${d.telegramUsername}\n`;
  return msg;
}
```

**Step 3: Wire up form submission in app.js**

```js
async function submitForm() {
  const response = await fetch('/.netlify/functions/send-telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (response.ok) showSuccessScreen();
  else showErrorMessage();
}
```

**Step 4: Commit**

```bash
git add netlify/ .env.example js/app.js
git commit -m "feat: Netlify Function for Telegram bot notification"
```

---

### Task 9: Footer + Final Polish

**Files:**
- Modify: `index.html` — footer
- Modify: `css/style.css` — footer styles, animations, responsive fixes

**Step 1: Footer HTML**

- Company name РОСФИНКРЕД
- Address placeholder
- Phone placeholder
- Link: "Политика конфиденциальности" (href="#")

**Step 2: Global responsive pass**

- Test all sections at 375px, 768px, 1280px
- Fix any layout breaks
- Ensure form wizard is comfortable on mobile

**Step 3: Smooth scroll and animations**

- Smooth scroll for CTA buttons
- Fade-in on scroll for sections (IntersectionObserver)
- Form step transitions

**Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: footer, responsive fixes, scroll animations"
```

---

### Task 10: Deployment to Netlify

**Step 1: Push to GitHub**

```bash
git remote add origin <github-repo-url>
git push -u origin main
```

**Step 2: Connect Netlify**

- Go to netlify.com → New site from Git
- Select repo
- Build command: (empty — no build step)
- Publish directory: `.`

**Step 3: Set environment variables in Netlify**

- `TELEGRAM_BOT_TOKEN` = bot token
- `TELEGRAM_CHAT_ID` = chat ID

**Step 4: Test live**

- Open deployed URL
- Fill form end-to-end
- Verify Telegram message received

---

## Estimated Effort

| Task | Description | Est. |
|------|------------|------|
| 1 | Project init | 2 min |
| 2 | Header + Hero | 10 min |
| 3 | Advantages + Steps | 8 min |
| 4 | Calculator | 10 min |
| 5 | Form steps 1-3 | 12 min |
| 6 | Form steps 4-6 | 10 min |
| 7 | Form step 7 | 12 min |
| 8 | Telegram function | 8 min |
| 9 | Footer + polish | 8 min |
| 10 | Deploy | 5 min |
| **Total** | | **~85 min** |
