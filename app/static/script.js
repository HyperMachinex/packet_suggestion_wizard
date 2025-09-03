// --------------------------- script.js (v4 – Grup adımları + paket öneri + okunaklı özet + 2 slider) ---------------------------
(() => {
  // --- DOM referansları
  const form = document.getElementById("featureForm");

  const btnBack = document.getElementById("btnBack");
  const btnNext = document.getElementById("btnNext");
  const stepLabel = document.getElementById("stepLabel");
  const progressBar = document.getElementById("progressBar");

  const customerType = document.getElementById("customerType");
  const bireyselFields = document.getElementById("bireyselFields");
  const kurumsalFields = document.getElementById("kurumsalFields");
  const fullNameInput = document.getElementById("fullName");
  const companyNameInput = document.getElementById("companyName");

  const monthlyMessages = document.getElementById("monthlyMessages"); // select (gizlenecek)
  const temsilciCount = document.getElementById("temsilciCount"); // select (gizlenecek)

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // --- Adım grupları
  // 1) kimlik
  // 2) trafik
  // 3) kanal
  // 4) sohbet
  // 5) ziyaret + crm
  // 6) ai
  // 7) operasyon + dev + security  ← burada "Paket Öner" tetiklenir
  // 8) summary
  const stepGroups = [
    ["kimlik", "trafik"],
    ["kanal-msg", "sohbet-pencere", "ai", "crm", "sohbet-agent"],
    ["ziyaret", "kanal-mobil", "operasyon", "dev", "security"],
    ["summary"],
  ];

  const labels = {
    kimlik: "Bilgiler",
    trafik: "Trafik",
    "kanal-msg": "Mesaj Kanalları",
    "kanal-mobil": "Mobil & Telefon",
    "sohbet-pencere": "Sohbet Penceresi",
    "sohbet-agent": "Agent & Mesaj",
    ziyaret: "Ziyaretçi",
    ai: "Yapay Zeka",
    operasyon: "Operasyon",
    crm: "CRM",
    dev: "Geliştirici",
    security: "Güvenlik",
    summary: "Özet",
  };

  // ---- Dinamik özellik listeleri (placeholder)
  /*
  const RAW_GROUPS = {
    kanal: [
      'Facebook, Instagram, Viber, Telegram Entegrasyonları',
      'Whatsapp Entegrasyonu (Ek olarak ücretlendirilmektedir)',
      'Apple Business Chat',
      "Facebook, Instagram ve Telegram'da Sesli Mesajlar",
    ],
    mobil: [
      'Mobil Uygulama SDK','Telefon+ Modülü','Görüntülü Görüşme Modülü',
    ],
    pencere: [
      'Sohbet öncesi butonlar','Dosya gönderme-alma',
      'Mobil cihazlara uygun sohbet penceresi','Gönderim sonrası yanıt düzenleme',
    ],
    agent: [
      'Yazım denetimi','Taslak cevaplar','Çoklu temsilcili sohbetler','Temsilci atama',
    ],
    ziyaret: [
      'Akıllı yönlendirme',
      'Canlı ziyaretçi takibi ve sitedeki ziyaretçiye manuel mesaj gönderme',
    ],
    ai: ['Soru-cevap botu','Özet çıkarma'],
    marketing: ['Kampanya tetikleyici','E-posta entegrasyonu','Raporlama API'],
    operasyon: ['Vardiya planlama','Yetkilendirme','Onay akışları'],
    crm: ['Müşteri profili','Sipariş senkronizasyonu','Fatura entegrasyonu',"Excel'e veri dökümü alma"],
    dev: ['Webhook'],
    security: ['IP kısıtlama','2FA','KVKK uyumu'],
  };
  */
  const RAW_GROUPS = {
    kanal: [
      // ok
      "Facebook, Instagram, Viber, Telegram Entegrasyonları",
      "Whatsapp Entegrasyonu (Ek olarak ücretlendirilmektedir)",
      "Apple Business Chat",
      "Facebook, Instagram ve Telegram'da Sesli Mesajlar",
    ],
    mobil: [
      // ok
      "Mobil Uygulama SDK",
      "Telefon+ Modülü",
      "Görüntülü Görüşme Modülü",
      "Something",
    ],
    pencere: [
      // ok
      "Sohbet öncesi butonlar",
      "Dosya gönderme-alma",
      "Mobil cihazlara uygun sohbet penceresi",
      "Gönderim sonrası yanıt düzenleme",
    ],
    ziyaret: [
      // ok
      "Akıllı yönlendirme",
      "Canlı ziyaretçi takibi ve sitedeki ziyaretçiye manuel mesaj gönderme",
      "Kampanya tetikleyici",
      "E-posta entegrasyonu",
    ],
    ai: [
      // ok
      "Soru-cevap botu",
      "Özet çıkarma",
      "Yazım denetimi",
    ],
    agent: [
      // ok
      "Taslak cevaplar",
      "Çoklu temsilcili sohbetler",
      "Temsilci atama",
    ],
    security: [
      // ok
      "IP kısıtlama",
      "2FA",
      "KVKK uyumu",
    ],
    operasyon: [
      // ok
      "Vardiya planlama",
      "Yetkilendirme",
      "Onay akışları",
    ],
    crm: [
      // ok
      "Müşteri profili",
      "Sipariş senkronizasyonu",
      "Fatura entegrasyonu",
    ],
    dev: [
      // ok
      "Webhook",
      "Raporlama API",
      "Excel'e veri dökümü alma",
    ],
  };
  function slugify(s) {
    return s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // güvenli diakritik temizliği
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  function renderGroup(containerId, arr) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = arr
      .map((txt) => {
        const v = slugify(txt);
        return `<label class="feature-card">
          <input type="checkbox" name="features[]" value="${v}" data-label="${txt}"/>
          <span class="feature-text">${txt}</span>
        </label>`;
      })
      .join("");

    // Initialize visual state for all cards
    el.querySelectorAll(".feature-card").forEach((card) => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      updateCardVisualState(card, checkbox);
    });
  }

  // Global function to update card visual state
  function updateCardVisualState(card, checkbox) {
    if (checkbox.checked) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  }
  renderGroup("grp-kanal", RAW_GROUPS.kanal);
  renderGroup("grp-mobil", RAW_GROUPS.mobil);
  renderGroup("grp-pencere", RAW_GROUPS.pencere);
  renderGroup("grp-agent", RAW_GROUPS.agent);
  renderGroup("grp-ziyaret", RAW_GROUPS.ziyaret);
  renderGroup("grp-ai", RAW_GROUPS.ai);
  renderGroup("grp-operasyon", RAW_GROUPS.operasyon);
  renderGroup("grp-crm", RAW_GROUPS.crm);
  renderGroup("grp-dev", RAW_GROUPS.dev);
  renderGroup("grp-security", RAW_GROUPS.security);

  // Global event listener for feature cards
  document.addEventListener("click", (e) => {
    const featureCard = e.target.closest(".feature-card");
    if (featureCard) {
      const checkbox = featureCard.querySelector('input[type="checkbox"]');
      if (checkbox) {
        // Toggle the checkbox
        checkbox.checked = !checkbox.checked;
        // Update visual state
        updateCardVisualState(featureCard, checkbox);
        // Trigger change event for form handling
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });

  // Also listen for direct checkbox changes
  document.addEventListener("change", (e) => {
    if (e.target.type === "checkbox" && e.target.name === "features[]") {
      const featureCard = e.target.closest(".feature-card");
      if (featureCard) {
        updateCardVisualState(featureCard, e.target);
      }
    }
  });

  // ---- Doğrulama kuralları
  const requiredByStep = {
    kimlik: () => {
      const type = customerType.value;
      if (type === "bireysel")
        return !!(fullNameInput && fullNameInput.value.trim());
      if (type === "kurumsal")
        return !!(companyNameInput && companyNameInput.value.trim());
      return true;
    },
    trafik: () =>
      !!(monthlyMessages && monthlyMessages.value) &&
      !!(temsilciCount && temsilciCount.value),
  };

  // ---- Error helpers ----
  function _anchorFor(el) {
    return el.closest(".tel-wrap") || el;
  } // tel-wrap varsa uyarıyı onun ALTINA koy
  function setFieldError(el, msg) {
    clearFieldError(el);
    const p = document.createElement("div");
    p.className = "field-error";
    p.textContent = msg;
    _anchorFor(el).insertAdjacentElement("afterend", p);
    el.classList.add("input-invalid");
  }
  function clearFieldError(el) {
    el.classList.remove("input-invalid");
    const a = _anchorFor(el);
    const n = a.nextElementSibling;
    if (n && n.classList.contains("field-error")) n.remove();
  }

  // ---- Validators ----
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function validateEmailField(el) {
    if (!el) return true;
    clearFieldError(el);
    const v = (el.value || "").trim();
    if (!EMAIL_RE.test(v)) {
      setFieldError(el, "Lütfen geçerli bir e-posta adresi girin.");
      return false;
    }
    return true;
  }

  function validatePhoneField(el) {
    if (!el) return true;
    clearFieldError(el);
    const v = (el.value || "").trim();
    // Tel bileşeninden gelen E.164 gizli alanı varsa onu doğrula
    const wrap = el.closest(".tel-wrap");
    const hiddenFull = wrap?.querySelector(`input[name="${el.name}_full"]`);
    if (hiddenFull && hiddenFull.value) {
      const ok = /^\+\d{8,15}$/.test(hiddenFull.value); // E.164 aralığı
      if (!ok) {
        setFieldError(el, "Lütfen geçerli bir telefon numarası girin.");
        return false;
      }
      return true;
    }
    // Yoksa düz sayıya göre kontrol et
    const digits = v.replace(/\D+/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setFieldError(el, "Telefon numarası 8–15 haneli olmalıdır.");
      return false;
    }
    return true;
  }

  // ---- "Boş olamaz" validator'ı ----
  function validateRequiredNotEmpty(el) {
    if (!el) return true;
    clearFieldError(el);
    const v = (el.value || "").trim();
    if (!v) {
      setFieldError(el, "Bu alan boş bırakılamaz.");
      return false;
    }
    return true;
  }

  // ---- Kimlik adımı ekstra doğrulama (bireysel/kurumsal alanları) ----
  function validateIdentityExtrasOnStep() {
    const ids = getCurrentIds();
    if (!ids.includes("kimlik")) return true; // sadece kimlik adımında çalış

    const isBireysel = customerType.value === "bireysel";

    if (isBireysel) {
      const industryEl = document.getElementById("industry");
      const okName = validateRequiredNotEmpty(fullNameInput);
      const okInd = validateRequiredNotEmpty(industryEl);
      if (!okName) fullNameInput?.focus();
      else if (!okInd) industryEl?.focus();
      return okName && okInd;
    } else {
      const contactEl = document.getElementById("contactName");
      const sectorEl = document.getElementById("industryCorp");

      const okCompany = validateRequiredNotEmpty(companyNameInput);
      const okContact = validateRequiredNotEmpty(contactEl);
      const okSector = validateRequiredNotEmpty(sectorEl);

      if (!okCompany) companyNameInput?.focus();
      else if (!okContact) contactEl?.focus();
      else if (!okSector) sectorEl?.focus();

      return okCompany && okContact && okSector;
    }
  }

  // Kimlik adımında temas bilgilerini doğrula
  function validateContactsOnStep() {
    const ids = getCurrentIds();
    if (!ids.includes("kimlik")) return true;
    const isBireysel = customerType.value === "bireysel";
    const emailEl = document.getElementById(isBireysel ? "email" : "emailCorp");
    const phoneEl = document.getElementById(
      isBireysel ? "phoneBireysel" : "phone"
    );
    const ok1 = validateEmailField(emailEl);
    const ok2 = validatePhoneField(phoneEl);
    if (!ok1) emailEl?.focus();
    else if (!ok2) phoneEl?.focus();
    return ok1 && ok2;
  }

  // ---- Paket önerme
  function getPackageSuggestion() {
    const data = new FormData(form);
    const monthly = String(data.get("monthlyMessages") || "");
    const agent = String(data.get("temsilciCount") || "");

    const has = (label) =>
      !!$$('input[name="features[]"]').find(
        (cb) => cb.dataset.label === label && cb.checked
      );

    // 1) Hacim/ekip eşiği -> Kurumsal (100k+ doğrudan kurumsal)
    if (["100k+"].includes(monthly) || agent === "100+") {
      return {
        pkg: "Kurumsal Paket",
        desc: "Yüksek trafik/ekip hacmi",
        reason: "10k+ mesaj veya 100+ temsilci",
      };
    }

    // 2) Kurumsal özellikler tetikler
    const enterpriseFeatures = [
      "Mobil Uygulama SDK",
      "Görüntülü Görüşme Modülü",
    ];
    if (enterpriseFeatures.some(has)) {
      const chosen = enterpriseFeatures.filter(has).join(", ");
      return {
        pkg: "Kurumsal Paket",
        desc: "Kurumsal özellikler seçildiği için",
        reason: `Seçilen kurumsal özellik(ler): ${chosen}`,
      };
    }

    // 3) Premium: 10K-100K
    if (monthly === "10k-100k") {
      return {
        pkg: "Premium Paket",
        desc: "10K-100K aylık mesaj hacmi",
        reason: "Hacim temelli öneri",
      };
    }

    // 4) Premium özellikleri
    const premiumFeatures = [
      "Whatsapp Entegrasyonu (Ek olarak ücretlendirilmektedir)",
      "Facebook, Instagram ve Telegram'da Sesli Mesajlar",
      "Apple Business Chat",
      "Telefon+ Modülü",
      "Temsilci atama",
      "Akıllı yönlendirme",
      "Özet çıkarma",
      "Kampanya tetikleyici",
      "E-posta entegrasyonu",
      "Raporlama API",
      "Yetkilendirme",
      "Onay akışları",
      "Sipariş senkronizasyonu",
      "Webhook",
      "2FA",
    ];
    if (premiumFeatures.some(has)) {
      const chosen = premiumFeatures.filter(has).join(", ");
      return {
        pkg: "Premium Paket",
        desc: "Gelişmiş kanal özellikleri",
        reason: `Seçilen: ${chosen}`,
      };
    }

    if (monthly === "1k-10k") {
      return {
        pkg: "Profesyonel Paket",
        desc: "1K-10K aylık mesaj hacmi",
        reason: "Hacim temelli öneri",
      };
    }

    // 5) Pro özellikleri
    const proFeatures = [
      "Sohbet öncesi butonlar",
      "Dosya gönderme-alma",
      "Canlı ziyaretçi takibi ve sitedeki ziyaretçiye manuel mesaj gönderme",
      "Excel'e veri dökümü alma",
      "Müşteri profili",
      "Gönderim sonrası yanıt düzenleme",
      "Yazım denetimi",
      "Taslak cevaplar",
      "Çoklu temsilcili sohbetler",
      "Soru-cevap botu",
      "Vardiya planlama",
      "Fatura entegrasyonu",
      "IP kısıtlama",
    ];
    if (proFeatures.some(has)) {
      const chosen = proFeatures.filter(has).join(", ");
      return {
        pkg: "Profesyonel Paket",
        desc: "Gelişmiş işlevler seçildi",
        reason: `Seçilen: ${chosen}`,
      };
    }

    // 6) Ücretsiz: düşük hacim + küçük ekip
    if (agent === "1-2" && monthly === "0-1000") {
      return {
        pkg: "Basic Paket",
        desc: "Düşük hacim ve küçük ekip",
        reason: "0-1K mesaj & 1-2 temsilci",
      };
    }

    // 7) Varsayılan
    return {
      pkg: "Basic Paket",
      desc: "Varsayılan öneri",
      reason: "Özellik/ölçek eşiklerine göre giriş seviye",
    };
  }

  // ---- Adım makinesi
  let idx = 0;
  const getCurrentIds = () => stepGroups[idx] || [];
  const isSummary = () => getCurrentIds().includes("summary");

  function showStep(i) {
    idx = Math.max(0, Math.min(i, stepGroups.length - 1));
    $$(".step").forEach((s) => s.classList.add("hidden"));
    getCurrentIds().forEach((id) => {
      const el = document.getElementById(`step-${id}`);
      if (el) el.classList.remove("hidden");
    });

    // Buton metinleri
    const lastBeforeSummary = stepGroups.length - 2;
    btnBack.disabled = idx === 0;
    btnNext.textContent =
      idx === lastBeforeSummary
        ? "Paket Öner"
        : isSummary()
        ? "Bitti"
        : "Devam Et";

    let btnContact = document.getElementById("btnContact");

    if (!btnContact.dataset.bound) {
      btnContact.dataset.bound = "1";
      btnContact.addEventListener("click", async () => {
        try {
          await saveSummary(); // MongoDB'ye kaydet
        } catch (_) {}
        document.getElementById("contactModal")?.classList.remove("hidden");
      });
    }

    btnContact.addEventListener("click", () => {
      document.getElementById("contactModal").classList.remove("hidden");
    });

    // Modal kapatma
    document
      .getElementById("closeContactModal")
      ?.addEventListener("click", () => {
        document.getElementById("contactModal").classList.add("hidden");
      });

    if (isSummary()) {
      if (!btnContact) {
        btnContact = document.createElement("button");
        btnContact.type = "button";
        btnContact.id = "btnContact";
        btnContact.className = "btn";
        btnContact.textContent = "Size ulaşmamızı ister misiniz?";
        btnNext.parentNode.insertBefore(btnContact, btnNext);
      }
      btnContact.style.display = "inline-block";
    } else {
      if (btnContact) btnContact.style.display = "none";
    }

    // İlerleme & başlık
    const totalCount = stepGroups.length - 1;
    const shownIndex = Math.min(idx + 1, totalCount);
    const groupLabel = isSummary()
      ? "Özet"
      : getCurrentIds()
          .map((id) => labels[id])
          .join(" + ");
    stepLabel.textContent = `Adım ${Math.min(
      shownIndex,
      totalCount
    )}/${totalCount}: ${groupLabel}`;
    const pct = Math.round(
      ((Math.min(idx, totalCount - 1) + 1) / totalCount) * 100
    );
    progressBar.style.width = pct + "%";

    // İlk odak
    const first = document.querySelector(
      getCurrentIds()
        .map(
          (id) =>
            `#step-${id} input, #step-${id} select, #step-${id} textarea, #step-${id} button`
        )
        .join(", ")
    );
    first?.focus();
  }

  function canProceed() {
    const ids = getCurrentIds();
    if (ids.includes("kimlik") && !requiredByStep.kimlik()) return false;
    if (ids.includes("trafik") && !requiredByStep.trafik()) return false;
    return true;
  }

  btnNext.addEventListener("click", () => {
    // Kimlik adımında boş alan kontrolü
    if (!validateIdentityExtrasOnStep()) return;

    // Kimlik adımında e-posta/telefon format kontrolü (doluysa format)
    if (!validateContactsOnStep()) return;
    if (!validateContactsOnStep()) return;
    const lastBeforeSummary = stepGroups.length - 2;

    if (idx === lastBeforeSummary) {
      const rec = getPackageSuggestion();
      buildSummary(rec);
      showStep(idx + 1);
      return;
    }

    if (isSummary()) return;

    if (!canProceed()) {
      // basit vurgulu doğrulama
      getCurrentIds().forEach((id) => {
        const section = document.getElementById(`step-${id}`);
        section
          ?.querySelectorAll("select[required], input[required]")
          .forEach((el) => {
            if (!el.value) el.style.outline = "2px solid var(--warn)";
            else el.style.outline = "";
          });
      });
      return;
    }

    showStep(idx + 1);
  });

  btnBack.addEventListener("click", () => showStep(idx - 1));

  // Enter = ileri, Shift+Enter = geri
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !["TEXTAREA"].includes(e.target.tagName)) {
      e.preventDefault();
      if (e.shiftKey) btnBack.click();
      else btnNext.click();
    }
  });

  // Bireysel/kurumsal alanlarını değiştir
  customerType.addEventListener("change", () => {
    const isBireysel = customerType.value === "bireysel";
    bireyselFields.style.display = isBireysel ? "grid" : "none";
    kurumsalFields.style.display = isBireysel ? "none" : "grid";
  });

  // ---------- Aylık Mesaj (Segmentli Bar) ----------
  // --- MONTHLY (Aylık Mesaj) pill görünümü ---
  (function injectMonthlyCSS() {
    const old = document.getElementById("mm-style");
    if (old) old.remove();
    const css = `
    :root { --pill-border:#fff; }  /* çerçeve rengi */

    .mm-wrap{ margin-top:8px; position:relative; padding-top:22px; }
    .mm-range{
      position:relative; display:grid; grid-template-columns:repeat(4,1fr);
      border:none; box-shadow: inset 0 0 0 2px var(--pill-border);   /* dışı full beyaz */
      border-radius:9999px; overflow:hidden; background:#0d1017;
    }
    /* dolgu: kesintisiz + sol taraf hep yuvarlak; sağ taraf %100'de yuvarlanır (JS) */
    .mm-fill{
      position:absolute; left:0; top:0; bottom:0; width:0%;
      background:linear-gradient(180deg, rgba(34,197,94,.45), rgba(34,197,94,.28));
      border-radius:9999px 0 0 9999px;
      pointer-events:none; transition:width .18s ease;
      z-index:1; transform:translateZ(0);
    }
    /* segment ayraçları: beyaz çizgi istersek var(--pill-border) kullan */
    .mm-seg{
      position:relative; padding:18px 0; text-align:center; cursor:pointer; user-select:none;
      border-right:1px solid var(--pill-border); outline:0; background:transparent; z-index:2;
    }
    .mm-seg:last-child{ border-right:0; }

    .mm-ticks{ position:absolute; top:0; left:0; width:100%; height:0; pointer-events:none; }
    .mm-tick{ position:absolute; top:-18px; font-size:12px; color:var(--pill-border); white-space:nowrap; transform:translateX(-50%); }
    .mm-tick.end{ transform:translateX(-100%); }
    `;
    const s = document.createElement("style");
    s.id = "mm-style";
    s.textContent = css;
    document.head.appendChild(s);
  })();

  // --- Field error styles (inject) ---
  (function injectErrorCSS() {
    if (document.getElementById("err-style")) return;
    const css = `
    .field-error{ margin-top:6px; font-size:12px; color:var(--warn); }
    .input-invalid{ outline:2px solid var(--warn); }
    `;
    const s = document.createElement("style");
    s.id = "err-style";
    s.textContent = css;
    document.head.appendChild(s);
  })();

  function initMonthlyMessagesSlider() {
    if (!monthlyMessages) return;

    monthlyMessages.style.display = "none";
    const container = monthlyMessages.parentElement;

    const wrap = document.createElement("div");
    wrap.className = "mm-wrap";
    const ticks = document.createElement("div");
    ticks.className = "mm-ticks";
    const range = document.createElement("div");
    range.className = "mm-range";
    const fill = document.createElement("div");
    fill.className = "mm-fill";
    range.appendChild(fill);

    const segs = [
      { value: "0-1000", label: "1.000" },
      { value: "1000-10000", label: "10.000" },
      { value: "10k-100k", label: "100.000" },
      { value: "100k+", label: "100.000+" },
    ];

    const tickPos = [25, 50, 75, 100];
    ticks.innerHTML = segs
      .map(
        (s, i) =>
          `<span class="mm-tick ${
            i === segs.length - 1 ? "end" : ""
          }" style="left:${tickPos[i]}%">${s.label}</span>`
      )
      .join("");

    const segButtons = [];
    segs.forEach((s, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mm-seg";
      b.dataset.value = s.value;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.tabIndex = 0;

      b.addEventListener("click", () => selectSeg(s.value));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          selectSeg(segs[Math.min(idx + 1, segs.length - 1)].value, true);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          selectSeg(segs[Math.max(idx - 1, 0)].value, true);
        }
      });

      range.appendChild(b);
      segButtons.push(b);
    });

    wrap.appendChild(ticks);
    wrap.appendChild(range);
    container.appendChild(wrap);

    function normalizeMonthly(val) {
      if (val === "100k-1m" || val === "1m+" || val === "100k+") return "100k+";
      return val;
    }

    function selectSeg(value, focus = false) {
      const normalized = normalizeMonthly(value);
      monthlyMessages.value = normalized;

      const selIndex = segs.findIndex((x) => x.value === normalized);
      const pct = selIndex >= 0 ? ((selIndex + 1) / segs.length) * 100 : 0;
      fill.style.width = pct + "%";

      segButtons.forEach((btn, i) => {
        btn.setAttribute("aria-checked", i === selIndex ? "true" : "false");
      });

      if (focus && selIndex >= 0) segButtons[selIndex].focus();
    }

    // İlk yükleme
    selectSeg(normalizeMonthly(monthlyMessages.value || ""));
  }

  // ---------- Temsilci Sayısı (Segmentli Bar) ----------
  // --- AGENT COUNT (Temsilci) pill görünümü ---
  (function injectAgentCSS() {
    const old = document.getElementById("ac-style");
    if (old) old.remove();
    const css = `
    :root { --pill-border:#fff; }

    .ac-wrap{ margin-top:8px; position:relative; padding-top:22px; }
    .ac-range{
      position:relative; display:grid; grid-template-columns:repeat(4,1fr);
      border:none; box-shadow: inset 0 0 0 2px var(--pill-border); /* dışı full beyaz */
      border-radius:9999px; overflow:hidden; background:#0d1017;
    }
    .ac-fill{
      position:absolute; left:0; top:0; bottom:0; width:0%;
      background:linear-gradient(180deg, rgba(34,197,94,.45), rgba(34,197,94,.28));
      border-radius:9999px 0 0 9999px; /* sol hep yuvarlak */
      pointer-events:none; transition:width .18s ease;
      z-index:1; transform:translateZ(0);
    }
    .ac-seg{
      position:relative; padding:18px 0; text-align:center; cursor:pointer; user-select:none;
      border-right:1px solid var(--pill-border); outline:0; background:transparent; z-index:2; /* beyaz bölme çizgileri */
    }
    .ac-seg:last-child{ border-right:0; }

    .ac-ticks{ position:absolute; top:0; left:0; width:100%; height:0; pointer-events:none; }
    .ac-tick{ position:absolute; top:-18px; font-size:12px; color:var(--pill-border); white-space:nowrap; transform:translateX(-50%); }
    .ac-tick.end{ transform:translateX(-100%); }
    `;
    const s = document.createElement("style");
    s.id = "ac-style";
    s.textContent = css;
    document.head.appendChild(s);
  })();

  function initAgentCountSlider() {
    if (!temsilciCount) return;

    temsilciCount.style.display = "none";
    const container = temsilciCount.parentElement;

    const wrap = document.createElement("div");
    wrap.className = "ac-wrap";
    const ticks = document.createElement("div");
    ticks.className = "ac-ticks";
    const range = document.createElement("div");
    range.className = "ac-range";
    const fill = document.createElement("div");
    fill.className = "ac-fill";
    range.appendChild(fill);

    const segs = [
      { value: "1-2", label: "2" },
      { value: "3-10", label: "10" },
      { value: "11-100", label: "100" },
      { value: "100+", label: "100+" },
    ];

    const tickHtml = segs
      .map((s, i) => {
        const pct = ((i + 1) / segs.length) * 100;
        const end = i === segs.length - 1 ? "end" : "";
        return `<span class="ac-tick ${end}" style="left:${pct}%">${s.label}</span>`;
      })
      .join("");
    ticks.innerHTML = tickHtml;

    const segButtons = [];
    segs.forEach((s, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ac-seg";
      b.dataset.value = s.value;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.tabIndex = 0;

      b.addEventListener("click", () => selectSeg(s.value));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          selectSeg(segs[Math.min(idx + 1, segs.length - 1)].value, true);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          selectSeg(segs[Math.max(idx - 1, 0)].value, true);
        }
      });

      range.appendChild(b);
      segButtons.push(b);
    });

    wrap.appendChild(ticks);
    wrap.appendChild(range);
    container.appendChild(wrap);

    function selectSeg(value, focus = false) {
      temsilciCount.value = value;
      const selIndex = segs.findIndex((x) => x.value === value);
      const pct = selIndex >= 0 ? ((selIndex + 1) / segs.length) * 100 : 0;
      fill.style.width = pct + "%";
      segButtons.forEach((btn, i) => {
        btn.setAttribute("aria-checked", i === selIndex ? "true" : "false");
      });
      if (focus && selIndex >= 0) segButtons[selIndex].focus();
    }

    // İlk yükleme
    selectSeg(temsilciCount.value || "");
  }
  // TR-dostu: string'in sadece ilk harfini büyütür (kalanı aynen bırakır)
  const capitalizeFirstTR = (s) => {
    if (!s) return undefined;
    s = String(s).trim();
    if (!s) return undefined;
    return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
  };

  // (İsteğe bağlı) Şirket adlarını her kelimenin baş harfi büyük yapayım dersen:
  const titleCaseTR = (s) => {
    if (!s) return undefined;
    return String(s)
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
      .join(" ");
  };
  // ---- Özet / dışa aktar
  function buildSummary(rec) {
    const data = new FormData(form);
    const features = $$('input[name="features[]"]:checked').map(
      (cb) => cb.dataset.label
    );

    const payload = {
      customerType: capitalizeFirstTR(data.get("customerType")),
      fullName: titleCaseTR((data.get("fullName") || "").trim() || undefined),
      // Sadece ilk harf büyüsün istersen: capitalizeFirstTR(data.get('companyName'))
      companyName: titleCaseTR(data.get("companyName")),
      monthlyMessages: data.get("monthlyMessages"),
      temsilciCount: data.get("temsilciCount"),
      features,
    };

    const recommendation = rec || {
      pkg: "Ücretsiz Paket",
      desc: "(varsayılan)",
      reason: "—",
    };

    const esc = (s) =>
      String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c])
      );

    const parts = [];
    parts.push(
      `<div><strong>Başvuru Tipi:</strong> ${esc(payload.customerType)}</div>`
    );
    if (payload.fullName)
      parts.push(`<div><strong>İsim:</strong> ${esc(payload.fullName)}</div>`);
    if (payload.companyName)
      parts.push(
        `<div><strong>Şirket:</strong> ${esc(payload.companyName)}</div>`
      );
    parts.push(
      `<div><strong>Aylık Mesaj:</strong> ${esc(
        payload.monthlyMessages || "—"
      )}</div>`
    );
    parts.push(
      `<div><strong>Temsilci:</strong> ${esc(
        payload.temsilciCount || "—"
      )}</div>`
    );

    parts.push(
      '<div style="margin-top:8px"><strong>Seçilen Özellikler:</strong></div>'
    );
    if (features.length) {
      parts.push(
        '<ul style="margin:6px 0 10px 20px">' +
          features.map((f) => `<li>${esc(f)}</li>`).join("") +
          "</ul>"
      );
    } else {
      parts.push('<div style="color:var(--muted)">(yok)</div>');
    }

    parts.push(
      '<hr style="border:none;border-top:1px dashed var(--border);margin:10px 0" />'
    );
    parts.push(
      `<div><strong>Önerilen Paket:</strong> ${esc(recommendation.pkg)}</div>`
    );
    parts.push(
      `<div><strong>Açıklama:</strong> ${esc(recommendation.desc)}</div>`
    );
    parts.push(
      `<div><strong>Gerekçe:</strong> ${esc(recommendation.reason)}</div>`
    );

    const el = document.getElementById("summaryText");
    el.classList.add("as-html");
    el.style.whiteSpace = "normal";
    el.innerHTML = parts.join("\n");
  }

  function download(filename, content, type = "text/plain") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  document.getElementById("copyBtn")?.addEventListener("click", () => {
    const txt = document.getElementById("summaryText").textContent || "";
    navigator.clipboard?.writeText(txt);
  });
  document.getElementById("jsonBtn")?.addEventListener("click", () => {
    const data = collect();
    download(
      "ccpilot-summary.json",
      JSON.stringify(data, null, 2),
      "application/json"
    );
  });
  document.getElementById("csvBtn")?.addEventListener("click", () => {
    const data = collect();
    const rows = [
      [
        "customerType",
        "fullName",
        "companyName",
        "monthlyMessages",
        "temsilciCount",
        "features",
      ],
      [
        data.customerType || "",
        data.fullName || "",
        data.companyName || "",
        data.monthlyMessages || "",
        data.temsilciCount || "",
        (data.features || []).join(";"),
      ],
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    download("ccpilot-summary.csv", csv, "text/csv");
  });
  document.getElementById("shareBtn")?.addEventListener("click", () => {
    const data = collect();
    const url = new URL(location.href);
    url.hash = "d=" + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    navigator.clipboard?.writeText(url.toString());
    alert("Bağlantı kopyalandı.");
  });

  function getSummaryPayload() {
    const formEl = document.getElementById("featureForm");
    const fd = new FormData(formEl);

    // Seçili özelliklerin LABEL'ları:
    const features = Array.from(
      document.querySelectorAll('input[name="features[]"]:checked')
    ).map((cb) => cb.dataset.label);

    // Intl-Tel için varsa gizli alanlardan E.164:
    const phoneBireyselFull =
      formEl.querySelector('input[name="phoneBireysel_full"]')?.value || null;
    const phoneCorpFull =
      formEl.querySelector('input[name="phone_full"]')?.value || null;

    // Öneri (summary öncesi hesaplanmış oluyor)
    const recommendation = {
      pkg: "Ücretsiz Paket",
      desc: "(varsayılan)",
      reason: "—",
    };

    return {
      // Kimlik
      customerType: fd.get("customerType") || null,

      // Bireysel alanları
      fullName: fd.get("fullName") || null,
      website: fd.get("website") || null,
      industry: fd.get("industry") || null,
      email: fd.get("email") || null,
      phone: phoneBireyselFull || fd.get("phoneBireysel") || null,

      // Kurumsal alanları
      companyName: fd.get("companyName") || null,
      contactName: fd.get("contactName") || null,
      websiteCorp: fd.get("websiteCorp") || null,
      industryCorp: fd.get("industryCorp") || null,
      emailCorp: fd.get("emailCorp") || null,
      phoneCorp: phoneCorpFull || fd.get("phone") || null,

      // Trafik
      monthlyMessages: fd.get("monthlyMessages") || null, // slider, <select>’teki değeri güncelliyoruz
      temsilciCount: fd.get("temsilciCount") || null, // slider, <select>’teki değeri güncelliyoruz

      // Özellikler
      features,

      // Öneri
      recommendation,

      // CSRF
      csrf_token: document.getElementById("csrf_token")?.value || null,
    };
  }

  function collect() {
    const data = new FormData(form);
    const features = $$('input[name="features[]"]:checked').map(
      (cb) => cb.dataset.label
    );
    return {
      customerType: capitalizeFirstTR(data.get("customerType")),
      fullName: titleCaseTR(data.get("fullName")),
      companyName: titleCaseTR(data.get("companyName")),
      monthlyMessages: data.get("monthlyMessages"),
      temsilciCount: data.get("temsilciCount"),
      features,
    };
  }

  async function saveSummary() {
    const payload = getSummaryPayload(); // buildSummary yerine JSON payload
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      if (typeof toast === "function") {
        toast("Basvurunuz kaydedildi • ID: " + (data.id || "—"));
      } else {
        console.log("Basvurunuz kaydedildi • ID:", data.id || "—");
      }
      return data;
    } catch (err) {
      console.error(err);
      alert("Kaydetme sırasında bir hata oluştu.");
      throw err;
    }
  }

  // --- Intl Tel Input (CSS inject) ---
  (function injectIntlTelCSS() {
    if (document.getElementById("intl-tel-style")) return;
    const css = `
    .tel-wrap{display:flex;gap:8px;align-items:stretch;position:relative}
    .tel-cc-btn{display:flex;align-items:center;gap:6px;padding:0 12px;border:1px solid var(--border);
      background:#0d1017;color:var(--text);border-radius:10px;cursor:pointer;white-space:nowrap}
    .tel-cc-btn .flag{font-size:18px;line-height:1}
    .tel-cc-btn .code{opacity:.9;font-variant-numeric:tabular-nums}
    .tel-list{position:absolute;z-index:1000;left:0;top:100%;margin-top:6px;width:min(420px,92vw);
      background:#0b0f16;border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.4);display:none}
    .tel-list.open{display:block}
    .tel-search{width:calc(100% - 16px);margin:8px 8px 6px;padding:8px 10px;border:1px solid var(--border);
      background:#0d1017;color:var(--text);border-radius:8px;outline:0}
    .tel-items{max-height:300px;overflow:auto;padding:4px}
    .tel-item{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;
      background:transparent;border:0;color:var(--text);padding:10px 12px;border-radius:8px;cursor:pointer;text-align:left}
    .tel-item:hover,.tel-item:focus{background:#0f1520;outline:1px solid var(--border)}
    .tel-item .left{display:flex;align-items:center;gap:10px}
    .tel-item .flag{font-size:18px}
    .tel-item .name{opacity:.95}
    .tel-item .dial{font-variant-numeric:tabular-nums;opacity:.9}
    `;
    const s = document.createElement("style");
    s.id = "intl-tel-style";
    s.textContent = css;
    document.head.appendChild(s);
  })();

  // --- Intl Tel Input ---
  const INTL_COUNTRIES = [
    { iso: "TR", name: "Türkiye", dial: "90" },
    { iso: "US", name: "United States", dial: "1" },
    { iso: "GB", name: "United Kingdom", dial: "44" },
    { iso: "DE", name: "Deutschland", dial: "49" },
    { iso: "FR", name: "France", dial: "33" },
    { iso: "NL", name: "Nederland", dial: "31" },
    { iso: "ES", name: "España", dial: "34" },
    { iso: "IT", name: "Italia", dial: "39" },
    { iso: "GR", name: "Ελλάδα", dial: "30" },
    { iso: "PT", name: "Portugal", dial: "351" },
    { iso: "SE", name: "Sverige", dial: "46" },
    { iso: "NO", name: "Norge", dial: "47" },
    { iso: "DK", name: "Danmark", dial: "45" },
    { iso: "FI", name: "Suomi", dial: "358" },
    { iso: "PL", name: "Polska", dial: "48" },
    { iso: "RO", name: "România", dial: "40" },
    { iso: "BG", name: "Bulgaria", dial: "359" },
    { iso: "RU", name: "Россия", dial: "7" },
    { iso: "UA", name: "Україна", dial: "380" },
    { iso: "AZ", name: "Azərbaycan", dial: "994" },
    { iso: "GE", name: "საქართველო", dial: "995" },
    { iso: "KZ", name: "Қазақстан", dial: "7" },
    { iso: "SA", name: "Saudi Arabia", dial: "966" },
    { iso: "AE", name: "United Arab Emirates", dial: "971" },
    { iso: "QA", name: "Qatar", dial: "974" },
    { iso: "KW", name: "Kuwait", dial: "965" },
    { iso: "BH", name: "Bahrain", dial: "973" },
    { iso: "OM", name: "Oman", dial: "968" },
    { iso: "IR", name: "Iran", dial: "98" },
    { iso: "IQ", name: "Iraq", dial: "964" },
    { iso: "IL", name: "Israel", dial: "972" },
    { iso: "IN", name: "India", dial: "91" },
    { iso: "PK", name: "Pakistan", dial: "92" },
    { iso: "BD", name: "Bangladesh", dial: "880" },
    { iso: "ID", name: "Indonesia", dial: "62" },
    { iso: "PH", name: "Philippines", dial: "63" },
    { iso: "MY", name: "Malaysia", dial: "60" },
    { iso: "SG", name: "Singapore", dial: "65" },
    { iso: "JP", name: "日本", dial: "81" },
    { iso: "KR", name: "대한민국", dial: "82" },
    { iso: "CN", name: "中国", dial: "86" },
    { iso: "HK", name: "香港", dial: "852" },
    { iso: "TW", name: "台灣", dial: "886" },
    { iso: "AU", name: "Australia", dial: "61" },
    { iso: "NZ", name: "New Zealand", dial: "64" },
    { iso: "MX", name: "México", dial: "52" },
    { iso: "AR", name: "Argentina", dial: "54" },
    { iso: "BR", name: "Brasil", dial: "55" },
    { iso: "CL", name: "Chile", dial: "56" },
    { iso: "ZA", name: "South Africa", dial: "27" },
  ];

  function flagEmoji(iso2) {
    return [...iso2.toUpperCase()]
      .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
      .join("");
  }
  function digits(s) {
    return String(s || "").replace(/\D+/g, "");
  }

  function initIntlTel(inputId, defaultIso = "TR") {
    const input = document.getElementById(inputId);
    if (!input) return;

    // sarmala
    const wrap = document.createElement("div");
    wrap.className = "tel-wrap";
    input.parentElement.insertBefore(wrap, input);
    wrap.appendChild(input);

    // gizli alanlar (dial & e164)
    const hidDial = document.createElement("input");
    hidDial.type = "hidden";
    hidDial.name = input.name + "_dial";
    const hidFull = document.createElement("input");
    hidFull.type = "hidden";
    hidFull.name = input.name + "_full";
    wrap.appendChild(hidDial);
    wrap.appendChild(hidFull);

    // buton
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tel-cc-btn";
    const btnFlag = document.createElement("span");
    btnFlag.className = "flag";
    const btnCode = document.createElement("span");
    btnCode.className = "code";
    btn.append(btnFlag, btnCode);
    wrap.insertBefore(btn, input);

    // dropdown
    const list = document.createElement("div");
    list.className = "tel-list";
    const search = document.createElement("input");
    search.className = "tel-search";
    search.placeholder = "Ülke veya kod ara…";
    const items = document.createElement("div");
    items.className = "tel-items";
    list.appendChild(search);
    list.appendChild(items);
    wrap.appendChild(list);

    // liste öğeleri
    function render(filter = "") {
      const f = filter.trim().toLowerCase();
      items.innerHTML = "";
      INTL_COUNTRIES.filter(
        (c) =>
          !f ||
          c.name.toLowerCase().includes(f) ||
          c.iso.toLowerCase().includes(f) ||
          ("+" + c.dial).includes(f)
      ).forEach((c) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tel-item";
        b.innerHTML = `<span class="left"><span class="flag">${flagEmoji(
          c.iso
        )}</span><span class="name">${
          c.name
        }</span></span><span class="dial">+${c.dial}</span>`;
        b.addEventListener("click", () => {
          setCountry(c);
          close();
        });
        items.appendChild(b);
      });
    }
    render();
    search.addEventListener("input", () => render(search.value));

    // aç/kapa
    function open() {
      list.classList.add("open");
      search.focus();
    }
    function close() {
      list.classList.remove("open");
    }
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      list.classList.toggle("open");
      if (list.classList.contains("open")) search.focus();
    });
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // seçimi uygula + e164 üret
    function setCountry(c) {
      btnFlag.textContent = flagEmoji(c.iso);
      btnCode.textContent = `+${c.dial}`;
      hidDial.value = c.dial;
      updateFull();
    }
    function updateFull() {
      const e164 = "+" + (hidDial.value || "") + digits(input.value);
      hidFull.value = e164;
    }
    input.addEventListener("input", updateFull);

    // başlangıç
    const start =
      INTL_COUNTRIES.find((c) => c.iso === defaultIso) || INTL_COUNTRIES[0];
    setCountry(start);
  }
  ["email", "emailCorp"].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener("blur", (e) => validateEmailField(e.target));
  });
  ["phoneBireysel", "phone"].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener("blur", (e) => validatePhoneField(e.target));
  });
  // ---- Başlat
  initMonthlyMessagesSlider();
  initAgentCountSlider();
  initIntlTel("phoneBireysel", "TR"); // bireysel
  initIntlTel("phone", "TR");
  showStep(0);
  bindFormSubmit();
})();
