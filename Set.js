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
    // Add this INSIDE document.addEventListener('DOMContentLoaded', () => { ... })
// e.g., right before the closing });

// ✅ Safe: Attached to window, no syntax risk
window.editTrade = function(id) {
    console.log('Edit called with ID:', id);
    
    const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    const trade = journal.find(t => t.id === id);
    if (!trade) return alert('Trade not found');

    // Fill form
    document.getElementById('editTradeId').value = trade.id;
    document.getElementById('editDate').value = trade.date;
    document.getElementById('editPair').value = trade.pair;
    document.getElementById('editDir').value = trade.dir;
    document.getElementById('editOutcome').value = trade.outcome;
    document.getElementById('editGrade').value = trade.grade || '';
    document.getElementById('editNotes').value = trade.notes || '';

    // Preview images
    const bp = document.getElementById('beforePreview');
    const ap = document.getElementById('afterPreview');
    if (bp && trade.imgBefore) bp.innerHTML = `<img src="${trade.imgBefore}" width="80">`;
    if (ap && trade.imgAfter) ap.innerHTML = `<img src="${trade.imgAfter}" width="80">`;

    // Open modal
    document.getElementById('editOverlay')?.classList.add('active');
    document.getElementById('editModal')?.classList.add('active');s
};
// ===== Symbol List =====
const SYMBOLS = [
    { group: ' Forex Majors', list: ['AUDUSD', 'EURUSD', 'GBPUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY'] 
  },
    { group: ' Forex Minors',    list: ['AUDCAD', 'AUDCHF', 'AUDJPY', 'AUDNZD', 'CADCHF', 'CADJPY', 'CHFJPY', 'EURAUD', 'EURCAD', 'EURCHF', 'EURGBP', 'EURJPY', 'EURNZD', 'GBPAUD', 'GBPCAD', 'GBPJPY', 'GBPNZD', 'NZDCHF', 'NZDJPY']
  },
    { group: ' Crypto', list: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'DOGEUSD', 'ADAUSD', 'DOTUSD', 'BNBUSD'] },
    { group: ' Commodities', list: ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NGAS', 'COPPER'] },
    { group: ' Indices', list: ['SPX500', 'NAS100', 'DJI30', 'GER40', 'UK100', 'JP225'] }
];

    // ===== Helper: Clear image uploads =====
    function clearImageUploads() {
        // Clear previews
        const beforePreview = document.getElementById('beforePreview');
        const afterPreview = document.getElementById('afterPreview');
        if (beforePreview) beforePreview.innerHTML = '';
        if (afterPreview) afterPreview.innerHTML = '';

        // Reset file inputs (Log)
        const imgBefore = document.getElementById('imgBefore');
        const imgAfter = document.getElementById('imgAfter');
        if (imgBefore) imgBefore.value = '';
        if (imgAfter) imgAfter.value = '';

        // Reset file inputs (Edit)
        const editImgBefore = document.getElementById('editImgBefore');
        const editImgAfter = document.getElementById('editImgAfter');
        if (editImgBefore) editImgBefore.value = '';
        if (editImgAfter) editImgAfter.value = '';
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
    // ===== Searchable Select =====
function initSearchableSelect(searchId, dropdownId, hiddenId) {
    const searchInput = document.getElementById(searchId);
    const dropdown = document.getElementById(dropdownId);
    const hiddenInput = document.getElementById(hiddenId);

    if (!searchInput || !dropdown || !hiddenInput) return;

    // Render dropdown
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

    // Open/close
    searchInput.addEventListener('focus', () => {
        renderDropdown(searchInput.value);
        dropdown.classList.add('active');
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => dropdown.classList.remove('active'), 150);
    });

    // Type to filter
    searchInput.addEventListener('input', () => {
        renderDropdown(searchInput.value);
        dropdown.classList.add('active');
    });

    // Select option
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

    // Keyboard navigation
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

// Initialize both
initSearchableSelect('tradePairSearch', 'tradePairDropdown', 'tradePair');
initSearchableSelect('editPairSearch', 'editPairDropdown', 'editPair');
// Force uppercase for pair inputs
['tradePairSearch', 'editPairSearch'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();
        });
    }
    input.addEventListener('paste', e => {
    setTimeout(() => {
        input.value = input.value.toUpperCase();
    }, 10);
});
});

    // Set today
    const dateInput = document.getElementById('tradeDate');
    if (dateInput) dateInput.valueAsDate = new Date();

    // Grade Log Button
    const gradeLogBtn = document.getElementById('gradeLogBtn');
    gradeLogBtn?.addEventListener('click', () => {
        const currentGradeEl = document.getElementById('grade-display');
        const gradeInput = document.getElementById('tradeGrade');
        if (currentGradeEl && gradeInput) {
            let gradeText = currentGradeEl.textContent.trim();
            const match = gradeText.match(/Grade:\s*([A-D]\+|F)/);
            gradeInput.value = match ? match[1] : '—';
        }
        clearImageUploads();
        journalOverlay.classList.add('active');
        journalModal.classList.add('active');
        toggleBodyScroll(true);
        document.getElementById('tradePair')?.focus();
    });

    // Log Trade Modal
    logTradeBtn?.addEventListener('click', () => {
        const currentGradeEl = document.getElementById('grade-display');
        const gradeInput = document.getElementById('tradeGrade');
        if (currentGradeEl && gradeInput) {
            let gradeText = currentGradeEl.textContent.trim();
            const match = gradeText.match(/Grade:\s*([A-D]\+|F)/);
            gradeInput.value = match ? match[1] : '—';
        }
        clearImageUploads();
        journalOverlay.classList.add('active');
        journalModal.classList.add('active');
        toggleBodyScroll(true);
        document.getElementById('tradePairSearch')?.focus();
    });

    [journalOverlay, closeJournalModal].forEach(el => {
        el?.addEventListener('click', () => {
            journalOverlay.classList.remove('active');
            journalModal.classList.remove('active');
            toggleBodyScroll(false);
            clearImageUploads();
        });
    });

    // Save trade
    saveTradeBtn?.addEventListener('click', async () => {
        const date = document.getElementById('tradeDate')?.value;
        const pair = document.getElementById('tradePair')?.value.trim().toUpperCase();
        const dir = document.getElementById('tradeDir')?.value;
        const outcome = document.getElementById('tradeOutcome')?.value;
        const notes = document.getElementById('tradeNotes')?.value.trim();
        const grade = document.getElementById('tradeGrade')?.value || '—';
        const beforeFile = document.getElementById('imgBefore')?.files[0];
        const afterFile = document.getElementById('imgAfter')?.files[0];

        if (!date || !pair) {
            alert('⚠️ Please enter date and pair.');
            return;
        }

        const toBase64 = file => new Promise(res => {
            if (!file) return res(null);
            const reader = new FileReader();
            reader.onload = e => res(e.target.result);
            reader.readAsDataURL(file);
        });

        const imgBefore = beforeFile ? await toBase64(beforeFile) : null;
        const imgAfter = afterFile ? await toBase64(afterFile) : null;

        const trade = {
            id: Date.now(),
            date, pair, dir, outcome, notes, imgBefore, imgAfter, grade,
            timestamp: new Date().toISOString()
        };

        const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        journal.push(trade);
        localStorage.setItem('tradeJournal', JSON.stringify(journal));

        // Close & go home
        journalOverlay.classList.remove('active');
        journalModal.classList.remove('active');
        toggleBodyScroll(false);

        const container = document.querySelector('.container');
        const journalPageEl = document.getElementById('journalPage');
        if (container) container.style.display = 'block';
        if (journalPageEl) journalPageEl.style.display = 'none';

        clearImageUploads();
    });

    // Edit Trade Modal Close
    [editOverlay, closeEditModal].forEach(el => {
        el?.addEventListener('click', () => {
            editOverlay.classList.remove('active');
            editModal.classList.remove('active');
            toggleBodyScroll(false);
            clearImageUploads();
        });
    });

    // Update trade
    updateTradeBtn?.addEventListener('click', async () => {
        const id = parseInt(document.getElementById('editTradeId').value);
        if (!id) return;

        let journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        const tradeIndex = journal.findIndex(t => t.id === id);
        if (tradeIndex === -1) return;

        const current = journal[tradeIndex];

        const date = document.getElementById('editDate').value;
        const pair = document.getElementById('editPair').value.trim().toUpperCase();
        const dir = document.getElementById('editDir').value;
        const outcome = document.getElementById('editOutcome').value;
        const grade = document.getElementById('editGrade').value.trim();
        const notes = document.getElementById('editNotes').value.trim();

        if (!date || !pair) {
            alert('⚠️ Date and Pair are required.');
            return;
        }

        const beforeFile = document.getElementById('editImgBefore').files[0];
        const afterFile = document.getElementById('editImgAfter').files[0];

        const toBase64 = file => new Promise(res => {
            if (!file) return res(null);
            const reader = new FileReader();
            reader.onload = e => res(e.target.result);
            reader.readAsDataURL(file);
        });

        const imgBefore = beforeFile ? await toBase64(beforeFile) : current.imgBefore;
        const imgAfter = afterFile ? await toBase64(afterFile) : current.imgAfter;

        journal[tradeIndex] = {
            ...current,
            date, pair, dir, outcome, grade, notes, imgBefore, imgAfter
        };

        localStorage.setItem('tradeJournal', JSON.stringify(journal));

        editOverlay.classList.remove('active');
        editModal.classList.remove('active');
        toggleBodyScroll(false);
        clearImageUploads();

        if (journalPage && journalPage.style.display === 'block') {
            showJournalPage();
        }
    });

    // View Journal
    viewJournalBtn?.addEventListener('click', () => {
        showJournalPage();
        toggleBodyScroll(false);
    });

    // Back to checklist
    backToChecklist?.addEventListener('click', () => {
        journalPage.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        toggleBodyScroll(false);
    });

    // ===== Image Upload: Drag, Drop, Click, Paste =====
    function setupImageUpload(dropzoneId, inputId, previewId) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (!dropzone || !input) return;

        // Click to upload
        dropzone.addEventListener('click', () => input.click());

        // File select
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) handleImage(file, preview);
        });

        // Drag & Drop
        dropzone.addEventListener('dragover', e => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', e => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
                handleImage(file, preview);
            }
        });
    }

    function handleImage(file, previewEl) {
        if (!previewEl) return;
        const reader = new FileReader();
        reader.onload = e => {
            previewEl.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">`;
        };
        reader.readAsDataURL(file);
    }

