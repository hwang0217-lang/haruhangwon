// 유료 파일(zip)을 암호화해서 paid/<id>.bin 으로 저장해요. 공개 저장소라 원본은 절대 올리지 않아요.
// 사용: FILE_KEY=<base64 32바이트> node scripts/encrypt-paid.mjs <zip 폴더>
//   FILE_KEY가 없으면 새로 만들어 화면에 한 번 보여 줘요 → Vercel 환경 변수 FILE_KEY에 넣기.
// zip 이름은 "NN_이름.zip" (크몽 발송파일 그대로). 아래 MAP으로 상품 id와 짝지어요.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, createCipheriv } from "node:crypto";

const MAP = {
  "01_요양보호사": "care", "02_고졸검정고시": "ged-high", "03_사회조사분석사2급": "survey2",
  "04_중졸검정고시_큰글씨": "ged-mid", "04_초졸검정고시_큰글씨": "ged-elem", "05_KIIP종합평가": "kiip",
  "06_미국시민권": "us-citizen", "07_손해평가사1차": "sonhae", "08_한국어교육능력검정": "kor-teach",
  "09_행정사1차": "haengjeong", "10_청소년상담사3급": "youth3", "11_GED_미국검정고시": "ged-us",
  "12_관광통역안내사": "tour", "13_농산물품질관리사": "nongpum", "14_보세사": "bose",
  "15_외국인운전면허학과": "drive", "16_캐나다시민권": "ca-citizen", "17_NCLEX_미국간호사": "nclex",
  "18_ACT_미국대입": "act", "19_국제무역사1급": "kita",
};

const src = process.argv[2];
if (!src) { console.error("zip 폴더를 알려 주세요."); process.exit(1); }
let key = process.env.FILE_KEY ? Buffer.from(process.env.FILE_KEY, "base64") : null;
if (!key) { key = randomBytes(32); console.log("새 FILE_KEY (Vercel 환경 변수에 넣기):\n" + key.toString("base64")); }
if (key.length !== 32) { console.error("FILE_KEY는 base64 32바이트여야 해요."); process.exit(1); }

const out = join(dirname(dirname(fileURLToPath(import.meta.url))), "paid");
mkdirSync(out, { recursive: true });
const manifest = {};
for (const f of readdirSync(src).filter(f => f.normalize("NFC").endsWith(".zip")).sort()) {
  const base = f.normalize("NFC").replace(/\.zip$/, "");
  const id = MAP[base];
  if (!id) { console.warn("짝 없음, 건너뜀:", f); continue; }
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(readFileSync(join(src, f))), c.final()]);
  writeFileSync(join(out, `${id}.bin`), Buffer.concat([iv, c.getAuthTag(), enc]));
  manifest[id] = "하루한권_" + base.replace(/^\d+_/, "") + ".zip";
  console.log("암호화:", f, "→", `paid/${id}.bin`);
}
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log(`완료: ${Object.keys(manifest).length}개`);
