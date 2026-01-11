/**
 * Temp Mail Logic by Diean
 * Menggunakan API 1secmail untuk layanan email sementara
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
    // Membuat ID acak sepanjang 7 karakter
    user = Math.random().toString(36).substring(7);
    const email = `${user}@${domain}`;
    
    // Tampilkan di input
    document.getElementById('email-address').value = email;
    
    // Reset tampilan kotak masuk
    document.getElementById('email-list').innerHTML = '<div class="empty-state">Menunggu pesan masuk...</div>';
    
    // Atur ulang interval pengecekan (setiap 5 detik)
    clearInterval(refreshInterval);
    refreshInterval = setInterval(checkMail, 5000);
}

/**
 * Mengecek apakah ada email masuk untuk alamat saat ini
 */
async function checkMail() {
    const timer = document.getElementById('timer');
    
    try {
        const res = await fetch(`${API_URL}?action=getMessages&login=${user}&domain=${domain}`);
        const emails = await res.json();
        
        renderList(emails);
        timer.innerText = emails.length > 0 ? `Ada ${emails.length} pesan masuk` : 'Menunggu pesan masuk...';
    } catch (e) {
        console.error('Koneksi terganggu:', e);
        timer.innerText = 'Gagal mengecek pesan.';
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

    // Map data email ke elemen HTML
    list.innerHTML = emails.map(mail => `
        <div class="email-item" onclick="readMail('${mail.id}')">
            <div style="font-weight:bold; color: #a5b4fc;">${mail.from}</div>
            <div style="font-size:13px; opacity:0.8; margin-top: 3px;">${mail.subject}</div>
            <div style="font-size:11px; opacity:0.5; margin-top: 5px;">ID: ${mail.id}</div>
        </div>
    `).join('');
}

/**
 * Membaca detail isi pesan email
 */
async function readMail(id) {
    try {
        const res = await fetch(`${API_URL}?action=readMessage&login=${user}&domain=${domain}&id=${id}`);
        const mail = await res.json();
        
        // Isi konten ke modal viewer
        document.getElementById('view-subject').innerText = mail.subject || '(Tanpa Subjek)';
        document.getElementById('view-from').innerText = "Dari: " + mail.from;
        
        // Gunakan htmlBody jika tersedia, jika tidak gunakan textBody
        const bodyContent = mail.htmlBody || mail.textBody;
        document.getElementById('view-body').innerHTML = bodyContent;
        
        // Tampilkan modal
        document.getElementById('email-viewer').classList.remove('hidden');
    } catch (e) {
        console.error('Gagal memuat pesan:', e);
        alert("Pesan tidak bisa dibuka.");
    }
}

/**
 * Menutup modal viewer
 */
function closeViewer() {
    document.getElementById('email-viewer').classList.add('hidden');
}

/**
 * Menyalin alamat email ke clipboard
 */
function copyToClipboard() {
    const emailField = document.getElementById("email-address");
    
    // Cara modern menyalin teks
    navigator.clipboard.writeText(emailField.value).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.innerText;
        
        // Efek visual tombol saat berhasil salin
        copyBtn.innerText = "Tersalin!";
        copyBtn.style.background = "#10b981";
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = ""; // Kembali ke warna asal CSS
        }, 2000);
    }).catch(err => {
        // Fallback jika navigator.clipboard gagal
        emailField.select();
        document.execCommand('copy');
        alert("Alamat email disalin!");
    });
}