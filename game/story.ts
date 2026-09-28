export type Impression = "quiet" | "work" | "talk";
export type SeatChoice = "window" | "corner" | "outside";
export type QuestionChoice = "future" | "fear" | "changed" | "stupid";

export type GameState = {
  impression?: Impression;
  badmintonHit?: boolean;
  seat?: SeatChoice;
  question?: QuestionChoice;
  orderedFood?: boolean;
};

export const impressionOptions = [
  { id: "quiet" as const, label: "quiet guy" },
  { id: "work" as const, label: "probably works too much" },
  { id: "talk" as const, label: "looks like he talks a lot" },
];

export const workRamble = [
  "Tớ làm phần mềm.",
  "Mostly backend. API, database...",
  "Rồi queue, retry, transaction...",
  "Docker, WebSocket, scale...",
  "...à.",
  "Tớ đang giải thích backend cho một người vừa mới gặp.",
];

export const seatOptions = [
  { id: "window" as const, label: "window seat" },
  { id: "corner" as const, label: "quiet corner" },
  { id: "outside" as const, label: "outside" },
];

export const questionOptions = [
  { id: "future" as const, label: "Where do you want to be in 5 years?" },
  { id: "fear" as const, label: "What are you afraid of?" },
  { id: "changed" as const, label: "What changed you the most?" },
  { id: "stupid" as const, label: "Tell me something stupid." },
];

export const questionAnswers: Record<QuestionChoice, string> = {
  future: "Tớ muốn giỏi hơn bây giờ, làm được thứ có ích, và vẫn còn thời gian cho những người mình quan tâm.",
  fear: "Có lẽ là để công việc nuốt hết phần còn lại của cuộc sống mà mình không nhận ra.",
  changed: "Những lần làm sai rồi phải tự sửa. Nghe hơi cliché, nhưng đúng thật.",
  stupid: "Tớ từng mất hàng giờ chỉ để làm một animation mà hầu như chẳng ai để ý. Website này cũng có vài cái như vậy.",
};

export const flawTags = [
  "overthinks sometimes",
  "starts too many things",
  "sleeps later than he should",
  "occasionally disappears into work",
];
