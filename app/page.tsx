"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { photos } from "./photos";

const scenes = [
  "boring-bio",
  "work",
  "growth",
  "sports",
  "work-cafe",
  "reading",
  "deep-talks",
  "cooking",
  "imperfect",
  "ending",
];

const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL ?? "";

function SceneLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="scene-label">
      <span>{String(n).padStart(2, "0")}</span>
      <b>{children}</b>
    </div>
  );
}

function Doodle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`doodle ${className}`}>{children}</span>;
}
function SceneAtmosphere({ index }: { index: number }) {
  return (
    <div className="scene-atmosphere" aria-hidden="true">
      <motion.i className="ambient-blob ambient-a"
        animate={{ x: [0, 36, -12, 0], y: [0, -22, 18, 0], rotate: [0, 8, -6, 0] }}
        transition={{ duration: 11 + (index % 3) * 2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.i className="ambient-blob ambient-b"
        animate={{ x: [0, -28, 16, 0], y: [0, 20, -16, 0], rotate: [0, -10, 7, 0] }}
        transition={{ duration: 14 + (index % 4), repeat: Infinity, ease: "easeInOut" }} />
      <motion.i className="ambient-line"
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.18, 0.42, 0.18] }}
        transition={{ duration: 9 + index, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function GymRoomArt() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageX = useTransform(scrollYProgress, [0, 1], [-24, 24]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.06]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [18, -22]);
  return (
    <div ref={ref} className="gym-art reveal">
      <motion.img src="/art/gym-room.svg" alt="Phòng gym hiện đại" style={{ x: imageX, scale: imageScale }} />
      <motion.div className="gym-height-badge" style={{ y: badgeY }}><b>1m86</b><span>still building</span></motion.div>
      <motion.div className="gym-orbit-note note-one" animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}>consistency &gt; hype</motion.div>
      <motion.div className="gym-orbit-note note-two" animate={{ y: [0, 9, 0], rotate: [2, -2, 2] }} transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}>average day. still showed up.</motion.div>
    </div>
  );
}

