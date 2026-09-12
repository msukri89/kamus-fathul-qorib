# Kamus Fathul Qorib — Format V2

Status: **DESIGN BASELINE / PROTOTYPE**

Dokumen ini menjadi acuan sebelum data lama dimigrasikan. Format lama tidak diubah oleh dokumen ini.

## 1. Tujuan

Format V2 mengubah kamus dari kumpulan entri datar menjadi **teks Arab utuh yang dapat dibaca**, dengan setiap lafaz dapat dibuka untuk melihat analisis leksikalnya tanpa meninggalkan halaman bacaan.

Prinsip utama:

- teks Arab lengkap adalah unit bacaan utama;
- terjemah literal mengikuti makna teks, bukan sekadar terjemah kata-per-kata yang kaku;
- `lexeme` adalah identitas leksikal yang dapat dipakai ulang;
- `token` adalah kemunculan lafaz tertentu di dalam teks;
- satu lexeme dapat memiliki banyak token;
- fungsi nahwu, bila diperlukan untuk riset internal, melekat pada token karena bergantung pada konteks;
- UI **tidak menampilkan kedudukan nahwu**;
- analisis yang belum yakin tidak boleh dipaksakan;
- makna leksikal dan makna kontekstual harus dibedakan;
- popup harus mengembalikan fokus ke lafaz yang diklik setelah ditutup.

## 2. Pemisahan Lexeme dan Token

### Lexeme

`lexeme` adalah unit analisis yang relatif stabil dan dapat dipakai kembali.

Contoh:

```json
{
  "lexeme_id": "LEX_KITAB_001",
  "lemma": "كِتَاب",
  "type": "اسم",
  "morphology": "مصدر",
  "root": "ك ت ب",
  "pattern": "فِعَال"
}
```

Informasi seperti akar, wazan, dan derivasi disimpan di lexeme bila memang dapat dipertanggungjawabkan.

### Token

`token` adalah kemunculan konkret di dalam kalimat.

```json
{
  "arabic": "الْكِتَابُ",
  "lexeme_id": "LEX_KITAB_001",
  "context": "lafaz utama yang sedang didefinisikan"
}
```

Token boleh mempunyai konteks atau fungsi internal yang berbeda meskipun menunjuk ke lexeme yang sama.

## 3. Aturan Identitas Lexeme

Dua token menggunakan `lexeme_id` yang sama apabila keduanya merupakan realisasi dari **unit leksikal yang sama**, bukan hanya karena tulisannya mirip.

Perubahan berikut pada umumnya **tidak membuat lexeme baru**:

- ال التعريف;
- perubahan i'rab akhir;
- mufrad/mutsanna/jamak bila masih merupakan infleksi dari lema yang sama dan analisis leksikalnya memang sama;
- perubahan jenis kelamin atau jumlah yang bersifat infleksional;
- perubahan bentuk fi'il karena waktu atau dhamir yang tetap berasal dari leksem verbal yang sama.

Sebaliknya, jangan menyatukan dua bentuk hanya karena akar hurufnya sama. Bentuk turunan yang telah menjadi unit leksikal berbeda dapat memerlukan `lexeme_id` berbeda.

## 4. Bentuk Turunan

`root`, `pattern`, dan `derivation` bukan alasan otomatis untuk menyatukan lexeme.

Contoh prinsip:

- `كَتَبَ` dan `كِتَاب` berhubungan secara derivatif, tetapi bukan berarti harus mempunyai lexeme yang sama;
- `عَلِمَ` dan `عِلْم` dapat dicatat sebagai lexeme berbeda yang mempunyai hubungan derivatif;
- bila dibutuhkan, hubungan tersebut disimpan melalui field `derives_from` atau `related_lexemes`.

Tujuannya agar kamus tidak mencampur **identitas kata** dengan **hubungan sharaf**.

## 5. Makna

Setiap lexeme minimal membedakan:

- `literal`: arti leksikal dasar yang paling relevan;
- `context_note`: penjelasan mengapa makna tertentu dipakai pada bagian tersebut.

Jika makna berubah karena konteks, jangan mengubah arti leksikal global. Tambahkan informasi pada token atau konteks section.

Contoh:

```json
{
  "literal": "masuk; termasuk",
  "context_note": "Pada konteks ini menunjukkan sesuatu yang termasuk dalam cakupan tertentu."
}
```

## 6. Lafaz Fungsi

Huruf dan unsur gramatikal seperti `وَ`, `فَ`, `مِنْ`, `أَمَّا`, serta gabungan seperti `مِمَّا` tetap boleh menjadi token agar urutan teks utuh dapat direpresentasikan.

Namun tidak semua token harus memiliki `lexeme_id`.

Dengan demikian:

```json
{
  "arabic": "وَ",
  "lexeme_id": null,
  "type": "حرف عطف",
  "literal": "dan"
}
```

