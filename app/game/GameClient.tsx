"use client";

import { useEffect, useRef } from "react";
import { photos } from "../photos";
import { TinyAudio } from "../../game/audio";
import {
  flawTags,
  impressionOptions,
  questionAnswers,
  questionOptions,
  seatOptions,
  workRamble,
  type GameState,
} from "../../game/story";
import styles from "./game.module.css";

const W = 390;
const H = 844;

export default function GameClient() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: any;
    let disposed = false;

    (async () => {
      const PhaserMod = await import("phaser");
      const Phaser = PhaserMod.default ?? PhaserMod;
      if (disposed || !hostRef.current) return;

      class MainScene extends Phaser.Scene {
        state: GameState = {};
        audio = new TinyAudio();
        stage = 0;
        bg!: any;
        content: any[] = [];
        progress!: any;

        constructor() {
          super("main");
        }

        preload() {
          this.load.image("face", photos.cafeBlack);
        }

        create() {
          this.cameras.main.setBackgroundColor("#fff8ec");
          this.bg = this.add.graphics();
          this.progress = this.add.graphics().setDepth(50);
          this.input.on("pointerdown", () => this.audio.click());
          this.showIntro();
        }

        clearScene(color = 0xfff8ec) {
          this.tweens.killAll();
          this.time.removeAllEvents();
          this.content.forEach((o) => o?.destroy?.());
          this.content = [];
          this.cameras.main.setBackgroundColor(color);
          this.bg.clear();
          this.bg.fillStyle(color, 1).fillRect(0, 0, W, H);
          this.drawProgress();
        }

        keep<T>(obj: T): T {
          this.content.push(obj);
          return obj;
        }

        drawProgress() {
          this.progress.clear();
          this.progress.fillStyle(0x11151b, 0.08).fillRect(0, 0, W, 4);
          const p = Math.max(0.04, (this.stage + 1) / 9);
          this.progress.fillStyle(0x2f80d8, 1).fillRect(0, 0, W * p, 4);
        }

        text(x: number, y: number, value: string, size = 24, color = "#17191f", width = 330, align: "left" | "center" = "left") {
          return this.keep(this.add.text(x, y, value, {
            fontFamily: "Arial, sans-serif",
            fontSize: size + "px",
            fontStyle: "bold",
            color,
            align,
            wordWrap: { width },
            lineSpacing: 4,
          }).setOrigin(align === "center" ? 0.5 : 0, 0));
        }

        small(x: number, y: number, value: string, color = "#5b6069") {
          return this.keep(this.add.text(x, y, value, {
            fontFamily: "monospace",
            fontSize: "11px",
            fontStyle: "bold",
            color,
            letterSpacing: 1.5,
          }));
        }

        panel(x: number, y: number, w: number, h: number, color = 0xffffff, alpha = 1, radius = 20) {
          const g = this.keep(this.add.graphics());
          g.fillStyle(color, alpha).fillRoundedRect(x, y, w, h, radius);
          g.lineStyle(2, 0x17191f, 0.9).strokeRoundedRect(x, y, w, h, radius);
          return g;
        }

        button(x: number, y: number, w: number, h: number, label: string, onClick: () => void, dark = true) {
          const c = this.keep(this.add.container(x, y));
          const g = this.add.graphics();
          g.fillStyle(dark ? 0x17191f : 0xffffff, 1).fillRoundedRect(0, 0, w, h, 16);
          g.lineStyle(2, 0x17191f, 1).strokeRoundedRect(0, 0, w, h, 16);
          const t = this.add.text(16, h / 2, label, {
            fontFamily: "Arial, sans-serif",
            fontSize: "15px",
            fontStyle: "bold",
            color: dark ? "#ffffff" : "#17191f",
          }).setOrigin(0, 0.5);
          const a = this.add.text(w - 18, h / 2, "→", {
            fontFamily: "Arial",
            fontSize: "20px",
            fontStyle: "bold",
            color: dark ? "#ffffff" : "#17191f",
          }).setOrigin(1, 0.5);
          c.add([g, t, a]);
          c.setSize(w, h).setInteractive({ useHandCursor: true });
          c.on("pointerdown", () => {
            this.audio.pop();
            this.tweens.add({ targets: c, scale: 0.97, duration: 70, yoyo: true, onComplete: onClick });
          });
          return c;
        }

        speech(value: string, y = 650) {
          const p = this.panel(18, y, 354, 118, 0xffffff, 0.95, 18);
          const t = this.text(34, y + 22, value, 17, "#17191f", 320);
          return [p, t];
        }

        faceCharacter(x: number, y: number, scale = 1) {
          const body = this.keep(this.add.graphics());
          body.fillStyle(0x20242b, 1).fillRoundedRect(x - 42 * scale, y + 45 * scale, 84 * scale, 130 * scale, 22 * scale);
          body.fillStyle(0xffffff, 1).fillRoundedRect(x - 32 * scale, y + 64 * scale, 64 * scale, 72 * scale, 14 * scale);
          const head = this.keep(this.add.image(x, y, "face").setDisplaySize(94 * scale, 94 * scale));
          const maskShape = this.make.graphics({ x: 0, y: 0 }, false);
          maskShape.fillCircle(x, y, 47 * scale);
          head.setMask(maskShape.createGeometryMask());
          return { body, head };
        }

        showIntro() {
          this.stage = 0;
          this.clearScene(0xfff8ec);
          this.small(22, 26, "FIGURE OUT LOC / 90 SEC");
          this.faceCharacter(W / 2, 190, 0.95);
          this.text(W / 2, 360, "You just opened\na stranger's link.", 35, "#17191f", 350, "center");
          this.text(W / 2, 455, "Bold move.", 18, "#6c7078", 330, "center");

          this.button(24, 535, 342, 58, "PLAY WITH SOUND  🔊", async () => {
            await this.audio.start(true);
            this.showImpression();
          });
          this.button(24, 605, 342, 58, "PLAY MUTED", async () => {
            await this.audio.start(false);
            this.showImpression();
          }, false);

          this.small(67, 690, "tap · swipe · choose · no signup required");
        }

        showImpression() {
          this.stage = 0;
          this.clearScene(0xfff8ec);
          this.small(22, 26, "FIRST IMPRESSION");
          this.faceCharacter(W / 2, 155, 0.75);
          this.text(W / 2, 310, "Don't think too much.", 30, "#17191f", 340, "center");
          this.text(W / 2, 355, "What kind of person do I look like?", 16, "#686d76", 340, "center");

          impressionOptions.forEach((option, i) => {
            this.button(28, 430 + i * 72, 334, 56, option.label, () => {
              this.state.impression = option.id;
              this.small(92, 665, "noted. I'll remember that.");
              this.time.delayedCall(650, () => this.showWork());
            }, i === 1);
          });
        }

        showWork() {
          this.stage = 1;
          this.clearScene(0xeef7ff);
          this.small(22, 26, "02 / WORK");
          this.text(22, 70, "Tớ làm phần mềm.", 34);

          const win = this.panel(22, 145, 346, 285, 0x11151b, 1, 22);
          const top = this.keep(this.add.graphics());
          top.fillStyle(0xffffff, 0.08).fillRoundedRect(34, 160, 322, 34, 10);
          ["#ff746e", "#ffd361", "#7fe29a"].forEach((c, i) => {
            const dot = this.keep(this.add.circle(53 + i * 18, 177, 5, Phaser.Display.Color.HexStringToColor(c).color));
          });
          const codeArea = this.keep(this.add.container(44, 214));
          const rambleText = this.keep(this.add.text(0, 0, workRamble[0], {
            fontFamily: "monospace", fontSize: "14px", color: "#aee7bd", wordWrap: { width: 285 }, lineSpacing: 7,
          }));
          codeArea.add(rambleText);

          let step = 0;
          const next = this.button(22, 470, 346, 56, "ừm... tiếp đi", () => {
            step += 1;
            this.audio.typingBurst();
            rambleText.setText(workRamble.slice(0, step + 1).join("\n\n"));
            this.tweens.add({ targets: rambleText, alpha: { from: 0.3, to: 1 }, x: { from: 8, to: 0 }, duration: 220 });

            if (step === 1) this.spawnTechChip("API", 44, 560);
            if (step === 2) {
              this.spawnTechChip("DB", 118, 585);
              this.spawnTechChip("QUEUE", 206, 554);
            }
            if (step === 3) {
              this.spawnTechChip("DOCKER", 48, 626);
              this.spawnTechChip("WS", 160, 646);
              this.spawnTechChip("SCALE", 239, 615);
            }
            if (step === 4) {
              this.cameras.main.shake(120, 0.004);
              this.audio.wrong();
            }
            if (step >= workRamble.length - 1) {
              next.destroy();
              this.button(70, 725, 250, 58, "PLEASE STOP", () => this.escapeWork());
            }
          });
        }

        spawnTechChip(label: string, x: number, y: number) {
          const chip = this.keep(this.add.container(x, y).setAlpha(0).setScale(0.7));
          const g = this.add.graphics();
          g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 86, 38, 12);
          g.lineStyle(2, 0x17191f, 1).strokeRoundedRect(0, 0, 86, 38, 12);
          const t = this.add.text(43, 19, label, { fontFamily: "monospace", fontSize: "11px", fontStyle: "bold", color: "#17191f" }).setOrigin(0.5);
          chip.add([g, t]);
          this.tweens.add({ targets: chip, alpha: 1, scale: 1, duration: 250, ease: "Back.Out" });
        }

        escapeWork() {
          this.audio.whoosh();
          this.content.filter((o) => o?.y > 520).forEach((o) => {
            this.tweens.add({ targets: o, y: H + 120, angle: Phaser.Math.Between(-40, 40), duration: 500, ease: "Back.In" });
          });
          this.time.delayedCall(540, () => this.showGym());
        }

        showGym() {
          this.stage = 2;
          this.clearScene(0xf2f6ed);
          this.small(22, 26, "03 / SELF-GROWTH");
          this.text(22, 66, "Ngồi nhiều quá thì\nphải bù lại chứ.", 32);

          const room = this.keep(this.add.graphics());
          room.fillStyle(0xe4eee3, 1).fillRoundedRect(20, 175, 350, 360, 26);
          room.lineStyle(3, 0x17191f, 0.8).strokeRoundedRect(20, 175, 350, 360, 26);
          room.fillStyle(0x8fa49a, 1).fillRect(45, 395, 300, 16);
          room.fillStyle(0x33373d, 1);
          room.fillRoundedRect(65, 280, 90, 22, 10);
          room.fillRect(103, 298, 14, 98);
          room.fillCircle(255, 370, 42);
          room.fillCircle(300, 370, 42);
          room.lineStyle(8, 0x33373d, 1).lineBetween(255, 370, 300, 370);
          room.fillStyle(0x8bd39c, 1).fillRoundedRect(230, 220, 92, 100, 18);

          this.panel(246, 190, 100, 58, 0xffd76d, 1, 14);
          this.text(260, 203, "1m86", 20);
          this.small(258, 229, "~90kg · WIP");

          this.text(24, 565, "Gym bro level?", 18);
          const rail = this.keep(this.add.graphics());
          rail.lineStyle(6, 0x17191f, 0.2).lineBetween(40, 635, 350, 635);
          this.small(28, 662, "couch potato");
          this.small(275, 662, "gym rat");

          const knob = this.keep(this.add.circle(195, 635, 16, 0x17191f).setInteractive({ useHandCursor: true, draggable: true }));
          this.input.setDraggable(knob);
          knob.on("drag", (_p: any, dragX: number) => {
            knob.x = Phaser.Math.Clamp(dragX, 45, 345);
          });
          knob.on("dragend", () => {
            knob.disableInteractive();
            if (knob.x > 270) {
              this.audio.wrong();
              this.speech("Không đến mức đó đâu 😐", 700);
            } else if (knob.x < 105) {
              this.audio.wrong();
              this.speech("Cũng không lười đến thế.", 700);
            } else {
              this.audio.pop();
              this.speech("Ừ, khoảng giữa là đúng.", 700);
            }
            this.tweens.add({ targets: knob, x: 195, duration: 420, ease: "Back.Out" });
            this.time.delayedCall(900, () => this.showSports());
          });
        }

        showSports() {
          this.stage = 3;
          this.clearScene(0xeaf7ff);
          this.small(22, 26, "04 / MOVE");
          this.text(22, 70, "Okay.\nEnough sitting.", 36);
          this.small(22, 170, "tap the shuttle when it hits the green zone");

          const court = this.keep(this.add.graphics());
          court.fillStyle(0xbfe5bf, 1).fillRoundedRect(20, 220, 350, 330, 24);
          court.lineStyle(2, 0xffffff, 0.9).strokeRoundedRect(36, 238, 318, 294, 12);
          court.lineBetween(195, 238, 195, 532);
          court.fillStyle(0x74cf8f, 0.5).fillRoundedRect(160, 280, 70, 190, 14);

          const shuttle = this.keep(this.add.text(34, 348, "🏸", { fontSize: "42px" }).setOrigin(0.5));
          let dir = 1;
          const move = this.tweens.add({ targets: shuttle, x: 354, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.InOut" });

          const hit = this.button(72, 600, 246, 62, "HIT!", () => {
            move.pause();
            const ok = shuttle.x > 150 && shuttle.x < 240;
            this.state.badmintonHit = ok;
            ok ? this.audio.hit() : this.audio.wrong();
            this.text(W / 2, 690, ok ? "NICE." : "we're pretending that didn't happen.", ok ? 30 : 17, "#17191f", 350, "center");
            this.time.delayedCall(950, () => this.showCafe());
          });
        }

        showCafe() {
          this.stage = 4;
          this.clearScene(0xfff4e6);
          this.small(22, 26, "05 / COFFEE?");
          this.text(22, 70, "Okay. Enough cardio.", 31);
          this.text(22, 118, "Coffee?", 42);

          this.button(24, 190, 165, 54, "obviously", () => this.chooseSeat());
          this.button(201, 190, 165, 54, "no thanks", () => {
            this.audio.wrong();
            this.speech("Interesting. We're going anyway.", 275);
            this.time.delayedCall(700, () => this.chooseSeat());
          }, false);
        }

        chooseSeat() {
          this.clearScene(0xfff4e6);
          this.small(22, 26, "05 / PICK A SEAT");
          this.text(22, 70, "Chọn chỗ đi.", 36);

          const cafe = this.keep(this.add.graphics());
          cafe.fillStyle(0xf0d3aa, 1).fillRoundedRect(18, 150, 354, 350, 24);
          cafe.fillStyle(0x8fc8e8, 1).fillRoundedRect(40, 180, 122, 130, 18);
          cafe.fillStyle(0x6d513f, 1);
          cafe.fillRoundedRect(55, 390, 95, 12, 6);
          cafe.fillRoundedRect(230, 390, 95, 12, 6);
          cafe.fillRect(98, 402, 10, 64);
          cafe.fillRect(273, 402, 10, 64);

          seatOptions.forEach((s, i) => {
            this.button(30, 540 + i * 66, 330, 50, s.label, () => {
              this.state.seat = s.id;
              this.audio.chime();
              this.showBook();
            }, i === 0);
          });
        }

        showBook() {
          this.stage = 5;
          this.clearScene(0xf3efff);
          this.small(22, 26, "06 / OPEN THE BOOK");
          this.text(22, 70, "Không mở laptop thì...", 30);

          const book = this.keep(this.add.container(195, 330));
          const left = this.add.graphics();
          left.fillStyle(0xfffdf6, 1).fillRoundedRect(-155, -120, 150, 240, 16);
          left.lineStyle(2, 0x17191f, 1).strokeRoundedRect(-155, -120, 150, 240, 16);
          const right = this.add.graphics();
          right.fillStyle(0xfffdf6, 1).fillRoundedRect(5, -120, 150, 240, 16);
          right.lineStyle(2, 0x17191f, 1).strokeRoundedRect(5, -120, 150, 240, 16);
          const q = this.add.text(0, 0, "Why do people\nbecome who\nthey are?", {
            fontFamily: "Georgia, serif", fontSize: "22px", color: "#17191f", align: "center",
          }).setOrigin(0.5);
          book.add([left, right, q]);

          this.button(58, 535, 274, 58, "OPEN IT", () => this.showDeepTalk());
        }

        showDeepTalk() {
          this.stage = 6;
          this.clearScene(0x17181d);
          this.small(22, 26, "07 / ASK ME ONE", "#ffffff");
          this.faceCharacter(195, 130, 0.65);
          this.text(W / 2, 270, "Small talk is fine.", 20, "#ffffff", 350, "center");
          this.text(W / 2, 310, "Nhưng tớ thích câu hỏi\nkhiến mình phải nghĩ.", 27, "#ffffff", 350, "center");

          questionOptions.forEach((q, i) => {
            this.button(24, 420 + i * 66, 342, 52, q.label, () => {
              this.state.question = q.id;
              this.audio.pop();
              this.showAnswer(q.id);
            }, false);
          });
        }

        showAnswer(id: keyof typeof questionAnswers) {
          this.clearScene(0x17181d);
          this.small(22, 26, "07 / MY ANSWER", "#ffffff");
          this.faceCharacter(195, 135, 0.7);
          this.speech(questionAnswers[id], 300);
          this.button(58, 610, 274, 58, "Okay. Dinner?", () => this.showCooking(), false);
        }

        showCooking() {
          this.stage = 7;
          this.clearScene(0xfff0e1);
          this.small(22, 26, "08 / DINNER?");
          this.text(22, 70, "Nói chuyện sẽ hay hơn\nnếu có đồ ăn.", 31);
          this.button(24, 170, 165, 54, "cook", () => this.cookMiniGame());
          this.button(201, 170, 165, 54, "order", () => {
            this.state.orderedFood = true;
            this.audio.wrong();
            this.speech("That was a test.", 250);
            this.time.delayedCall(750, () => this.cookMiniGame());
          }, false);
        }

        cookMiniGame() {
          this.clearScene(0xfff0e1);
          this.small(22, 26, "08 / COOKING");
          this.text(22, 70, "Tap the pan 3 times.", 28);
          const pan = this.keep(this.add.container(195, 360));
          const p = this.add.circle(0, 0, 105, 0x24282e);
          const food = this.add.text(0, 0, "🍳\n🥬  🍅  🧄", { fontSize: "38px", align: "center" }).setOrigin(0.5);
          pan.add([p, food]);
          pan.setSize(210, 210).setInteractive({ useHandCursor: true });
          let taps = 0;
          pan.on("pointerdown", () => {
            taps += 1;
            this.audio.sizzle();
            this.tweens.add({ targets: pan, angle: { from: -5, to: 5 }, duration: 100, yoyo: true });
            if (taps >= 3) {
              pan.disableInteractive();
              this.text(W / 2, 520, "Tớ thích nấu ăn.", 28, "#17191f", 340, "center");
              this.text(W / 2, 565, "Nhưng chủ yếu là nấu cho\nnhững người mình quan tâm.", 19, "#6a4b43", 340, "center");
              this.button(58, 685, 274, 56, "show me the bad part", () => this.showFlaws());
            }
          });
        }

        showFlaws() {
          this.stage = 8;
          this.clearScene(0xf0f1f5);
          this.small(22, 26, "09 / REALITY CHECK");
          this.text(W / 2, 86, "This is starting to sound\nsuspiciously good.", 29, "#17191f", 350, "center");
          this.button(40, 215, 310, 62, "SHOW ME THE BAD PART", () => {
            this.audio.wrong();
            this.cameras.main.shake(170, 0.006);
            this.revealFlaws();
          });
        }

        revealFlaws() {
          this.clearScene(0xf0f1f5);
          this.small(22, 26, "09 / MUCH BETTER");
          this.text(W / 2, 75, "lol no.", 64, "#17191f", 350, "center");
          const clock = this.panel(218, 165, 150, 75, 0x17191f, 1, 16);
          this.text(235, 180, "02:17 AM", 24, "#ffd76d");
          const tabs = this.panel(22, 270, 180, 180, 0xffffff, 1, 16);
          this.small(38, 286, "tabs: 27");
          ["portfolio", "new project", "another project", "sleep earlier?"].forEach((v, i) => this.small(38, 320 + i * 28, v));
          flawTags.forEach((tag, i) => {
            this.panel(32, 485 + i * 50, 326, 38, i % 2 ? 0xffe5dc : 0xe6ecff, 1, 14);
            this.small(48, 498 + i * 50, tag);
          });
          this.text(W / 2, 705, "Better?", 22, "#17191f", 340, "center");
          this.button(92, 750, 206, 50, "Much.", () => this.showEnding());
        }

        showEnding() {
          this.stage = 9;
          this.clearScene(0x5d759c);
          this.small(22, 26, "END / 7%", "#ffffff");
          this.text(W / 2, 75, "So...", 34, "#ffffff", 350, "center");

          const first = impressionOptions.find((o) => o.id === this.state.impression)?.label ?? "something";
          const seat = seatOptions.find((o) => o.id === this.state.seat)?.label ?? "a seat";
          const q = questionOptions.find((o) => o.id === this.state.question)?.label ?? "a question";
          const sport = this.state.badmintonHit ? "returned the badminton shot" : "missed the badminton shot";
          const lines = [
            "You thought I was “" + first + "”.",
            "You picked the " + seat + ".",
            "You " + sport + ".",
            "And you asked: “" + q + "”",
          ];
          lines.forEach((line, i) => {
            this.keep(this.add.text(28, 150 + i * 55, line, {
              fontFamily: "Arial", fontSize: "16px", fontStyle: "bold", color: "#ffffff",
              wordWrap: { width: 334 }, lineSpacing: 3,
            }));
          });

          this.panel(28, 405, 334, 180, 0xffffff, 0.16, 22);
          this.text(W / 2, 435, "YOU KNOW LOC", 16, "#ffffff", 300, "center");
          this.text(W / 2, 475, "7%", 58, "#ffffff", 300, "center");
          this.text(W / 2, 555, "Not bad.", 16, "#ffffff", 300, "center");

          this.text(W / 2, 625, "The other 93% probably needs\nan actual conversation.", 22, "#ffffff", 350, "center");
          this.button(44, 730, 302, 58, "SAY HI", () => {
            const url = process.env.NEXT_PUBLIC_CONTACT_URL;
            if (url) window.open(url, "_blank", "noopener,noreferrer");
            else this.speech("Chưa gắn link chat — nhưng ít nhất game chạy rồi 😅", 650);
          }, false);
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: W,
        height: H,
        backgroundColor: "#fff8ec",
        scene: [MainScene],
        transparent: false,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: W,
          height: H,
        },
        render: {
          antialias: true,
          pixelArt: false,
          roundPixels: false,
        },
        input: {
          activePointers: 2,
        },
      });
    })();

    return () => {
      disposed = true;
      game?.destroy?.(true);
    };
  }, []);

  return (
    <div className={styles.shell}>
      <div className={styles.phone}>
        <div ref={hostRef} className={styles.gameHost} />
      </div>
      <p className={styles.hint}>Best with sound · tap / drag / choose</p>
    </div>
  );
}
