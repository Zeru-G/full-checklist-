// ✅ GLOBAL: Clear image uploads
function clearImageUploads() {
    const ids = ['beforePreview', 'afterPreview', 'editBeforePreview', 'editAfterPreview'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    ['imgBefore', 'imgAfter', 'editImgBefore', 'editImgAfter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // ===== Core UI Elements =====
    const themeToggle = document.getElementById('themeToggle');
    const resetBtn = document.getElementById('resetBtn');
    const logTradeBtn = document.getElementById('logTradeBtn');
    const viewJournalBtn = document.getElementById('viewJournalBtn');
    const calcBtn = document.getElementById('calcBtn');
    const body = document.body;
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // ===== Helper: Toggle body scroll lock =====
    function toggleBodyScroll(lock = true) {
        if (lock) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            const scrollY = parseInt(document.body.style.top || '0') * -1;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, scrollY);
        }
    }

    // ===== Theme Handling =====
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    }

    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        body.classList.toggle('dark-theme');
        const isLight = body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // ===== Reset =====
    function resetChecklist() {
        const card = document.querySelector('.card');
        if (!card) return;

        card.style.opacity = '0.6';
        card.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            checkboxes.forEach(cb => cb.checked = false);
            calculateTotals();
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 150);
    }

    resetBtn?.addEventListener('click', resetChecklist);

    // ===== Checklist Scoring =====
    checkboxes.forEach(cb => {
        cb.addEventListener('change', calculateTotals);
    });

    // Initial blank state
    const gradeEl = document.getElementById('grade-display');
    if (gradeEl) {
        gradeEl.textContent = '—';
        gradeEl.className = 'grade-display';
    }

    // ===== Scroll-Reactive Buttons =====
    const fixedActions = document.querySelector('.fixed-actions');
    let lastScrollY = window.scrollY;
    let ticking = false;
    const scrollThreshold = 20;
    let hideTimeout = null;

    const updateButtonVisibility = () => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;
        const hasScrolledEnough = Math.abs(currentScrollY - lastScrollY) > 5;
        
        if (isScrollingDown && hasScrolledEnough && currentScrollY > scrollThreshold) {
            fixedActions?.classList.add('hidden');
        } else if (!isScrollingDown && hasScrolledEnough) {
            fixedActions?.classList.remove('hidden');
        } else if (currentScrollY <= scrollThreshold) {
            fixedActions?.classList.remove('hidden');
        }

        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (currentScrollY <= scrollThreshold || !isScrollingDown) {
                fixedActions?.classList.remove('hidden');
            }
        }, 2000);
        
        lastScrollY = currentScrollY;
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateButtonVisibility);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        lastScrollY = window.scrollY;
        fixedActions?.classList.remove('hidden');
    });

    if (window.scrollY > scrollThreshold) {
        fixedActions?.classList.add('hidden');
    }

    // ===== Symbol List =====
    const SYMBOLS = [
        { group: ' Forex Majors', list: ['AUDUSD', 'EURUSD', 'GBPUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY'] },
        { group: ' Forex Minors', list: ['AUDCAD', 'AUDCHF', 'AUDJPY', 'AUDNZD', 'CADCHF', 'CADJPY', 'CHFJPY', 'EURAUD', 'EURCAD', 'EURCHF', 'EURGBP', 'EURJPY', 'EURNZD', 'GBPAUD', 'GBPCAD', 'GBPJPY', 'GBPNZD', 'NZDCHF', 'NZDJPY'] },
        { group: ' Crypto', list: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'DOGEUSD', 'ADAUSD', 'DOTUSD', 'BNBUSD'] },
        { group: ' Commodities', list: ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NGAS', 'COPPER'] },
        { group: ' Indices', list: ['SPX500', 'NAS100', 'DJI30', 'GER40', 'UK100', 'JP225'] }
    ];

    // ✅ FIXED: Keyboard + Mouse Navigation — Works in All Modals
   // ✅ FIXED: Dropdown stays open on click, keyboard works, no flicker
