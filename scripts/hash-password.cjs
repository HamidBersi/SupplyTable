/**
 * Génère un hash Argon2id (PHC) pour AUTH_PASSWORD_HASH.
 * Usage : node scripts/hash-password.cjs "votre-mot-de-passe"
 */
const argon2 = require("argon2");

const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage: node scripts/hash-password.cjs "<mot-de-passe>"');
  process.exit(1);
}

argon2
  .hash(pwd, { type: argon2.argon2id })
  .then((hash) => {
    console.log("# PHC (ne pas mettre tel quel dans .env.local : les $ sont mangés par Next)");
    console.log(hash);
    const b64 = Buffer.from(hash, "utf8").toString("base64");
    console.log("\n# À mettre dans .env.local (recommandé) :");
    console.log(`AUTH_PASSWORD_HASH_BASE64=${b64}`);
    console.log(
      "\n# Alternative : échapper chaque $ en \\$ dans AUTH_PASSWORD_HASH=...\\$argon2id\\$v=19..."
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
