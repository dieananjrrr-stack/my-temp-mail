const API_URL = 'https://www.1secmail.com/api/v1/';
let user = '';
let domain = '1secmail.com';
let refreshInterval;

// 1. Generate Email Random saat web dibuka
document.addEventListener('DOMContentLoaded', generateNewEmail);

function generateNewEmail() {
    // Buat string random untuk username
    user = Math.random().toString(36).substring(7);
    const email = `${user}@${domain}`;
    
    document.getElementById('email-address').value = email;
    document.getElementById('email-list').innerHTML = '<div class="empty-state">Menunggu pesan...</div>';
    
    // Mulai auto refresh
    clearInterval(refreshInterval);
    refreshInterval = setInterval(checkMail, 5000); // Cek tiap 5 detik
}

// 2. Cek Inbox
async function checkMail() {
    const timer = document.getElementById('timer');
    timer.innerText = 'Mengecek...';
    
    try {
        const res = await fetch(`${API_URL}?action=getMessages&login=${user}&domain=${domain}`);
        const emails = await res.json();
        
        renderList(emails);
        setTimeout(() => timer.innerText = 'Auto-refresh dalam 5s...', 1000);
    } catch (e) {
        console.error('Gagal fetch:', e);
    }
}

// 3. Tampilkan List Email
function renderList(emails) {
    const list = document.getElementById('email-list');
    
    if (emails.length === 0) {
        list.innerHTML = '<div class="empty-state">Belum ada pesan masuk...</div>';
        return;
    }

    list.innerHTML = emails.map(mail => `
        <div class="email-item" onclick="readMail('${mail.id}')">
            <span class="email-sender">${mail.from}</span>
            <span class="email-subject">${mail.subject}</span>
            <div style="font-size:12px; color:#999; margin-top:4px">${mail.date}</div>
        </div>
    `).join('');
}

// 4. Baca Isi Email
async function readMail(id) {
    try {
        const res = await fetch(`${API_URL}?action=readMessage&login=${user}&domain=${domain}&id=${id}`);
        const mail = await res.json();
        
        document.getElementById('view-subject').innerText = mail.subject;
        document.getElementById('view-from').innerText = mail.from;
        document.getElementById('view-body').innerHTML = mail.htmlBody || mail.textBody; // Prioritas HTML
        
        document.getElementById('email-viewer').classList.remove('hidden');
    } catch (e) {
        alert("Gagal membuka pesan");
    }
}

function closeViewer() {
    document.getElementById('email-viewer').classList.add('hidden');
}

function copyToClipboard() {
    const copyText = document.getElementById("email-address");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Email disalin: " + copyText.value);
}