// Keep Log modals using shared previews
setupImageUpload('beforeDropzone', 'imgBefore', 'beforePreview');
setupImageUpload('afterDropzone', 'imgAfter', 'afterPreview');

// ✅ Edit modals use their own previews
setupImageUpload('editBeforeDropzone', 'editImgBefore', 'editBeforePreview');
setupImageUpload('editAfterDropzone', 'editImgAfter', 'editAfterPreview');
    // Global paste handler
    document.addEventListener('paste', e => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const activeEl = document.activeElement;
                    const targets = [
                        { dropzone: 'beforeDropzone', input: 'imgBefore' },
                        { dropzone: 'afterDropzone', input: 'imgAfter' },
                        { dropzone: 'editBeforeDropzone', input: 'editImgBefore' },
                        { dropzone: 'editAfterDropzone', input: 'editImgAfter' }
                    ];
                    
                    for (let t of targets) {
                        const dz = document.getElementById(t.dropzone);
                        if (dz && (dz === activeEl || dz.contains(activeEl))) {
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            document.getElementById(t.input).files = dt.files;
                            handleImage(file, document.getElementById('beforePreview'));
                            e.preventDefault();
                            return;
                        }
                    }
                }
            }
        }
    });

    // ===== Helper Functions =====
    function calculateTotals() {
        let weekly = 0, daily = 0, fourHour = 0, oneHour = 0, entry = 0;

        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            const val = parseFloat(checkbox.dataset.value);
            switch (checkbox.dataset.timeframe) {
                case 'weekly': weekly += val; break;
                case 'daily': daily += val; break;
                case '4hour': fourHour += val; break;
                case '1hour': oneHour += val; break;
                case 'entry': entry += val; break;
            }
        });

        const grandTotal = weekly + daily + fourHour + oneHour + entry;

        const update = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        update('total-weekly', weekly + '%');
        update('total-daily', daily + '%');
        update('total-4hour', fourHour + '%');
        update('total-1hour', oneHour + '%');
        update('entry-signal', entry + '%');
        update('grand-total', grandTotal + '%');
        updateGrade(grandTotal);
    }

    function updateGrade(score) {
        const el = document.getElementById('grade-display');
        if (!el) return;

        el.className = 'grade-display';
        const anyChecked = document.querySelectorAll('input[type="checkbox"]:checked').length > 0;

        if (score >= 90) {
            el.textContent = 'Grade: A+';
            el.classList.add('grade-a');
        } else if (score >= 80) {
            el.textContent = 'Grade: B+';
            el.classList.add('grade-b');
        } else if (score >= 70) {
            el.textContent = 'Grade: C+';
            el.classList.add('grade-c');
        } else if (score >= 60) {
            el.textContent = 'Grade: D+';
            el.classList.add('grade-d');
        } else if (anyChecked) {
            el.textContent = 'Grade: F';
            el.classList.add('grade-f');
        } else {
            el.textContent = '—';
        }
    }

    function showJournalPage() {
        const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        
        const wins = journal.filter(t => t.outcome === 'Win').length;
        const losses = journal.filter(t => t.outcome === 'Loss').length;
        const total = journal.length;
        const winRate = total ? `${((wins / total) * 100).toFixed(1)}%` : '—';

        const update = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        update('stat-total', total);
        update('stat-wins', wins);
        update('stat-losses', losses);
        update('stat-winrate', winRate);

        const tbody = document.getElementById('journalTableBody');
        if (!tbody) return;

        if (journal.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="no-trades">No trades logged yet.</td></tr>`;
        } else {
            tbody.innerHTML = journal.slice().reverse().map(t => {
                const outcomeClass = 
                    t.outcome === 'Win' ? 'win-cell' :
                    t.outcome === 'Loss' ? 'loss-cell' : 'be-cell';
                
                const gradeClass = 
                    t.grade === 'A+' ? 'grade-a' :
                    t.grade === 'B+' ? 'grade-b' :
                    t.grade === 'C+' ? 'grade-c' :
                    t.grade === 'D+' ? 'grade-d' : '';

                return `
                    <tr data-id="${t.id}">
                        <td>${t.date}</td>
                        <td>${(t.pair || '').toUpperCase()}</td>
                        <td>${t.dir}</td>
                        <td class="${outcomeClass}">${t.outcome}</td>
                        <td class="${gradeClass}">${t.grade || '—'}</td>
                        <td>${t.imgBefore ? `<img src="${t.imgBefore}" onclick="showImage(this.src)" alt="Before">` : '—'}</td>
                        <td>${t.imgAfter ? `<img src="${t.imgAfter}" onclick="showImage(this.src)" alt="After">` : '—'}</td>
                        <td>${t.notes || '—'}</td>
                        <td style="padding:8px; text-align:center;">
                            <div style="display:flex; gap:8px; justify-content:center;">
                                <button class="fab-btn" style="width:36px; height:36px; padding:0;"
                                        onclick="editTrade(${t.id})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="fab-btn" style="width:36px; height:36px; padding:0;"
                                        onclick="deleteTrade(${t.id})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        const container = document.querySelector('.container');
        if (container) container.style.display = 'none';
        if (journalPage) journalPage.style.display = 'block';
        window.scrollTo(0, 0);
    }

    // Image zoom
    window.showImage = src => {
        const win = window.open('', '_blank', 'width=900,height=700,resizable,scrollbars=yes');
        if (win) {
            win.document.write(`
                <html><body style="margin:0;background:#000;">
                    <img src="${src}" style="max-width:100%;max-height:100vh;object-fit:contain;">
                </body></html>
            `);
        }
    };
});