function initSearchableSelect(searchId, dropdownId, hiddenId) {
    const searchInput = document.getElementById(searchId);
    const dropdown = document.getElementById(dropdownId);
    const hiddenInput = document.getElementById(hiddenId);

    if (!searchInput || !dropdown || !hiddenInput) return;

    // Prevent dropdown close on mousedown (critical fix)
    dropdown.addEventListener('mousedown', e => {
        e.preventDefault(); // Stops input blur on click
    });

    function renderDropdown(filter = '') {
        let html = '';
        SYMBOLS.forEach(group => {
            const filtered = group.list.filter(sym => 
                sym.toLowerCase().includes(filter.toLowerCase())
            );
            if (filtered.length > 0) {
                html += `<div class="select-option category">${group.group}</div>`;
                filtered.forEach(sym => {
                    html += `<div class="select-option" data-value="${sym}">${sym}</div>`;
                });
            }
        });
        dropdown.innerHTML = html || '<div class="select-option disabled">No matches</div>';
    }

    function openDropdown() {
        renderDropdown(searchInput.value);
        dropdown.classList.add('active');
        searchInput.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
        dropdown.classList.remove('active');
        searchInput.setAttribute('aria-expanded', 'false');
    }

    function selectOption(option) {
        if (option.classList.contains('disabled')) return;
        const value = option.dataset.value;
        searchInput.value = value;
        hiddenInput.value = value;
        closeDropdown();
        searchInput.focus();

        // Trigger pair-type detection (for calculator)
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // ===== Events =====
    searchInput.addEventListener('focus', openDropdown);

    // ✅ CRITICAL: Delayed blur close — only close if not clicking dropdown
    let isClosing = false;
    searchInput.addEventListener('blur', () => {
        isClosing = true;
        setTimeout(() => {
            if (isClosing) closeDropdown();
            isClosing = false;
        }, 200);
    });

    dropdown.addEventListener('mousedown', () => {
        isClosing = false; // Cancel pending close
    });

    searchInput.addEventListener('input', () => {
        searchInput.value = searchInput.value.toUpperCase();
        openDropdown();
    });

    searchInput.addEventListener('paste', e => {
        setTimeout(() => {
            searchInput.value = searchInput.value.toUpperCase();
            openDropdown();
        }, 10);
    });

    // Keyboard navigation (↑ ↓ ⏎)
    function handleKeydown(e) {
        const items = Array.from(dropdown.querySelectorAll('.select-option:not(.category):not(.disabled)'));
        const current = dropdown.querySelector('.select-option.selected');
        let index = items.indexOf(current);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            index = index === -1 ? 0 : Math.min(index + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            index = index === -1 ? items.length - 1 : Math.max(index - 1, 0);
                        } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (current) {
                        selectOption(current);
                        closeDropdown(); // ✅ Ensure dropdown closes
                    }
                    return;
                } else if (e.key === 'Escape') {
            e.preventDefault();
            closeDropdown();
            searchInput.focus();
            return;
        }

        // Update selection
        items.forEach(item => item.classList.remove('selected'));
        if (items[index]) {
            items[index].classList.add('selected');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    searchInput.addEventListener('keydown', handleKeydown);
    dropdown.addEventListener('keydown', handleKeydown);

    // Mouse
    dropdown.addEventListener('click', e => {
        const option = e.target.closest('.select-option:not(.category):not(.disabled)');
        if (option) selectOption(option);
    });

    dropdown.addEventListener('mouseover', e => {
        const option = e.target.closest('.select-option:not(.category):not(.disabled)');
        if (option) {
            dropdown.querySelectorAll('.select-option.selected').forEach(el => el.classList.remove('selected'));
            option.classList.add('selected');
        }
    });
}

    // ===== Modals =====
    const journalModal = document.getElementById('journalModal');
    const journalOverlay = document.getElementById('journalOverlay');
    const closeJournalModal = document.getElementById('closeJournalModal');
    const saveTradeBtn = document.getElementById('saveTradeBtn');

    const editModal = document.getElementById('editModal');
    const editOverlay = document.getElementById('editOverlay');
    const closeEditModal = document.getElementById('closeEditModal');
    const updateTradeBtn = document.getElementById('updateTradeBtn');

    const calcModal = document.getElementById('calcModal');
    const calcOverlay = document.getElementById('calcOverlay');
    const closeCalcModal = document.getElementById('closeCalcModal');

    const backToChecklist = document.getElementById('backToChecklist');
    const journalPage = document.getElementById('journalPage');

    // Initialize searchable selects
    initSearchableSelect('tradePairSearch', 'tradePairDropdown', 'tradePair');
    initSearchableSelect('editPairSearch', 'editPairDropdown', 'editPair');
    initSearchableSelect('calcPairSearch', 'calcPairDropdown', 'calcPair');

    // Set today
    const dateInput = document.getElementById('tradeDate');
    if (dateInput) dateInput.valueAsDate = new Date();

    // ===== Image Upload System =====
    function setupImageUpload(dropzoneId, inputId, previewId, containerId) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const container = document.getElementById(containerId);

        if (!dropzone || !input || !preview || !container) return;

        function resetUploadArea() {
            preview.innerHTML = '';
            dropzone.style.display = 'block';
            input.value = '';
        }

        dropzone.addEventListener('click', () => input.click());
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) handleImage(file, preview, container);
        });
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', e => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
                handleImage(file, preview, container);
            }
        });

        return { reset: resetUploadArea };
    }

    function handleImage(file, previewEl, containerEl) {
        if (!previewEl || !containerEl) return;
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '200px';
            img.style.borderRadius = '8px';
            img.style.marginTop = '12px';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove image';
            removeBtn.onclick = () => {
                previewEl.innerHTML = '';
                containerEl.querySelector('.image-dropzone').style.display = 'block';
                const input = containerEl.querySelector('input[type="file"]');
                if (input) input.value = '';
            };

            previewEl.innerHTML = '';
            previewEl.appendChild(img);
            previewEl.appendChild(removeBtn);
            containerEl.querySelector('.image-dropzone').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // Initialize image uploads
    const logBeforeUpload = setupImageUpload('beforeDropzone', 'imgBefore', 'beforePreview', 'beforeUploadContainer');
    const logAfterUpload = setupImageUpload('afterDropzone', 'imgAfter', 'afterPreview', 'afterUploadContainer');
    const editBeforeUpload = setupImageUpload('editBeforeDropzone', 'editImgBefore', 'editBeforePreview', 'editBeforeUploadContainer');
    const editAfterUpload = setupImageUpload('editAfterDropzone', 'editImgAfter', 'editAfterPreview', 'editAfterUploadContainer');

    // ===== Modal Open Handlers =====
    function openLogModal() {
        logBeforeUpload.reset();
        logAfterUpload.reset();
        document.getElementById('tradePairSearch').value = '';
        document.getElementById('tradePair').value = '';

        const currentGradeEl = document.getElementById('grade-display');
        const gradeInput = document.getElementById('tradeGrade');
        if (currentGradeEl && gradeInput) {
            const match = currentGradeEl.textContent.trim().match(/Grade:\s*([A-D]\+|F)/);
            gradeInput.value = match ? match[1] : '—';
        }

        journalOverlay.classList.add('active');
        journalModal.classList.add('active');
        toggleBodyScroll(true);
        document.getElementById('tradePairSearch')?.focus();
    }

    function openEditModal(id) {
        editBeforeUpload.reset();
        editAfterUpload.reset();

        const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        const trade = journal.find(t => t.id === id);
        if (!trade) return alert('Trade not found.');

        document.getElementById('editTradeId').value = trade.id;
        document.getElementById('editDate').value = trade.date;
        document.getElementById('editPair').value = trade.pair;
        document.getElementById('editPairSearch').value = trade.pair;
        document.getElementById('editDir').value = trade.dir;
        document.getElementById('editOutcome').value = trade.outcome;
        document.getElementById('editGrade').value = trade.grade || '';
        document.getElementById('editNotes').value = trade.notes || '';

        const createPreview = (previewId, imgSrc, containerId) => {
            const preview = document.getElementById(previewId);
            const container = document.getElementById(containerId);
            if (!preview || !imgSrc || !container) return;

            preview.innerHTML = `
                <img src="${imgSrc}" alt="Preview" style="max-width:100%;max-height:200px;border-radius:8px;margin-top:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <button class="remove-image-btn" title="Remove">&times;</button>
            `;
            preview.querySelector('.remove-image-btn').onclick = () => {
                preview.innerHTML = '';
                container.querySelector('.image-dropzone').style.display = 'block';
                const inputId = containerId.includes('Before') ? 'editImgBefore' : 'editImgAfter';
                document.getElementById(inputId).value = '';
            };
            container.querySelector('.image-dropzone').style.display = 'none';
        };

        createPreview('editBeforePreview', trade.imgBefore, 'editBeforeUploadContainer');
        createPreview('editAfterPreview', trade.imgAfter, 'editAfterUploadContainer');

        editOverlay.classList.add('active');
        editModal.classList.add('active');
        toggleBodyScroll(true);
        document.getElementById('editPairSearch')?.focus();
    }

    document.getElementById('gradeLogBtn')?.addEventListener('click', openLogModal);
    logTradeBtn?.addEventListener('click', openLogModal);
    window.editTrade = openEditModal;

    [journalOverlay, closeJournalModal].forEach(el => {
        el?.addEventListener('click', () => {
            journalOverlay.classList.remove('active');
            journalModal.classList.remove('active');
            toggleBodyScroll(false);
        });
    });
    [editOverlay, closeEditModal].forEach(el => {
        el?.addEventListener('click', () => {
            editOverlay.classList.remove('active');
            editModal.classList.remove('active');
            toggleBodyScroll(false);
        });
    });
    [calcOverlay, closeCalcModal].forEach(el => {
        el?.addEventListener('click', () => {
            calcOverlay.classList.remove('active');
            calcModal.classList.remove('active');
            toggleBodyScroll(false);
            document.getElementById('calcResult').style.display = 'none';
        });
    });

    calcBtn?.addEventListener('click', () => {
        calcOverlay.classList.add('active');
        calcModal.classList.add('active');
        toggleBodyScroll(true);
        document.getElementById('calcPairSearch')?.focus();
    });

    // ===== HYBRID Pip Value =====
    const CUSTOM_PIP_VALUES = { 'EURGBP': 13.00 };

    async function getPipValueLive(pair, asset) {
        if (asset !== 'forex') {
            if (asset === 'crypto') return pair.startsWith('BTC') ? 100.0 : pair.startsWith('ETH') ? 10.0 : 1.0;
            if (asset === 'commodities') return pair === 'XAUUSD' ? 100.0 : 10.0;
            return 10.0;
        }

        const p = pair.replace(/[/\s]/g, '').toUpperCase();
        if (CUSTOM_PIP_VALUES[p]) return CUSTOM_PIP_VALUES[p];

        const base = p.substring(0, 3);
        const quote = p.substring(3, 6);
        const pipSize = quote === 'JPY' ? 0.01 : 0.0001;
        const lotSize = 100000;

        try {
            if (quote === 'USD') return 10.0;
            if (base === 'USD') {
                const res = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${quote}`);
                const data = await res.json();
                const rate = data.rates[quote];
                return rate ? (pipSize * lotSize) / rate : 10.0;
            }
            const res = await fetch(`https://api.exchangerate.host/latest?base=${quote}&symbols=USD`);
            const data = await res.json();
            const quoteInUSD = data.rates.USD;
            return quoteInUSD ? (pipSize * lotSize) / quoteInUSD : 10.0;
        } catch (e) {
            return 10.0;
        }
    }

    // ===== Save & Update =====
    saveTradeBtn?.addEventListener('click', async () => {
        const date = document.getElementById('tradeDate')?.value;
        const pair = document.getElementById('tradePair')?.value.trim().toUpperCase();
        if (!date || !pair) return alert('⚠️ Please select date and pair.');

        const dir = document.getElementById('tradeDir')?.value;
        const outcome = document.getElementById('tradeOutcome')?.value;
        const notes = document.getElementById('tradeNotes')?.value.trim();
        const grade = document.getElementById('tradeGrade')?.value || '—';
        const beforeFile = document.getElementById('imgBefore')?.files[0];
        const afterFile = document.getElementById('imgAfter')?.files[0];

        const toBase64 = file => new Promise(res => {
            if (!file) return res(null);
            const reader = new FileReader();
            reader.onload = e => res(e.target.result);
            reader.readAsDataURL(file);
        });

        const imgBefore = await toBase64(beforeFile);
        const imgAfter = await toBase64(afterFile);

        const trade = {
            id: Date.now(),
            date, pair, dir, outcome, notes, imgBefore, imgAfter, grade,
            timestamp: new Date().toISOString()
        };

        const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        journal.push(trade);
        localStorage.setItem('tradeJournal', JSON.stringify(journal));

        journalOverlay.classList.remove('active');
        journalModal.classList.remove('active');
        toggleBodyScroll(false);

        const container = document.querySelector('.container');
        const journalPageEl = document.getElementById('journalPage');
        if (container) container.style.display = 'block';
        if (journalPageEl) journalPageEl.style.display = 'none';
    });

    updateTradeBtn?.addEventListener('click', async () => {
        const id = parseInt(document.getElementById('editTradeId')?.value);
        if (!id) return;

        let journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        const tradeIndex = journal.findIndex(t => t.id === id);
        if (tradeIndex === -1) return;

        const current = journal[tradeIndex];
        const date = document.getElementById('editDate')?.value;
        const pair = document.getElementById('editPair')?.value.trim().toUpperCase();
        if (!date || !pair) return alert('⚠️ Date and Pair are required.');

        const dir = document.getElementById('editDir')?.value;
        const outcome = document.getElementById('editOutcome')?.value;
        const grade = document.getElementById('editGrade')?.value.trim();
        const notes = document.getElementById('editNotes')?.value.trim();

        const beforeFile = document.getElementById('editImgBefore')?.files[0];
        const afterFile = document.getElementById('editImgAfter')?.files[0];

        const toBase64 = file => new Promise(res => {
            if (!file) return res(null);
            const reader = new FileReader();
            reader.onload = e => res(e.target.result);
            reader.readAsDataURL(file);
        });

        const imgBefore = beforeFile ? await toBase64(beforeFile) : current.imgBefore;
        const imgAfter = afterFile ? await toBase64(afterFile) : current.imgAfter;

        journal[tradeIndex] = { ...current, date, pair, dir, outcome, grade, notes, imgBefore, imgAfter };
        localStorage.setItem('tradeJournal', JSON.stringify(journal));

        editOverlay.classList.remove('active');
        editModal.classList.remove('active');
        toggleBodyScroll(false);

        if (journalPage && journalPage.style.display === 'block') showJournalPage();
    });

    // ===== Position Size Calculator =====
    const assetTypeSelect = document.getElementById('assetType');
    const calcPairSearch = document.getElementById('calcPairSearch');

    calcPairSearch?.addEventListener('input', () => {
        const p = calcPairSearch.value.trim().toUpperCase();
        if (p) {
            if (['BTC','ETH','SOL','XRP','DOGE'].some(c => p.startsWith(c))) {
                assetTypeSelect.value = 'crypto';
            } else if (['XAU','XAG','USOIL','UKOIL'].some(c => p.startsWith(c))) {
                assetTypeSelect.value = 'commodities';
            } else {
                assetTypeSelect.value = 'forex';
            }
        }
    });

    document.getElementById('calculateBtn')?.addEventListener('click', async () => {
        const asset = assetTypeSelect.value;
        const pair = document.getElementById('calcPair')?.value.trim().toUpperCase() || calcPairSearch?.value.trim().toUpperCase() || '';
        const accountSize = parseFloat(document.getElementById('accountSize').value);
        const riskPercent = parseFloat(document.getElementById('riskPercent').value);
        const slPips = parseFloat(document.getElementById('stopLossPips').value);

        if (!accountSize || !riskPercent || !slPips || !pair) {
            alert('⚠️ Please fill all fields.');
            return;
        }

        const riskAmount = accountSize * (riskPercent / 100);
        const pipValue = await getPipValueLive(pair, asset);
        const lots = riskAmount / (slPips * pipValue);
        const finalLots = Math.max(0.01, parseFloat(lots.toFixed(2)));

        document.getElementById('lotSizeResult').textContent = finalLots;
        document.getElementById('riskUSDResult').textContent = '$' + riskAmount.toFixed(2);
        document.getElementById('pipValueResult').textContent = pipValue.toFixed(2);
        document.getElementById('slPipsResult').textContent = slPips;
        document.getElementById('calcResult').style.display = 'block';
    });

    document.getElementById('resetCalcBtn')?.addEventListener('click', () => {
        ['accountSize', 'riskPercent', 'stopLossPips'].forEach(id => {
            document.getElementById(id).value = '';
        });
        calcPairSearch.value = '';
        document.getElementById('calcPair').value = '';
        document.getElementById('calcResult').style.display = 'none';
    });

    // ===== Navigation & Helpers =====
    viewJournalBtn?.addEventListener('click', () => { showJournalPage(); toggleBodyScroll(false); });
    backToChecklist?.addEventListener('click', () => {
        journalPage.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        toggleBodyScroll(false);
    });

    function calculateTotals() {
        let weekly = 0, daily = 0, fourHour = 0, oneHour = 0, entry = 0;
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            const val = parseFloat(cb.dataset.value);
            switch (cb.dataset.timeframe) {
                case 'weekly': weekly += val; break;
                case 'daily': daily += val; break;
                case '4hour': fourHour += val; break;
                case '1hour': oneHour += val; break;
                case 'entry': entry += val; break;
            }
        });
        const g = weekly + daily + fourHour + oneHour + entry;
        const safeSet = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        safeSet('total-weekly', weekly + '%');
        safeSet('total-daily', daily + '%');
        safeSet('total-4hour', fourHour + '%');
        safeSet('total-1hour', oneHour + '%');
        safeSet('entry-signal', entry + '%');
        safeSet('grand-total', g + '%');
        updateGrade(g);
    }

    function updateGrade(score) {
        const el = document.getElementById('grade-display');
        if (!el) return;
        el.className = 'grade-display';
        const any = document.querySelectorAll('input[type="checkbox"]:checked').length > 0;
        if (score >= 90) { el.textContent = 'Grade: A+'; el.classList.add('grade-a'); }
        else if (score >= 80) { el.textContent = 'Grade: B+'; el.classList.add('grade-b'); }
        else if (score >= 70) { el.textContent = 'Grade: C+'; el.classList.add('grade-c'); }
        else if (score >= 60) { el.textContent = 'Grade: D+'; el.classList.add('grade-d'); }
        else if (any) { el.textContent = 'Grade: F'; el.classList.add('grade-f'); }
        else el.textContent = '—';
    }

    function showJournalPage() {
        const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        const wins = journal.filter(t => t.outcome === 'Win').length;
        const losses = journal.filter(t => t.outcome === 'Loss').length;
        const total = journal.length;
        const winRate = total ? `${((wins / total) * 100).toFixed(1)}%` : '—';
        const safeSet = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        safeSet('stat-total', total);
        safeSet('stat-wins', wins);
        safeSet('stat-losses', losses);
        safeSet('stat-winrate', winRate);

        const tbody = document.getElementById('journalTableBody');
        if (!tbody) return;

        if (journal.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="no-trades">No trades logged yet.</td></tr>`;
        } else {
            tbody.innerHTML = journal.slice().reverse().map(t => {
                const oc = t.outcome === 'Win' ? 'win-cell' : t.outcome === 'Loss' ? 'loss-cell' : 'be-cell';
                const gc = t.grade === 'A+' ? 'grade-a' : t.grade === 'B+' ? 'grade-b' : t.grade === 'C+' ? 'grade-c' : t.grade === 'D+' ? 'grade-d' : '';
                return `
                    <tr data-id="${t.id}">
                        <td>${t.date}</td>
                        <td>${(t.pair || '').toUpperCase()}</td>
                        <td>${t.dir}</td>
                        <td class="${oc}">${t.outcome}</td>
                        <td class="${gc}">${t.grade || '—'}</td>
                        <td>${t.imgBefore ? `<img src="${t.imgBefore}" onclick="showImage(this.src)" alt="Before">` : '—'}</td>
                        <td>${t.imgAfter ? `<img src="${t.imgAfter}" onclick="showImage(this.src)" alt="After">` : '—'}</td>
                        <td>${t.notes || '—'}</td>
                        <td style="padding:8px; text-align:center;">
                            <div style="display:flex; gap:8px; justify-content:center;">
                                <button class="fab-btn" style="width:36px; height:36px; padding:0;" onclick="editTrade(${t.id})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="fab-btn" style="width:36px; height:36px; padding:0;" onclick="deleteTrade(${t.id})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        document.querySelector('.container').style.display = 'none';
        journalPage.style.display = 'block';
        window.scrollTo(0, 0);
    }

    window.showImage = src => {
        const win = window.open('', '_blank', 'width=900,height=700,resizable,scrollbars=yes');
        if (win) win.document.write(`<html><body style="margin:0;background:#000;"><img src="${src}" style="max-width:100%;max-height:100vh;object-fit:contain;"></body></html>`);
    };
});

