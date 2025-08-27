// --------------------------- script.js (v3 – Grup adımları + paket öneri + okunaklı özet) ---------------------------
(()=>{
  const form = document.getElementById('featureForm');
  const monthlyMessages = document.getElementById('monthlyMessages');
  const temsilciCount   = document.getElementById('temsilciCount');

  // Tekil adımlar yerine, bir adımda birden fazla bölüm gösterecek şekilde grupladık:
  // 1) kimlik
  // 2) trafik
  // 3) kanal
  // 4) sohbet
  // 5) ziyaret + crm
  // 6) ai + marketing
  // 7) operasyon + dev + security   ← burada "Paket Öner" tetiklenir
  // 8) summary
  const stepGroups = [
    ['kimlik'],
    ['trafik'],
    ['kanal'],
    ['sohbet'],
    ['ziyaret', 'crm'],
    ['ai', 'marketing'],
    ['operasyon', 'dev', 'security'],
    ['summary']
  ];

  const labels = {
    kimlik:'Bilgiler',
    trafik:'Trafik',
    kanal:'Kanallar',
    sohbet:'Sohbet',
    ziyaret:'Ziyaretçi',
    ai:'Yapay Zeka',
    marketing:'Pazarlama',
    operasyon:'Operasyon',
    crm:'CRM',
    dev:'Geliştirici',
    security:'Güvenlik',
    summary:'Özet'
  };

  const stateKey = 'ccpilot_wizard_v1';
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const btnBack     = $('#btnBack');
  const btnNext     = $('#btnNext');
  const stepLabel   = $('#stepLabel');
  const progressBar = $('#progressBar');

  const customerType   = $('#customerType');
  const bireyselFields = $('#bireyselFields');
  const kurumsalFields = $('#kurumsalFields');

  // ---- Dinamik özellik listeleri (placeholder) ----
  const RAW_GROUPS = {
    kanal: [
      'Facebook, Instagram, Viber, Telegram Entegrasyonları',
      'Whatsapp Entegrasyonu (Ek olarak ücretlendirilmektedir)',
      'Apple Business Chat',
      "Facebook, Instagram ve Telegram'da Sesli Mesajlar"
    ],
    mobil: [
      'Mobil Uygulama SDK','Telefon+ Modülü','Görüntülü Görüşme Modülü'
    ],
    pencere: [
      'Sohbet öncesi butonlar','Dosya gönderme-alma',
      'Mobil cihazlara uygun sohbet penceresi','Gönderim sonrası yanıt düzenleme'
    ],
    agent: [
      'Yazım denetimi','Taslak cevaplar','Çoklu temsilcili sohbetler','Temsilci atama'
    ],
    ziyaret: [
      'Ziyaretçi ısı haritası','Kaynak/utm takibi','Akıllı yönlendirme',
      'Canlı ziyaretçi takibi ve sitedeki ziyaretçiye manuel mesaj gönderme'
    ],
    ai: ['Soru-cevap botu','Özet çıkarma','Duygu analizi'],
    marketing: ['Kampanya tetikleyici','E-posta entegrasyonu','Raporlama API'],
    operasyon: ['Vardiya planlama','Yetkilendirme','Onay akışları'],
    crm: ['Müşteri profili','Sipariş senkronizasyonu','Fatura entegrasyonu',"Excel'e veri dökümü alma"],
    dev: ['REST API','Webhook','SDK'],
    security: ['IP kısıtlama','2FA','KVKK uyumu']
  };

  function slugify(s){
    return s.toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g,'')   // diakritik temizliği (güvenli aralık)
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'');
  }
  function renderGroup(containerId, arr){
    const el = document.getElementById(containerId);
    if(!el) return;
    el.innerHTML = arr.map(txt=>{
      const v = slugify(txt);
      return `<label class="card" style="display:flex;align-items:center;gap:8px"><input type="checkbox" name="features[]" value="${v}" data-label="${txt}"/> ${txt}</label>`;
    }).join('');
  }

  // Map containers
  renderGroup('grp-kanal',     RAW_GROUPS.kanal);
  renderGroup('grp-mobil',     RAW_GROUPS.mobil);
  renderGroup('grp-pencere',   RAW_GROUPS.pencere);
  renderGroup('grp-agent',     RAW_GROUPS.agent);
  renderGroup('grp-ziyaret',   RAW_GROUPS.ziyaret);
  renderGroup('grp-ai',        RAW_GROUPS.ai);
  renderGroup('grp-marketing', RAW_GROUPS.marketing);
  renderGroup('grp-operasyon', RAW_GROUPS.operasyon);
  renderGroup('grp-crm',       RAW_GROUPS.crm);
  renderGroup('grp-dev',       RAW_GROUPS.dev);
  renderGroup('grp-security',  RAW_GROUPS.security);

  // ---------- Aylık Mesaj (Segmentli Bar) ----------