// ✅ GLOBAL: Edit trade
window.editTrade = function(id) {
    clearImageUploads();
    const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    const trade = journal.find(t => t.id === id);
    if (!trade) {
        alert('⚠️ Trade not found.');
        return;
    }

    // Fill form
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('editTradeId', trade.id);
    set('editDate', trade.date);
    set('editPair', trade.pair);
    set('editDir', trade.dir);
    set('editOutcome', trade.outcome);
    set('editGrade', trade.grade || '');
    set('editNotes', trade.notes || '');

    // Preview images
   // New: use edit-specific previews
const editBeforePreview = document.getElementById('editBeforePreview');
const editAfterPreview = document.getElementById('editAfterPreview');

if (editBeforePreview && trade.imgBefore) {
    editBeforePreview.innerHTML = `<img src="${trade.imgBefore}" alt="Before" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">`;
}
if (editAfterPreview && trade.imgAfter) {
    editAfterPreview.innerHTML = `<img src="${trade.imgAfter}" alt="After" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">`;
}

    // Open modal
    document.getElementById('editOverlay')?.classList.add('active');
    document.getElementById('editModal')?.classList.add('active');
    toggleBodyScroll(true);
    document.getElementById('editPair')?.focus();
};

// ✅ GLOBAL: Delete trade
window.deleteTrade = (id) => {
    if (!confirm('⚠️ Delete this trade? This cannot be undone.')) return;

    let journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    journal = journal.filter(t => t.id !== id);
    localStorage.setItem('tradeJournal', JSON.stringify(journal));

    // Instant DOM removal
    const row = document.querySelector(`#journalTableBody tr[data-id="${id}"]`);
    if (row) {
        row.style.transition = 'opacity 0.3s, transform 0.3s';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 300);
    }

    // Update stats
    const winsEl = document.getElementById('stat-wins');
    const lossesEl = document.getElementById('stat-losses');
    const totalEl = document.getElementById('stat-total');
    const winRateEl = document.getElementById('stat-winrate');

    if (winsEl && lossesEl && totalEl && winRateEl) {
        const wins = journal.filter(t => t.outcome === 'Win').length;
        const losses = journal.filter(t => t.outcome === 'Loss').length;
        const total = journal.length;
        const winRate = total ? `${((wins / total) * 100).toFixed(1)}%` : '—';

        winsEl.textContent = wins;
        lossesEl.textContent = losses;
        totalEl.textContent = total;
        winRateEl.textContent = winRate;
    }

    // Handle empty state
    const tbody = document.getElementById('journalTableBody');
    if (tbody && journal.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="no-trades">No trades logged yet.</td></tr>`;
    }
    
};
