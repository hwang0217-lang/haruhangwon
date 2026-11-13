// 유료 책 파일(PDF·EPUB)을 잠가서 paid/ 에 넣기. 저장소가 공개라서 원본은 절대 올리지 않습니다.
// 사용법: FILE_KEY=<Vercel에 넣은 값> node scripts/encrypt-books.cjs <원본 폴더(books/out)> [합격플랜 zip 폴더(x-<id>.zip)]
// 파일 형식: iv(12바이트) + tag(16바이트) + 암호문 (AES-256-GCM)
const fs = require("fs"), path = require("path"), crypto = require("crypto"), vm = require("vm");
const R = path.join(__dirname, "..");
const key = Buffer.from(process.env.FILE_KEY || "", "base64url");
if (key.length !== 32) { console.error("FILE_KEY가 없거나 32바이트가 아니에요."); process.exit(1); }
const src = process.argv[2]; if (!src) { console.error("원본 폴더를 적어 주세요."); process.exit(1); }
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(R, "books.js"), "utf8") + ";this.BOOKS=BOOKS;", ctx);
fs.mkdirSync(path.join(R, "paid"), { recursive: true });
let n = 0, miss = [];
for (const b of ctx.BOOKS) for (const ext of ["pdf", "epub"]) {
  const f = path.join(src, `${b.id}.${ext}`);
  if (!fs.existsSync(f)) { miss.push(`${b.id}.${ext}`); continue; }
  const iv = crypto.randomBytes(12), c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(fs.readFileSync(f)), c.final()]);
  fs.writeFileSync(path.join(R, "paid", `${b.id}.${ext}.enc`), Buffer.concat([iv, c.getAuthTag(), enc]));
  n++;
}
const enc1 = (f, out) => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const e = Buffer.concat([c.update(fs.readFileSync(f)), c.final()]); fs.writeFileSync(path.join(R, "paid", out), Buffer.concat([iv, c.getAuthTag(), e])); n++; };
if (process.argv[3]) for (const x of JSON.parse(fs.readFileSync(path.join(R, "exam/data.json"), "utf8"))) {
  const f = path.join(process.argv[3], `x-${x.id}.zip`);
  if (fs.existsSync(f)) enc1(f, `x-${x.id}.zip.enc`); else miss.push(`x-${x.id}.zip`);
}
console.log(`잠근 파일 ${n}개` + (miss.length ? ` · 없는 파일: ${miss.join(", ")}` : ""));
if (miss.length) process.exit(2);
