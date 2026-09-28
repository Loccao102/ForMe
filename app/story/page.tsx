"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useSpring } from "motion/react";
import { photos } from "../photos";
import styles from "./story.module.css";

const beats = ["intro","work","growth","sports","cafe","reading","talks","cooking","reality","ending"] as const;

const workLines = [
  "Tớ làm phần mềm. Chủ yếu là backend, API và mấy thứ ở phía sau màn hình.",
  "Rồi có database, microservice, queue, Docker... thỉnh thoảng phải nghĩ xem import vài trăm nghìn bản ghi kiểu gì cho đỡ nghẹt.",
  "Nếu request timeout thì lại nghĩ idempotency, retry, transaction... rồi còn cache, lock, scale, WebSocket...",
  "À... khoan.",
  "Cái này là chuyên môn của tớ. Tớ nói hơi dài rồi 😅",
  "Xin lỗi nha. Xuống tiếp thôi — ngoài code tớ cũng đang cố có một cuộc sống.",
];

function Progress({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 24, mass: 0.6 });
  return <motion.i style={{ scaleX: spring }} />;
}

function Bridge({ text, action, onNext, dark = false }: { text: string; action: string; onNext: () => void; dark?: boolean; }) {
  return (
    <motion.div className={dark ? styles.bridge + " " + styles.darkBridge : styles.bridge}
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.75, once: true }}>
      <p>{text}</p>
      <button type="button" onClick={onNext}>{action}<span>↓</span></button>
    </motion.div>
  );
}

function WorkRamble({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const finished = step === workLines.length - 1;
  return (
    <div className={styles.ramble} aria-live="polite">
      <div className={styles.rambleStream}>
        {workLines.slice(0, step + 1).map((line, index) => (
          <motion.p key={line} className={index === step ? styles.currentLine : ""}
            initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}>{line}</motion.p>
        ))}
      </div>
      <button type="button" className={styles.rambleButton}
        onClick={() => finished ? onDone() : setStep((v) => Math.min(v + 1, workLines.length - 1))}>
        {finished ? "Ừ, xuống tiếp thôi" : step >= 3 ? "haha, tiếp đi" : "ừm... tiếp đi"} <span>↓</span>
      </button>
    </div>
  );
}

