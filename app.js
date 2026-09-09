// Tempat menyimpan data dari JSON
let kamusData = []; 

// Fungsi untuk memuat data dari file data.json
async function muatKamus() {
    try {
        const response = await fetch('./data.json');
        kamusData = await response.json();
        tampilkanHasil(kamusData); // Tampilkan semua data di awal
    } catch (error) {
        document.getElementById('hasil').innerHTML = "<p style='text-align:center; color:red;'>Gagal memuat data kamus.</p>";
    }
}

// Fungsi untuk menampilkan data ke layar
function tampilkanHasil(data) {
    const container = document.getElementById('hasil');
    container.innerHTML = ''; // Bersihkan hasil sebelumnya

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">Kata tidak ditemukan.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        // Desain kotak (card) untuk setiap kata
        card.style = "background: white; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);";
        
        card.innerHTML = `
            <h2 style="margin: 0 0 5px 0; color: #0f172a; text-align: right;" dir="rtl">${item.term_arabic}</h2>
            <p style="margin: 0 0 10px 0; color: #64748b; font-style: italic;">${item.transliteration}</p>
            <p style="margin: 5px 0;"><strong>Arti:</strong> ${item.meaning_literal}</p>
            <p style="margin: 5px 0;"><strong>Makna Fikih:</strong> ${item.meaning_fiqh}</p>
            <p style="margin: 10px 0 0 0; font-size: 0.85em; display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px;">🏷️ ${item.chapter}</p>
        `;
        container.appendChild(card);
    });
}

// Fungsi untuk mendeteksi ketikan di kotak pencarian
document.getElementById('inputCari').addEventListener('keyup', function() {
    const kataKunci = this.value.toLowerCase();
    
    // Cari kecocokan di huruf arab, tulisan latin, atau artinya
    const hasilFilter = kamusData.filter(item => 
        item.term_arabic.includes(kataKunci) || 
        item.transliteration.toLowerCase().includes(kataKunci) ||
        item.meaning_literal.toLowerCase().includes(kataKunci) ||
        item.meaning_fiqh.toLowerCase().includes(kataKunci)
    );
    
    tampilkanHasil(hasilFilter);
});

// Jalankan aplikasi
muatKamus();