// ---------- Aylık Mesaj (Segmentli Bar) ----------
  (function injectMonthlyCSS(){
    // eski stili kaldırıp yenisini takalım
    const old = document.getElementById('mm-style'); 
    if (old) old.remove();

    const css = `
    .mm-wrap{ margin-top:8px; position:relative; padding-top:22px; }
    .mm-range{ position:relative; display:grid; grid-template-columns:repeat(4,1fr);
              border:1.5px solid var(--border); border-radius:16px; overflow:hidden; background:#0d1017; }
    /* Kesintisiz yeşil dolgu katmanı */
    .mm-fill{ position:absolute; left:0; top:0; bottom:0; width:0%;
              background:linear-gradient(180deg, rgba(34,197,94,.45), rgba(34,197,94,.28));
              border-radius:inherit; pointer-events:none; transition:width .18s ease; }

    .mm-seg{ position:relative; padding:18px 0; text-align:center; cursor:pointer; user-select:none;
            border-right:1px solid var(--border); outline:0; background:transparent; }
    .mm-seg:last-child{ border-right:0; }
    /* önceki sürümdeki yeşil çerçeveyi kaldırıyoruz */
    .mm-seg.active{ box-shadow:none; background:transparent; }
    .mm-seg:focus-visible{ box-shadow: inset 0 0 0 2px var(--brand); }

    /* Çizgi üstündeki etiketler */
    .mm-ticks{ position:absolute; top:0; left:0; width:100%; height:0; pointer-events:none; }
    .mm-tick{ position:absolute; top:-18px; font-size:12px; color:var(--muted); white-space:nowrap; transform:translateX(-50%); }
    .mm-tick.end{ transform:translateX(-100%); } /* 100.000+ sağ çizgi üstü */
    `;
    const s = document.createElement('style'); s.id='mm-style'; s.textContent = css;
    document.head.appendChild(s);
  })();

  function initMonthlyMessagesSlider(){
    if(!monthlyMessages) return;

    monthlyMessages.style.display = 'none';
    const container = monthlyMessages.parentElement;

    const wrap  = document.createElement('div');  wrap.className = 'mm-wrap';
    const ticks = document.createElement('div');  ticks.className = 'mm-ticks';
    const range = document.createElement('div');  range.className = 'mm-range';

    // Kesintisiz dolgu
    const fill  = document.createElement('div');  fill.className = 'mm-fill';
    range.appendChild(fill); // önce doldurma katmanını ekliyoruz

    const segs = [
      { value:'0-1000',     label:'1.000'    },
      { value:'1000-10000', label:'10.000'   },
      { value:'10k-100k',   label:'100.000'  },
      { value:'100k+',      label:'100.000+' }
    ];

    // Etiketleri çizgi üstlerine yerleştir
    const tickPos = [25, 50, 75, 100];
    ticks.innerHTML = segs.map((s,i)=>(
      `<span class="mm-tick ${i===segs.length-1?'end':''}" style="left:${tickPos[i]}%">${s.label}</span>`
    )).join('');

    // Segment butonları
    const segButtons = [];
    segs.forEach((s, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mm-seg';
      b.dataset.value = s.value;
      b.setAttribute('role','radio');
      b.setAttribute('aria-checked','false');
      b.tabIndex = 0;

      b.addEventListener('click', () => selectSeg(s.value));
      b.addEventListener('keydown', (e) => {
        if(e.key==='ArrowRight' || e.key==='ArrowDown'){
          e.preventDefault(); selectSeg(segs[Math.min(idx+1, segs.length-1)].value, true);
        }
        if(e.key==='ArrowLeft' || e.key==='ArrowUp'){
          e.preventDefault(); selectSeg(segs[Math.max(idx-1, 0)].value, true);
        }
      });

      range.appendChild(b);
      segButtons.push(b);
    });

    wrap.appendChild(ticks);
    wrap.appendChild(range);
    container.appendChild(wrap);

    function normalizeMonthly(val){
      // Eski değerlerle uyumluluk
      if(val==='100k-1m' || val==='1m+' || val==='100k+') return '100k+';
      return val;
    }

    function selectSeg(value, focus=false){
      const normalized = normalizeMonthly(value);
      monthlyMessages.value = normalized;

      const selIndex = segs.findIndex(x => x.value === normalized);

      // Dolgu genişliği: (seçili index +1) / 4
      const pct = selIndex >= 0 ? ((selIndex+1)/segs.length)*100 : 0;
      fill.style.width = pct + '%';

      // ARIA durumu (sadece seçili true)
      segButtons.forEach((btn,i)=>{
        btn.classList.toggle('active', i <= selIndex && selIndex !== -1); // sadece erişilebilirlik için
        btn.setAttribute('aria-checked', (i===selIndex) ? 'true' : 'false');
      });

      if (focus && selIndex >= 0) segButtons[selIndex].focus();
    }

    // İlk yükleme
    selectSeg(normalizeMonthly(monthlyMessages.value || ''));
  }


  // ---- Zorunluluklar (kimlik, trafik) ----
  function isKimlikValid(){
    const type = customerType.value;
    if(type==='bireysel') return !!$('#fullName')?.value.trim();
    if(type==='kurumsal') return !!$('#companyName')?.value.trim();
    return true;
  }
  function isTrafikValid(){
    return !!$('#monthlyMessages')?.value && !!$('#temsilciCount')?.value;
  }

  // ---- Paket önerme (uploaded algoritmadan uyarlanmış) ----
  function getPackageSuggestion(){
    const data = new FormData(form);
    const monthlyMessages = String(data.get('monthlyMessages')||'');
    const agentCount      = String(data.get('temsilciCount')||'');
    const has = (label)=> !!$$('input[name="features[]"]').find(cb=>cb.dataset.label===label && cb.checked);

    // 1) Kurumsal özellikler
    const enterpriseFeatures = ['Mobil Uygulama SDK','Sohbet yönlendirme','Görüntülü Görüşme Modülü'];
    if(enterpriseFeatures.some(has)){
      const chosen = enterpriseFeatures.filter(has).join(', ');
      return { pkg:'Kurumsal Paket', desc:'Kurumsal özellikler seçildiği için', reason:`Seçilen kurumsal özellik(ler): ${chosen}` };
    }

    // 2) Hacim/Ekip eşiği
    if(['100k-1m','1m+'].includes(monthlyMessages) || agentCount==='20+'){
      return { pkg:'Kurumsal Paket', desc:'Yüksek trafik/ekip hacmi', reason:'100K+ mesaj veya 20+ temsilci' };
    }

    // 3) Premium: 10K-100K
    if(monthlyMessages==='10k-100k'){
      return { pkg:'Premium Paket', desc:'10K-100K aylık mesaj hacmi', reason:'Hacim temelli öneri' };
    }

    // 4) Premium özellikleri
    const premiumFeatures = ['Whatsapp Entegrasyonu (Ek olarak ücretlendirilmektedir)', "Facebook, Instagram ve Telegram'da Sesli Mesajlar"];
    if(premiumFeatures.some(has)){
      const chosen = premiumFeatures.filter(has).join(', ');
      return { pkg:'Premium Paket', desc:'Gelişmiş kanal özellikleri', reason:`Seçilen: ${chosen}` };
    }

    // 5) Pro özellikleri
    const proFeatures = [
      'Sohbet öncesi butonlar','Dosya gönderme-alma','Canlı ziyaretçi takibi ve sitedeki ziyaretçiye manuel mesaj gönderme',
      "Excel'e veri dökümü alma",'Müşteri profili','Kampanya tetikleyici','Raporlama API'
    ];
    if(proFeatures.some(has)){
      const chosen = proFeatures.filter(has).join(', ');
      return { pkg:'Profesyonel Paket', desc:'Gelişmiş işlevler seçildi', reason:`Seçilen: ${chosen}` };
    }

    // 6) Ücretsiz: düşük hacim + küçük ekip
    if(agentCount==='1-2' && monthlyMessages==='0-1000'){
      return { pkg:'Ücretsiz Paket', desc:'Düşük hacim ve küçük ekip', reason:'0-1K mesaj & 1-2 temsilci' };
    }

    // 7) Varsayılan
    return { pkg:'Profesyonel Paket', desc:'Varsayılan öneri', reason:'Özellik/ölçek eşiklerine göre orta seviye' };
  }

  // ---- Adım makinesi ----
  let idx = 0;

  function getCurrentIds(){ return stepGroups[idx] || []; }
  function isSummary(){ return getCurrentIds().includes('summary'); }

  function showStep(i){
    idx = Math.max(0, Math.min(i, stepGroups.length-1));
    // tüm step section'ları gizle
    $$('.step').forEach(s=>s.classList.add('hidden'));
    // bu adımda görünmesi gerekenleri aç
    getCurrentIds().forEach(id=>{
      const el = document.getElementById(`step-${id}`);
      if(el) el.classList.remove('hidden');
    });

    // buton metinleri
    const lastBeforeSummary = stepGroups.length-2;
    btnBack.disabled = idx===0;
    btnNext.textContent = idx===lastBeforeSummary ? 'Paket Öner' : (isSummary() ? 'Bitti' : 'Devam Et');

    // başlık ve ilerleme
    const totalCount = stepGroups.length-1; // summary hariç
    const shownIndex = Math.min(idx+1, totalCount);
    const groupLabel = getCurrentIds().includes('summary')
      ? 'Özet'
      : getCurrentIds().map(id=>labels[id]).join(' + ');
    stepLabel.textContent = `Adım ${Math.min(shownIndex,totalCount)}/${totalCount}: ${groupLabel}`;
    const pct = Math.round((Math.min(idx,totalCount-1)+1)/totalCount*100);
    progressBar.style.width = pct+'%';

    // odak
    const first = document.querySelector(getCurrentIds().map(id=>`#step-${id} input, #step-${id} select, #step-${id} textarea, #step-${id} button`).join(', '));
    first?.focus();
  }

  function canProceed(){
    const ids = getCurrentIds();
    if(ids.includes('kimlik') && !isKimlikValid()) return false;
    if(ids.includes('trafik') && !isTrafikValid()) return false;
    return true;
  }

  btnNext.addEventListener('click',()=>{
    const lastBeforeSummary = stepGroups.length-2;

    if(idx===lastBeforeSummary){
      const rec = getPackageSuggestion();
      localStorage.setItem(stateKey+':pkg', JSON.stringify(rec));
      buildSummary(rec);
      showStep(idx+1);
      return;
    }

    if(isSummary()) return;

    if(!canProceed()){
      // basit vurgulu doğrulama
      getCurrentIds().forEach(id=>{
        const section = document.getElementById(`step-${id}`);
        section?.querySelectorAll('select[required], input[required]').forEach(el=>{
          if(!el.value) el.style.outline='2px solid var(--warn)'; else el.style.outline='';
        });
      });
      return;
    }

    persist();
    showStep(idx+1);
  });

  btnBack.addEventListener('click',()=> showStep(idx-1));

  // Enter = ileri, Shift+Enter = geri
  form.addEventListener('keydown', (e)=>{
    if(e.key==='Enter' && !['TEXTAREA'].includes(e.target.tagName)){
      e.preventDefault();
      if(e.shiftKey) btnBack.click(); else btnNext.click();
    }
  });

  // Bireysel/kurumsal alanlarını değiştir
  customerType.addEventListener('change', ()=>{
    const isBireysel = customerType.value==='bireysel';
    bireyselFields.style.display = isBireysel? 'grid':'none';
    kurumsalFields.style.display = isBireysel? 'none':'grid';
  });

  // ---- Özet / dışa aktar ----
  function buildSummary(rec){
    const data = new FormData(form);
    const features = $$('input[name="features[]"]:checked').map(cb => cb.dataset.label);

    const payload = {
      customerType: data.get('customerType'),
      fullName: data.get('fullName') || undefined,
      companyName: data.get('companyName') || undefined,
      monthlyMessages: data.get('monthlyMessages'),
      temsilciCount: data.get('temsilciCount'),
      features
    };

    const recommendation =
      rec ||
      JSON.parse(localStorage.getItem(stateKey + ':pkg') || 'null') ||
      { pkg: 'Ücretsiz Paket', desc: '(varsayılan)', reason: '—' };

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const parts = [];
    parts.push(`<div><strong>Başvuru Tipi:</strong> ${esc(payload.customerType)}</div>`);
    if (payload.fullName) parts.push(`<div><strong>İsim:</strong> ${esc(payload.fullName)}</div>`);
    if (payload.companyName) parts.push(`<div><strong>Şirket:</strong> ${esc(payload.companyName)}</div>`);
    parts.push(`<div><strong>Aylık Mesaj:</strong> ${esc(payload.monthlyMessages || '—')}</div>`);
    parts.push(`<div><strong>Temsilci:</strong> ${esc(payload.temsilciCount || '—')}</div>`);

    parts.push('<div style="margin-top:8px"><strong>Seçilen Özellikler:</strong></div>');
    if (features.length) {
      parts.push('<ul style="margin:6px 0 10px 20px">' +
        features.map(f => `<li>${esc(f)}</li>`).join('') +
        '</ul>');
    } else {
      parts.push('<div style="color:var(--muted)">(yok)</div>');
    }

    parts.push('<hr style="border:none;border-top:1px dashed var(--border);margin:10px 0" />');
    parts.push(`<div><strong>Önerilen Paket:</strong> ${esc(recommendation.pkg)}</div>`);
    parts.push(`<div><strong>Açıklama:</strong> ${esc(recommendation.desc)}</div>`);
    parts.push(`<div><strong>Gerekçe:</strong> ${esc(recommendation.reason)}</div>`);

    const el = document.getElementById('summaryText');
    el.classList.add('as-html');
    el.style.whiteSpace = 'normal';
    el.innerHTML = parts.join('\n');
  }

  function download(filename, content, type='text/plain'){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([content],{type}));
    a.download=filename; a.click(); URL.revokeObjectURL(a.href);
  }
  $('#copyBtn')?.addEventListener('click',()=>{
    const txt = document.getElementById('summaryText').textContent || '';
    navigator.clipboard?.writeText(txt);
  });
  $('#jsonBtn')?.addEventListener('click',()=>{
    const data = collect();
    download('ccpilot-summary.json', JSON.stringify(data,null,2), 'application/json');
  });
  $('#csvBtn')?.addEventListener('click',()=>{
    const data = collect();
    const rows = [
      ['customerType','fullName','companyName','monthlyMessages','temsilciCount','features'],
      [data.customerType||'',data.fullName||'',data.companyName||'',data.monthlyMessages||'',data.temsilciCount||'',(data.features||[]).join(';')]
    ];
    const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'); // satır sonu eklendi
    download('ccpilot-summary.csv', csv, 'text/csv');
  });
  $('#shareBtn')?.addEventListener('click',()=>{
    const data = collect();
    const url = new URL(location.href);
    url.hash = 'd=' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    navigator.clipboard?.writeText(url.toString());
    alert('Bağlantı kopyalandı.');
  });

  function collect(){
    const data = new FormData(form);
    const features = $$('input[name="features[]"]:checked').map(cb=>cb.dataset.label);
    return {
      customerType: data.get('customerType'),
      fullName: data.get('fullName'),
      companyName: data.get('companyName'),
      monthlyMessages: data.get('monthlyMessages'),
      temsilciCount: data.get('temsilciCount'),
      features
    };
  }

  // ---- Kalıcılık ----
  function persist(){ localStorage.setItem(stateKey, JSON.stringify(collect())); }
  function restore(){
    try{
      const saved = JSON.parse(localStorage.getItem(stateKey)||'null');
      if(!saved) return;
      Object.entries(saved).forEach(([k,v])=>{
        const el = form.elements.namedItem(k);
        if(!el) return;
        if(el instanceof RadioNodeList || (el.length && el[0]?.type==='radio')) return;
        if(Array.isArray(el)) return;
        if(el.type==='checkbox') el.checked = !!v; else el.value = v ?? '';
      });
      const features = saved.features||[];
      $$('input[name="features[]"]').forEach(cb=>{cb.checked = features.includes(cb.dataset.label)});
    }catch(_){/* noop */}
  }

  // Paylaşım linkinden yükleme
  (function importFromHash(){
    try{
      const m = location.hash.match(/[#&]d=([^&]+)/);
      if(!m) return;
      const json = decodeURIComponent(escape(atob(m[1])));
      localStorage.setItem(stateKey, json);
    }catch(_){/* noop */}
  })();
  initMonthlyMessagesSlider();
  restore();
  showStep(0);
})();
