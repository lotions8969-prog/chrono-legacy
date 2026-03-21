// ── Dialogue / Story data ─────────────────────────────────────────────────────

export interface DialoguePage {
  portrait : string;   // texture key (e.g. 'portrait_elder')
  name     : string;
  text     : string;
}

export interface NpcScript {
  pages: DialoguePage[];
}

export const NPC_SCRIPTS: Record<string, NpcScript> = {

  elder: {
    pages: [
      {
        portrait: 'portrait_elder',
        name    : 'Elder Gaspar',
        text    : 'The time-gates are awakening… Strange lights have been seen near the ancient ruins to the north.',
      },
      {
        portrait: 'portrait_elder',
        name    : 'Elder Gaspar',
        text    : 'Long ago, the Frozen Flame fell from the sky and fractured the flow of time itself. Our village has guarded the secret ever since.',
      },
      {
        portrait: 'portrait_elder',
        name    : 'Elder Gaspar',
        text    : 'Those creatures appearing from nowhere — they are not of this era. Be on your guard, young ones.',
      },
    ],
  },

  merchant: {
    pages: [
      {
        portrait: 'portrait_merchant',
        name    : 'Lara the Merchant',
        text    : 'Welcome to Truce Village! Have you heard? Strange monsters appeared near the lake last night!',
      },
      {
        portrait: 'portrait_merchant',
        name    : 'Lara the Merchant',
        text    : 'If you are heading into danger, rest well and keep your wits sharp. The road ahead will not be forgiving!',
      },
    ],
  },

  adventurer: {
    pages: [
      {
        portrait: 'portrait_adventurer',
        name    : 'Tomas the Wanderer',
        text    : 'Those glowing pillars near the northern forest — I\'ve seen things come through them. Things that should not exist.',
      },
      {
        portrait: 'portrait_adventurer',
        name    : 'Tomas the Wanderer',
        text    : 'I tried to investigate but the monsters were too strong. With a partner like yours… maybe you could find answers.',
      },
    ],
  },

  child: {
    pages: [
      {
        portrait: 'portrait_child',
        name    : 'Little Pip',
        text    : 'I found a shiny glowing stone near the old ruins! It made the air shimmer like a rainbow!',
      },
      {
        portrait: 'portrait_child',
        name    : 'Little Pip',
        text    : 'Mama says not to touch it… but it was sooooo pretty~!',
      },
    ],
  },

  scientist: {
    pages: [
      {
        portrait: 'portrait_scientist',
        name    : 'Dr. Melchior',
        text    : 'Fascinating! These temporal readings are beyond anything I\'ve recorded. The time-stream is destabilizing at an alarming rate!',
      },
      {
        portrait: 'portrait_scientist',
        name    : 'Dr. Melchior',
        text    : 'If my calculations are correct, the Frozen Flame — the seed of all chronological order — is about to shatter.',
      },
      {
        portrait: 'portrait_scientist',
        name    : 'Dr. Melchior',
        text    : 'Someone must travel through the gates, reach the Flame\'s resting place, and restore the balance of time. Are you… prepared for that journey?',
      },
    ],
  },

  gatekeeper: {
    pages: [
      {
        portrait: 'portrait_elder',
        name    : 'Gate Inscription',
        text    : '— Carved upon the arch —\n"Beyond lies a world not yet born and a world long since dead. Enter with courage; return with wisdom."',
      },
    ],
  },

};