// ✅ GLOBAL: Edit & Delete
window.editTrade = (id) => {
    const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    const trade = journal.find(t => t.id === id);
    if (!trade) return alert('Trade not found.');

    document.getElementById('editTradeId').value = trade.id;
    document.getElementById('editDate').value = trade.date;
    document.getElementById('editPair').value = trade.pair;
    document.getElementById('editPairSearch').value = trade.pair;
    document.getElementById('editDir').value = trade.dir;
    document.getElementById('editOutcome').value = trade.outcome;
    document.getElementById('editGrade').value = trade.grade || '';
    document.getElementById('editNotes').value = trade.notes || '';

    const createPreview = (previewId, imgSrc, containerId) => {
        const preview = document.getElementById(previewId);
        const container = document.getElementById(containerId);
        if (!preview || !imgSrc || !container) return;

        preview.innerHTML = `
            <img src="${imgSrc}" alt="Preview" style="max-width:100%;max-height:200px;border-radius:8px;margin-top:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <button class="remove-image-btn" title="Remove">&times;</button>
        `;
        preview.querySelector('.remove-image-btn').onclick = () => {
            preview.innerHTML = '';
            container.querySelector('.image-dropzone').style.display = 'block';
            const inputId = containerId.includes('Before') ? 'editImgBefore' : 'editImgAfter';
            document.getElementById(inputId).value = '';
        };
        container.querySelector('.image-dropzone').style.display = 'none';
    };

    createPreview('editBeforePreview', trade.imgBefore, 'editBeforeUploadContainer');
    createPreview('editAfterPreview', trade.imgAfter, 'editAfterUploadContainer');

    document.getElementById('editOverlay')?.classList.add('active');
    document.getElementById('editModal')?.classList.add('active');

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    document.getElementById('editPairSearch')?.focus();
};

window.deleteTrade = (id) => {
    if (!confirm('⚠️ Delete this trade? This cannot be undone.')) return;
    let journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    journal = journal.filter(t => t.id !== id);
    localStorage.setItem('tradeJournal', JSON.stringify(journal));

    const row = document.querySelector(`#journalTableBody tr[data-id="${id}"]`);
    if (row) {
        row.style.transition = 'opacity 0.3s, transform 0.3s';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 300);
    }

    const j = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    const wins = j.filter(t => t.outcome === 'Win').length;
    const losses = j.filter(t => t.outcome === 'Loss').length;
    const total = j.length;
    const winRate = total ? `${((wins / total) * 100).toFixed(1)}%` : '—';
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-wins').textContent = wins;
    document.getElementById('stat-losses').textContent = losses;
    document.getElementById('stat-winrate').textContent = winRate;

    if (j.length === 0) {
        document.getElementById('journalTableBody').innerHTML = `<tr><td colspan="9" class="no-trades">No trades logged yet.</td></tr>`;
    }
};
