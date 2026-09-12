# Kamus Fathul Qorib — Format V2

Status: **DESIGN BASELINE / PROTOTYPE**

Dokumen ini menjadi acuan sebelum data lama dimigrasikan. Format lama tidak diubah oleh dokumen ini.

## 1. Tujuan

Format V2 mengubah kamus dari kumpulan entri datar menjadi **teks Arab utuh yang dapat dibaca**, dengan setiap lafaz dapat dibuka untuk melihat analisis leksikalnya tanpa meninggalkan halaman bacaan.

Prinsip utama:

- teks Arab lengkap adalah unit bacaan utama;
- terjemah literal mengikuti makna teks, bukan sekadar terjemah kata-per-kata yang kaku;
- `lexeme` adalah identitas leksikal yang dapat dipakai ulang;
- `form` adalah bentuk lafaz yang benar-benar muncul dalam teks;
- `token` / `occurrence` adalah kemunculan form di lokasi tertentu;
- satu lexeme dapat memiliki banyak form dan banyak token;
- token frase dapat memiliki beberapa komponen form yang masing-masing menunjuk ke lexeme berbeda;
- fungsi nahwu, bila diperlukan untuk riset internal, melekat pada token karena bergantung pada konteks;
- UI **tidak menampilkan kedudukan nahwu**;
- analisis yang belum yakin tidak boleh dipaksakan;
- makna leksikal dan makna kontekstual harus dibedakan;
- popup harus mengembalikan fokus ke lafaz yang diklik setelah ditutup.

## 2. Tiga Lapisan Identitas

Model V2 menggunakan tiga lapisan:

```text
FORM
  ↓
TOKEN / OCCURRENCE
  ↓
LEXEME
```

### Form

`form` adalah bentuk konkret yang tampak dalam teks.

Contoh:

```json
{
  "arabic": "مِيَاهٍ",
  "lexeme_id": "LEX_MA_001",
  "number": "plural"
}
```

Form menyimpan informasi yang memang melekat pada bentuk yang muncul, seperti variasi i'rab, jumlah, atau bentuk morfologis tertentu.

### Token / Occurrence

`token` adalah kemunculan form pada lokasi tertentu dalam section.

Token menyimpan informasi kontekstual, misalnya:

- `token_id`;
- `form`;
- `grammar_role` untuk kebutuhan internal;
- `contextual_meaning`;
- `reference`;
- `components` untuk frase.

### Lexeme

`lexeme` adalah unit analisis leksikal yang relatif stabil dan dapat dipakai kembali.

Contoh:

```json
{
  "lexeme_id": "LEX_MA_001",
  "lemma": "مَاء",
  "type": "اسم",
  "morphology": "اسم جامد",
  "root": "...",
  "literal": "air"
}
```

Informasi seperti akar, wazan, tashrif, dan makna leksikal disimpan pada lexeme bila memang dapat dipertanggungjawabkan.

## 3. Identitas Lexeme dan Variasi Bentuk

Dua form menggunakan `lexeme_id` yang sama apabila keduanya merupakan realisasi dari **unit leksikal yang sama**, bukan hanya karena tulisannya mirip.

Perubahan berikut pada umumnya tidak membuat lexeme baru bila memang merupakan variasi bentuk dari lema yang sama:

- ال التعريف;
- perubahan i'rab akhir;
- mufrad/mutsanna/jamak;
- perubahan jumlah atau jenis yang bersifat infleksional;
- perubahan bentuk fi'il karena waktu atau dhamir yang tetap berasal dari leksem verbal yang sama.

Contoh uji:

`مَاء` → `مِيَاه`

boleh menunjuk ke `LEX_MA_001`, tetapi token/form tetap mencatat bahwa bentuk yang muncul adalah jamak.

Sebaliknya, jangan menyatukan dua bentuk hanya karena akar hurufnya sama.

## 4. Token Frase

Frase seperti:

`مَاءُ الْبَحْرِ`

tidak boleh diberi satu `lexeme_id` yang seolah-olah mewakili seluruh frase.

Gunakan:

```json
{
  "token_type": "phrase",
  "form": {
    "arabic": "مَاءُ الْبَحْرِ",
    "components": [
      {"arabic": "مَاءُ", "lexeme_id": "LEX_MA_001"},
      {"arabic": "الْبَحْرِ", "lexeme_id": "LEX_BAHR_001"}
    ]
  },
  "contextual_meaning": "air laut"
}
```

