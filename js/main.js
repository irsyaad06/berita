/**
 * PORTAL BERITA PROTOTYPE - iCraftDS (iCraft Digital Services)
 * Interactive Controller (Dark Mode, Ticker, Audio Player, Bookmarks, Comments, Font Resizer)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initDateTime();
    initTicker();
    initReadingProgress();
    initLiveSearch();
    initAudioPlayer();
    initFontResizer();
    initComments();
    initBookmarks();
});

/* ====================================================================
   1. Dark Mode Management
   ==================================================================== */
function initTheme() {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const isDark = localStorage.getItem('icraftds_theme') === 'dark' || 
                   (!('icraftds_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        document.documentElement.classList.add('dark');
        updateThemeIcons(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcons(false);
    }

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('icraftds_theme', currentDark ? 'dark' : 'light');
            updateThemeIcons(currentDark);
            showToast(currentDark ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan');
        });
    });
}

function updateThemeIcons(isDark) {
    document.querySelectorAll('.theme-icon-sun').forEach(el => el.classList.toggle('hidden', !isDark));
    document.querySelectorAll('.theme-icon-moon').forEach(el => el.classList.toggle('hidden', isDark));
}

/* ====================================================================
   2. Realtime Date & Weather Display
   ==================================================================== */
function initDateTime() {
    const dateEl = document.getElementById('current-date');
    if (!dateEl) return;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    dateEl.textContent = `${dayName}, ${dateNum} ${monthName} ${year}`;
}

/* ====================================================================
   3. Breaking News Ticker Carousel
   ==================================================================== */
const tickerHeadlines = [
    { title: "Presiden Resmikan Pusat Data AI Nasional & Dorong Kedaulatan Digital Indonesia", url: "artikel.html", cat: "Nasional" },
    { title: "IHSG Ditutup Menguat ke Level 7.820, Saham Sektor Teknologi & Energi Memimpin", url: "artikel.html", cat: "Ekonomi" },
    { title: "Timnas Indonesia Raih Kemenangan Bersejarah di Putaran Ketiga Kualifikasi Piala Dunia", url: "artikel.html", cat: "Bola" },
    { title: "Peluncuran Satelit Komunikasi Nusantara Sukses Meluncur dari Florida", url: "artikel.html", cat: "Teknologi" },
    { title: "BMKG Rilis Peringatan Dini Cuaca Ekstrem Sepekan ke Depan di 18 Wilayah", url: "artikel.html", cat: "Daerah" }
];

let tickerIndex = 0;
let tickerTimer = null;

function initTicker() {
    const tickerText = document.getElementById('ticker-headline-text');
    const tickerCat = document.getElementById('ticker-category');
    const tickerLink = document.getElementById('ticker-link');
    if (!tickerText) return;

    function renderHeadline() {
        tickerText.style.opacity = '0';
        tickerText.style.transform = 'translateY(8px)';
        
        setTimeout(() => {
            const item = tickerHeadlines[tickerIndex];
            tickerText.textContent = item.title;
            if (tickerCat) tickerCat.textContent = item.cat;
            if (tickerLink) tickerLink.href = item.url;
            
            tickerText.style.opacity = '1';
            tickerText.style.transform = 'translateY(0)';
            tickerIndex = (tickerIndex + 1) % tickerHeadlines.length;
        }, 300);
    }

    renderHeadline();
    tickerTimer = setInterval(renderHeadline, 5000);

    const tickerContainer = document.getElementById('ticker-container');
    if (tickerContainer) {
        tickerContainer.addEventListener('mouseenter', () => clearInterval(tickerTimer));
        tickerContainer.addEventListener('mouseleave', () => tickerTimer = setInterval(renderHeadline, 5000));
    }
}

/* ====================================================================
   4. Reading Progress Bar (Article View)
   ==================================================================== */
function initReadingProgress() {
    const progressEl = document.getElementById('reading-progress');
    if (!progressEl) return;

    window.addEventListener('scroll', () => {
        const docElem = document.documentElement;
        const totalHeight = docElem.scrollHeight - docElem.clientHeight;
        if (totalHeight <= 0) return;
        const progress = (window.scrollY / totalHeight) * 100;
        progressEl.style.width = Math.min(100, Math.max(0, progress)) + '%';
    });
}

/* ====================================================================
   5. Live Search & Category Filter
   ==================================================================== */
function initLiveSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchModal = document.getElementById('search-modal');
    const openSearchBtns = document.querySelectorAll('.open-search-modal');
    const closeSearchBtn = document.getElementById('close-search-modal');

    openSearchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (searchModal) {
                searchModal.classList.remove('hidden');
                setTimeout(() => searchInput && searchInput.focus(), 100);
            }
        });
    });

    if (closeSearchBtn && searchModal) {
        closeSearchBtn.addEventListener('click', () => searchModal.classList.add('hidden'));
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) searchModal.classList.add('hidden');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const resultsBox = document.getElementById('search-live-results');
            if (!resultsBox) return;

            if (query.length < 2) {
                resultsBox.innerHTML = '<p class="text-xs text-slate-400 py-3 text-center">Ketik minimal 2 karakter untuk mencari berita...</p>';
                return;
            }

            const matched = tickerHeadlines.filter(h => h.title.toLowerCase().includes(query) || h.cat.toLowerCase().includes(query));
            if (matched.length === 0) {
                resultsBox.innerHTML = `<p class="text-xs text-slate-400 py-3 text-center">Tidak ditemukan artikel dengan kata kunci "<strong>${query}</strong>"</p>`;
            } else {
                resultsBox.innerHTML = matched.map(m => `
                    <a href="${m.url}" class="flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition group">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">${m.cat}</span>
                            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600">${m.title}</span>
                        </div>
                        <span class="text-xs text-slate-400 group-hover:translate-x-1 transition">&rarr;</span>
                    </a>
                `).join('');
            }
        });
    }
}

