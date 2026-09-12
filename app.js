let kamusData = [];

async function muatKamus() {
    try {
        const sumberData = ['./data.json', './data-bab2.json', './data-bab3.json', './data-bab4.json', './data-bab5.json', './data-bab6.json', './data-bab7.json', './data-bab8.json', './data-bab9.json', './data-bab10.json', './data-bab11.json', './data-bab12.json', './data-bab13.json', './data-bab14.json', './data-bab15.json', './data-bab16.json', './data-bab17.json', './data-bab18.json', './data-bab19.json', './data-bab20.json', './data-bab21.json', './data-bab22.json', './data-bab23.json', './data-bab24.json', './data-bab25.json', './data-bab26.json', './data-bab27.json', './data-bab28.json', './data-bab29.json', './data-bab30.json', './data-bab31.json', './data-bab32.json', './data-bab33.json', './data-bab34.json', './data-bab35.json', './data-bab36.json', './data-bab37.json', './data-bab38.json', './data-bab39.json', './data-bab40.json', './data-bab41.json', './data-bab42.json', './data-bab43.json', './data-bab44.json', './data-bab45.json', './data-bab46.json', './data-bab47.json', './data-bab48.json', './data-bab49.json', './data-bab50.json'];
        const responses = await Promise.all(sumberData.map(path => fetch(path)));

        for (let i = 0; i < responses.length; i++) {
            if (!responses[i].ok) {
                throw new Error(`Gagal memuat ${sumberData[i]}: HTTP ${responses[i].status}`);
            }
        }

        const semuaData = await Promise.all(responses.map(response => response.json()));
        if (semuaData.some(data => !Array.isArray(data))) {
            throw new Error('Format salah satu file data kamus tidak valid: harus berupa array.');
        }

        kamusData = semuaData.flat();
        tampilkanHasil(kamusData);
    } catch (error) {
        console.error('Gagal memuat kamus:', error);
        document.getElementById('hasil').innerHTML = "<p style='text-align:center; color:red;'>Gagal memuat data kamus.</p>";
    }
}

function normalisasiArab(teks) {
    return String(teks || '')
        .normalize('NFKC')
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/[إأآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[ـ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalisasiTeks(teks) {
    return String(teks || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function cocokPencarian(teks, keyword, keywordArab) {
    const nilai = String(teks || '');
    return normalisasiTeks(nilai).includes(normalisasiTeks(keyword)) ||
        normalisasiArab(nilai).includes(keywordArab);
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
    const keyword = input ? input.value.trim() : '';
    const keywordArab = normalisasiArab(keyword);

    if (!keyword) {
        tampilkanHasil(kamusData);
        return;
    }

    const hasil = kamusData.filter(item =>
        cocokPencarian(item.term_arabic, keyword, keywordArab) ||
        cocokPencarian(item.chapter_arabic, keyword, keywordArab) ||
        cocokPencarian(item.meaning_literal, keyword, keywordArab) ||
        cocokPencarian(item.meaning_fiqh, keyword, keywordArab)
    );

    tampilkanHasil(hasil);
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', cariKamus);
}

muatKamus();
