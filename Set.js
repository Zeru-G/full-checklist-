document.addEventListener('DOMContentLoaded', () => {
    // ===== Core UI Elements =====
    const themeToggle = document.getElementById('themeToggle');
    const resetBtn = document.getElementById('resetBtn');
    const logTradeBtn = document.getElementById('logTradeBtn');
    const viewJournalBtn = document.getElementById('viewJournalBtn');
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

    // ===== Searchable Select =====
    function initSearchableSelect(searchId, dropdownId, hiddenId) {
        const searchInput = document.getElementById(searchId);
        const dropdown = document.getElementById(dropdownId);
        const hiddenInput = document.getElementById(hiddenId);

        if (!searchInput || !dropdown || !hiddenInput) return;

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
            dropdown.innerHTML = html || '<div class="select-option">No matches</div>';
        }

        searchInput.addEventListener('focus', () => {
            renderDropdown(searchInput.value);
            dropdown.classList.add('active');
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => dropdown.classList.remove('active'), 150);
        });

        searchInput.addEventListener('input', () => {
            searchInput.value = searchInput.value.toUpperCase();
            renderDropdown(searchInput.value);
            dropdown.classList.add('active');
        });

        searchInput.addEventListener('paste', e => {
            setTimeout(() => {
                searchInput.value = searchInput.value.toUpperCase();
                renderDropdown(searchInput.value);
            }, 10);
        });

        dropdown.addEventListener('click', e => {
            const option = e.target.closest('.select-option:not(.category)');
            if (option) {
                const value = option.dataset.value;
                searchInput.value = value;
                hiddenInput.value = value;
                dropdown.classList.remove('active');
                searchInput.focus();
            }
        });

        searchInput.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const first = dropdown.querySelector('.select-option:not(.category)');
                if (first) first.focus();
            }
        });

        dropdown.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const items = Array.from(dropdown.querySelectorAll('.select-option:not(.category)'));
                const current = document.activeElement;
                let index = items.indexOf(current);
                index += e.key === 'ArrowDown' ? 1 : -1;
                if (index < 0) index = items.length - 1;
                if (index >= items.length) index = 0;
                items[index]?.focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const active = document.activeElement;
                if (active.classList.contains('select-option')) {
                    const value = active.dataset.value;
                    searchInput.value = value;
                    hiddenInput.value = value;
                    dropdown.classList.remove('active');
                    searchInput.focus();
                }
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

    const backToChecklist = document.getElementById('backToChecklist');
    const journalPage = document.getElementById('journalPage');

    // Initialize searchable selects
    initSearchableSelect('tradePairSearch', 'tradePairDropdown', 'tradePair');
    initSearchableSelect('editPairSearch', 'editPairDropdown', 'editPair');

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

        // Fill form
        document.getElementById('editTradeId').value = trade.id;
        document.getElementById('editDate').value = trade.date;
        document.getElementById('editPair').value = trade.pair;
        document.getElementById('editPairSearch').value = trade.pair;
        document.getElementById('editDir').value = trade.dir;
        document.getElementById('editOutcome').value = trade.outcome;
        document.getElementById('editGrade').value = trade.grade || '';
        document.getElementById('editNotes').value = trade.notes || '';

        // Preview images with X button
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

    // Bind buttons
    document.getElementById('gradeLogBtn')?.addEventListener('click', openLogModal);
    logTradeBtn?.addEventListener('click', openLogModal);
    window.editTrade = openEditModal; // ✅ Now globally available

    // Close handlers
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

        if (journalPage && journalPage.style.display === 'block') {
            const tbody = document.getElementById('journalTableBody');
            if (tbody) showJournalPage();
        }
    });

    // ===== Navigation =====
    viewJournalBtn?.addEventListener('click', () => {
        showJournalPage();
        toggleBodyScroll(false);
    });

    backToChecklist?.addEventListener('click', () => {
        journalPage.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        toggleBodyScroll(false);
    });

    // ===== Helper Functions =====
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

// ✅ GLOBAL: Delete trade
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

    // Update stats
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
