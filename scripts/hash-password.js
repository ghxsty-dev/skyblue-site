const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.log("Kullanım: node scripts/hash-password.js <şifre>");
  console.log("Örnek: node scripts/hash-password.js guvenliSifre123");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nŞifre hash'i oluşturuldu:\n");
console.log(`Hash: ${hash}\n`);
console.log("Bu hash'i .env dosyasına ekleyin:");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
