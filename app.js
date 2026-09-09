let kamusData = []; 

async function muatKamus() {
    try {
        const response = await fetch('./data.json');
        kamusData = await response.json();
        tampilkanHasil(kamusData); 
    } catch (error) {
        document.getElementById('hasil').innerHTML = "<p style='text-align:center; color:red;'>Gagal memuat data kamus.</p>";
    }
}

function tampilkanHasil(data) {
    const container = document.getElementById('hasil');
    container.innerHTML = ''; 

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">Kata tidak ditemukan.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.style = "background: white; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);";
        
        // Cek apakah data sharaf ada, jika ada buat kotak khusus sharaf
        let sharafHTML = '';
        if(item.word_form && item.fiil_madhi) {
            sharafHTML = `
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 10px; margin: 10px 0; border-radius: 6px; font-size: 0.9em; color: #475569;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 5px;">
                    <span><strong>Bentuk Kata:</strong> ${item.word_form}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span><strong>Madhi:</strong> <span dir="rtl" style="font-size:1.1em; color:#0f172a;">${item.fiil_madhi}</span></span>
                    <span><strong>Mudhari':</strong> <span dir="rtl" style="font-size:1.1em; color:#0f172a;">${item.fiil_mudhari}</span></span>
                </div>
            </div>`;
        }

        card.innerHTML = `
            <h2 style="margin: 0 0 5px 0; color: #0f172a; text-align: right; font-size: 1.8em;" dir="rtl">${item.term_arabic}</h2>
            <p style="margin: 0 0 10px 0; color: #64748b; font-style: italic;">${item.transliteration}</p>
            
            ${sharafHTML} <!-- Menampilkan kotak sharaf di sini -->

            <p style="margin: 8px 0;"><strong>Arti:</strong> ${item.meaning_literal}</p>
            <p style="margin: 8px 0; line-height: 1.6;"><strong>Makna Fikih:</strong> ${item.meaning_fiqh}</p>
            <p style="margin: 15px 0 0 0; font-size: 0.85em; display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 20px;">🏷️ ${item.chapter}</p>
        `;
        container.appendChild(card);
    });
}

document.getElementById('inputCari').addEventListener('keyup', function() {
    const kataKunci = this.value.toLowerCase();
    
    const hasilFilter = kamusData.filter(item => 
        item.term_arabic.includes(kataKunci) || 
        item.transliteration.toLowerCase().includes(kataKunci) ||
        item.meaning_literal.toLowerCase().includes(kataKunci) ||
        item.meaning_fiqh.toLowerCase().includes(kataKunci)
    );
    
    tampilkanHasil(hasilFilter);
});

muatKamus();