function StoryProgress({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 24, mass: 0.7 });
  return <motion.div className="story-progress-fill" style={{ scaleX: spring }} />;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [contactHint, setContactHint] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.scene ?? 0);
        setActive(index);
      },
      { threshold: [0.35, 0.55, 0.72] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    document.querySelector<HTMLElement>(`[data-scene="${index}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleContact = () => {
    if (contactUrl) {
      window.open(contactUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setContactHint(true);
    window.setTimeout(() => setContactHint(false), 3200);
  };

  return (
    <main className="story" ref={rootRef}>
      <div className="story-progress" aria-hidden="true"><StoryProgress value={(active + 1) / 10} /></div>
      <aside className="story-nav" aria-label="Story progress">
        <div className="nav-name">LOC / 90 SEC</div>
        <div className="dots">
          {scenes.map((name, index) => (
            <button
              key={name}
              className={active === index ? "dot active" : "dot"}
              aria-label={`Go to scene ${index + 1}: ${name}`}
              onClick={() => goTo(index)}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="nav-count">{String(active + 1).padStart(2, "0")} / 10</div>
      </aside>

      <section className="scene intro-scene" data-scene="0">
        <SceneAtmosphere index={0} />
        <div className="paper-grain" />
        <div className="intro-grid">
          <div className="fake-profile reveal">
            <div className="fake-topbar">
              <span className="mini-brand">dating-ish</span>
              <span>•••</span>
            </div>
            <div className="profile-head">
              <img src={photos.cafeYellow} alt="Cao Tiến Lộc" />
              <div>
                <h2>Cao Tiến Lộc, 23</h2>
                <p>Hà Nội</p>
              </div>
            </div>
            <div className="profile-lines">
              <span>↕ 1m86 · ~90kg</span>
              <span>⌘ Software Engineer</span>
              <span>☕ Coffee / work café</span>
              <span>⌁ Books</span>
              <span>⚽ Football · 🏸 Badminton · Running</span>
            </div>
            <p className="profile-copy">
              Thích trò chuyện sâu, phát triển bản thân và làm những thứ bất chợt nghĩ ra.
            </p>
            <div className="profile-actions"><i>×</i><i>★</i><i>♥</i></div>
          </div>

          <div className="intro-copy reveal delay-1">
            <Doodle className="scribble">hmm...</Doodle>
            <p className="eyebrow">THIS COULD&apos;VE BEEN A BIO</p>
            <h1>
              Ừm... đúng.
              <br />
              <em>Nhưng hơi chán.</em>
            </h1>
            <p className="lead">
              Bình thường thì quá nhàm chán,
              <br /> nên tôi tạo ra cái này.
            </p>
            <button className="primary" onClick={() => goTo(1)}>
              Xem bản thú vị hơn <span>↓</span>
            </button>
          </div>
        </div>
        <p className="tiny-note bottom-note">Same facts. Better way to tell them.</p>
      </section>

      <section className="scene work-scene" data-scene="1">
        <SceneAtmosphere index={1} />
        <SceneLabel n={2}>WORK</SceneLabel>
        <div className="work-layout">
          <div className="copy-block reveal">
            <p className="eyebrow">BAN NGÀY</p>
            <h2>Tôi làm phần mềm.</h2>
            <p className="scene-copy">
              Tôi thích cảm giác biến một ý tưởng hơi mơ hồ thành thứ thật sự chạy được.
            </p>
            <div className="flow">
              <span>idea</span><b>→</b><span>code</span><b>→</b><span>bug</span><b>→</b><span>fix</span><b>↻</b>
            </div>
            <p className="tiny-note">Rồi thường có thêm một ý tưởng khác.</p>
          </div>

          <div className="browser-card reveal delay-1">
            <div className="browser-bar"><i /><i /><i /><span>localhost:3000</span></div>
            <div className="terminal">
              <p><span>const</span> me = {"{"}</p>
              <p>&nbsp;&nbsp;learn: <b>true</b>,</p>
              <p>&nbsp;&nbsp;build: <b>true</b>,</p>
              <p>&nbsp;&nbsp;breakThings: <b>sometimes</b>,</p>
              <p>&nbsp;&nbsp;tryAgain: <b>true</b></p>
              <p>{"}"}</p>
            </div>
            <Doodle className="work-sticker">probably over-engineered</Doodle>
          </div>
        </div>
      </section>

      <section className="scene growth-scene" data-scene="2">
        <SceneAtmosphere index={2} />
        <SceneLabel n={3}>SELF-GROWTH</SceneLabel>
        <div className="growth-layout">
          <div className="photo-cutout reveal">
            <img src={photos.fullbody} alt="Lộc standing" />
            <div className="height-line"><span>1m86</span></div>
            <Doodle className="weight-tag">~90kg</Doodle>
          </div>

          <div className="copy-block reveal delay-1">
            <p className="eyebrow">NOT A TRANSFORMATION POST</p>
            <h2>Chỉ đang cố tốt hơn một chút mỗi ngày.</h2>
            <p className="scene-copy">
              Gym không phải để trông như siêu anh hùng. Với tôi nó là chuyện khỏe hơn,
              kỷ luật hơn và giữ lời hứa với chính mình.
            </p>
            <div className="growth-bars">
              <div><span>healthier</span><i style={{ width: "72%" }} /></div>
              <div><span>stronger</span><i style={{ width: "63%" }} /></div>
              <div><span>more disciplined</span><i style={{ width: "58%" }} /></div>
            </div>
            <p className="tiny-note">not there yet. still going.</p>
          </div>
        </div>
      </section>

      <section className="scene sports-scene" data-scene="3">
        <SceneAtmosphere index={3} />
        <SceneLabel n={4}>MOVE</SceneLabel>
        <div className="sports-title reveal">
          <p className="eyebrow">TÔI KHÔNG NGỒI TRƯỚC MÁY TÍNH CẢ NGÀY.</p>
          <h2>...most days.</h2>
        </div>
        <div className="sport-track">
          <motion.article className="sport-card football reveal" whileHover={{ y: -12, rotate: -2, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
            <span className="sport-icon">⚽</span>
            <h3>Football</h3>
            <p>Chạy nhiều hơn mình tưởng.</p>
            <Doodle>pass!</Doodle>
          </motion.article>
          <motion.article className="sport-card badminton reveal delay-1" whileHover={{ y: -12, rotate: 2, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
            <span className="sport-icon">🏸</span>
            <h3>Badminton</h3>
            <p>Môn dễ khiến tôi nghiêm túc hơi quá.</p>
            <Doodle>one more game?</Doodle>
          </motion.article>
          <motion.article className="sport-card running reveal delay-2" whileHover={{ y: -12, rotate: -1, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
            <span className="sport-icon">⌁</span>
            <h3>Running</h3>
            <p>Đầu óc thường yên hơn sau vài km.</p>
            <Doodle>keep moving →</Doodle>
          </motion.article>
        </div>
        <div className="flying-shuttle" aria-hidden="true">🏸</div>
      </section>

      <section className="scene cafe-scene" data-scene="4">
        <SceneAtmosphere index={4} />
        <SceneLabel n={5}>WORK CAFÉ</SceneLabel>
        <div className="cafe-layout">
          <figure className="photo-frame reveal">
            <img src={photos.cafeYellow} alt="Lộc sitting in a café" />
            <figcaption>somewhere with coffee + a socket</figcaption>
          </figure>
          <div className="copy-block reveal delay-1">
            <p className="eyebrow">FAVOURITE THIRD PLACE</p>
            <h2>Có những ngày tôi ra quán để làm việc.</h2>
            <p className="scene-copy">Có những ngày chỉ để ngồi, nghĩ và nhìn mọi thứ trôi qua.</p>
            <div className="cafe-chips">
              <span>work</span><span>think</span><span>people-watch</span><span>coffee</span>
            </div>
            <Doodle className="coffee-note">good coffee = better ideas?</Doodle>
          </div>
        </div>
      </section>

      <section className="scene reading-scene" data-scene="5">
        <SceneAtmosphere index={5} />
        <SceneLabel n={6}>READING</SceneLabel>
        <div className="reading-layout">
          <motion.div className="book reveal" initial={{ rotateX: 8, rotateZ: -2 }} whileInView={{ rotateX: 2, rotateZ: -1 }} viewport={{ amount: 0.45 }} transition={{ duration: 0.9, ease: "easeOut" }}>
            <div className="page left-page">
              <small>WHY?</small>
              <p>Tôi thích hiểu tại sao mọi thứ lại như vậy.</p>
            </div>
            <div className="book-spine" />
            <div className="page right-page">
              <small>AND PEOPLE?</small>
              <p>Con người cũng vậy.</p>
              <div className="highlight" />
            </div>
          </motion.div>
          <div className="reading-side reveal delay-1">
            <p className="scene-copy">
              Đọc với tôi không phải để đếm số cuốn. Tôi chỉ thích cảm giác có thêm một góc nhìn mới.
            </p>
            <div className="margin-notes">
              <span>better questions</span>
              <span>broader view</span>
              <span>less certain, more curious</span>
            </div>
          </div>
        </div>
      </section>

      <section className="scene talks-scene" data-scene="6">
        <SceneAtmosphere index={6} />
        <SceneLabel n={7}>DEEP TALKS</SceneLabel>
        <div className="talks-bg">
          <motion.img src={photos.cafeBlack} alt="Lộc ở quán cà phê" animate={{ scale: [1.06, 1.1, 1.06], x: [0, -10, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
          <div className="talks-gradient" />
        </div>
        <div className="talks-copy reveal">
          <p className="eyebrow">SMALL TALK IS FINE.</p>
          <h2>Nhưng tôi thích những cuộc nói chuyện làm mình quên mất thời gian hơn.</h2>
          <div className="bubbles">
            <span>future</span>
            <span>family</span>
            <span>career</span>
            <span>relationships</span>
            <span>things we&apos;re afraid of</span>
            <span>random 2AM thoughts</span>
          </div>
        </div>
        <div className="empty-chair reveal delay-2">
          <div className="chair-back" />
          <div className="chair-seat" />
          <Doodle>your seat?</Doodle>
        </div>
      </section>

      <section className="scene cooking-scene" data-scene="7">
        <SceneAtmosphere index={7} />
        <SceneLabel n={8}>COOKING</SceneLabel>
        <div className="kitchen">
          <div className="counter">
            <motion.div className="pan" animate={{ rotate: [-9, -6, -10, -9], y: [0, -2, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <span className="pan-food">fresh dinner</span>
            </motion.div>
            <div className="ingredients">
              <motion.i animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity }} />
              <motion.i animate={{ y: [0, 6, 0] }} transition={{ duration: 3.7, repeat: Infinity }} />
              <motion.i animate={{ y: [0, -5, 0] }} transition={{ duration: 4.2, repeat: Infinity }} />
              <motion.i animate={{ y: [0, 7, 0] }} transition={{ duration: 3.4, repeat: Infinity }} />
            </div>
          </div>
          <div className="plates">
            <span>🍽️</span><span>🍽️</span><span>🍽️</span>
          </div>
        </div>
        <div className="cooking-copy reveal">
          <p className="eyebrow">I LIKE COOKING.</p>
          <h2>Actually...</h2>
          <p className="big-line">Tôi thích nấu ăn <em>cho những người mình quan tâm.</em></p>
          <Doodle className="recipe-note">good food → happier people</Doodle>
        </div>
      </section>

      <section className="scene imperfect-scene" data-scene="8">
        <SceneAtmosphere index={8} />
        <SceneLabel n={9}>REALITY CHECK</SceneLabel>
        <motion.div className="chaos-window win-one" animate={{ y: [0, -10, 0], rotate: [-8, -5, -8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
          <div className="browser-bar"><i /><i /><i /><span>tabs: 27</span></div>
          <p>portfolio</p><p>new project idea</p><p>another new project idea</p><p>how to sleep earlier</p>
        </motion.div>
        <motion.div className="chaos-window win-two" animate={{ y: [0, 9, 0], rotate: [7, 4, 7] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}>
          <b>02:17 AM</b>
          <span>“mình sửa nốt cái này thôi”</span>
        </motion.div>
        <div className="imperfect-copy reveal">
          <p className="narrator">Narrator: “Nghe có vẻ mọi thứ ổn hết nhỉ?”</p>
          <h2>lol no.</h2>
          <div className="messy-tags">
            <span>overthinks sometimes</span>
            <span>starts too many things</span>
            <span>sleeps later than he should</span>
            <span>still figuring things out</span>
          </div>
          <p className="scene-copy">Phần này chắc mới giống người thật hơn.</p>
        </div>
      </section>

      <section className="scene ending-scene" data-scene="9">
        <SceneAtmosphere index={9} />
        <motion.div className="sun" animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <div className="city">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <div className="ending-card reveal">
          <p className="eyebrow">SO... THAT&apos;S THE SHORT VERSION.</p>
          <h2>You know Lộc</h2>
          <div className="meter"><i /><span>7%</span></div>
          <p className="ending-joke">“Ừ, nghe cũng hợp lý.”</p>
          <h3>Phần còn lại nói chuyện trực tiếp chắc vui hơn.</h3>
          <button className="primary dark" onClick={handleContact}>Say hi <span>→</span></button>
          <a className="secondary-link" href="https://github.com/Loccao102" target="_blank" rel="noreferrer">
            hoặc xem tôi đang build gì ↗
          </a>
          {contactHint && (
            <div className="contact-hint">
              Chưa gắn link chat. Thêm <code>NEXT_PUBLIC_CONTACT_URL</code> trước khi public.
            </div>
          )}
        </div>
        <p className="final-note">A normal bio felt boring. So I built this instead.</p>
      </section>

      {active < 9 && (
        <button className="next-scene" onClick={() => goTo(Math.min(active + 1, 9))} aria-label="Next scene">
          ↓
        </button>
      )}
    </main>
  );
}
