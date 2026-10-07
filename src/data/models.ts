import type { Field, ModelDef, NumberFieldDef, Option, SegmentedField, SelectField, SliderField } from "@/types/model";

const slider = (name: string, label: string, min: number, max: number, step: number, def: number,
  o: Partial<Pick<SliderField, "unit" | "format" | "help" | "log" | "invalid">> = {}): SliderField => ({ type: "slider", name, label, min, max, step, default: def, ...o });
const number = (name: string, label: string, min: number, max: number, def: number, invalid?: string, unit?: string): NumberFieldDef =>
  ({ type: "number", name, label, min, max, step: 1, default: def, invalid, unit });
const segmented = (name: string, label: string, options: Option[], def: number | string, help?: string): SegmentedField => ({ type: "segmented", name, label, options, default: def, help });
const select = (name: string, label: string, options: string[] | Option[], def: string): SelectField =>
  ({ type: "select", name, label, default: def, options: options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)) });

const battery = (): SliderField => slider("battery", "Phone battery", 0, 100, 1, 34, { unit: "%", invalid: "Unless you've discovered a 900% battery, try again." });
const clock = (name = "hour", label = "What time is it?", def = 23.5): SliderField => slider(name, label, 0, 24, 0.25, def, { format: "clock" });
const APPS = ["Instagram", "WhatsApp", "YouTube", "Chrome", "Gmail", "Spotify", "Maps", "Notes"];
const DAYS: Option[] = [["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"], ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"]].map(([value, label]) => ({ value, label }));
const YES_NO: Option[] = [{ value: 1, label: "Yes" }, { value: 0, label: "No" }];

const fields: Record<string, Field[]> = {
  "study-vs-instagram": [
    clock(), battery(),
    slider("sleep", "Hours slept last night", 0, 14, 0.5, 5.5, { unit: "h" }),
    slider("deadline_hours", "Upcoming deadline in", 1, 720, 1, 48, { format: "hours", log: true }),
    segmented("phone_distance", "Where is your phone?", [{ value: 0, label: "In my hand" }, { value: 1, label: "Within reach" }, { value: 2, label: "Across the room" }, { value: 3, label: "Another room" }], 0),
    segmented("mood", "Current mental state", [{ value: 0, label: "Exhausted", emoji: "😵" }, { value: 1, label: "Existing", emoji: "😐" }, { value: 2, label: "Functional", emoji: "🙂" }, { value: 3, label: "Suspiciously productive", emoji: "🔥" }], 1),
    number("tabs", "Tabs open", 0, 60, 14, "Unless you've found a way to keep 400 tabs open, try 0 to 60."),
    select("last_activity", "Last thing you did", [{ value: "studying", label: "Studied (briefly)" }, { value: "scrolling", label: "Scrolled" }, { value: "watching", label: "Watched something" }, { value: "eating", label: "Ate" }, { value: "chatting", label: "Chatted" }, { value: "nothing", label: "Stared at a wall" }], "scrolling"),
  ],
  maggi: [
    slider("masala", "Masala packets", 0, 4, 0.5, 1.5), slider("chilli_tsp", "Extra chilli", 0, 6, 0.25, 1.5, { unit: " tsp" }),
    slider("water_ml", "Water", 100, 500, 10, 280, { unit: " ml" }), slider("cook_min", "Cooking time", 1, 10, 0.5, 4, { unit: " min" }),
    slider("hunger", "Hunger level", 0, 10, 1, 7, { help: "0 is full, 10 is ready to eat the packet" }),
  ],
  nap: [
    clock("hour", "What time is it?", 15), slider("sleep_last", "Sleep last night", 0, 12, 0.5, 5, { unit: "h" }),
    segmented("bed_comfort", "Bed comfort", [{ value: 1, label: "Floor" }, { value: 2, label: "Firm" }, { value: 3, label: "Fine" }, { value: 4, label: "Soft" }, { value: 5, label: "Cloud" }], 4),
    slider("temp_c", "Room temperature", 10, 45, 1, 31, { unit: " °C" }), select("day", "Day of the week", DAYS, "sun"),
    number("prev_naps", "Naps already taken this week", 0, 5, 2, "Even you can't have taken more than 5 naps. Try 0 to 5."),
    slider("workload", "Academic workload", 0, 10, 1, 7), battery(),
  ],
  "next-app": [
    select("prev1", "Most recent app", APPS, "Instagram"), select("prev2", "The one before that", APPS, "WhatsApp"), select("prev3", "And before that", APPS, "Instagram"),
    clock(), slider("session_min", "Session length", 0, 240, 5, 35, { format: "minutes" }), battery(),
    number("notifications", "Pending notifications", 0, 40, 9, "Pending notifications: 0 to 40. Beyond that, it's a lifestyle."),
    segmented("weekend", "Day type", [{ value: 0, label: "Weekday" }, { value: 1, label: "Weekend" }], 0),
    number("opens_today", "Times you've opened your phone today", 0, 150, 50, "Stay within 0 to 150 phone opens."),
    select("activity", "What are you doing?", [{ value: "studying", label: "Studying" }, { value: "working", label: "Working" }, { value: "relaxing", label: "Relaxing" }, { value: "commuting", label: "Commuting" }, { value: "eating", label: "Eating" }, { value: "bored", label: "Bored" }], "bored"),
  ],
  "bathroom-phone": [
    slider("typical_minutes", "Usual time in there", 1, 40, 1, 12, { unit: " min" }), segmented("phone_in_hand", "Phone in hand right now?", YES_NO, 1),
    slider("boredom", "Boredom level", 0, 10, 1, 7), number("yt_notifications", "Unwatched YouTube notifications", 0, 30, 6, "Between 0 and 30 notifications, please."),
    battery(), clock("hour", "What time is it?", 22),
  ],
  "programmer-debug": [
    segmented("severity", "Bug severity", [{ value: 1, label: "Cosmetic" }, { value: 2, label: "Annoying" }, { value: 3, label: "Serious" }, { value: 4, label: "Blocking" }, { value: 5, label: "Prod is down" }], 3),
    slider("error_len", "Error message length", 10, 800, 10, 240, { unit: " chars" }), slider("minutes", "Time already spent debugging", 0, 600, 5, 90, { format: "minutes" }),
    number("so_tabs", "Stack Overflow tabs open", 0, 30, 6, "That's not a tab count, that's a cry for help. Try 0 to 30."),
    number("coffee", "Cups of coffee", 0, 8, 3, "Between 0 and 8 cups. We care about you."), slider("sleep", "Sleep last night", 0, 12, 0.5, 5, { unit: "h" }),
    slider("experience", "Years of experience", 0, 15, 0.5, 2, { unit: " yrs" }),
  ],
  reply: [
    slider("minutes_since", "Time since you sent it", 1, 1440, 1, 180, { format: "minutes", log: true }), slider("avg_reply_min", "Her usual reply time", 1, 720, 1, 30, { format: "minutes", log: true }),
    slider("msg_len", "Message length", 1, 400, 1, 90, { unit: " chars" }), number("emojis", "Emojis in the message", 0, 8, 2, "0 to 8 emojis. Even you have limits."),
    segmented("seen", "Status", [{ value: 1, label: "Seen" }, { value: 0, label: "Delivered only" }], 1), clock("hour", "Time of day", 23),
    segmented("day_type", "Day", [{ value: "weekday", label: "Weekday" }, { value: "weekend", label: "Weekend" }], "weekday"),
  ],
  excuse: [
    slider("hours_left", "Hours until the deadline", 1, 168, 1, 10, { format: "hours", log: true }), slider("sleep", "Sleep last night", 0, 12, 0.5, 5, { unit: "h" }),
    select("weather", "Weather", [{ value: "sunny", label: "Sunny" }, { value: "rainy", label: "Rainy" }, { value: "stormy", label: "Stormy" }, { value: "hot", label: "Unbearably hot" }, { value: "cold", label: "Cold" }], "sunny"),
    slider("motivation", "Motivation", 0, 10, 1, 3), number("unfinished", "Unfinished tasks", 0, 15, 6, "0 to 15 unfinished tasks. Past that, pick a different tab."),
    segmented("strictness", "Teacher strictness", [{ value: 1, label: "Lenient" }, { value: 2, label: "Fair" }, { value: 3, label: "Firm" }, { value: 4, label: "Strict" }, { value: 5, label: "Terrifying" }], 3),
  ],
};

const def = (index: number, id: string, name: string, short: string, category: string, outputType: ModelDef["outputType"], primaryHead: string, disclaimer?: string): ModelDef =>
  ({ id, index, name, short, category, outputType, primaryHead, fields: fields[id], disclaimer });

export const MODELS: ModelDef[] = [
  def(1, "study-vs-instagram", "Will I study or open Instagram?", "A predictive model for the timeless battle between productivity and scrolling.", "Productivity", "binary-classification", "study"),
  def(2, "maggi", "Will this Maggi become too spicy?", "Machine learning finally answers the question nobody asked.", "Food", "classification + regression", "spice"),
  def(3, "nap", "If I lie down for 5 minutes, will I wake up?", "An advanced system for predicting the consequences of \"I'll just rest for five minutes.\"", "Sleep", "classification + regression", "wake"),
  def(4, "next-app", "Which app will I open next?", "Predicting the next digital destination of a chronically distracted human.", "Digital habits", "multiclass-classification", "next"),
  def(5, "bathroom-phone", "Will I take my phone to the bathroom?", "A classifier designed to answer one of humanity's most avoidable questions.", "Daily life", "binary-classification", "phone"),
  def(6, "programmer-debug", "Will this programmer fix the bug or restart the server?", "Predicting the oldest debugging strategy known to mankind.", "Engineering", "multiclass-classification", "strategy"),
  def(7, "reply", "Will she reply or am I cooked?", "An intentionally experimental model attempting to predict reply behavior.", "Relationships", "classification + regression", "reply",
    "This model is for entertainment. Human behavior is unpredictable, especially after \"seen\"."),
  def(8, "excuse", "What excuse will I make tomorrow?", "Machine learning meets academic procrastination.", "Academia", "multiclass-classification", "excuse"),
];

export const getModel = (id: string) => MODELS.find((m) => m.id === id);
