/**
 * Temp Mail Logic by Diean
 * Versi Perbaikan: Penanganan Error & Retry Otomatis
 */

const API_URL = 'https://www.1secmail.com/api/v1/';
let user = '';
let domain = '1secmail.com';
let refreshInterval;

// Jalankan saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', generateNewEmail);

/**
 * Membuat alamat email baru secara acak
 */
function generateNewEmail() {
    user = Math.random().toString(36).substring(7);
    const email = `${user}@${domain}`;
    
    document.getElementById('email-address').value = email;
    document.getElementById('email-list').innerHTML = '<div class="empty-state">Menunggu pesan masuk...</div>';
    
    clearInterval(refreshInterval);
    // Interval pengecekan pesan
    refreshInterval = setInterval(checkMail, 5000);
}

/**
 * Mengecek apakah ada email masuk
 */
async function checkMail() {
    const timer = document.getElementById('timer');
    
    try {
        // Menggunakan fetch dengan mode cors eksplisit
        const res = await fetch(`${API_URL}?action=getMessages&login=${user}&domain=${domain}`, {
            method: 'GET',
            mode: 'cors'
        });

        if (!res.ok) throw new Error('Server Error');

        const emails = await res.json();
        renderList(emails);
        
        if (emails.length > 0) {
            timer.innerText = `Ada ${emails.length} pesan masuk`;
            timer.style.color = "#10b981"; // Hijau jika ada pesan
        } else {
            timer.innerText = 'Menunggu pesan masuk...';
            timer.style.color = ""; 
        }
    } catch (e) {
        console.error('Koneksi terganggu:', e);
        // Menampilkan status error yang lebih ramah
        timer.innerText = '⚠️ Gangguan koneksi, mencoba lagi...';
        timer.style.color = "#f87171";
    }
}

/**
 * Menampilkan daftar email ke layar
 */
function renderList(emails) {
    const list = document.getElementById('email-list');
    
    if (emails.length === 0) {
        list.innerHTML = '<div class="empty-state">Belum ada email...</div>';
        return;
    }

    list.innerHTML = emails.map(mail => `
        <div class="email-item" onclick="readMail('${mail.id}')">
            <div style="font-weight:bold; color: #a5b4fc;">${mail.from}</div>
            <div style="font-size:13px; opacity:0.8; margin-top: 3px;">${mail.subject}</div>
            <div style="font-size:11px; opacity:0.5; margin-top: 5px;">Klik untuk membaca</div>
        </div>
    `).join('');
}

/**
 * Membaca detail isi pesan email
 */
async function readMail(id) {
    const viewerBody = document.getElementById('view-body');
    viewerBody.innerHTML = "Sedang memuat isi pesan...";
    document.getElementById('email-viewer').classList.remove('hidden');

    try {
        const res = await fetch(`${API_URL}?action=readMessage&login=${user}&domain=${domain}&id=${id}`);
        const mail = await res.json();
        
        document.getElementById('view-subject').innerText = mail.subject || '(Tanpa Subjek)';
        document.getElementById('view-from').innerText = "Dari: " + mail.from;
        
        // Menampilkan isi pesan (HTML atau Teks)
        viewerBody.innerHTML = mail.htmlBody || mail.textBody || "Pesan kosong.";
    } catch (e) {
        viewerBody.innerHTML = "Gagal memuat isi pesan. Periksa koneksi internet Anda.";
    }
}

function closeViewer() {
    document.getElementById('email-viewer').classList.add('hidden');
}

/**
 * Menyalin alamat email ke clipboard
 */
function copyToClipboard() {
    const emailField = document.getElementById("email-address");
    
    navigator.clipboard.writeText(emailField.value).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.innerText;
        
        copyBtn.innerText = "Tersalin!";
        copyBtn.style.background = "#10b981";
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = ""; 
        }, 2000);
    }).catch(() => {
        emailField.select();
        document.execCommand('copy');
    });
}