import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: tsx hash-password.ts <password>");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
