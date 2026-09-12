# Kamus Fathul Qorib — Pelajaran Uji V2 Thaharah

Status: **PROTOTYPE REVIEW**

Dokumen ini mencatat temuan dari dataset uji `data-v2-thaharah-water-test-v22.json` sebelum schema V2 dikunci.

## 1. Token gabungan tidak boleh memiliki satu lexeme utama secara membingungkan

Contoh:

`مَاءُ الْبَحْرِ`

Jika token tersebut hanya memiliki `lexeme_id = LEX_MA_001`, popup akan terlihat seolah-olah seluruh lafaz hanya dianalisis sebagai `مَاء`.

### Keputusan

Untuk token gabungan yang ingin diklik sebagai satu unit tampilan, gunakan:

```json
{
  "arabic": "مَاءُ الْبَحْرِ",
  "token_type": "phrase",
  "components": [
    {"arabic": "مَاءُ", "lexeme_id": "LEX_MA_001"},
    {"arabic": "الْبَحْرِ", "lexeme_id": "LEX_BAHR_001"}
  ]
}
```

Dengan demikian UI dapat memilih antara:

- popup frase, atau
- popup komponen tertentu.

Kita tidak boleh menggunakan `lexeme_id` tunggal sebagai representasi seluruh frase.

## 2. Makna kontekstual tidak boleh mengubah makna global lexeme

Contoh:

`غَيْرُ مُطَهِّرٍ`

Lexeme `مُطَهِّر` secara leksikal berarti **yang menyucikan**. Tetapi dalam konteks `غَيْرُ مُطَهِّرٍ`, makna keseluruhan menjadi **tidak menyucikan**.

### Keputusan

Lexeme tetap menyimpan makna leksikal:

```json
"literal": "yang menyucikan"
```

Sedangkan token boleh memiliki:

```json
"contextual_meaning": "tidak menyucikan"
```

Jangan mengubah `literal` lexeme menjadi "tidak menyucikan", karena negasi berasal dari `غَيْرُ`, bukan dari lexeme `مُطَهِّر`.

## 3. Bentuk jamak perlu dibedakan dari identitas lexeme

Contoh:

`مَاء` → `مِيَاه`

Untuk prototype kita menguji keduanya dengan lexeme yang sama karena yang dicari adalah identitas leksikalnya.

Namun token tetap harus menyimpan informasi bentuk yang muncul, misalnya:

```json
{
  "arabic": "مِيَاهٍ",
  "lexeme_id": "LEX_MA_001",
  "form": "مِيَاه",
  "number": "plural"
}
```

`number` dan informasi bentuk seperti ini merupakan atribut token/form, bukan alasan otomatis membuat lexeme baru.

## 4. Gabungan idhafah tetap menjaga komponen

Untuk:

`مَاءُ السَّمَاءِ`

lexeme `مَاء` dan `سَمَاء` harus tetap merupakan dua identitas leksikal.

Frase dapat memiliki terjemah kontekstual:

`air langit`

sedangkan masing-masing komponen tetap dapat dibuka untuk analisis tersendiri.

## 5. Jangan memaksakan analisis semua token

Partikel, isim maushul, angka, dhamir yang melekat, dan bentuk gabungan boleh menggunakan:

```json
"lexeme_id": null
```

sampai model analisisnya benar-benar ditetapkan.

Lebih baik `null` yang jujur daripada analisis sharaf yang tampak lengkap tetapi keliru.

## 6. Popup harus menentukan unit yang sedang diklik

Target UI V2:

- klik lafaz atomik → tampilkan lexeme tersebut;
- klik frase gabungan → tampilkan struktur frase dan komponen lexeme;
- konteks negasi, idhafah, jar-majrur, dan sejenisnya boleh memengaruhi makna konteks;
- **grammar_role tidak ditampilkan** kepada pembaca;
- setelah popup ditutup, fokus kembali ke lafaz yang diklik.

## 7. Temuan penting untuk schema final

Schema V2 berikutnya sebaiknya memisahkan tiga lapisan:

```text
FORM
  ↓
TOKEN / OCCURRENCE
  ↓
LEXEME
```

Dan untuk lafaz gabungan:

```text
PHRASE TOKEN
  ├── component FORM → LEXEME
  ├── component FORM → LEXEME
  └── contextual meaning
```

Ini lebih aman daripada memaksa setiap token mempunyai satu `lexeme_id`.

## 8. Status

Dataset uji ini **belum menjadi data produksi**.

Tidak ada data lama yang diubah oleh eksperimen ini. Tujuan tahap ini adalah menemukan kelemahan schema sebelum migrasi besar dilakukan.
