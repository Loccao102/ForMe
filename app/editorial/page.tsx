"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { photos } from "../photos";
import styles from "./editorial.module.css";

const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL;

const impressions = [
  "quiet at first",
  "probably talks a lot once comfortable",
  "looks calmer than he actually is",
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
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const heroRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const afterRef = useRef<HTMLElement>(null);
  const cafeRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroSmooth = useSpring(heroProgress, { stiffness: 90, damping: 24, mass: 0.35 });
  const heroScale = useTransform(heroSmooth, [0, 0.75], [1, reduceMotion ? 1 : 1.12]);
  const heroY = useTransform(heroSmooth, [0, 1], [0, reduceMotion ? 0 : -72]);
  const heroPhotoRotate = useTransform(heroSmooth, [0, 1], [-3, reduceMotion ? -3 : 3]);

  const { scrollYProgress: workProgress } = useScroll({
    target: workRef,
    offset: ["start end", "end start"],
  });
  const workSmooth = useSpring(workProgress, { stiffness: 100, damping: 28, mass: 0.35 });
  const workX = useTransform(workSmooth, [0, 1], ["8%", reduceMotion ? "8%" : "-14%"]);
  const workRotate = useTransform(workSmooth, [0, 1], [-1, reduceMotion ? -1 : 2]);

  const { scrollYProgress: afterProgress } = useScroll({
    target: afterRef,
    offset: ["start start", "end end"],
  });
  const afterSmooth = useSpring(afterProgress, { stiffness: 88, damping: 26, mass: 0.38 });
  const afterX = useTransform(afterSmooth, [0, 1], ["0vw", reduceMotion ? "0vw" : "-200vw"]);

  const { scrollYProgress: cafeProgress } = useScroll({
    target: cafeRef,
    offset: ["start end", "end start"],
  });
  const cafeSmooth = useSpring(cafeProgress, { stiffness: 95, damping: 28, mass: 0.35 });
  const cafeImageY = useTransform(cafeSmooth, [0, 1], [reduceMotion ? 0 : -24, reduceMotion ? 0 : 24]);
  const cafeTypeX = useTransform(cafeSmooth, [0, 1], ["4%", reduceMotion ? "4%" : "-18%"]);

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
    <main className={styles.site} data-motion="v2-stable">
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
          <span>23 · Hà Nội · 1m86 · scroll ↓</span>
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
            {["IDEA", "BUILD", "BREAK", "FIX", "SHIP", "REPEAT", "WHY DID THAT WORK?"].map(
              (item, index) => (
                <span key={item} className={index === 6 ? styles.techPanic : ""}>
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
            className={styles.bigStatement}
            initial={{ scale: 0.75, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            CURIOUS.
            <small>about places, people, food, stories, and whatever comes next</small>
          </motion.div>

          <div className={styles.factRail}>
            <Tape tilt={-2}>coffee</Tape>
            <Tape tilt={3}>badminton</Tape>
            <Tape tilt={-4}>football</Tape>
            <Tape tilt={2}>running</Tape>
            <Tape tilt={-1}>books</Tape>
            <Tape tilt={4}>cooking</Tape>
            <Tape tilt={-3}>long conversations</Tape>
            <Tape tilt={1}>new places</Tape>
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
            I like moving until my head gets quiet, finding cafés worth staying in, cooking something good,
            discovering new places, and conversations that accidentally become personal.
          </p>
        </div>
      </section>

      <section ref={afterRef} className={styles.after}>
        <div className={styles.afterSticky}>
          <div className={styles.sectionNoLight}>04 / AFTER WORK</div>
          <motion.div className={styles.afterTrack} style={{ x: isMobile ? 0 : afterX }}>
            <article className={styles.afterPanel + " " + styles.badminton}>
              <span className={styles.afterIndex}>01 / 03</span>
              <p className={styles.sportKicker}>after work · favourite sport</p>
              <h3>BADMINTON</h3>
              <p>The “one last game” lie is alive and well.</p>
              <div className={styles.shuttleArt} aria-hidden="true">
                <i /><i /><i /><b />
              </div>
            </article>
            <article className={styles.afterPanel + " " + styles.football}>
              <span className={styles.afterIndex}>02 / 03</span>
              <p className={styles.sportKicker}>switch off the brain</p>
              <h3>FOOTBALL</h3>
              <p>Good excuse to stop thinking and just move.</p>
              <div className={styles.ballArt} aria-hidden="true"><i /></div>
            </article>
            <article className={styles.afterPanel + " " + styles.running}>
              <span className={styles.afterIndex}>03 / 03</span>
              <p className={styles.sportKicker}>reset button</p>
              <h3>RUNNING</h3>
              <p>A few kilometres can reset a surprisingly noisy brain.</p>
              <div className={styles.runArt} aria-hidden="true"><i /><i /><i /></div>
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
              A quiet corner.
              <br />
              <i>Then somehow… life.</i>
            </h2>
            <p>
              I can start with something ordinary and somehow end up talking about why people become who they are.
            </p>
          </div>

          <div className={styles.cafeImageWrap}>
            <motion.img src={photos.cafeYellow} alt="Lộc having coffee" style={{ y: cafeImageY }} />
            <span>stay a little longer.</span>
          </div>
        </div>
      </section>

      <section className={styles.build}>
        <div className={styles.sectionNo}>06 / SMALL THINGS I LIKE</div>
        <div className={styles.buildGrid}>
          <h2>
            The little things
            <br />
            <i>matter more.</i>
          </h2>
          <div className={styles.projectPile}>
            {[
              ["01", "a good meal", "especially when it is shared with someone I care about"],
              ["02", "a new café", "quiet enough to stay longer than planned"],
              ["03", "a long walk", "the easiest way to let my head slow down"],
              ["04", "a real conversation", "the kind where people stop trying to sound impressive"],
            ].map(([n, title, copy], i) => (
              <motion.article
                key={title}
                initial={{ y: 80, rotate: i % 2 ? 4 : -4, opacity: 0 }}
                whileInView={{ y: 0, rotate: i % 2 ? 1.5 : -1.5, opacity: 1 }}
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
        <div className={styles.sectionNoLight}>07 / AFTER MIDNIGHT</div>
        <div className={styles.tabs}>
          {["the future", "family", "where life is going", "one awkward memory", "the next trip", "why am I awake"].map(
            (thought, i) => (
              <motion.div
                key={thought}
                style={{ top: i * 54, x: "-50%" }}
                initial={{ y: 48, rotate: i % 2 ? 5 : -5, opacity: 0 }}
                whileInView={{ y: 0, rotate: i % 2 ? 2 : -2, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 150, damping: 22, delay: i * 0.06 }}
              >
                <span>✦</span>
                {thought}
              </motion.div>
            )
          )}
        </div>
        <div className={styles.twoAmCopy}>
          <span>2:17 AM.</span>
          <h2>
            My brain has a small problem with
            <br />
            <i>“we can think about that tomorrow.”</i>
          </h2>
          <p>Sometimes thoughtful. Sometimes unnecessary. Usually both.</p>
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
          <p className={styles.eyebrow}>ENOUGH FACTS.</p>
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

        </div>

        <div className={styles.endingTicker}>
          LOC — COFFEE — BADMINTON — BOOKS — FOOD — LATE NIGHTS — LONG TALKS — NEW PLACES —
        </div>
      </section>
    </main>
  );
}
