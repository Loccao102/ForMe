"use client";

import { useEffect, useRef } from "react";
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
        heroActor: any = null;

        constructor() {
          super("main");
        }

        preload() {
          this.load.image("face-neutral", "/game/face-neutral.svg");
          this.load.image("face-smile", "/game/face-smile.svg");
          this.load.image("face-thinking", "/game/face-thinking.svg");
          this.load.image("face-surprised", "/game/face-surprised.svg");
          this.load.image("face-deadpan", "/game/face-deadpan.svg");
          this.load.image("office-bg", "/game/office.svg");
          this.load.image("gym-bg", "/game/gym.svg");
          this.load.image("cafe-bg", "/game/cafe.svg");
          this.load.image("kitchen-bg", "/game/kitchen.svg");
          this.load.image("park-bg", "/game/park.svg");
          this.load.image("rooftop-bg", "/game/rooftop-night.svg");
          this.load.image("body-idle", "/game/body-idle-v2.svg");
          this.load.image("body-walk-a", "/game/body-walk-a-v2.svg");
          this.load.image("body-walk-b", "/game/body-walk-b-v2.svg");
          this.load.image("body-talk", "/game/body-talk-v2.svg");
          this.load.image("body-deadpan", "/game/body-deadpan-v2.svg");
          this.load.image("body-gym", "/game/body-gym.svg");
          this.load.image("body-gym-up", "/game/body-gym-up.svg");
          this.load.image("body-badminton", "/game/body-badminton.svg");
          this.load.image("body-badminton-back", "/game/body-badminton-back.svg");
          this.load.image("body-badminton-hit", "/game/body-badminton-hit.svg");
          this.load.image("body-football", "/game/body-football.svg");
          this.load.image("body-football-prep", "/game/body-football-prep.svg");
          this.load.image("body-run", "/game/body-run.svg");
          this.load.image("body-run-b", "/game/body-run-b.svg");
          this.load.image("body-seated", "/game/body-seated.svg");
          this.load.image("body-seated-sip", "/game/body-seated-sip.svg");
          this.load.image("body-cook", "/game/body-cook.svg");
          this.load.image("body-cook-a", "/game/body-cook-a.svg");
          this.load.image("body-cook-b", "/game/body-cook-b.svg");
          this.load.image("body-talk-alt", "/game/body-talk-alt.svg");
          this.load.image("body-wave", "/game/body-wave.svg");
          this.load.image("body-laptop", "/game/body-laptop.svg");
          this.load.image("body-book-closed", "/game/body-book-closed.svg");
          this.load.image("body-book-open", "/game/body-book-open.svg");
          this.load.image("body-serve", "/game/body-serve.svg");
        }

        create() {
          this.cameras.main.setBackgroundColor("#fff8ec");
          this.bg = this.add.graphics().setDepth(-20);
          this.progress = this.add.graphics().setDepth(50);
          this.input.on("pointerdown", () => this.audio.click());
          this.showIntro();
        }

        clearScene(color = 0xfff8ec) {
          this.tweens.killAll();
          this.time.removeAllEvents();
          this.cameras.main.setScroll(0, 0);
          this.cameras.main.setZoom(1);
          this.cameras.main.setRotation(0);
          this.content.forEach((o) => o?.destroy?.());
          this.content = [];
          this.heroActor = null;
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

        artBackground(key: string, alpha = 1, drift = true) {
          const image = this.keep(this.add.image(W / 2, H / 2, key).setDisplaySize(W + 10, H + 10).setAlpha(alpha));
          image.setDepth(-1);

          if (drift) {
            this.tweens.add({
              targets: image,
              x: W / 2 - 5,
              y: H / 2 + 4,
              duration: 7600,
              yoyo: true,
              repeat: -1,
              ease: "Sine.InOut",
            });
          }

          return image;
        }

        ambientDots(color = 0xffffff, count = 8, alpha = 0.2) {
          for (let i = 0; i < count; i++) {
            const dot = this.keep(this.add.circle(
              Phaser.Math.Between(16, W - 16),
              Phaser.Math.Between(80, H - 80),
              Phaser.Math.Between(2, 5),
              color,
              alpha
            ).setDepth(-0.2));

            this.tweens.add({
              targets: dot,
              x: dot.x + Phaser.Math.Between(-24, 24),
              y: dot.y - Phaser.Math.Between(18, 62),
              alpha: { from: alpha * 0.55, to: alpha },
              duration: Phaser.Math.Between(2400, 5200),
              yoyo: true,
              repeat: -1,
              delay: Phaser.Math.Between(0, 900),
              ease: "Sine.InOut",
            });
          }
        }

        transitionTo(next: () => void, duration = 280) {
          this.input.enabled = false;
          this.audio.whoosh();
          this.cameras.main.fadeOut(duration, 15, 18, 24);

          this.time.delayedCall(duration + 20, () => {
            next();
            this.cameras.main.fadeIn(duration + 110, 15, 18, 24);
            this.input.enabled = true;
          });
        }

        slideWorldTo(
          nextBackground: string,
          next: () => void,
          direction = 1,
          duration = 620
        ) {
          this.input.enabled = false;
          this.audio.whoosh();

          const currentTargets = this.content.filter(
            (o) => o?.active && typeof o.x === "number"
          );

          const nextBg = this.keep(
            this.add.image(
              direction > 0 ? W * 1.5 : -W * 0.5,
              H / 2,
              nextBackground
            ).setDisplaySize(W + 10, H + 10).setDepth(-1.4)
          );

          this.tweens.add({
            targets: currentTargets,
            x: direction > 0 ? `-=${W}` : `+=${W}`,
            duration,
            ease: "Sine.InOut",
          });

          this.tweens.add({
            targets: nextBg,
            x: W / 2,
            duration,
            ease: "Sine.InOut",
          });

          this.tweens.add({
            targets: this.cameras.main,
            scrollX: direction * 20,
            duration,
            ease: "Sine.InOut",
          });

          this.time.delayedCall(duration - 10, () => {
            next();
            this.cameras.main.flash(90, 255, 255, 255, false);
            this.input.enabled = true;
          });
        }

        glitchTo(next: () => void) {
          this.input.enabled = false;
          this.audio.wrong();
          this.cameras.main.shake(230, 0.009);

          const bands = Array.from({ length: 7 }).map((_, i) => {
            const band = this.add.rectangle(
              W / 2,
              90 + i * 105,
              W + 80,
              Phaser.Math.Between(16, 34),
              i % 2 ? 0xffe5dc : 0xdce8ff,
              0.72
            ).setDepth(95);
            this.content.push(band);
            return band;
          });

          bands.forEach((band, i) => {
            band.x += i % 2 ? -W : W;
            this.tweens.add({
              targets: band,
              x: W / 2,
              duration: 120,
              delay: i * 24,
              yoyo: true,
              hold: 25,
              ease: "Stepped",
            });
          });

          this.time.delayedCall(360, () => {
            next();
            this.cameras.main.flash(130, 255, 255, 255, false);
            this.input.enabled = true;
          });
        }

        loopBodyFrames(actor: any, frames: string[], delay = 180) {
          let index = 0;
          actor.body.setTexture(frames[0]);
          return this.time.addEvent({
            delay,
            loop: true,
            callback: () => {
              if (!actor?.body?.active) return;
              index = (index + 1) % frames.length;
              actor.body.setTexture(frames[index]);
            },
          });
        }

        playBodySequence(
          actor: any,
          frames: string[],
          delay = 95,
          onComplete?: () => void
        ) {
          let index = 0;
          actor.body.setTexture(frames[0]);

          const evt = this.time.addEvent({
            delay,
            repeat: Math.max(0, frames.length - 2),
            callback: () => {
              index += 1;
              if (actor?.body?.active) actor.body.setTexture(frames[index]);
            },
          });

          this.time.delayedCall(delay * frames.length, () => {
            if (actor?.body?.active) actor.body.setTexture(frames[frames.length - 1]);
            onComplete?.();
          });

          return evt;
        }

        squash(actor: any, amount = 0.06, duration = 120) {
          const baseX = actor.container.scaleX || 1;
          const baseY = actor.container.scaleY || 1;
          this.tweens.add({
            targets: actor.container,
            scaleX: baseX + amount,
            scaleY: baseY - amount,
            duration,
            yoyo: true,
            ease: "Sine.InOut",
          });
        }

        walkActorTo(
          actor: any,
          x: number,
          duration = 620,
          onComplete?: () => void
        ) {
          if (!actor?.container?.active) return;
          let frame = false;
          const direction = x >= actor.container.x ? 1 : -1;
          actor.container.scaleX = Math.abs(actor.container.scaleX || 1) * direction;
          actor.head.scaleX = Math.abs(actor.head.scaleX || 1) * direction;

          const stepper = this.time.addEvent({
            delay: 125,
            loop: true,
            callback: () => {
              if (!actor?.body?.active) return;
              frame = !frame;
              actor.body.setTexture(frame ? "body-walk-a" : "body-walk-b");
            },
          });

          this.tweens.add({
            targets: actor.container,
            x,
            y: actor.container.y - 3,
            duration,
            ease: "Sine.InOut",
            onComplete: () => {
              stepper.remove();
              actor.container.scaleX = Math.abs(actor.container.scaleX || 1);
              actor.head.scaleX = Math.abs(actor.head.scaleX || 1);
              actor.body.setTexture("body-idle");
              onComplete?.();
            },
          });
        }

        foregroundParallax(color = 0x11151b, alpha = 0.12, speed = 6000) {
          const near = this.keep(this.add.graphics().setDepth(-0.1));
          near.fillStyle(color, alpha);
          near.fillEllipse(-30, H - 80, 150, 110);
          near.fillEllipse(W + 20, H - 55, 190, 130);
          near.fillRoundedRect(-20, H - 34, W + 40, 60, 24);

          this.tweens.add({
            targets: near,
            x: -16,
            duration: speed,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });

          return near;
        }

        cameraNudge(x = 8, y = 0, duration = 180) {
          const cam = this.cameras.main;
          this.tweens.add({
            targets: cam,
            scrollX: x,
            scrollY: y,
            duration,
            yoyo: true,
            ease: "Sine.InOut",
          });
        }

        faceCharacter(
          x: number,
          y: number,
          scale = 1,
          pose = "body-idle",
          face = "face-neutral",
          bob = true
        ) {
          const c = this.keep(this.add.container(x, y));

          const shadow = this.add.ellipse(0, 265 * scale, 98 * scale, 18 * scale, 0x11151b, 0.12);
          const body = this.add.image(0, 18 * scale, pose)
            .setOrigin(0.5, 0)
            .setDisplaySize(160 * scale, 260 * scale);

          const head = this.add.image(0, -2 * scale, face)
            .setDisplaySize(112 * scale, 112 * scale);

          c.add([shadow, body, head]);

          const headBaseScaleY = head.scaleY;
          this.time.addEvent({
            delay: 2800 + Phaser.Math.Between(0, 1100),
            loop: true,
            callback: () => {
              this.tweens.add({
                targets: head,
                scaleY: headBaseScaleY * 0.12,
                duration: 60,
                yoyo: true,
                hold: 35,
                ease: "Sine.InOut",
              });
            },
          });

          if (bob) {
            this.tweens.add({
              targets: c,
              y: y - 5 * scale,
              duration: 1450,
              yoyo: true,
              repeat: -1,
              ease: "Sine.InOut",
            });
          }

          return { container: c, body, head };
        }

        walkIn(y: number, scale = 0.72, targetX = W / 2) {
          const actor = this.faceCharacter(-90, y, scale, "body-walk-a", "face-neutral", false);
          let frame = false;
          const stepper = this.time.addEvent({
            delay: 135,
            loop: true,
            callback: () => {
              frame = !frame;
              actor.body.setTexture(frame ? "body-walk-a" : "body-walk-b");
            },
          });

          this.tweens.add({
            targets: actor.container,
            x: targetX,
            duration: 950,
            ease: "Sine.Out",
            onComplete: () => {
              stepper.remove();
              actor.body.setTexture("body-idle");
              actor.head.setTexture("face-smile");
              this.tweens.add({
                targets: actor.container,
                y: y - 4 * scale,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: "Sine.InOut",
              });
            },
          });

          return actor;
        }

        showIntro() {
          this.stage = 0;
          this.clearScene(0xfff8ec);
          this.artBackground("rooftop-bg", 0.94);
          const introShade = this.keep(this.add.rectangle(W / 2, H / 2, W, H, 0x0d1020, 0.16));
          introShade.setDepth(-0.5);
          this.small(22, 26, "FIGURE OUT LOC / 90 SEC", "#ffffff");
          const introActor = this.walkIn(170, 0.78);
          introActor.container.setSize(130, 240).setInteractive({ useHandCursor: true });
          introActor.container.on("pointerdown", () => {
            introActor.head.setTexture("face-surprised");
            this.audio.pop();
            const poke = this.text(W / 2, 305, "hey 😐", 15, "#ffffff", 150, "center");
            this.tweens.add({ targets: poke, alpha: 0, y: 288, duration: 850, delay: 280 });
            this.time.delayedCall(650, () => introActor.head.setTexture("face-smile"));
          });
          this.text(W / 2, 360, "You just opened\na stranger's link.", 35, "#ffffff", 350, "center");
          this.text(W / 2, 455, "Bold move.", 18, "#f5d7b2", 330, "center");

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
          this.faceCharacter(W / 2, 155, 0.75, "body-idle", "face-neutral");
          this.text(W / 2, 310, "Don't think too much.", 30, "#17191f", 340, "center");
          this.text(W / 2, 355, "What kind of person do I look like?", 16, "#686d76", 340, "center");

          impressionOptions.forEach((option, i) => {
            this.button(28, 430 + i * 72, 334, 56, option.label, () => {
              this.state.impression = option.id;
              this.small(92, 665, "noted. I'll remember that.");
              this.time.delayedCall(650, () => this.transitionTo(() => this.showWork()));
            }, i === 1);
          });
        }

        showWork() {
          this.stage = 1;
          this.clearScene(0xeef7ff);
          this.artBackground("office-bg", 0.78);
          this.ambientDots(0x8ed7ff, 7, 0.18);
          this.foregroundParallax(0x0d1118, 0.09, 7200);
          this.small(22, 26, "02 / WORK");
          this.text(22, 70, "Tớ làm phần mềm.", 34);

          const win = this.panel(22, 145, 346, 285, 0x11151b, 1, 22);
          const top = this.keep(this.add.graphics());
          top.fillStyle(0xffffff, 0.08).fillRoundedRect(34, 160, 322, 34, 10);
          ["#ff746e", "#ffd361", "#7fe29a"].forEach((c, i) => {
            const dot = this.keep(this.add.circle(53 + i * 18, 177, 5, Phaser.Display.Color.HexStringToColor(c).color));
          });
          const workActor = this.faceCharacter(315, 675, 0.32, "body-talk", "face-neutral", false);
          this.heroActor = workActor;
          const workTalkLoop = this.loopBodyFrames(workActor, ["body-talk", "body-talk-alt"], 520);
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

            if (step === 1) {
              workActor.head.setTexture("face-thinking");
              this.spawnTechChip("API", 44, 560);
            }
            if (step === 2) {
              this.spawnTechChip("DB", 118, 585);
              this.spawnTechChip("QUEUE", 206, 554);
            }
            if (step === 3) {
              workActor.head.setTexture("face-surprised");
              this.spawnTechChip("DOCKER", 48, 626);
              this.spawnTechChip("WS", 160, 646);
              this.spawnTechChip("SCALE", 239, 615);
            }
            if (step === 4) {
              workTalkLoop.remove();
              workActor.head.setTexture("face-deadpan");
              workActor.body.setTexture("body-deadpan");
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
          const hero = this.heroActor;
          if (hero?.container) {
            hero.head.setTexture("face-smile");
            hero.body.setTexture("body-walk-a");
            this.tweens.add({
              targets: hero.container,
              x: W + 110,
              angle: 4,
              duration: 620,
              ease: "Sine.In",
            });
          }

          this.content.filter((o) => o?.y > 520 && o !== hero?.container).forEach((o) => {
            this.tweens.add({ targets: o, y: H + 120, angle: Phaser.Math.Between(-40, 40), duration: 500, ease: "Back.In" });
          });
          this.time.delayedCall(540, () => this.slideWorldTo("gym-bg", () => this.showGym(), 1, 650));
        }

        showGym() {
          this.stage = 2;
          this.clearScene(0xf2f6ed);
          this.artBackground("gym-bg", 0.92);
          this.ambientDots(0xb9ffd0, 6, 0.14);
          this.small(22, 26, "03 / SELF-GROWTH", "#ffffff");
          this.panel(18, 56, 354, 95, 0x101419, 0.72, 20);
          this.text(34, 76, "Ngồi nhiều quá thì\nphải bù lại chứ.", 28, "#ffffff", 320);
          const gymActor = this.faceCharacter(195, 310, 0.56, "body-gym", "face-neutral", false);
          this.heroActor = gymActor;
          gymActor.container.setSize(160, 250).setInteractive({ useHandCursor: true });
          let reps = 0;
          let lifting = false;
          const repText = this.small(150, 500, "tap me for a rep");
          gymActor.container.on("pointerdown", () => {
            if (lifting) return;
            lifting = true;
            reps += 1;
            this.audio.pop();
            gymActor.head.setTexture(reps >= 3 ? "face-smile" : "face-neutral");
            repText.setText("rep " + reps + (reps >= 3 ? " · okay, enough 😅" : ""));

            this.playBodySequence(
              gymActor,
              ["body-gym", "body-gym-up", "body-gym-up", "body-gym"],
              115,
              () => { lifting = false; }
            );
            this.squash(gymActor, 0.035, 140);
            this.tweens.add({
              targets: gymActor.container,
              y: 300,
              duration: 180,
              yoyo: true,
              ease: "Sine.InOut",
            });
          });

          this.panel(246, 190, 100, 58, 0xffd76d, 0.95, 14);
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
            this.time.delayedCall(900, () => this.slideWorldTo("park-bg", () => this.showSports(), 1, 620));
          });
        }

        showSports() {
          this.stage = 3;
          this.clearScene(0xeaf7ff);
          this.artBackground("park-bg", 0.92);
          this.ambientDots(0xffffff, 8, 0.16);
          this.foregroundParallax(0x2d7f49, 0.11, 5200);
          this.small(22, 26, "04 / MOVE");
          this.text(22, 70, "Okay.\nEnough sitting.", 36);
          this.small(22, 170, "tap the shuttle when it hits the green zone");

          const court = this.keep(this.add.graphics());
          court.fillStyle(0xbfe5bf, 0.82).fillRoundedRect(20, 220, 350, 330, 24);
          court.lineStyle(2, 0xffffff, 0.95).strokeRoundedRect(36, 238, 318, 294, 12);
          court.lineBetween(195, 238, 195, 532);
          court.fillStyle(0x74cf8f, 0.5).fillRoundedRect(160, 280, 70, 190, 14);

          const player = this.faceCharacter(92, 315, 0.42, "body-badminton", "face-neutral", false);
          this.heroActor = player;
          player.container.setDepth(3);

          let readyFrame = false;
          const readyLoop = this.time.addEvent({
            delay: 330,
            loop: true,
            callback: () => {
              if (!player.body.active) return;
              readyFrame = !readyFrame;
              player.body.setTexture(readyFrame ? "body-badminton-back" : "body-badminton");
            },
          });

          const shuttle = this.keep(this.add.text(250, 348, "🏸", { fontSize: "42px" }).setOrigin(0.5).setDepth(4));
          let dir = 1;
          const move = this.tweens.add({ targets: shuttle, x: 354, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.InOut" });

          const hit = this.button(72, 600, 246, 62, "HIT!", () => {
            move.pause();
            readyLoop.remove();
            const ok = shuttle.x > 150 && shuttle.x < 240;
            this.state.badmintonHit = ok;
            player.head.setTexture(ok ? "face-smile" : "face-surprised");

            this.playBodySequence(
              player,
              ["body-badminton-back", "body-badminton-hit", "body-badminton"],
              85
            );
            this.squash(player, 0.045, 90);
            this.tweens.add({
              targets: player.container,
              angle: ok ? -6 : 6,
              x: ok ? 108 : 80,
              duration: 170,
              yoyo: true,
              ease: "Back.Out",
            });
            ok ? this.audio.hit() : this.audio.wrong();
            this.text(W / 2, 690, ok ? "NICE." : "we're pretending that didn't happen.", ok ? 30 : 17, "#17191f", 350, "center");
            this.time.delayedCall(850, () => this.showSportsMontage());
          });
        }

        showSportsMontage() {
          this.audio.whoosh();
          this.clearScene(0xeaf7ff);
          this.artBackground("park-bg", 0.96);
          this.small(22, 26, "04 / ALSO...");
          this.text(22, 70, "Badminton không phải\nmôn duy nhất.", 30);

          const footballActor = this.faceCharacter(105, 350, 0.45, "body-football-prep", "face-smile", false);
          footballActor.container.setAlpha(0).setX(30);
          this.tweens.add({
            targets: footballActor.container,
            alpha: 1,
            x: 120,
            duration: 420,
            ease: "Back.Out",
            onComplete: () => {
              this.playBodySequence(
                footballActor,
                ["body-football-prep", "body-football", "body-football-prep"],
                115
              );
              this.tweens.add({
                targets: footballActor.container,
                x: 136,
                angle: -4,
                duration: 160,
                yoyo: true,
                ease: "Back.Out",
              });
            },
          });

          const footballLabel = this.text(235, 330, "football", 28, "#17191f", 130, "center");
          footballLabel.setAlpha(0);
          this.tweens.add({ targets: footballLabel, alpha: 1, y: 318, duration: 350, delay: 160 });

          this.time.delayedCall(760, () => {
            this.audio.whoosh();
            this.tweens.add({
              targets: [footballActor.container, footballLabel],
              x: "-=250",
              alpha: 0,
              duration: 260,
              ease: "Sine.In",
            });

            const runner = this.faceCharacter(310, 355, 0.43, "body-run", "face-neutral", false);
            const runLoop = this.loopBodyFrames(runner, ["body-run", "body-run-b"], 120);
            runner.container.setAlpha(0).setX(420);
            const runLabel = this.text(82, 330, "running", 28, "#17191f", 130, "center");
            runLabel.setAlpha(0);

            this.tweens.add({
              targets: runner.container,
              x: 270,
              alpha: 1,
              duration: 420,
              ease: "Sine.Out",
            });
            this.tweens.add({ targets: runLabel, alpha: 1, y: 318, duration: 330, delay: 150 });

            const streaks = this.keep(this.add.graphics());
            streaks.lineStyle(4, 0xffffff, 0.6);
            [0, 1, 2].forEach((i) => streaks.lineBetween(210, 455 + i * 24, 330, 455 + i * 24));
            streaks.setAlpha(0);
            this.tweens.add({ targets: streaks, alpha: 1, x: -28, duration: 340, repeat: 1, yoyo: true });

            this.time.delayedCall(900, () => {
              runLoop.remove();
              this.tweens.add({
                targets: runner.container,
                x: W + 110,
                duration: 320,
                ease: "Sine.In",
              });
              this.time.delayedCall(180, () => this.slideWorldTo("cafe-bg", () => this.showCafe(), 1, 620));
            });
          });
        }

        showCafe() {
          this.stage = 4;
          this.clearScene(0xfff4e6);
          this.artBackground("cafe-bg", 0.92);
          this.ambientDots(0xffe4a9, 7, 0.16);
          this.foregroundParallax(0x4f2d1f, 0.07, 6800);
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

          this.artBackground("cafe-bg", 0.98);
          this.foregroundParallax(0x4f2d1f, 0.07, 6800);
          this.panel(18, 145, 354, 350, 0xffffff, 0.08, 24);

          const cafeActor = this.faceCharacter(-70, 292, 0.42, "body-walk-a", "face-smile", false);
          this.heroActor = cafeActor;
          cafeActor.container.setDepth(2);

          let step = false;
          const walkLoop = this.time.addEvent({
            delay: 125,
            loop: true,
            callback: () => {
              if (!cafeActor.body.active) return;
              step = !step;
              cafeActor.body.setTexture(step ? "body-walk-a" : "body-walk-b");
            },
          });
          this.tweens.add({
            targets: cafeActor.container,
            x: 205,
            duration: 780,
            ease: "Sine.Out",
            onComplete: () => {
              walkLoop.remove();
              cafeActor.body.setTexture("body-idle");
            },
          });

          const laptop = this.keep(this.add.container(192, 390).setAlpha(0).setScale(0.78).setDepth(3));
          const base = this.add.rectangle(0, 22, 86, 8, 0x2f3339).setOrigin(0.5);
          const screen = this.add.rectangle(0, -4, 78, 48, 0x1a1d24).setOrigin(0.5);
          const glow = this.add.rectangle(0, -4, 66, 36, 0x315787).setOrigin(0.5).setAlpha(0.65);
          laptop.add([base, screen, glow]);

          const coffee = this.keep(this.add.text(332, 402, "☕", { fontSize: "34px" }).setOrigin(0.5).setDepth(4));
          coffee.setInteractive({ useHandCursor: true });
          let sipping = false;
          coffee.on("pointerdown", () => {
            if (sipping) return;
            sipping = true;
            this.audio.pop();
            cafeActor.body.setTexture("body-seated-sip");
            cafeActor.head.setTexture("face-smile");
            this.tweens.add({ targets: coffee, alpha: 0.2, y: 386, duration: 160, yoyo: true, hold: 170 });
            this.tweens.add({ targets: cafeActor.container, angle: -2, duration: 180, yoyo: true });
            const note = this.text(250, 455, "probably the second one.", 12, "#5c4032", 125, "center");
            note.setAlpha(0);
            this.tweens.add({ targets: note, alpha: 1, y: 443, duration: 180, yoyo: true, hold: 650 });
            this.time.delayedCall(620, () => {
              if (cafeActor.body.active) cafeActor.body.setTexture("body-seated");
              sipping = false;
            });
          });

          let picked = false;
          seatOptions.forEach((s, i) => {
            this.button(30, 540 + i * 66, 330, 50, s.label, () => {
              if (picked) return;
              picked = true;
              this.state.seat = s.id;
              this.audio.chime();

              const targetX = s.id === "window" ? 115 : s.id === "corner" ? 286 : 205;
              const reply = s.id === "window"
                ? "Window seat. Good choice."
                : s.id === "corner"
                  ? "Quiet corner. Tớ cũng hay chọn chỗ này."
                  : "Outside? Okay, miễn là trời không quá nóng.";

              cafeActor.head.setTexture("face-smile");
              this.walkActorTo(cafeActor, targetX, 520, () => {
                cafeActor.body.setTexture("body-seated");
                cafeActor.container.y = 315;
                this.squash(cafeActor, 0.025, 120);
                this.cameraNudge(targetX < W / 2 ? -6 : 6, 0, 160);

                this.tweens.add({
                  targets: laptop,
                  alpha: 1,
                  scale: 1,
                  y: 382,
                  duration: 420,
                  ease: "Back.Out",
                });

                this.tweens.add({
                  targets: glow,
                  alpha: { from: 0.12, to: 0.72 },
                  duration: 500,
                  yoyo: true,
                  repeat: 1,
                });
              });
              this.speech(reply, 420);
              this.time.delayedCall(950, () => {
                cafeActor.head.setTexture("face-thinking");
                this.tweens.add({
                  targets: laptop,
                  scaleY: 0.12,
                  alpha: 0.45,
                  duration: 320,
                  ease: "Sine.InOut",
                });
                this.cameraNudge(0, -4, 180);
              });
              this.time.delayedCall(1420, () => this.showBook());
            }, i === 0);
          });
        }

        showBook() {
          this.stage = 5;
          this.clearScene(0xf3efff);
          this.artBackground("cafe-bg", 0.38);
          this.faceCharacter(305, 470, 0.36, "body-seated", "face-thinking", true);
          this.small(22, 26, "06 / OPEN THE BOOK");
          this.text(22, 70, "Không mở laptop thì...", 30);

          const book = this.keep(this.add.container(195, 330).setScale(0.75).setAlpha(0));
          const cover = this.add.graphics();
          cover.fillStyle(0x3a4968, 1).fillRoundedRect(-85, -115, 170, 230, 16);
          cover.lineStyle(3, 0x17191f, 1).strokeRoundedRect(-85, -115, 170, 230, 16);
          const coverTitle = this.add.text(0, -5, "WHY\nPEOPLE?", {
            fontFamily: "Georgia, serif",
            fontSize: "24px",
            fontStyle: "bold",
            color: "#fff5dc",
            align: "center",
          }).setOrigin(0.5);

          const pages = this.add.container(0, 0).setAlpha(0);
          const left = this.add.graphics();
          left.fillStyle(0xfffdf6, 1).fillRoundedRect(-155, -120, 150, 240, 16);
          left.lineStyle(2, 0x17191f, 1).strokeRoundedRect(-155, -120, 150, 240, 16);
          const right = this.add.graphics();
          right.fillStyle(0xfffdf6, 1).fillRoundedRect(5, -120, 150, 240, 16);
          right.lineStyle(2, 0x17191f, 1).strokeRoundedRect(5, -120, 150, 240, 16);
          const q = this.add.text(0, 0, "Why do people\nbecome who\nthey are?", {
            fontFamily: "Georgia, serif", fontSize: "22px", color: "#17191f", align: "center",
          }).setOrigin(0.5);
          pages.add([left, right, q]);
          book.add([pages, cover, coverTitle]);

          this.tweens.add({
            targets: book,
            scale: 1,
            alpha: 1,
            y: 320,
            duration: 560,
            ease: "Back.Out",
          });

          this.button(58, 535, 274, 58, "OPEN IT", () => {
            this.audio.whoosh();
            this.cameraNudge(0, -6, 170);
            this.tweens.add({
              targets: cover,
              scaleX: 0.04,
              x: -150,
              angle: -8,
              alpha: 0,
              duration: 360,
              ease: "Sine.InOut",
            });
            this.tweens.add({ targets: coverTitle, alpha: 0, duration: 180 });
            this.tweens.add({
              targets: pages,
              alpha: 1,
              scaleX: { from: 0.55, to: 1 },
              duration: 420,
              ease: "Back.Out",
            });

            const pageFlip = this.add.rectangle(6, 0, 148, 230, 0xfffdf6).setOrigin(0, 0.5);
            pages.add(pageFlip);
            this.tweens.add({
              targets: pageFlip,
              scaleX: 0.02,
              x: -4,
              duration: 430,
              delay: 240,
              ease: "Sine.InOut",
              onComplete: () => pageFlip.destroy(),
            });

            const topics = [
              { value: "future", x: 64, y: 188 },
              { value: "family", x: 305, y: 198 },
              { value: "fear", x: 54, y: 430 },
              { value: "love", x: 326, y: 440 },
              { value: "career", x: 195, y: 166 },
            ].map((item, i) => {
              const topic = this.keep(this.add.text(195, 330, item.value, {
                fontFamily: "Arial",
                fontSize: "15px",
                fontStyle: "bold",
                color: i % 2 ? "#f08d83" : "#4b7fc8",
                backgroundColor: "#fffdf5",
                padding: { x: 10, y: 6 },
              }).setOrigin(0.5).setAlpha(0).setScale(0.55).setDepth(8));

              this.tweens.add({
                targets: topic,
                x: item.x,
                y: item.y,
                alpha: 1,
                scale: 1,
                duration: 520,
                delay: 360 + i * 70,
                ease: "Back.Out",
              });
              return topic;
            });

            this.tweens.add({
              targets: this.cameras.main,
              zoom: 1.055,
              duration: 760,
              ease: "Sine.InOut",
            });

            this.time.delayedCall(1120, () => this.showDeepTalk());
          });
        }

        showDeepTalk() {
          this.stage = 6;
          this.clearScene(0x17181d);
          this.artBackground("cafe-bg", 0.32);
          this.ambientDots(0xffd9a8, 10, 0.12);
          const shade = this.keep(this.add.rectangle(W / 2, H / 2, W, H, 0x101116, 0.72));
          shade.setDepth(-0.5);
          this.small(22, 26, "07 / ASK ME ONE", "#ffffff");
          const talkActor = this.faceCharacter(195, 130, 0.65, "body-talk", "face-thinking", false);
          this.heroActor = talkActor;
          this.loopBodyFrames(talkActor, ["body-talk", "body-talk-alt"], 620);
          this.tweens.add({
            targets: talkActor.container,
            y: 126,
            duration: 1700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });
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
          this.artBackground("cafe-bg", 0.32);
          const answerShade = this.keep(this.add.rectangle(W / 2, H / 2, W, H, 0x101116, 0.74));
          answerShade.setDepth(-0.5);
          this.small(22, 26, "07 / MY ANSWER", "#ffffff");
          const answerFace = id === "stupid" || id === "future" ? "face-smile" : id === "fear" ? "face-thinking" : "face-neutral";
          const answerActor = this.faceCharacter(195, 135, 0.7, "body-talk", answerFace, false);
          this.loopBodyFrames(answerActor, ["body-talk", "body-talk-alt"], 720);
          this.tweens.add({
            targets: answerActor.container,
            y: 131,
            duration: 1650,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });
          this.speech(questionAnswers[id], 300);
          this.button(58, 610, 274, 58, "Okay. Dinner?", () => this.transitionTo(() => this.showCooking()), false);
        }

        showCooking() {
          this.stage = 7;
          this.clearScene(0xfff0e1);
          this.artBackground("kitchen-bg", 0.9);
          this.ambientDots(0xffd9a8, 7, 0.12);
          this.foregroundParallax(0x5c3425, 0.07, 6200);
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
          this.artBackground("kitchen-bg", 0.98);
          this.small(22, 26, "08 / COOKING");
          const cookActor = this.faceCharacter(310, 250, 0.42, "body-cook-a", "face-smile", false);
          this.heroActor = cookActor;
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
            this.playBodySequence(
              cookActor,
              ["body-cook-a", "body-cook-b", "body-cook-a"],
              90
            );
            this.squash(cookActor, 0.03, 100);
            this.tweens.add({ targets: pan, angle: { from: -7, to: 7 }, x: { from: -8, to: 8 }, duration: 90, yoyo: true });
            if (taps >= 3) {
              pan.disableInteractive();
              cookActor.head.setTexture("face-smile");
              this.cameraNudge(0, 6, 160);

              const plates = [
                { x: 105, y: 650, emoji: "🍽️" },
                { x: 195, y: 650, emoji: "🍽️" },
                { x: 285, y: 650, emoji: "🍽️" },
              ].map((item, i) => {
                const plate = this.keep(this.add.text(item.x, item.y + 70, item.emoji, {
                  fontSize: "42px",
                }).setOrigin(0.5).setAlpha(0).setScale(0.7));

                this.tweens.add({
                  targets: plate,
                  y: item.y,
                  alpha: 1,
                  scale: 1,
                  duration: 420,
                  delay: i * 120,
                  ease: "Back.Out",
                });
                return plate;
              });

              const garnish = this.keep(this.add.text(W / 2, 605, "🥬  🍅  ✨", {
                fontSize: "28px",
              }).setOrigin(0.5).setAlpha(0));
              this.tweens.add({
                targets: garnish,
                alpha: 1,
                y: 592,
                duration: 420,
                delay: 260,
                ease: "Back.Out",
              });

              this.tweens.add({
                targets: pan,
                y: 330,
                scale: 0.78,
                alpha: 0.38,
                duration: 420,
                ease: "Sine.InOut",
              });

              this.text(W / 2, 500, "Tớ thích nấu ăn.", 28, "#17191f", 340, "center");
              this.text(W / 2, 545, "Nhưng chủ yếu là nấu cho\nnhững người mình quan tâm.", 19, "#6a4b43", 340, "center");

              this.time.delayedCall(620, () => {
                this.playBodySequence(
                  cookActor,
                  ["body-cook-a", "body-cook-b", "body-cook-a"],
                  110
                );
                plates.forEach((plate, i) => {
                  this.tweens.add({
                    targets: plate,
                    scale: 1.05,
                    duration: 150,
                    delay: i * 60,
                    yoyo: true,
                    ease: "Sine.InOut",
                  });
                });
              });

              this.button(58, 710, 274, 56, "show me the bad part", () => this.glitchTo(() => this.showFlaws()));
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
          this.artBackground("office-bg", 0.38);
          const flawShade = this.keep(this.add.rectangle(W / 2, H / 2, W, H, 0x17191f, 0.2));
          flawShade.setDepth(-0.5);
          this.small(22, 26, "09 / MUCH BETTER");
          const flawActor = this.faceCharacter(315, 120, 0.36, "body-deadpan", "face-deadpan", false);
          this.tweens.add({
            targets: flawActor.container,
            y: 126,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });
          this.text(W / 2, 75, "lol no.", 64, "#17191f", 350, "center");
          const clock = this.panel(218, 165, 150, 75, 0x17191f, 1, 16);
          this.text(235, 180, "02:17 AM", 24, "#ffd76d");
          const tabs = this.panel(22, 270, 180, 180, 0xffffff, 1, 16);
          this.small(38, 286, "tabs: 27");
          ["portfolio", "new project", "another project", "sleep earlier?"].forEach((v, i) => this.small(38, 320 + i * 28, v));
          flawTags.forEach((tag, i) => {
            const card = this.panel(32, 485 + i * 50, 326, 38, i % 2 ? 0xffe5dc : 0xe6ecff, 1, 14);
            const label = this.small(48, 498 + i * 50, tag);
            const cardTargetX = card.x;
            const labelTargetX = label.x;
            const offset = i % 2 ? 36 : -36;

            card.setAlpha(0).setX(cardTargetX + offset);
            label.setAlpha(0).setX(labelTargetX + offset);

            this.tweens.add({
              targets: card,
              x: cardTargetX,
              alpha: 1,
              duration: 360,
              delay: 120 + i * 110,
              ease: "Back.Out",
            });
            this.tweens.add({
              targets: label,
              x: labelTargetX,
              alpha: 1,
              duration: 360,
              delay: 150 + i * 110,
              ease: "Back.Out",
            });
          });
          this.text(W / 2, 705, "Better?", 22, "#17191f", 340, "center");
          this.button(92, 750, 206, 50, "Much.", () => this.transitionTo(() => this.showEnding(), 360));
        }

        showEnding() {
          this.stage = 9;
          this.clearScene(0x5d759c);
          this.artBackground("rooftop-bg", 1);
          this.ambientDots(0xffe3a0, 12, 0.18);
          this.foregroundParallax(0x11131d, 0.16, 8200);
          const endShade = this.keep(this.add.rectangle(W / 2, H / 2, W, H, 0x111529, 0.34));
          endShade.setDepth(-0.5);
          this.small(22, 26, "END / 7%", "#ffffff");
          const endActor = this.faceCharacter(326, 690, 0.34, "body-wave", "face-smile", false);
          this.tweens.add({
            targets: endActor.container,
            angle: { from: -2, to: 3 },
            duration: 260,
            yoyo: true,
            repeat: 2,
            ease: "Sine.InOut",
          });
          this.time.delayedCall(950, () => {
            if (!endActor.body.active) return;
            endActor.body.setTexture("body-seated");
            endActor.container.y += 22;
            this.tweens.add({
              targets: endActor.container,
              y: endActor.container.y - 4,
              duration: 1500,
              yoyo: true,
              repeat: -1,
              ease: "Sine.InOut",
            });
          });
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
