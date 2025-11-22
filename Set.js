document.addEventListener('DOMContentLoaded', () => {
    // ===== Core UI Elements =====
    const themeToggle = document.getElementById('themeToggle');
    const resetBtn = document.getElementById('resetBtn');
    const logTradeBtn = document.getElementById('logTradeBtn');
    const gradeLogBtn = document.getElementById('gradeLogBtn');

gradeLogBtn?.addEventListener('click', () => {
    // Auto-fill grade (same as main Log button)
    const currentGradeEl = document.getElementById('grade-display');
    const gradeInput = document.getElementById('tradeGrade');
    if (currentGradeEl && gradeInput) {
        let gradeText = currentGradeEl.textContent.trim();
        const match = gradeText.match(/Grade:\s*([A-D]\+|F)/);
        gradeInput.value = match ? match[1] : '—';
    }
    // Add to Journal from grade area
const gradeLogBtn = document.getElementById('gradeLogBtn');
gradeLogBtn?.addEventListener('click', () => {
    // Auto-fill grade
    const currentGradeEl = document.getElementById('grade-display');
    const gradeInput = document.getElementById('tradeGrade');
    if (currentGradeEl && gradeInput) {
        let gradeText = currentGradeEl.textContent.trim();
        const match = gradeText.match(/Grade:\s*([A-D]\+|F)/);
        gradeInput.value = match ? match[1] : '—';
    }
    // Open modal
    journalOverlay.classList.add('active');
    journalModal.classList.add('active');
    toggleBodyScroll(true);
});
    // Open modal
    journalOverlay.classList.add('active');
    journalModal.classList.add('active');
    toggleBodyScroll(true);
});
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

    // ===== Journal Modals =====
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

    // Set today
    const dateInput = document.getElementById('tradeDate');
    if (dateInput) dateInput.valueAsDate = new Date();

    // ===== Log Trade Modal =====
    logTradeBtn?.addEventListener('click', () => {
        const currentGradeEl = document.getElementById('grade-display');
        const gradeInput = document.getElementById('tradeGrade');
        if (currentGradeEl && gradeInput) {
            let gradeText = currentGradeEl.textContent.trim();
            const match = gradeText.match(/Grade:\s*([A-D]\+|F)/);
            gradeInput.value = match ? match[1] : '—';
        }
        journalOverlay.classList.add('active');
        journalModal.classList.add('active');
        toggleBodyScroll(true);
    });

    [journalOverlay, closeJournalModal].forEach(el => {
        el?.addEventListener('click', () => {
            journalOverlay.classList.remove('active');
            journalModal.classList.remove('active');
            toggleBodyScroll(false);
        });
    });

    // Save trade
    saveTradeBtn?.addEventListener('click', async () => {
        const date = document.getElementById('tradeDate')?.value;
        const pair = document.getElementById('tradePair')?.value.trim();
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

        // ✅ Close & go home
        journalOverlay.classList.remove('active');
        journalModal.classList.remove('active');
        toggleBodyScroll(false);

        const container = document.querySelector('.container');
        const journalPageEl = document.getElementById('journalPage');
        if (container) container.style.display = 'block';
        if (journalPageEl) journalPageEl.style.display = 'none';

        // Reset form
        document.getElementById('tradePair').value = '';
        document.getElementById('tradeNotes').value = '';
        document.getElementById('imgBefore').value = '';
        document.getElementById('imgAfter').value = '';
    });

    // ===== Edit Trade Modal =====
    [editOverlay, closeEditModal].forEach(el => {
        el?.addEventListener('click', () => {
            editOverlay.classList.remove('active');
            editModal.classList.remove('active');
            toggleBodyScroll(false);
        });
    });

    updateTradeBtn?.addEventListener('click', async () => {
        const id = parseInt(document.getElementById('editTradeId').value);
        if (!id) return;

        let journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
        const tradeIndex = journal.findIndex(t => t.id === id);
        if (tradeIndex === -1) return;

        const current = journal[tradeIndex];

        const date = document.getElementById('editDate').value;
        const pair = document.getElementById('editPair').value.trim();
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

        // Refresh journal if open
        if (journalPage && journalPage.style.display === 'block') {
            showJournalPage();
        }
    });

    // View Journal
    viewJournalBtn?.addEventListener('click', () => {
        showJournalPage();
        toggleBodyScroll(false); // journal is full page — allow scroll
    });

    // Back to checklist
    backToChecklist?.addEventListener('click', () => {
        journalPage.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        toggleBodyScroll(false);
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
                            <td>${t.pair}</td>
                            <td>${t.dir}</td>
                            <td class="${outcomeClass}">${t.outcome}</td>
                            <td class="${gradeClass}">${t.grade || '—'}</td>
                            <td>${t.imgBefore ? `<img src="${t.imgBefore}" onclick="showImage(this.src)">` : '—'}</td>
                            <td>${t.imgAfter ? `<img src="${t.imgAfter}" onclick="showImage(this.src)">` : '—'}</td>
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
window.editTrade = (id) => {
    const journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    const trade = journal.find(t => t.id === id);
    if (!trade) return;

    document.getElementById('editTradeId').value = trade.id;
    document.getElementById('editDate').value = trade.date;
    document.getElementById('editPair').value = trade.pair;
    document.getElementById('editDir').value = trade.dir;
    document.getElementById('editOutcome').value = trade.outcome;
    document.getElementById('editGrade').value = trade.grade || '';
    document.getElementById('editNotes').value = trade.notes || '';

    const beforePreview = document.getElementById('beforePreview');
    const afterPreview = document.getElementById('afterPreview');
    
    beforePreview.innerHTML = trade.imgBefore 
        ? `<img src="${trade.imgBefore}" width="80" style="border-radius:4px;">`
        : '<em>No image</em>';
    
    afterPreview.innerHTML = trade.imgAfter 
        ? `<img src="${trade.imgAfter}" width="80" style="border-radius:4px;">`
        : '<em>No image</em>';

    document.getElementById('editImgBefore').value = '';
    document.getElementById('editImgAfter').value = '';

    document.getElementById('editOverlay').classList.add('active');
    document.getElementById('editModal').classList.add('active');
    toggleBodyScroll(true);
};

// ✅ GLOBAL: Delete trade — instant, stays in journal
window.deleteTrade = (id) => {
    if (!confirm('⚠️ Delete this trade? This cannot be undone.')) return;

    let journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
    const tradeToRemove = journal.find(t => t.id === id);
    if (!tradeToRemove) return;

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