Dengan model ini pengguna tetap melihat frase secara natural, sementara setiap komponen tetap dapat dianalisis secara terpisah.

## 5. Bentuk Turunan

`root`, `pattern`, dan `derivation` bukan alasan otomatis untuk menyatukan lexeme.

Contoh prinsip:

- `كَتَبَ` dan `كِتَاب` berhubungan secara derivatif, tetapi bukan berarti harus mempunyai lexeme yang sama;
- `عَلِمَ` dan `عِلْم` dapat dicatat sebagai lexeme berbeda yang mempunyai hubungan derivatif;
- bila dibutuhkan, hubungan tersebut disimpan melalui `derives_from` atau `related_lexemes`.

Tujuannya agar kamus tidak mencampur **identitas kata** dengan **hubungan sharaf**.

## 6. Makna Leksikal dan Makna Kontekstual

Setiap lexeme minimal membedakan:

- `literal`: arti leksikal dasar yang paling relevan;
- `context_note`: penjelasan leksikal yang membantu memahami penggunaan.

Token dapat menambahkan:

- `contextual_meaning`: makna yang muncul dari gabungan atau konteks;
- `context`: catatan penggunaan pada section tersebut.

Contoh:

`مُطَهِّر` secara leksikal = **yang menyucikan**.

Dalam:

`غَيْرُ مُطَهِّرٍ`

makna keseluruhan = **tidak menyucikan**.

Negasi berasal dari `غَيْرُ`, sehingga literal lexeme `مُطَهِّر` tidak boleh diubah menjadi "tidak menyucikan".

## 7. Lafaz Fungsi

Huruf dan unsur gramatikal seperti `وَ`, `فَ`, `مِنْ`, `أَمَّا`, serta bentuk gabungan seperti `مِمَّا` tetap boleh menjadi token agar urutan teks utuh dapat direpresentasikan.

Namun tidak semua token harus memiliki `lexeme_id`.

Contoh:

```json
{
  "arabic": "وَ",
  "lexeme_id": null,
  "type": "حرف عطف",
  "literal": "dan"
}
```

Tidak boleh dipaksa masuk ke sistem lexeme hanya demi konsistensi teknis.

## 8. Bentuk Gabungan

Lafaz yang secara tulisan merupakan gabungan beberapa unsur, misalnya `بِمَعْنَى` atau `مِمَّا`, dapat dipertahankan sebagai satu form/token tampilan agar pembacaan natural.

Jika analisis internal membutuhkan pemecahan unsur, gunakan `components`.

Jangan mengorbankan bentuk teks yang dibaca pengguna demi analisis internal.

## 9. Nahwu

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

## 10. Referensi Lafaz

Kemunculan kedua dan seterusnya tidak boleh menyalin ulang analisis leksikal.

Contoh:

```json
{
  "reference": {
    "status": "reused",
    "first_seen": "TOK_001"
  }
}
```

Untuk tahap berikutnya, struktur referensi dapat berkembang menjadi daftar lokasi:

```json
"references": [
  {
    "section_id": "SEC_THARAH_001",
    "token_id": "TOK_001"
  }
]
```

Ini lebih kuat daripada menyimpan teks catatan manual seperti `sudah dibahas`.

## 11. Ambiguitas dan Homonimi

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

## 12. Status Kepastian Analisis

Analisis ilmiah tidak boleh dipaksa lengkap.

Field berikut digunakan untuk membedakan tingkat kepastian:

```json
"confidence": "verified"
```

Nilai:

- `verified` — telah diperiksa terhadap sumber yang memadai;
- `probable` — kuat tetapi masih perlu pemeriksaan;
- `uncertain` — belum cukup dasar untuk ditetapkan.

Untuk `uncertain`, UI tidak boleh menyajikan analisis sebagai fakta pasti.

## 13. Struktur Tingkat Atas V2

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
│   ├── confidence
│   └── related_lexemes[]
└── sections[]
    ├── section_id
    ├── title_arabic
    ├── text_arabic
    ├── translation_literal
    ├── translation_note
    └── tokens[]
        ├── token_id
        ├── token_type
        ├── form
        │   ├── arabic
        │   ├── lexeme_id
        │   └── form attributes
        ├── components[] (untuk phrase)
        ├── grammar_role (internal)
        ├── contextual_meaning
        └── reference
```

## 14. Prinsip Migrasi

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
