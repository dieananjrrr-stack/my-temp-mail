/**
 * Temp Mail Logic by Diean
 * Modifikasi Akhir: Optimasi Stabilitas API & UI Feedback
 */

const API_URL = 'https://www.1secmail.com/api/v1/';
const DOMAINS = ['1secmail.com', '1secmail.net', '1secmail.org']; 
let user = '';
let domain = DOMAINS[0];
let refreshInterval;

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', generateNewEmail);

/**
 * Membuat alamat email baru
 */
function generateNewEmail() {
    // Generate username unik
    user = Math.random().toString(36).substring(2, 10);
    domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    
    const email = `${user}@${domain}`;
    
    // Update input alamat email
    const emailInput = document.getElementById('email-address');
    if (emailInput) {
        emailInput.value = email;
    }
    
    // Reset list pesan dengan indikator loading sederhana
    const list = document.getElementById('email-list');
    if (list) {
        list.innerHTML = `
            <div class="empty-state">
                <p style="opacity: 0.6;">Menyiapkan kotak masuk...</p>
            </div>`;
    }
    
    // Bersihkan interval lama jika ada
    if (refreshInterval) clearInterval(refreshInterval);
    
    // Cek pesan setiap 5 detik
    refreshInterval = setInterval(checkMail, 5000);
    
    // Langsung cek pesan pertama kali
    checkMail();
}

/**
 * Fungsi pengecekan pesan masuk
 */
async function checkMail() {
    const timer = document.getElementById('timer');
    
    try {
        const response = await fetch(`${API_URL}?action=getMessages&login=${user}&domain=${domain}`);
        
        if (!response.ok) throw new Error('Network response was not ok');

        const emails = await response.json();
        renderList(emails);
        
        if (timer) {
            if (emails.length > 0) {
                timer.innerText = `✅ Ada ${emails.length} pesan baru`;
                timer.style.color = "#4ade80"; 
            } else {
                timer.innerText = '📡 Mencari pesan masuk...';
                timer.style.color = "#94a3b8"; 
            }
        }
    } catch (e) {
        if (timer) {
            timer.innerText = '🔄 Menghubungkan ulang...';
            timer.style.color = "#fbbf24";
        }
        console.warn('Cek pesan gagal, mencoba lagi dalam 5 detik...');
    }
}

/**
 * Menampilkan list email ke UI
 */
function renderList(emails) {
    const list = document.getElementById('email-list');
    if (!list) return;

    if (emails.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>Belum ada pesan.</p>
                <small style="opacity:0.5;">Refresh otomatis aktif...</small>
            </div>`;
        return;
    }

    list.innerHTML = emails.map(mail => `
        <div class="email-item" onclick="readMail('${mail.id}')" style="
            background: rgba(255, 255, 255, 0.08);
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: 0.3s;
        ">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong style="color: #a5b4fc;">${mail.from}</strong>
                <span style="font-size: 11px; opacity: 0.6;">${mail.date.split(' ')[1]}</span>
            </div>
            <div style="font-size: 13px; opacity: 0.8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${mail.subject || '(Tanpa Subjek)'}
            </div>
        </div>
    `).join('');
}

/**
 * Membaca isi detail email
 */
async function readMail(id) {
    const viewerBody = document.getElementById('view-body');
    const viewerSubject = document.getElementById('view-subject');
    const viewerFrom = document.getElementById('view-from');
    
    if (viewerBody) viewerBody.innerHTML = '<p style="text-align:center; padding: 20px;">Membuka pesan...</p>';
    
    const viewer = document.getElementById('email-viewer');
    if (viewer) viewer.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}?action=readMessage&login=${user}&domain=${domain}&id=${id}`);
        const mail = await response.json();
        
        if (viewerSubject) viewerSubject.innerText = mail.subject || '(Tanpa Subjek)';
        if (viewerFrom) viewerFrom.innerText = `Dari: ${mail.from}`;
        
        const content = mail.htmlBody || mail.textBody || "Pesan kosong.";
        if (viewerBody) {
            viewerBody.innerHTML = `<div style="color: #cbd5e1; line-height: 1.6;">${content}</div>`;
            // Pastikan link di dalam email bisa diklik dan dibuka di tab baru
            const links = viewerBody.querySelectorAll('a');
            links.forEach(link => link.setAttribute('target', '_blank'));
        }
        
    } catch (e) {
        if (viewerBody) viewerBody.innerHTML = '<p style="text-align:center; color: #f87171;">❌ Gagal memuat pesan.</p>';
    }
}

/**
 * Menutup modal baca email
 */
function closeViewer() {
    const viewer = document.getElementById('email-viewer');
    if (viewer) viewer.classList.add('hidden');
}

/**
 * Fungsi Salin Email
 */
function copyToClipboard() {
    const emailField = document.getElementById("email-address");
    if (!emailField) return;

    navigator.clipboard.writeText(emailField.value).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Tersalin! ✅";
            copyBtn.style.background = "#22c55e";
            
            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.style.background = ""; 
            }, 1500);
        }
    }).catch(() => {
        emailField.select();
        document.execCommand('copy');
        alert("Alamat tersalin!");
    });
}