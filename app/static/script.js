/**
 * CCpilot Plan Destek Formu - Main Application Script
 * A multi-step wizard for package recommendation
 */

(() => {
  // ============================================================================
  // DOM ELEMENTS & UTILITIES
  // ============================================================================

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
  const monthlyMessages = document.getElementById("monthlyMessages");
  const temsilciCount = document.getElementById("temsilciCount");

  // Utility functions
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ============================================================================
  // STEP CONFIGURATION
  // ============================================================================

  const stepGroups = [
    ["kimlik", "trafik"],
    ["kanal-msg", "sohbet-pencere", "ai", "crm", "sohbet-agent"],
    ["ziyaret", "kanal-mobil", "operasyon", "dev", "security"],
    ["summary"],
  ];

  const stepLabels = {
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

  // ============================================================================
  // FEATURE GROUPS & RENDERING
  // ============================================================================

  const featureGroups = {
    kanal: [
      "Facebook, Instagram, Viber, Telegram Entegrasyonları",
      "Whatsapp Entegrasyonu (Ek olarak ücretlendirilmektedir)",
      "Apple Business Chat",
      "Facebook, Instagram ve Telegram'da Sesli Mesajlar",
    ],
    mobil: [
      "Mobil Uygulama SDK",
      "Telefon+ Modülü",
      "Görüntülü Görüşme Modülü",
      "Something",
    ],
    pencere: [
      "Sohbet öncesi butonlar",
      "Dosya gönderme-alma",
      "Mobil cihazlara uygun sohbet penceresi",
      "Gönderim sonrası yanıt düzenleme",
    ],
    ziyaret: [
      "Akıllı yönlendirme",
      "Canlı ziyaretçi takibi ve sitedeki ziyaretçiye manuel mesaj gönderme",
      "Kampanya tetikleyici",
      "E-posta entegrasyonu",
    ],
    ai: ["Soru-cevap botu", "Özet çıkarma", "Yazım denetimi"],
    agent: ["Taslak cevaplar", "Çoklu temsilcili sohbetler", "Temsilci atama"],
    security: ["IP kısıtlama", "2FA", "KVKK uyumu"],
    operasyon: ["Vardiya planlama", "Yetkilendirme", "Onay akışları"],
    crm: ["Müşteri profili", "Sipariş senkronizasyonu", "Fatura entegrasyonu"],
    dev: ["Webhook", "Raporlama API", "Excel'e veri dökümü alma"],
  };

  function slugify(text) {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateCardVisualState(card, checkbox) {
    card.classList.toggle("selected", checkbox.checked);
  }

  function renderFeatureGroup(containerId, features) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = features
      .map((feature) => {
        const value = slugify(feature);
        return `
          <label class="feature-card">
            <input type="checkbox" name="features[]" value="${value}" data-label="${feature}"/>
            <span class="feature-text">${feature}</span>
          </label>
        `;
      })
      .join("");

    // Initialize visual state
    container.querySelectorAll(".feature-card").forEach((card) => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      updateCardVisualState(card, checkbox);
    });
  }

  function initializeFeatureGroups() {
    Object.entries(featureGroups).forEach(([key, features]) => {
      renderFeatureGroup(`grp-${key}`, features);
    });
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  function setupFeatureCardEvents() {
    document.addEventListener("click", (e) => {
      const featureCard = e.target.closest(".feature-card");
      if (!featureCard) return;

      const checkbox = featureCard.querySelector('input[type="checkbox"]');
      if (!checkbox) return;

      checkbox.checked = !checkbox.checked;
      updateCardVisualState(featureCard, checkbox);
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });

    document.addEventListener("change", (e) => {
      if (e.target.type === "checkbox" && e.target.name === "features[]") {
        const featureCard = e.target.closest(".feature-card");
        if (featureCard) {
          updateCardVisualState(featureCard, e.target);
        }
      }
    });
  }

  // ============================================================================
  // VALIDATION SYSTEM
  // ============================================================================

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const PHONE_REGEX = /^\+\d{8,15}$/;

  const stepValidation = {
    kimlik: () => {
      const type = customerType.value;
      if (type === "bireysel") return !!fullNameInput?.value.trim();
      if (type === "kurumsal") return !!companyNameInput?.value.trim();
      return true;
    },
    trafik: () => !!(monthlyMessages?.value && temsilciCount?.value),
  };

  function getErrorAnchor(element) {
    return element.closest(".tel-wrap") || element;
  }

  function setFieldError(element, message) {
    clearFieldError(element);
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    getErrorAnchor(element).insertAdjacentElement("afterend", errorDiv);
    element.classList.add("input-invalid");
  }

  function clearFieldError(element) {
    element.classList.remove("input-invalid");
    const anchor = getErrorAnchor(element);
    const nextElement = anchor.nextElementSibling;
    if (nextElement?.classList.contains("field-error")) {
      nextElement.remove();
    }
  }

  function validateEmail(element) {
    if (!element) return true;
    clearFieldError(element);
    const value = (element.value || "").trim();
    if (!EMAIL_REGEX.test(value)) {
      setFieldError(element, "Lütfen geçerli bir e-posta adresi girin.");
      return false;
    }
    return true;
  }

  function validatePhone(element) {
    if (!element) return true;
    clearFieldError(element);
    const value = (element.value || "").trim();

    // Check E.164 format if available
    const wrap = element.closest(".tel-wrap");
    const hiddenFull = wrap?.querySelector(
      `input[name="${element.name}_full"]`
    );
    if (hiddenFull?.value) {
      if (!PHONE_REGEX.test(hiddenFull.value)) {
        setFieldError(element, "Lütfen geçerli bir telefon numarası girin.");
        return false;
      }
      return true;
    }

    // Fallback to digit count validation
    const digits = value.replace(/\D+/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setFieldError(element, "Telefon numarası 8–15 haneli olmalıdır.");
      return false;
    }
    return true;
  }

  function validateRequired(element) {
    if (!element) return true;
    clearFieldError(element);
    const value = (element.value || "").trim();
    if (!value) {
      setFieldError(element, "Bu alan boş bırakılamaz.");
      return false;
    }
    return true;
  }

  function validateIdentityStep() {
    const currentIds = getCurrentStepIds();
    if (!currentIds.includes("kimlik")) return true;

    const isBireysel = customerType.value === "bireysel";
    const fields = isBireysel
      ? {
          name: fullNameInput,
          industry: document.getElementById("industry"),
          email: document.getElementById("email"),
          phone: document.getElementById("phoneBireysel"),
        }
      : {
          name: companyNameInput,
          contact: document.getElementById("contactName"),
          industry: document.getElementById("industryCorp"),
          email: document.getElementById("emailCorp"),
          phone: document.getElementById("phone"),
        };

    const validations = [
      validateRequired(fields.name),
      validateRequired(fields.industry),
      validateEmail(fields.email),
      validatePhone(fields.phone),
    ];

    if (!isBireysel) {
      validations.push(validateRequired(fields.contact));
    }

    // Focus first invalid field
    const fieldArray = Object.values(fields).filter(Boolean);
    const firstInvalidIndex = validations.findIndex((valid) => !valid);
    if (firstInvalidIndex !== -1) {
      fieldArray[firstInvalidIndex]?.focus();
    }

    return validations.every((valid) => valid);
  }

  // ============================================================================
  // PACKAGE RECOMMENDATION
  // ============================================================================

  function getPackageRecommendation() {
    const formData = new FormData(form);
    const monthly = String(formData.get("monthlyMessages") || "");
    const agent = String(formData.get("temsilciCount") || "");

    const hasFeature = (label) =>
      $$('input[name="features[]"]').some(
        (cb) => cb.dataset.label === label && cb.checked
      );

    // Enterprise features trigger
    const enterpriseFeatures = [
      "Mobil Uygulama SDK",
      "Görüntülü Görüşme Modülü",
    ];
    if (enterpriseFeatures.some(hasFeature)) {
      const chosen = enterpriseFeatures.filter(hasFeature).join(", ");
      return {
        pkg: "Kurumsal Paket",
        desc: "Kurumsal özellikler seçildiği için",
        reason: `Seçilen kurumsal özellik(ler): ${chosen}`,
      };
    }

    // High volume/team threshold
    if (monthly === "100k+" || agent === "100+") {
      return {
        pkg: "Kurumsal Paket",
        desc: "Yüksek trafik/ekip hacmi",
        reason: "10k+ mesaj veya 100+ temsilci",
      };
    }

    // Premium features
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

    if (premiumFeatures.some(hasFeature)) {
      const chosen = premiumFeatures.filter(hasFeature).join(", ");
      return {
        pkg: "Premium Paket",
        desc: "Gelişmiş kanal özellikleri",
        reason: `Seçilen: ${chosen}`,
      };
    }

    // Volume-based recommendations
    if (monthly === "10k-100k") {
      return {
        pkg: "Premium Paket",
        desc: "10K-100K aylık mesaj hacmi",
        reason: "Hacim temelli öneri",
      };
    }

    if (monthly === "1k-10k") {
      return {
        pkg: "Profesyonel Paket",
        desc: "1K-10K aylık mesaj hacmi",
        reason: "Hacim temelli öneri",
      };
    }

    // Professional features
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

    if (proFeatures.some(hasFeature)) {
      const chosen = proFeatures.filter(hasFeature).join(", ");
      return {
        pkg: "Profesyonel Paket",
        desc: "Gelişmiş işlevler seçildi",
        reason: `Seçilen: ${chosen}`,
      };
    }

    // Basic package for low volume
    if (agent === "1-2" && monthly === "0-1000") {
      return {
        pkg: "Basic Paket",
        desc: "Düşük hacim ve küçük ekip",
        reason: "0-1K mesaj & 1-2 temsilci",
      };
    }

    // Default recommendation
    return {
      pkg: "Basic Paket",
      desc: "Varsayılan öneri",
      reason: "Özellik/ölçek eşiklerine göre giriş seviye",
    };
  }

  // ============================================================================
  // STEP NAVIGATION
  // ============================================================================

  let currentStepIndex = 0;

  function getCurrentStepIds() {
    return stepGroups[currentStepIndex] || [];
  }

  function isSummaryStep() {
    return getCurrentStepIds().includes("summary");
  }

  function canProceedToNext() {
    const currentIds = getCurrentStepIds();
    return currentIds.every((id) => {
      const validator = stepValidation[id];
      return validator ? validator() : true;
    });
  }

  function showStep(stepIndex) {
    currentStepIndex = Math.max(0, Math.min(stepIndex, stepGroups.length - 1));

    // Hide all steps
    $$(".step").forEach((step) => step.classList.add("hidden"));

    // Show current step
    getCurrentStepIds().forEach((id) => {
      const stepElement = document.getElementById(`step-${id}`);
      if (stepElement) stepElement.classList.remove("hidden");
    });

    // Update navigation buttons
    updateNavigationButtons();
    updateProgressDisplay();
    focusFirstInput();
  }

  function updateNavigationButtons() {
    const lastBeforeSummary = stepGroups.length - 2;
    btnBack.disabled = currentStepIndex === 0;

    btnNext.textContent =
      currentStepIndex === lastBeforeSummary
        ? "Paket Öner"
        : isSummaryStep()
        ? "Bitti"
        : "Devam Et";

    // Show/hide contact button only on summary page
    const btnContact = document.getElementById("btnContact");
    if (btnContact) {
      btnContact.style.display = isSummaryStep() ? "inline-block" : "none";
    }
  }

  function updateProgressDisplay() {
    const totalSteps = stepGroups.length - 1;
    const currentStepNumber = Math.min(currentStepIndex + 1, totalSteps);
    const progressPercentage = Math.round(
      (currentStepNumber / totalSteps) * 100
    );

    const groupLabel = isSummaryStep()
      ? "Özet"
      : getCurrentStepIds()
          .map((id) => stepLabels[id])
          .join(" + ");

    stepLabel.textContent = `Adım ${currentStepNumber}/${totalSteps}: ${groupLabel}`;
    progressBar.style.width = `${progressPercentage}%`;
  }

  function focusFirstInput() {
    const firstInput = document.querySelector(
      getCurrentStepIds()
        .map(
          (id) =>
            `#step-${id} input, #step-${id} select, #step-${id} textarea, #step-${id} button`
        )
        .join(", ")
    );
    firstInput?.focus();
  }

  function goToNextStep() {
    if (!validateIdentityStep()) return;

    const lastBeforeSummary = stepGroups.length - 2;

    if (currentStepIndex === lastBeforeSummary) {
      const recommendation = getPackageRecommendation();
      buildSummary(recommendation);
      showStep(currentStepIndex + 1);
      return;
    }

    if (isSummaryStep()) return;

    if (!canProceedToNext()) {
      highlightInvalidFields();
      return;
    }

    showStep(currentStepIndex + 1);
  }

  function goToPreviousStep() {
    showStep(currentStepIndex - 1);
  }

  function highlightInvalidFields() {
    getCurrentStepIds().forEach((id) => {
      const section = document.getElementById(`step-${id}`);
      section
        ?.querySelectorAll("select[required], input[required]")
        .forEach((el) => {
          el.style.outline = el.value ? "" : "2px solid var(--warn)";
        });
    });
  }

  // ============================================================================
  // CUSTOMER TYPE MANAGEMENT
  // ============================================================================

  function initCustomerTypeTabs() {
    const tabs = document.querySelectorAll(".customer-type-tab");

    function updateTabVisualState(selectedValue) {
      tabs.forEach((tab) => {
        const tabValue = tab.dataset.value;
        const radio = tab.querySelector('input[type="radio"]');
        const isSelected = tabValue === selectedValue;

        tab.classList.toggle("selected", isSelected);
        radio.checked = isSelected;
      });
    }

    function toggleFields(customerType) {
      const isBireysel = customerType === "bireysel";
      bireyselFields.style.display = isBireysel ? "grid" : "none";
      kurumsalFields.style.display = isBireysel ? "none" : "grid";
    }

    function selectTab(value) {
      customerType.value = value;
      updateTabVisualState(value);
      toggleFields(value);
      customerType.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function setupTabListeners() {
      tabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
          e.preventDefault();
          selectTab(tab.dataset.value);
        });

        tab.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectTab(tab.dataset.value);
          }
        });
      });

      document
        .querySelectorAll('input[name="customerTypeTab"]')
        .forEach((radio) => {
          radio.addEventListener("change", (e) => {
            if (e.target.checked) selectTab(e.target.value);
          });
        });
    }

    setupTabListeners();
    selectTab(customerType.value);
  }

  // ============================================================================
  // PILL BAR SLIDERS
  // ============================================================================

  function createPillBar(selectElement, config) {
    if (!selectElement) return;

    selectElement.style.display = "none";
    const container = selectElement.parentElement;

    const wrap = document.createElement("div");
    wrap.className = config.wrapClass;

    const ticks = document.createElement("div");
    ticks.className = config.ticksClass;

    const range = document.createElement("div");
    range.className = config.rangeClass;

    const fill = document.createElement("div");
    fill.className = config.fillClass;
    range.appendChild(fill);

    // Create tick labels
    const tickPositions = config.segments.map(
      (_, i) => ((i + 1) / config.segments.length) * 100
    );
    ticks.innerHTML = config.segments
      .map((segment, i) => {
        const isLast = i === config.segments.length - 1;
        const endClass = isLast ? "end" : "";
        return `<span class="${config.tickClass} ${endClass}" style="left:${tickPositions[i]}%">${segment.label}</span>`;
      })
      .join("");

    // Create segment buttons
    const segmentButtons = [];
    config.segments.forEach((segment, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = config.segmentClass;
      button.dataset.value = segment.value;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", "false");
      button.tabIndex = 0;

      button.addEventListener("click", () => selectSegment(segment.value));
      button.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = Math.min(index + 1, config.segments.length - 1);
          selectSegment(config.segments[nextIndex].value, true);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex = Math.max(index - 1, 0);
          selectSegment(config.segments[prevIndex].value, true);
        }
      });

      range.appendChild(button);
      segmentButtons.push(button);
    });

    function selectSegment(value, focus = false) {
      selectElement.value = value;
      const selectedIndex = config.segments.findIndex((s) => s.value === value);
      const percentage =
        selectedIndex >= 0
          ? ((selectedIndex + 1) / config.segments.length) * 100
          : 0;

      fill.style.width = `${percentage}%`;

      segmentButtons.forEach((btn, i) => {
        btn.setAttribute(
          "aria-checked",
          i === selectedIndex ? "true" : "false"
        );
      });

      if (focus && selectedIndex >= 0) {
        segmentButtons[selectedIndex].focus();
      }
    }

    wrap.appendChild(ticks);
    wrap.appendChild(range);
    container.appendChild(wrap);

    // Initialize with current value
    selectSegment(selectElement.value || config.segments[0].value);
  }

  function initMonthlyMessagesSlider() {
    createPillBar(monthlyMessages, {
      wrapClass: "mm-wrap",
      ticksClass: "mm-ticks",
      rangeClass: "mm-range",
      fillClass: "mm-fill",
      segmentClass: "mm-seg",
      tickClass: "mm-tick",
      segments: [
        { value: "0-1000", label: "1.000" },
        { value: "1000-10000", label: "10.000" },
        { value: "10k-100k", label: "100.000" },
        { value: "100k+", label: "100.000+" },
      ],
    });
  }

  function initAgentCountSlider() {
    createPillBar(temsilciCount, {
      wrapClass: "ac-wrap",
      ticksClass: "ac-ticks",
      rangeClass: "ac-range",
      fillClass: "ac-fill",
      segmentClass: "ac-seg",
      tickClass: "ac-tick",
      segments: [
        { value: "1-2", label: "2" },
        { value: "3-10", label: "10" },
        { value: "11-100", label: "100" },
        { value: "100+", label: "100+" },
      ],
    });
  }

  // ============================================================================
  // SUMMARY & EXPORT
  // ============================================================================

  function buildSummary(recommendation) {
    const formData = new FormData(form);
    const features = $$('input[name="features[]"]:checked').map(
      (cb) => cb.dataset.label
    );

    const payload = {
      customerType: capitalizeFirstTR(formData.get("customerType")),
      fullName: titleCaseTR(formData.get("fullName")),
      companyName: titleCaseTR(formData.get("companyName")),
      monthlyMessages: formData.get("monthlyMessages"),
      temsilciCount: formData.get("temsilciCount"),
      features,
    };

    const rec = recommendation || {
      pkg: "Ücretsiz Paket",
      desc: "(varsayılan)",
      reason: "—",
    };

    const summaryParts = [
      `<div><strong>Başvuru Tipi:</strong> ${escapeHtml(
        payload.customerType
      )}</div>`,
      payload.fullName
        ? `<div><strong>İsim:</strong> ${escapeHtml(payload.fullName)}</div>`
        : "",
      payload.companyName
        ? `<div><strong>Şirket:</strong> ${escapeHtml(
            payload.companyName
          )}</div>`
        : "",
      `<div><strong>Aylık Mesaj:</strong> ${escapeHtml(
        payload.monthlyMessages || "—"
      )}</div>`,
      `<div><strong>Temsilci:</strong> ${escapeHtml(
        payload.temsilciCount || "—"
      )}</div>`,
      '<div style="margin-top:8px"><strong>Seçilen Özellikler:</strong></div>',
      features.length
        ? '<ul style="margin:6px 0 10px 20px">' +
          features.map((f) => `<li>${escapeHtml(f)}</li>`).join("") +
          "</ul>"
        : '<div style="color:var(--muted)">(yok)</div>',
      '<hr style="border:none;border-top:1px dashed var(--border);margin:10px 0" />',
      `<div><strong>Önerilen Paket:</strong> ${escapeHtml(rec.pkg)}</div>`,
      `<div><strong>Açıklama:</strong> ${escapeHtml(rec.desc)}</div>`,
      `<div><strong>Gerekçe:</strong> ${escapeHtml(rec.reason)}</div>`,
    ];

    const summaryElement = document.getElementById("summaryText");
    summaryElement.classList.add("as-html");
    summaryElement.style.whiteSpace = "normal";
    summaryElement.innerHTML = summaryParts.filter(Boolean).join("\n");
  }

  function escapeHtml(text) {
    return String(text ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[char])
    );
  }

  function capitalizeFirstTR(text) {
    if (!text) return undefined;
    text = String(text).trim();
    if (!text) return undefined;
    return text.charAt(0).toLocaleUpperCase("tr-TR") + text.slice(1);
  }

  function titleCaseTR(text) {
    if (!text) return undefined;
    return String(text)
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
      .join(" ");
  }

  function downloadFile(filename, content, type = "text/plain") {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function setupExportButtons() {
    document.getElementById("copyBtn")?.addEventListener("click", () => {
      const text = document.getElementById("summaryText").textContent || "";
      navigator.clipboard?.writeText(text);
    });

    document.getElementById("jsonBtn")?.addEventListener("click", () => {
      const data = collectFormData();
      downloadFile(
        "ccpilot-summary.json",
        JSON.stringify(data, null, 2),
        "application/json"
      );
    });

    document.getElementById("csvBtn")?.addEventListener("click", () => {
      const data = collectFormData();
      const csvRows = [
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
      const csv = csvRows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      downloadFile("ccpilot-summary.csv", csv, "text/csv");
    });

    document.getElementById("shareBtn")?.addEventListener("click", () => {
      const data = collectFormData();
      const url = new URL(location.href);
      url.hash =
        "d=" + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      navigator.clipboard?.writeText(url.toString());
      alert("Bağlantı kopyalandı.");
    });
  }

  function collectFormData() {
    const formData = new FormData(form);
    const features = $$('input[name="features[]"]:checked').map(
      (cb) => cb.dataset.label
    );

    return {
      customerType: capitalizeFirstTR(formData.get("customerType")),
      fullName: titleCaseTR(formData.get("fullName")),
      companyName: titleCaseTR(formData.get("companyName")),
      monthlyMessages: formData.get("monthlyMessages"),
      temsilciCount: formData.get("temsilciCount"),
      features,
    };
  }

  // ============================================================================
  // INTERNATIONAL TELEPHONE INPUT
  // ============================================================================

  const COUNTRIES = [
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

  function getFlagEmoji(iso2) {
    return [...iso2.toUpperCase()]
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  }

  function extractDigits(text) {
    return String(text || "").replace(/\D+/g, "");
  }

  function initInternationalPhone(inputId, defaultCountry = "TR") {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Wrap input
    const wrap = document.createElement("div");
    wrap.className = "tel-wrap";
    input.parentElement.insertBefore(wrap, input);
    wrap.appendChild(input);

    // Hidden fields for dial code and full number
    const dialInput = document.createElement("input");
    dialInput.type = "hidden";
    dialInput.name = input.name + "_dial";

    const fullInput = document.createElement("input");
    fullInput.type = "hidden";
    fullInput.name = input.name + "_full";

    wrap.appendChild(dialInput);
    wrap.appendChild(fullInput);

    // Country selector button
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tel-cc-btn";

    const flagSpan = document.createElement("span");
    flagSpan.className = "flag";

    const codeSpan = document.createElement("span");
    codeSpan.className = "code";

    button.append(flagSpan, codeSpan);
    wrap.insertBefore(button, input);

    // Dropdown list
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

    function renderCountries(filter = "") {
      const searchTerm = filter.trim().toLowerCase();
      items.innerHTML = "";

      COUNTRIES.filter(
        (country) =>
          !searchTerm ||
          country.name.toLowerCase().includes(searchTerm) ||
          country.iso.toLowerCase().includes(searchTerm) ||
          ("+" + country.dial).includes(searchTerm)
      ).forEach((country) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "tel-item";
        item.innerHTML = `
            <span class="left">
              <span class="flag">${getFlagEmoji(country.iso)}</span>
              <span class="name">${country.name}</span>
            </span>
            <span class="dial">+${country.dial}</span>
          `;

        item.addEventListener("click", () => {
          selectCountry(country);
          closeDropdown();
        });

        items.appendChild(item);
      });
    }

    function openDropdown() {
      list.classList.add("open");
      search.focus();
    }

    function closeDropdown() {
      list.classList.remove("open");
    }

    function selectCountry(country) {
      flagSpan.textContent = getFlagEmoji(country.iso);
      codeSpan.textContent = `+${country.dial}`;
      dialInput.value = country.dial;
      updateFullNumber();
    }

    function updateFullNumber() {
      const e164 = "+" + (dialInput.value || "") + extractDigits(input.value);
      fullInput.value = e164;
    }

    // Event listeners
    button.addEventListener("click", (e) => {
      e.preventDefault();
      list.classList.toggle("open");
      if (list.classList.contains("open")) search.focus();
    });

    search.addEventListener("input", () => renderCountries(search.value));
    input.addEventListener("input", updateFullNumber);

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) closeDropdown();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });

    // Initialize
    renderCountries();
    const defaultCountryData =
      COUNTRIES.find((c) => c.iso === defaultCountry) || COUNTRIES[0];
    selectCountry(defaultCountryData);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function setupEventListeners() {
    btnNext.addEventListener("click", goToNextStep);
    btnBack.addEventListener("click", goToPreviousStep);

    // Modal functionality - simplified approach
    function setupModal() {
      const btnContact = document.getElementById("btnContact");
      const contactModal = document.getElementById("contactModal");
      const closeContactModal = document.getElementById("closeContactModal");

      if (!btnContact || !contactModal || !closeContactModal) {
        console.warn("Modal elements not found");
        return;
      }

      // Open modal
      btnContact.addEventListener("click", (e) => {
        e.preventDefault();
        contactModal.classList.remove("hidden");
      });

      // Close modal with Tamam button
      closeContactModal.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        contactModal.classList.add("hidden");
      });

      // Close modal when clicking outside
      contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) {
          contactModal.classList.add("hidden");
        }
      });

      // Prevent modal content clicks from closing the modal
      const modalContent = contactModal.querySelector(".modal-content");
      if (modalContent) {
        modalContent.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      }
    }

    // Setup modal
    setupModal();

    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !["TEXTAREA"].includes(e.target.tagName)) {
        e.preventDefault();
        if (e.shiftKey) goToPreviousStep();
        else goToNextStep();
      }
    });

    // Global Escape key handler for modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("contactModal");
        if (modal && !modal.classList.contains("hidden")) {
          modal.classList.add("hidden");
        }
      }
    });

    // Email validation on blur
    ["email", "emailCorp"].forEach((id) => {
      const element = document.getElementById(id);
      element?.addEventListener("blur", (e) => validateEmail(e.target));
    });

    // Phone validation on blur
    ["phoneBireysel", "phone"].forEach((id) => {
      const element = document.getElementById(id);
      element?.addEventListener("blur", (e) => validatePhone(e.target));
    });
  }

  function initializeApp() {
    // Initialize all components
    initializeFeatureGroups();
    setupFeatureCardEvents();
    initCustomerTypeTabs();
    initMonthlyMessagesSlider();
    initAgentCountSlider();
    initInternationalPhone("phoneBireysel", "TR");
    initInternationalPhone("phone", "TR");
    setupExportButtons();
    setupEventListeners();

    // Show first step
    showStep(0);
  }

  // Start the application when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