function Atmosphere({ tone = "blue" }: { tone?: "blue" | "green" | "warm" | "purple" }) {
  return (
    <div className={styles.atmosphere + " " + styles[tone]} aria-hidden="true">
      <motion.i animate={{ x: [0, 24, -8, 0], y: [0, -18, 12, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
      <motion.i animate={{ x: [0, -20, 12, 0], y: [0, 15, -10, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function SceneNo({ n }: { n: number }) {
  return <span className={styles.sceneNo}>{String(n).padStart(2, "0")}</span>;
}

export default function StoryPage() {
  const [active, setActive] = useState(0);
  const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL ?? "";
  const sections = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const nodes = sections.current.filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const top = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!top) return;
      setActive(Number((top.target as HTMLElement).dataset.index ?? 0));
    }, { threshold: [0.4, 0.62] });
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const go = (index: number) => sections.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const progress = useMemo(() => (active + 1) / beats.length, [active]);

  const contact = () => {
    if (contactUrl) window.open(contactUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.story}>
      <div className={styles.progress}><Progress value={progress} /></div>

      <section ref={(el) => { sections.current[0] = el; }} data-index="0" className={styles.scene + " " + styles.intro}>
        <Atmosphere tone="warm" />
        <div className={styles.bioCard}>
          <div className={styles.bioHead}>
            <img src={photos.cafeYellow} alt="Cao Tiến Lộc" />
            <div><b>Cao Tiến Lộc, 23</b><span>Hà Nội</span></div>
          </div>
          <div className={styles.tags}>
            <span>1m86 · ~90kg</span><span>Software Engineer</span><span>Coffee</span><span>Books</span><span>Sports</span>
          </div>
          <p>Thích trò chuyện sâu, phát triển bản thân và làm những thứ bất chợt nghĩ ra.</p>
        </div>

        <div className={styles.introCopy}>
          <p className={styles.kicker}>THIS COULD&apos;VE BEEN A BIO</p>
          <h1>Ừm... đúng.<br /><em>Nhưng hơi chán.</em></h1>
          <p>Bình thường thì quá nhàm chán, nên tớ làm cái này.</p>
          <button type="button" onClick={() => go(1)}>Okay, kể đi <span>↓</span></button>
        </div>
      </section>

      <section ref={(el) => { sections.current[1] = el; }} data-index="1" className={styles.scene + " " + styles.work}>
        <Atmosphere tone="blue" />
        <SceneNo n={2} />
        <div className={styles.workVisual}>
          <div className={styles.codeWindow}>
            <div className={styles.windowTop}><i /><i /><i /><span>localhost:3000</span></div>
            <motion.div className={styles.codeLines} animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <span>API request → service</span><span>database → transaction</span><span>queue → retry</span><span>websocket → realtime</span><span>docker → ship it</span>
            </motion.div>
          </div>
          <div className={styles.workTitle}><p className={styles.kicker}>BAN NGÀY</p><h2>Tớ làm phần mềm.</h2></div>
        </div>
        <WorkRamble onDone={() => go(2)} />
      </section>

      <section ref={(el) => { sections.current[2] = el; }} data-index="2" className={styles.scene + " " + styles.growth}>
        <Atmosphere tone="green" /><SceneNo n={3} />
        <div className={styles.photoScene}>
          <motion.img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=86" alt="Phòng gym"
            initial={{ scale: 1.08 }} whileInView={{ scale: 1.01 }} transition={{ duration: 1.3 }} />
          <div className={styles.photoShade} />
          <div className={styles.hud}><b>1m86</b><span>~90kg · in progress</span></div>
          <motion.span className={styles.noteA} animate={{ y: [0, -7, 0], rotate: [-2, 2, -2] }} transition={{ duration: 4.5, repeat: Infinity }}>consistency &gt; hype</motion.span>
        </div>
        <div className={styles.copy}>
          <p className={styles.kicker}>SELF-GROWTH, NOT TRANSFORMATION</p>
          <h2>Chỉ đang cố tốt hơn một chút mỗi ngày.</h2>
          <p>Không phải để thành bodybuilder. Tớ tập để khỏe hơn, chạy bền hơn và giữ được một thói quen đủ lâu để thấy mình thay đổi.</p>
        </div>
        <Bridge text="Ngồi code nhiều quá nên tớ buộc phải tìm cách kéo mình ra khỏi cái ghế." action="Xem tớ vận động kiểu gì" onNext={() => go(3)} />
      </section>

      <section ref={(el) => { sections.current[3] = el; }} data-index="3" className={styles.scene + " " + styles.sports}>
        <Atmosphere tone="blue" /><SceneNo n={4} />
        <div className={styles.copy}><p className={styles.kicker}>TỚ KHÔNG NGỒI TRƯỚC MÁY TÍNH CẢ NGÀY</p><h2>...most days.</h2></div>
        <div className={styles.sportRail}>
          <motion.article whileTap={{ scale: .98 }}><b>⚽</b><h3>Football</h3><p>Chạy nhiều hơn mình tưởng.</p></motion.article>
          <motion.article whileTap={{ scale: .98 }}><b>🏸</b><h3>Badminton</h3><p>Môn dễ khiến tớ nghiêm túc hơi quá.</p></motion.article>
          <motion.article whileTap={{ scale: .98 }}><b>↗</b><h3>Running</h3><p>Đầu óc thường yên hơn sau vài km.</p></motion.article>
        </div>
        <Bridge text="Chạy, đá bóng, đánh cầu xong thì có một nơi tớ rất hay quay về..." action="Đi kiếm cà phê" onNext={() => go(4)} />
      </section>

      <section ref={(el) => { sections.current[4] = el; }} data-index="4" className={styles.scene + " " + styles.cafe}>
        <Atmosphere tone="warm" /><SceneNo n={5} />
        <div className={styles.photoScene}>
          <motion.img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=86" alt="Laptop và cà phê trên bàn làm việc"
            initial={{ scale: 1.1 }} whileInView={{ scale: 1.02 }} transition={{ duration: 1.4 }} />
          <div className={styles.photoShade} />
          <motion.span className={styles.focusPill} animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, repeat: Infinity }}>● focus mode</motion.span>
        </div>
        <div className={styles.copy}>
          <p className={styles.kicker}>WORK CAFÉ</p>
          <h2>Một góc yên, laptop mở, cà phê cạnh tay.</h2>
          <p>Đây gần như là setup mặc định khi tớ muốn làm việc, nghĩ linh tinh hoặc biến một ý tưởng mới thành project.</p>
        </div>
        <Bridge text="Nhưng không phải lần nào ra quán tớ cũng mở laptop." action="Không mở laptop thì sao?" onNext={() => go(5)} />
      </section>

      <section ref={(el) => { sections.current[5] = el; }} data-index="5" className={styles.scene + " " + styles.reading}>
        <Atmosphere tone="purple" /><SceneNo n={6} />
        <div className={styles.book}>
          <div><small>WHY?</small><p>Tớ thích hiểu tại sao mọi thứ lại như vậy.</p></div><i />
          <div><small>AND PEOPLE?</small><p>Con người cũng vậy.</p><mark /></div>
        </div>
        <div className={styles.copy}><p>Đọc với tớ không phải để đếm số cuốn. Tớ chỉ thích cảm giác có thêm một góc nhìn mới.</p></div>
        <Bridge text="Đọc nhiều không làm tớ thông thái hơn bao nhiêu. Nó chỉ khiến tớ có nhiều câu hỏi hơn." action="Đúng, chuyện đó dẫn tới đây" onNext={() => go(6)} />
      </section>

      <section ref={(el) => { sections.current[6] = el; }} data-index="6" className={styles.scene + " " + styles.talks}>
        <SceneNo n={7} />
        <motion.img className={styles.talkPhoto} src={photos.cafeBlack} alt="Lộc ở quán cà phê"
          animate={{ scale: [1.04, 1.08, 1.04], x: [0, -8, 0] }} transition={{ duration: 12, repeat: Infinity }} />
        <div className={styles.talkShade} />
        <div className={styles.talkCopy}>
          <p className={styles.kicker}>SMALL TALK IS FINE.</p>
          <h2>Nhưng tớ thích những cuộc nói chuyện làm mình quên mất thời gian hơn.</h2>
          <div className={styles.topicCloud}><span>future</span><span>family</span><span>career</span><span>relationships</span><span>things we&apos;re afraid of</span><span>random 2AM thoughts</span></div>
        </div>
        <Bridge dark text="Tớ nói khá nhiều khi thân rồi. May là đôi lúc tớ biết im lặng và... nấu ăn." action="Còn một cách khác" onNext={() => go(7)} />
      </section>

      <section ref={(el) => { sections.current[7] = el; }} data-index="7" className={styles.scene + " " + styles.cooking}>
        <Atmosphere tone="warm" /><SceneNo n={8} />
        <div className={styles.kitchenArt}>
          <motion.div animate={{ rotate: [-4, 2, -3, -4], y: [0, -3, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>🍳</motion.div>
          <span>🥬</span><span>🍅</span><span>🧄</span><i /><i /><i />
        </div>
        <div className={styles.copy}>
          <p className={styles.kicker}>I LIKE COOKING.</p><h2>Actually...</h2>
          <p className={styles.bigLine}>Tớ thích nấu ăn <em>cho những người mình quan tâm.</em></p>
        </div>
        <Bridge text="Nghe đến đây hơi giống quảng cáo bản thân rồi nhỉ?" action="Okay, nói phần thật đi" onNext={() => go(8)} />
      </section>

      <section ref={(el) => { sections.current[8] = el; }} data-index="8" className={styles.scene + " " + styles.reality}>
        <Atmosphere tone="purple" /><SceneNo n={9} />
        <motion.div className={styles.floatingWindow} animate={{ y: [0, -9, 0], rotate: [-5, -2, -5] }} transition={{ duration: 5.6, repeat: Infinity }}>
          <b>tabs: 27</b><span>portfolio</span><span>new project idea</span><span>another new idea</span><span>how to sleep earlier</span>
        </motion.div>
        <motion.div className={styles.clockWindow} animate={{ y: [0, 8, 0], rotate: [5, 2, 5] }} transition={{ duration: 5, repeat: Infinity }}>
          <b>02:17 AM</b><span>“mình sửa nốt cái này thôi”</span>
        </motion.div>
        <div className={styles.realityCopy}>
          <p>Narrator: “Nghe có vẻ mọi thứ ổn hết nhỉ?”</p><h2>lol no.</h2>
          <div className={styles.tags}><span>overthinks sometimes</span><span>starts too many things</span><span>sleeps later than he should</span><span>still figuring things out</span></div>
        </div>
        <Bridge text="Vậy là đủ cả phần hay lẫn phần hơi hỗn loạn. Còn một màn cuối thôi." action="Được rồi, gần hết rồi" onNext={() => go(9)} />
      </section>

      <section ref={(el) => { sections.current[9] = el; }} data-index="9" className={styles.scene + " " + styles.ending}>
        <div className={styles.sun} />
        <div className={styles.skyline}>{Array.from({ length: 8 }).map((_, i) => <i key={i} />)}</div>
        <div className={styles.endCard}>
          <p className={styles.kicker}>SO... THAT&apos;S THE SHORT VERSION.</p>
          <h2>You know Lộc</h2>
          <div className={styles.meter}><i /><b>7%</b></div>
          <p>“Ừ, nghe cũng hợp lý.”</p>
          <h3>Phần còn lại nói chuyện trực tiếp chắc vui hơn.</h3>
          <button type="button" onClick={contact}>Say hi <span>→</span></button>
          <a href="https://github.com/Loccao102" target="_blank" rel="noreferrer">hoặc xem tớ đang build gì ↗</a>
        </div>
      </section>
    </main>
  );
}
