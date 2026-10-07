export type Bank = Record<string, string[]>;
export interface ModelHumor { verdict: Bank; advice: Bank }

export const pick = (list: string[], seed: number) => list[Math.abs(seed) % list.length];

export function seedOf(values: Record<string, unknown>): number {
  const s = JSON.stringify(values); let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export const HUMOR: Record<string, ModelHumor> = {
  "study-vs-instagram": {
    verdict: {
      high: ["Your productivity has left the chat.", "The notes will remain unopened. The app will not."],
      mid: ["There is still hope. Unfortunately.", "Close call. The phone has the home-field advantage."],
      low: ["Who are you and what have you done with yourself?", "Rare data point. We checked it twice."],
    },
    advice: {
      high: ["Bro, just accept it.", "Schedule the scroll. Ten minutes, then a timer."],
      mid: ["Put the phone in another room. Or don't. We'll know.", "Start with two minutes. The model has been wrong before."],
      low: ["Do not touch anything. Momentum is rare.", "Keep going. Do not check what time it is."],
    },
  },
  maggi: {
    verdict: {
      low: ["Structurally mild. Spiritually quiet.", "A responsible bowl of noodles."],
      mid: ["Your eyebrows will notice. Nothing else.", "Suspicious, but survivable."],
      high: ["That is no longer seasoning. That is a position.", "Your future self has filed a complaint."],
      extreme: ["The model recommends a witness.", "This is beyond Maggi. This is a dare."],
    },
    advice: {
      low: ["Add more chilli. You have the headroom.", "Safe. Mildly boring. Perfect."],
      mid: ["Keep the water nearby.", "Taste before you commit the second packet."],
      high: ["Keep the milk nearby.", "Cold milk. Not water. Trust the model."],
      extreme: ["Tell someone where you are.", "Call someone. Then eat."],
    },
  },
  nap: {
    verdict: {
      low: ["Congratulations, consciousness wins today.", "A disciplined nap. Suspicious, but welcome."],
      mid: ["A coin flip with pillows.", "Possible. Not promised."],
      high: ["That was never going to be five minutes.", "You'll wake up. Eventually. Somewhere near dinner."],
      extreme: ["Set an alarm. And another alarm. And maybe call a friend.", "The model has seen this before. You do not wake up."],
    },
    advice: {
      low: ["Lie down. The system believes in you.", "Fine. Go ahead."],
      mid: ["Set one alarm. Put the phone across the room.", "Sit up. Lean. Do not recline."],
      high: ["Two alarms, one of them loud.", "Maybe nap on a chair."],
      extreme: ["You are not getting up.", "Cancel your plans. Be honest with yourself."],
    },
  },
  "next-app": {
    verdict: {
      Instagram: ["Instagram. Again.", "A creature of habit. The habit is Instagram."],
      WhatsApp: ["A message you could have ignored.", "WhatsApp: because someone just typed."],
      YouTube: ["One video, then six.", "YouTube. The tab you'll close in two hours."],
      Chrome: ["Chrome: the app you open when you don't know what you want.", "A search is coming. Unclear what for."],
      Gmail: ["Gmail. Bold. Adult. Unexpected.", "The inbox beckons. It always has 300 unread."],
      Spotify: ["Spotify: the app you open to feel productive.", "Music first, work later (never)."],
      Maps: ["Maps. You're actually going somewhere.", "Directions, for once."],
      Notes: ["Notes. Improbable but welcome.", "Write something down. Anything."],
    },
    advice: {
      Instagram: ["You already know.", "Set a ten-minute limit. You won't, but set it."],
      WhatsApp: ["Reply now or never. Mostly never.", "Mute the group."],
      YouTube: ["Disable autoplay. Please.", "One video. Choose it before you open it."],
      Chrome: ["Close three tabs first.", "Write down the question before you search."],
      Gmail: ["Archive ten emails. Feel powerful.", "Unsubscribe from one thing."],
      Spotify: ["Pick the playlist first. Then stop picking.", "Instrumental only."],
      Maps: ["Safe travels.", "Leave five minutes earlier than the app says."],
      Notes: ["Keep going.", "The model is cautiously impressed."],
    },
  },
  "bathroom-phone": {
    verdict: {
      high: ["You were never going in there phone-free.", "The phone has its own reservation."],
      mid: ["It could go either way. Statistically, it won't.", "A brief hesitation, followed by the phone."],
      low: ["A rare act of restraint. Frame it.", "Unplugged. Brave."],
    },
    advice: {
      high: ["You already know the answer.", "At least wipe the screen after."],
      mid: ["Take it. Everyone does.", "Set a timer. Your legs will thank you."],
      low: ["Enjoy the silence. It will not last.", "Read the shampoo bottle. Like our ancestors."],
    },
  },
  "programmer-debug": {
    verdict: {
      fix: ["Unusual. We respect it.", "A proper fix. Someone read the stack trace."],
      restart: ["A classic. Scientifically questionable, emotionally satisfying.", "Turned off and on again. Time-tested."],
      google: ["The answer exists. Someone else already asked.", "Seventeen tabs, one accepted answer from 2014."],
      blame: ["It's definitely the dependency. Probably.", "package.json is the real culprit."],
      giveup: ["A strategic retreat. Tomorrow-you has fresh eyes.", "Closing the laptop is also a debugging step."],
    },
    advice: {
      fix: ["Write the test first. You won't, but write it.", "Commit. Push. Walk away."],
      restart: ["Have you tried restarting it?", "Restart it. Then write down why it worked."],
      google: ["Read the second answer, not just the first.", "Copy the error exactly. Not your paraphrase."],
      blame: ["Pin the version. Open the issue. Go to lunch.", "Check the changelog before the rage."],
      giveup: ["Take a walk. The bug will still be there.", "Sleep. Then fix it in ten minutes."],
    },
  },
  reply: {
    verdict: {
      alive: ["The signs are decent. Don't spoil them.", "She will probably reply. Probably."],
      uncertain: ["The model refuses to commit. Wise.", "Genuinely unclear. Go do something else."],
      concerning: ["Statistically, this is where hope dies. Briefly.", "The silence is doing numbers."],
      cooked: ["The data is... not on your side.", "You are, technically, cooked."],
    },
    advice: {
      alive: ["Do nothing. Impressive.", "Put the phone down."],
      uncertain: ["Wait two hours. Not one, two.", "Resist the follow-up."],
      concerning: ["Do not send a second message. Do not.", "Distract yourself with a hobby."],
      cooked: ["Please don't send the meme.", "Go for a walk. Hydrate."],
    },
  },
  excuse: {
    verdict: {
      github: ["Technology: the universal alibi.", "A technical difficulty, naturally."],
      internet: ["The Wi-Fi again. Poor Wi-Fi.", "The router is always the villain."],
      laptop: ["Hardware betrayal. Classic.", "The laptop picked today to give up."],
      family: ["Heavy move. Use sparingly.", "High-risk, high-reward. The model disapproves."],
      forgot: ["Honesty. Bold. Unprecedented.", "The truth. Terrifying."],
      almost: ["Everything is almost done. Always.", "Nearly there, for three days now."],
      submitted: ["Submitted. Somewhere. Perhaps.", "A confident claim with no receipts."],
      other: ["The long, creative excuse. Respect.", "A bespoke excuse. Handcrafted."],
    },
    advice: {
      github: ["Check the status page first. It adds credibility.", "Screenshot something."],
      internet: ["Have a screenshot of a speed test ready.", "Mention the router, not the ISP."],
      laptop: ["Keep the 'update in progress' screen as evidence.", "Do not reboot until you have a screenshot."],
      family: ["Please don't. Just ask for an extension.", "Use sparingly. Karma exists."],
      forgot: ["Say sorry first, then say it.", "Offer a time. Be specific."],
      almost: ["Send a draft. Even a bad one.", "Define 'almost' as 60 percent."],
      submitted: ["Check the portal before the email.", "Have the file ready, just in case."],
      other: ["Keep it under two sentences.", "Pick a single detail. Details sell."],
    },
  },
};