/* ====================================================================
   6. Simulated Audio News ("Dengarkan Berita Ini")
   ==================================================================== */
function initAudioPlayer() {
    const playBtn = document.getElementById('audio-play-btn');
    const audioBar = document.getElementById('audio-progress-bar');
    const audioTime = document.getElementById('audio-time-label');
    const playIcon = document.getElementById('audio-play-icon');
    const pauseIcon = document.getElementById('audio-pause-icon');
    const waveEl = document.getElementById('audio-soundwave');

    if (!playBtn) return;

    let isPlaying = false;
    let seconds = 0;
    const totalDuration = 125; // 2m 5s
    let audioInterval = null;

    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (playIcon) playIcon.classList.toggle('hidden', isPlaying);
        if (pauseIcon) pauseIcon.classList.toggle('hidden', !isPlaying);
        if (waveEl) waveEl.classList.toggle('opacity-30', !isPlaying);

        if (isPlaying) {
            showToast('Memutar audio narasi berita AI...');
            audioInterval = setInterval(() => {
                seconds++;
                if (seconds > totalDuration) {
                    seconds = 0;
                    isPlaying = false;
                    clearInterval(audioInterval);
                    if (playIcon) playIcon.classList.remove('hidden');
                    if (pauseIcon) pauseIcon.classList.add('hidden');
                    if (waveEl) waveEl.classList.add('opacity-30');
                    return;
                }
                const progressPct = (seconds / totalDuration) * 100;
                if (audioBar) audioBar.style.width = progressPct + '%';
                
                const curM = Math.floor(seconds / 60);
                const curS = String(seconds % 60).padStart(2, '0');
                if (audioTime) audioTime.textContent = `${curM}:${curS} / 02:05`;
            }, 1000);
        } else {
            clearInterval(audioInterval);
        }
    });
}

/* ====================================================================
   7. Font Resizer in Article Detail
   ==================================================================== */
function initFontResizer() {
    const btnDecrease = document.getElementById('font-decrease');
    const btnIncrease = document.getElementById('font-increase');
    const articleBody = document.getElementById('article-content-body');

    if (!articleBody) return;

    let currentSize = 16; // default 16px
    const minSize = 14;
    const maxSize = 22;

    if (btnDecrease) {
        btnDecrease.addEventListener('click', () => {
            if (currentSize > minSize) {
                currentSize -= 2;
                articleBody.style.fontSize = currentSize + 'px';
                showToast(`Ukuran teks: ${currentSize}px`);
            }
        });
    }

    if (btnIncrease) {
        btnIncrease.addEventListener('click', () => {
            if (currentSize < maxSize) {
                currentSize += 2;
                articleBody.style.fontSize = currentSize + 'px';
                showToast(`Ukuran teks: ${currentSize}px`);
            }
        });
    }
}

/* ====================================================================
   8. Comments Interaction Simulator
   ==================================================================== */
function initComments() {
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentList = document.getElementById('comment-list');
    const commentCountEl = document.getElementById('comment-count-badge');

    if (!commentForm || !commentInput || !commentList) return;

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = commentInput.value.trim();
        if (!text) return;

        const newCommentHtml = `
            <div class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 animate-fadeIn">
                <div class="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    A
                </div>
                <div class="flex-1 text-xs">
                    <div class="flex items-center justify-between mb-1">
                        <strong class="font-bold text-slate-900 dark:text-slate-100">Anda (Tamu Redaksi)</strong>
                        <span class="text-[10px] text-slate-400">Baru saja</span>
                    </div>
                    <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(text)}</p>
                    <div class="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                        <button class="hover:text-sky-600 flex items-center gap-1" onclick="this.querySelector('span').textContent = parseInt(this.querySelector('span').textContent) + 1">
                            &hearts; <span>0</span> Suka
                        </button>
                        <button class="hover:text-sky-600">Balas</button>
                    </div>
                </div>
            </div>
        `;

        commentList.insertAdjacentHTML('afterbegin', newCommentHtml);
        commentInput.value = '';

        if (commentCountEl) {
            const count = parseInt(commentCountEl.textContent || '0') + 1;
            commentCountEl.textContent = count;
        }

        showToast('Komentar Anda berhasil dikirim!');
    });
}

/* ====================================================================
   9. Bookmark & Share Action
   ==================================================================== */
function initBookmarks() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const icon = btn.querySelector('svg');
            const isBookmarked = btn.classList.toggle('text-sky-600');
            if (isBookmarked) {
                btn.classList.add('fill-current');
                showToast('Artikel disimpan ke daftar baca!');
            } else {
                btn.classList.remove('fill-current');
                showToast('Artikel dihapus dari daftar baca.');
            }
        });
    });

    document.querySelectorAll('.copy-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('Tautan artikel berhasil disalin!');
            }).catch(() => {
                showToast('Tautan disalin ke clipboard');
            });
        });
    });
}

/* ====================================================================
   10. Toast Notification Helper
   ==================================================================== */
function showToast(msg) {
    let toast = document.getElementById('live-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'live-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 transform transition-all duration-300 translate-y-12 opacity-0';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>${msg}</span>
    `;
    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.add('translate-y-12', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 2800);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
