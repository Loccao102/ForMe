"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { photos } from "../photos";
import styles from "./editorial.module.css";

const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL;

const impressions = [
  "quiet at first",
  "probably works too much",
  "looks like he has too many tabs open",
];

const questions = {
  future: {
    label: "the future",
    answer:
      "I like building toward a life that still has ambition in it — without turning every day into a sprint.",
  },
  fear: {
    label: "something you fear",
    answer:
      "Waking up one day and realising I got very good at being busy, but forgot to actually live.",
  },
  people: {
    label: "people",
    answer:
      "I remember the conversations where someone says what they actually mean. Those tend to stay with me.",
  },
  stupid: {
    label: "something stupid",
    answer:
      "I can spend an unreasonable amount of time polishing a tiny interaction almost nobody will notice.",
  },
} as const;

type QuestionKey = keyof typeof questions;

function SplitWord({ children }: { children: string }) {
  return (
    <span className={styles.splitWord} aria-label={children}>
      {children.split("").map((letter, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          initial={{ y: "110%", rotate: 6, opacity: 0 }}
          whileInView={{ y: "0%", rotate: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.6, delay: index * 0.025, ease: [0.16, 1, 0.3, 1] }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}

function Tape({ children, tilt = -3 }: { children: React.ReactNode; tilt?: number }) {
  return (
    <motion.span
      className={styles.tape}
      style={{ rotate: tilt }}
      whileHover={{ rotate: 0, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
    >
      {children}
    </motion.span>
  );
}

export default function EditorialPage() {
  const [impression, setImpression] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuestionKey | null>(null);
  const [contactHint, setContactHint] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const afterRef = useRef<HTMLElement>(null);
  const cafeRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroProgress, [0, 0.75], [1, 1.22]);
  const heroY = useTransform(heroProgress, [0, 1], [0, -110]);
  const heroPhotoRotate = useTransform(heroProgress, [0, 1], [-3, 7]);

  const { scrollYProgress: workProgress } = useScroll({
    target: workRef,
    offset: ["start end", "end start"],
  });
  const workX = useTransform(workProgress, [0, 1], ["18%", "-22%"]);
  const workRotate = useTransform(workProgress, [0, 1], [-2, 4]);

  const { scrollYProgress: afterProgress } = useScroll({
    target: afterRef,
    offset: ["start start", "end end"],
  });
  const afterX = useTransform(afterProgress, [0, 1], ["0%", "-67%"]);

  const { scrollYProgress: cafeProgress } = useScroll({
    target: cafeRef,
    offset: ["start end", "end start"],
  });
  const cafeImageY = useTransform(cafeProgress, [0, 1], [-60, 70]);
  const cafeTypeX = useTransform(cafeProgress, [0, 1], ["12%", "-28%"]);

  const chosenQuestion = question ? questions[question] : null;
  const endingLine = useMemo(() => {
    if (!impression && !question) return "You stayed this long. That already says something.";
    if (impression && question) {
      return "You guessed “" + impression + "” and then asked about " + questions[question].label + ".";
    }
    if (impression) return "Your first guess was “" + impression + "”. I’ll allow it.";
    return "You skipped the judging and asked about " + questions[question!].label + ".";
  }, [impression, question]);

  const handleContact = () => {
    if (contactUrl) {
      window.open(contactUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setContactHint(true);
    window.setTimeout(() => setContactHint(false), 3000);
  };

  return (
    <main className={styles.site}>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroNoise} />
        <motion.div className={styles.heroWord} style={{ scale: heroScale, y: heroY }}>
          <span>YOU DON’T</span>
          <em>KNOW ME.</em>
        </motion.div>

        <motion.div className={styles.heroPhoto} style={{ rotate: heroPhotoRotate }}>
          <img src={photos.fullbody} alt="Lộc" />
          <span className={styles.photoIndex}>01</span>
        </motion.div>

        <div className={styles.heroBottom}>
          <p>
            Good.
            <br />
            That’s actually perfect.
          </p>
          <span>scroll to make a questionable first impression ↓</span>
        </div>
      </section>

      <section className={styles.impression}>
        <div className={styles.sectionNo}>01 / FIRST IMPRESSION</div>
        <div className={styles.impressionGrid}>
          <div>
            <p className={styles.eyebrow}>NO CONTEXT. THREE SECONDS.</p>
            <h2>
              What do I
              <br />
              <i>look like?</i>
            </h2>
          </div>

          <motion.div
            className={styles.portraitCard}
            initial={{ rotate: -6, y: 40 }}
            whileInView={{ rotate: -2, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={photos.cafeBlack} alt="Lộc at a cafe" />
            <div className={styles.handArrow}>↙</div>
            <span>judge responsibly</span>
          </motion.div>

          <div className={styles.impressionChoices}>
            {impressions.map((item, i) => (
              <motion.button
                key={item}
                className={impression === item ? styles.choiceActive : ""}
                onClick={() => setImpression(item)}
                whileHover={{ x: 12 }}
                whileTap={{ scale: 0.98 }}
              >
                <b>0{i + 1}</b>
                <span>{item}</span>
                <i>→</i>
              </motion.button>
            ))}
            <motion.p
              key={impression ?? "empty"}
              className={styles.impressionReply}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: impression ? 1 : 0, y: impression ? 0 : 12 }}
            >
              {impression ? "noted. this will come back later." : "\u00A0"}
            </motion.p>
          </div>
        </div>
      </section>

      <section ref={workRef} className={styles.work}>
        <div className={styles.sectionNoLight}>02 / BY DAY</div>
        <div className={styles.workSticky}>
          <p className={styles.workKicker}>SOFTWARE ENGINEER, MOSTLY.</p>
          <h2>
            <SplitWord>I WRITE SOFTWARE.</SplitWord>
          </h2>

          <motion.div className={styles.techStream} style={{ x: workX, rotate: workRotate }}>
            {["API", "DATABASE", "QUEUE", "RETRY", "DOCKER", "CACHE", "WEBSOCKET", "WHY IS PROD DOWN?"].map(
              (item, index) => (
                <span key={item} className={index === 7 ? styles.techPanic : ""}>
                  {item}
                </span>
              )
            )}
          </motion.div>

          <div className={styles.workJoke}>
            <span>okay.</span>
            <strong>This is becoming a technical interview.</strong>
          </div>
        </div>
      </section>

      <section className={styles.more}>
        <div className={styles.sectionNo}>03 / MORE THAN WORK</div>
        <div className={styles.editorialSpread}>
          <div className={styles.moreTitle}>
            <p className={styles.eyebrow}>THE BORING FACTS, QUICKLY</p>
            <h2>There’s more.</h2>
          </div>

          <motion.div
            className={styles.bigNumber}
            initial={{ scale: 0.75, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            1m86
            <small>still inconvenient on buses</small>
          </motion.div>

          <div className={styles.factRail}>
            <Tape tilt={-2}>Hà Nội</Tape>
            <Tape tilt={3}>coffee</Tape>
            <Tape tilt={-4}>badminton</Tape>
            <Tape tilt={2}>football</Tape>
            <Tape tilt={-1}>running</Tape>
            <Tape tilt={4}>books</Tape>
            <Tape tilt={-3}>cooking</Tape>
            <Tape tilt={1}>too many side projects</Tape>
          </div>

          <motion.div
            className={styles.yellowPortrait}
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            whileInView={{ clipPath: "inset(0% 0 0 0)" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={photos.cafeYellow} alt="Lộc at a cafe" />
          </motion.div>

          <p className={styles.moreCopy}>
            I like building things, moving until my head gets quiet, sitting in cafés longer than planned,
            and conversations that accidentally become personal.
          </p>
        </div>
      </section>

      <section ref={afterRef} className={styles.after}>
        <div className={styles.afterSticky}>
          <div className={styles.sectionNoLight}>04 / AFTER WORK</div>
          <motion.div className={styles.afterTrack} style={{ x: afterX }}>
            <article className={styles.afterPanel + " " + styles.badminton}>
              <span className={styles.afterIndex}>01</span>
              <h3>BADMINTON</h3>
              <p>The “one last game” lie is alive and well.</p>
              <div className={styles.shuttle}>◒</div>
            </article>
            <article className={styles.afterPanel + " " + styles.football}>
              <span className={styles.afterIndex}>02</span>
              <h3>FOOTBALL</h3>
              <p>Good excuse to stop thinking and just move.</p>
              <div className={styles.ball}>●</div>
            </article>
            <article className={styles.afterPanel + " " + styles.running}>
              <span className={styles.afterIndex}>03</span>
              <h3>RUNNING</h3>
              <p>A few kilometres can reset a surprisingly noisy brain.</p>
              <div className={styles.route}>⌁⌁⌁⌁⌁</div>
            </article>
            <article className={styles.afterPanel + " " + styles.coffeePanel}>
              <span className={styles.afterIndex}>04</span>
              <h3>COFFEE.</h3>
              <p>And eventually, everything somehow ends here.</p>
              <div className={styles.cup}>◯</div>
            </article>
          </motion.div>
        </div>
      </section>

      <section ref={cafeRef} className={styles.cafe}>
        <motion.div className={styles.cafeMarquee} style={{ x: cafeTypeX }}>
          FUTURE — CAREER — FAMILY — FEAR — TRAVEL — STUPID IDEAS — PEOPLE —
        </motion.div>

        <div className={styles.cafeGrid}>
          <div className={styles.cafeCopy}>
            <p className={styles.eyebrow}>MY FAVOURITE KIND OF PLACE</p>
            <h2>
              Coffee.
              <br />
              Laptop.
              <br />
              <i>Then somehow… life.</i>
            </h2>
            <p>
              I can spend one hour talking about code and the next two talking about why people become who they are.
            </p>
          </div>

          <div className={styles.cafeImageWrap}>
            <motion.img src={photos.cafeYellow} alt="Lộc having coffee" style={{ y: cafeImageY }} />
            <span>stay a little longer.</span>
          </div>
        </div>
      </section>

      <section className={styles.build}>
        <div className={styles.sectionNo}>06 / I BUILD THINGS FOR NO GOOD REASON</div>
        <div className={styles.buildGrid}>
          <h2>
            “What if I
            <br />
            just made it?”
          </h2>
          <div className={styles.projectPile}>
            {[
              ["01", "3D worlds", "because normal portfolios felt too normal"],
              ["02", "AI agents", "because clicking things manually gets boring"],
              ["03", "tiny SaaS ideas", "because apparently sleep is optional"],
              ["04", "weird experiments", "because curiosity usually wins"],
            ].map(([n, title, copy], i) => (
              <motion.article
                key={title}
                initial={{ y: 80, rotate: i % 2 ? 4 : -4, opacity: 0 }}
                whileInView={{ y: i * 18, rotate: i % 2 ? 2 : -2, opacity: 1 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
              >
                <b>{n}</b>
                <h3>{title}</h3>
                <p>{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.twoAm}>
        <div className={styles.sectionNoLight}>07 / 02:17 AM</div>
        <div className={styles.tabs}>
          {["portfolio", "AI agent", "random SaaS", "new idea", "another new idea", "why am I awake"].map(
            (tab, i) => (
              <motion.div
                key={tab}
                initial={{ y: 110, rotate: i % 2 ? 7 : -7, opacity: 0 }}
                whileInView={{ y: i * 10, rotate: i % 2 ? 3 : -3, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 130, damping: 18, delay: i * 0.06 }}
              >
                <span>×</span>
                {tab}
              </motion.div>
            )
          )}
        </div>
        <div className={styles.twoAmCopy}>
          <span>27 tabs.</span>
          <h2>
            I have a small problem with
            <br />
            <i>“one more idea.”</i>
          </h2>
          <p>Curiosity is useful. Time management is… catching up.</p>
        </div>
      </section>

      <section className={styles.human}>
        <div className={styles.sectionNo}>08 / THE HUMAN PART</div>
        <div className={styles.comic}>
          <motion.div whileInView={{ rotate: -2 }} viewport={{ once: true }} className={styles.comicPanel}>
            <span>01</span>
            <div className={styles.panIcon}>⌁</div>
            <strong>cooks</strong>
            <p>especially when there’s someone to cook for</p>
          </motion.div>
          <motion.div whileInView={{ rotate: 2 }} viewport={{ once: true }} className={styles.comicPanel}>
            <span>02</span>
            <div className={styles.bookIcon}>▱</div>
            <strong>reads</strong>
            <p>mostly to leave with better questions</p>
          </motion.div>
          <motion.div whileInView={{ rotate: -1 }} viewport={{ once: true }} className={styles.comicPanel}>
            <span>03</span>
            <div className={styles.talkIcon}>“ ”</div>
            <strong>talks</strong>
            <p>preferably past the point where small talk survives</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.question}>
        <div className={styles.questionIntro}>
          <p className={styles.eyebrow}>ENOUGH ABOUT WHAT I DO.</p>
          <h2>Ask me something real.</h2>
        </div>

        <div className={styles.questionGrid}>
          {(Object.keys(questions) as QuestionKey[]).map((key) => (
            <motion.button
              key={key}
              onClick={() => setQuestion(key)}
              className={question === key ? styles.questionActive : ""}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{questions[key].label}</span>
              <i>↗</i>
            </motion.button>
          ))}
        </div>

        <motion.div
          className={styles.answer}
          key={question ?? "none"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: chosenQuestion ? 1 : 0, y: chosenQuestion ? 0 : 20 }}
        >
          {chosenQuestion && (
            <>
              <span>my short answer</span>
              <p>{chosenQuestion.answer}</p>
            </>
          )}
        </motion.div>
      </section>

      <section className={styles.ending}>
        <div className={styles.endingPhoto}>
          <img src={photos.fullbody} alt="" />
        </div>

        <div className={styles.endingCopy}>
          <motion.p
            className={styles.endingMemory}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {endingLine}
          </motion.p>

          <h2>
            And somehow,
            <br />
            <em>these were the least interesting things about me.</em>
          </h2>

          <p className={styles.endingSub}>Want the unedited version?</p>

          <motion.button
            className={styles.dmButton}
            onClick={handleContact}
            whileHover={{ scale: 1.04, rotate: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            DM ME <span>↗</span>
          </motion.button>

          {contactHint && (
            <p className={styles.contactHint}>
              Add <code>NEXT_PUBLIC_CONTACT_URL</code> and this button will open your DMs.
            </p>
          )}

          <a className={styles.githubLink} href="https://github.com/Loccao102" target="_blank" rel="noreferrer">
            or see what I’m building ↗
          </a>
        </div>

        <div className={styles.endingTicker}>
          LOC — SOFTWARE — COFFEE — BADMINTON — BOOKS — IDEAS — TOO MANY TABS — COOKING —
        </div>
      </section>
    </main>
  );
}
