let kamusData = [];

async function muatKamus() {
    try {
        const dataResponse = await fetch('./data.json');
        if (!dataResponse.ok) {
            throw new Error(`Gagal memuat data.json: HTTP ${dataResponse.status}`);
        }

        const data = await dataResponse.json();
        if (!Array.isArray(data)) {
            throw new Error('Format data.json tidak valid: harus berupa array.');
        }

        kamusData = data;
        tampilkanHasil(kamusData);
    } catch (error) {
        console.error('Gagal memuat kamus:', error);
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

    const groupedData = data.reduce((grup, item) => {
        const bab = item.chapter_arabic;
        if (!grup[bab]) grup[bab] = [];
        grup[bab].push(item);
        return grup;
    }, {});

    for (const [bab, items] of Object.entries(groupedData)) {
        const details = document.createElement('details');
        details.open = true;
        details.style = "background: white; border: 1px solid #cbd5e1; margin-bottom: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";

        const summary = document.createElement('summary');
        summary.style = "background: #0f172a; color: white; padding: 15px; font-size: 1.4em; font-weight: bold; cursor: pointer; text-align: right; direction: rtl; list-style: none;";
        summary.innerHTML = `📖 ${bab}`;
        details.appendChild(summary);

        items.forEach(item => {
            const div = document.createElement('div');
            div.style = "padding: 15px; border-bottom: 1px solid #e2e8f0;";

            const term = document.createElement('h3');
            term.textContent = item.term_arabic;
            term.style = "margin: 0 0 10px; font-size: 1.5em; text-align: right; direction: rtl; color: #0f172a;";
            div.appendChild(term);

            const literal = document.createElement('p');
            literal.innerHTML = `<strong>Makna literal:</strong> ${item.meaning_literal || '-'}`;
            div.appendChild(literal);

            const sharaf = document.createElement('p');
            sharaf.innerHTML = `<strong>Sharaf:</strong> ${item.sharaf || '-'}`;
            div.appendChild(sharaf);

            const fiqh = document.createElement('p');
            fiqh.innerHTML = `<strong>Makna fiqih:</strong> ${item.meaning_fiqh || '-'}`;
            div.appendChild(fiqh);

            details.appendChild(div);
        });

        container.appendChild(details);
    }
}

function cariKamus() {
    const input = document.getElementById('searchInput');
    const keyword = input ? input.value.trim().toLowerCase() : '';

    if (!keyword) {
        tampilkanHasil(kamusData);
        return;
    }

    const hasil = kamusData.filter(item =>
        String(item.term_arabic || '').toLowerCase().includes(keyword) ||
        String(item.meaning_literal || '').toLowerCase().includes(keyword) ||
        String(item.meaning_fiqh || '').toLowerCase().includes(keyword)
    );

    tampilkanHasil(hasil);
}

muatKamus();