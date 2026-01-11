/**
 * Temp Mail Logic by Diean
 * Modifikasi: Optimasi UI & Peningkatan Kecepatan API
 */

const API_URL = 'https://www.1secmail.com/api/v1/';
const DOMAINS = ['1secmail.com', '1secmail.net', '1secmail.org']; // Pilihan domain cadangan
let user = '';
let domain = DOMAINS[0];
let refreshInterval;

// Jalankan saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', generateNewEmail);

/**
 * Membuat alamat email baru secara acak
 */
function generateNewEmail() {
    // Generate username acak yang lebih unik
    user = Math.random().toString(36).substring(2, 10);
    // Bisa diputar domainnya jika perlu, default tetap index 0
    domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    
    const email = `${user}@${domain}`;
    
    // Update tampilan input
    const emailInput = document.getElementById('email-address');
    emailInput.value = email;
    emailInput.classList.add('fade-in'); // Efek transisi jika ada CSS-nya
    
    // Reset tampilan kotak masuk dengan animasi loading
    document.getElementById('email-list').innerHTML = `
        <div class="empty-state">
            <div class="loader-small"></div>
            Menyiapkan kotak masuk...
        </div>`;
    
    // Hapus interval lama dan buat yang baru (setiap 5 detik)
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(checkMail, 5000);
    
    // Langsung cek sekali saat dibuat
    checkMail();
}

/**
 * Mengecek apakah ada email masuk
 */
async function checkMail() {
    const timer = document.getElementById('timer');
    
    try {
        const response = await fetch(`${API_URL}?action=getMessages&login=${user}&domain=${domain}`);
        
        if (!response.ok) throw new Error('API Offline');

        const emails = await response.json();
        renderList(emails);
        
        if (emails.length > 0) {
            timer.innerText = `✅ Terdeteksi ${emails.length} pesan baru`;
            timer.style.color = "#4ade80"; 
        } else {
            timer.innerText = '📡 Mencari pesan masuk...';
            timer.style.color = "#94a3b8"; 
        }
    } catch (e) {
        console.warn('Network issue:', e);
        timer.innerText = '🔄 Menghubungkan ulang ke server...';
        timer.style.color = "#fbbf24";
    }
}

/**
 * Menampilkan daftar email ke layar
 */
function renderList(emails) {
    const list = document.getElementById('email-list');
    
    if (emails.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>Belum ada pesan.</p>
                <small style="display:block; margin-top:5px; opacity:0.5;">Gunakan email di atas untuk mendaftar.</small>
            </div>`;
        return;
    }

    // Render list email dengan desain yang lebih rapi
    list.innerHTML = emails.map(mail => `
        <div class="email-item animate-slide-up" onclick="readMail('${mail.id}')">
            <div class="email-sender-row">
                <span class="sender-name">${mail.from}</span>
                <span class="email-date">${mail.date.split(' ')[1]}</span>
            </div>
            <div class="email-subject-line">${mail.subject || '(Tanpa Subjek)'}</div>
        </div>
    `).join('');
}

/**
 * Membaca detail isi pesan email
 */
async function readMail(id) {
    const viewerBody = document.getElementById('view-body');
    const viewerSubject = document.getElementById('view-subject');
    const viewerFrom = document.getElementById('view-from');
    
    // Tampilkan loading di dalam modal
    viewerBody.innerHTML = '<div class="loader-center"></div><p style="text-align:center">Membuka pesan...</p>';
    document.getElementById('email-viewer').classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}?action=readMessage&login=${user}&domain=${domain}&id=${id}`);
        const mail = await response.json();
        
        viewerSubject.innerText = mail.subject || '(Tanpa Subjek)';
        viewerFrom.innerText = `Dari: ${mail.from}`;
        
        // Memproses isi pesan agar link tetap bisa diklik
        const content = mail.htmlBody || mail.textBody || "Pesan tidak memiliki konten.";
        viewerBody.innerHTML = `<div class="mail-content-wrapper">${content}</div>`;
        
    } catch (e) {
        viewerBody.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <p>❌ Gagal memuat isi pesan.</p>
                <button onclick="readMail('${id}')" style="margin-top:10px; font-size:12px;">Coba Lagi</button>
            </div>`;
    }
}

/**
 * Menutup modal viewer
 */
function closeViewer() {
    document.getElementById('email-viewer').classList.add('hidden');
}

/**
 * Menyalin alamat email ke clipboard dengan Feedback Visual
 */
function copyToClipboard() {
    const emailField = document.getElementById("email-address");
    const copyBtn = document.getElementById('copy-btn');
    
    navigator.clipboard.writeText(emailField.value).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Tersalin! ✅";
        copyBtn.style.background = "#22c55e";
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = ""; 
        }, 1500);
    }).catch(() => {
        // Fallback jika API Clipboard gagal
        emailField.select();
        document.execCommand('copy');
        alert("Alamat tersalin!");
    });
}