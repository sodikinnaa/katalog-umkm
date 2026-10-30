import assert from "node:assert/strict";

const { tautanAman, validasiNomorWhatsApp, normalisasiNomorWhatsApp } = await import("./pengaturan-toko.js");

assert.equal(tautanAman("https://a.id/x"), "https://a.id/x");
assert.equal(tautanAman("http://a.id"), "http://a.id/");
assert.equal(tautanAman("/produk/1"), "/produk/1");
assert.equal(tautanAman("//evil.id"), null);
assert.equal(tautanAman("javascript:alert(1)"), null);
assert.equal(tautanAman("data:text/html,x"), null);
assert.equal(tautanAman(""), null);
assert.equal(tautanAman("/produk/1", { izinkanRelatif: false }), null);

assert.equal(normalisasiNomorWhatsApp("+62 812-3456-7890"), "6281234567890");
assert.equal(normalisasiNomorWhatsApp("081234567890"), "6281234567890");
assert.equal(validasiNomorWhatsApp("6281234567890").error, null);
assert.notEqual(validasiNomorWhatsApp("123").error, null);
assert.notEqual(validasiNomorWhatsApp("1234567890123456").error, null);

console.log("pengaturan-toko: semua cek lulus");
