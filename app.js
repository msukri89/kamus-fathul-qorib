let kamusData = [];

async function muatKamus() {
    try {
        const [dataResponse, correctionsResponse, wudhuCorrectionsResponse, sunnahWudhuCorrectionsResponse, nawaqidhWudhuCorrectionsResponse] = await Promise.all([
            fetch('./data.json'),
            fetch('./data-corrections.json'),
            fetch('./data-corrections-wudhu.json'),
            fetch('./data-corrections-sunnah-wudhu.json'),
            fetch('./data-corrections-nawaqidh-wudhu.json')
        ]);

        const data = await dataResponse.json();
        const corrections = correctionsResponse.ok ? await correctionsResponse.json() : [];
        const wudhuCorrections = wudhuCorrectionsResponse.ok ? await wudhuCorrectionsResponse.json() : [];
        const sunnahWudhuCorrections = sunnahWudhuCorrectionsResponse.ok ? await sunnahWudhuCorrectionsResponse.json() : [];
        const nawaqidhWudhuCorrections = nawaqidhWudhuCorrectionsResponse.ok ? await nawaqidhWudhuCorrectionsResponse.json() : [];
        const allCorrections = [...corrections, ...wudhuCorrections, ...sunnahWudhuCorrections, ...nawaqidhWudhuCorrections];

        // Data utama tetap dipertahankan, sedangkan entri yang sudah diaudit
        // dioverride berdasarkan kombinasi bab + istilah Arab.
        const correctionsMap = new Map(
            allCorrections.map(item => [`${item.chapter_arabic}|||${item.term_arabic}`, item])
        );

        kamusData = data.map(item => {
            const key = `${item.chapter_arabic}|||${item.term_arabic}`;
            return correctionsMap.has(key)
                ? { ...item, ...correctionsMap.get(key) }
                : item;
        });

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

        const contentDiv = document.createElement('div');
        contentDiv.style = "padding: 0 15px;";

        items.forEach((item, index) => {
            const wordBlock = document.createElement('div');
            const borderStyle = index < items.length - 1 ? 'border-bottom: 1px dashed #cbd5e1;' : '';
            wordBlock.style = `padding: 15px 0; ${borderStyle}`;

            let sharafHTML = '';
            if (item.sharaf && item.sharaf.trim() !== "") {
                sharafHTML = `
                <div style="text-align: right; direction: rtl; color: #0369a1; font-size: 1.3em; margin-bottom: 10px;">
                    ${item.sharaf}
                </div>`;
            }

            wordBlock.innerHTML = `
                <div style="font-size: 1.4em; margin-bottom: 8px; text-align: right; direction: rtl; color: #0f172a;">
                    <strong>${item.term_arabic}</strong> : <span style="font-size: 0.8em; color: #334155; font-weight: normal;">${item.meaning_literal}</span>
                </div>
                ${sharafHTML}
                <div style="color: #475569; line-height: 1.6; text-align: left;">
                    <strong>Makna Fikih:</strong> ${item.meaning_fiqh}
                </div>
            `;
            contentDiv.appendChild(wordBlock);
        });

        details.appendChild(contentDiv);
        container.appendChild(details);
    }
}

document.getElementById('inputCari').addEventListener('keyup', function() {
    const kataKunci = this.value.toLowerCase();

    const hasilFilter = kamusData.filter(item =>
        item.term_arabic.includes(kataKunci) ||
        item.meaning_literal.toLowerCase().includes(kataKunci) ||
        item.meaning_fiqh.toLowerCase().includes(kataKunci) ||
        item.chapter_arabic.includes(kataKunci)
    );

    tampilkanHasil(hasilFilter);
});

muatKamus();