Tidak boleh dipaksa masuk ke sistem lexeme hanya demi konsistensi teknis.

## 7. Bentuk Gabungan

Lafaz yang secara tulisan merupakan gabungan beberapa unsur, misalnya `بِمَعْنَى` atau `مِمَّا`, dapat dipertahankan sebagai satu token tampilan agar pembacaan natural.

Jika analisis internal membutuhkan pemecahan unsur, gunakan struktur tambahan seperti:

```json
{
  "arabic": "مِمَّا",
  "lexeme_id": null,
  "components": ["مِنْ", "مَا"]
}
```

Jangan mengorbankan bentuk teks yang dibaca pengguna demi analisis internal.

## 8. Nahwu

Informasi nahwu boleh tetap disimpan pada token untuk kebutuhan riset, validasi, atau pengembangan di masa depan.

Contoh:

```json
{
  "arabic": "الْكِتَابُ",
  "lexeme_id": "LEX_KITAB_001",
  "grammar_role": "مبتدأ"
}
```

Tetapi field tersebut **bukan bagian dari tampilan popup pengguna**.

Popup hanya menampilkan informasi yang berhubungan dengan lafaz:

- lafaz Arab;
- makna literal;
- lemma;
- jenis kata;
- sharaf;
- akar;
- wazan;
- tashrif/derivasi;
- catatan konteks bila diperlukan;
- status bahwa lexeme sudah pernah dibahas.

## 9. Referensi Lafaz

Kemunculan kedua dan seterusnya tidak boleh menyalin ulang analisis leksikal.

Contoh:

```json
{
  "arabic": "اسْمٌ",
  "lexeme_id": "LEX_ISM_001",
  "reference": {
    "status": "reused",
    "first_seen": "SEC_THARAH_001"
  }
}
```

Untuk tahap berikutnya, struktur referensi sebaiknya berkembang menjadi daftar lokasi:

```json
"references": [
  {
    "section_id": "SEC_THARAH_001",
    "token_index": 10
  }
]
```

Ini lebih kuat daripada menyimpan teks catatan manual seperti `sudah dibahas`.

## 10. Ambiguitas dan Homonimi

Tulisan Arab yang sama tidak selalu berarti lexeme yang sama.

Karena itu identitas lexeme tidak boleh dibuat hanya berdasarkan string Arab yang telah dinormalisasi.

Jika satu bentuk memiliki dua makna leksikal yang benar-benar berbeda, gunakan lexeme terpisah atau struktur sense, misalnya:

```json
{
  "lexeme_id": "LEX_X_001",
  "senses": [
    {"sense_id": "S1", "literal": "..."},
    {"sense_id": "S2", "literal": "..."}
  ]
}
```

Keputusan antara satu lexeme dengan banyak sense atau beberapa lexeme akan ditentukan setelah diuji pada data nyata Fathul Qorib.

## 11. Status Kepastian Analisis

Analisis ilmiah tidak boleh dipaksa lengkap.

Field berikut dapat digunakan pada tahap berikutnya:

```json
"confidence": "verified"
```

Nilai yang direncanakan:

- `verified` — telah diperiksa terhadap sumber yang memadai;
- `probable` — kuat tetapi masih perlu pemeriksaan;
- `uncertain` — belum cukup dasar untuk ditetapkan.

Untuk `uncertain`, UI tidak boleh menyajikan analisis sebagai fakta pasti.

## 12. Struktur Tingkat Atas V2

Struktur target:

```text
V2 document
├── format_version
├── source
├── metadata
├── lexemes[]
│   ├── lexeme_id
│   ├── lemma
│   ├── type
│   ├── morphology
│   ├── root
│   ├── pattern
│   ├── derivation
│   ├── literal
│   └── related_lexemes[]
└── sections[]
    ├── section_id
    ├── title_arabic
    ├── text_arabic
    ├── translation_literal
    ├── translation_note
    └── tokens[]
        ├── arabic
        ├── lexeme_id
        ├── components[]
        ├── grammar_role (internal)
        ├── context
        └── reference
```

## 13. Prinsip Migrasi

Jangan langsung mengonversi seluruh data lama.

Urutan kerja:

1. kunci model V2;
2. uji pada pembukaan Fathul Qorib;
3. uji pada paragraf Thaharah yang lebih panjang dan memiliki pengulangan lafaz;
4. uji pada bentuk jamak, fi'il, huruf, dhamir, dan lafaz gabungan;
5. uji popup dan pemulihan fokus;
6. audit ulang analisis sharaf;
7. setelah schema stabil, baru buat migrator dari data lama;
8. migrasikan bertahap sambil mempertahankan aplikasi lama tetap berjalan.

**Tidak ada file data lama yang boleh dihapus atau ditimpa selama tahap prototype.**
