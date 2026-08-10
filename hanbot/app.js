(function () {
  "use strict";

  const content = window.RIFTPLUS_CONTENT;

  if (!content) {
    throw new Error("RiftPlus content failed to load.");
  }

  const predictionCases = {
    accepted: {
      verdict: "accepted",
      status: "CAST FIRED",
      eventFrame: 11,
      eventType: "cast",
      zone: { from: 10, to: 14, color: "#d6b45b", label: "CAST WINDOW" },
      window: [75, 76, 78, 79, 81, 83, 85, 87, 89, 91, 92, 93, 93, 93, 92, 91, 90, 89, 88, 87, 86],
      vel: [320, 318, 314, 309, 303, 296, 290, 285, 281, 278, 276, 275, 275, 276, 278, 281, 285, 290, 296, 303, 311],
      samples: [76, 75, 79, 78, 82, 82, 84, 88, 88, 90, 93, 91, 94, 92, 93, 90, 91, 88, 89, 86, 87],
      stats: { hitchance: "93%", gate: "PASSED", trace: "STABLE" },
      casts: [
        { time: "14:02", spell: "Samira Q · 042", verdict: "HIT" },
        { time: "13:58", spell: "Samira Q · 041", verdict: "HIT" },
        { time: "13:51", spell: "Samira Q · 040", verdict: "HIT" },
      ],
    },
    rejected: {
      verdict: "rejected",
      status: "CAST BLOCKED",
      eventFrame: 11,
      eventType: "block",
      zone: { from: 9, to: 13, color: "#d9514e", label: "GATE BREACH" },
      window: [75, 76, 74, 71, 68, 64, 59, 55, 51, 48, 45, 42, 40, 38, 36, 35, 34, 34, 33, 32, 32],
      vel: [320, 328, 344, 368, 400, 440, 488, 544, 608, 680, 760, 848, 944, 1048, 1160, 1280, 1408, 1544, 1688, 1840, 2000],
      samples: [74, 77, 73, 72, 69, 63, 60, 54, 52, 47, 46, 41, 41, 37, 37, 34, 35, 33, 34, 31, 33],
      stats: { hitchance: "38%", gate: "BLOCKED", trace: "DEGRADED" },
      casts: [
        { time: "14:05", spell: "Samira Q · 043", verdict: "BLOCKED" },
        { time: "14:02", spell: "Samira Q · 042", verdict: "HIT" },
        { time: "13:58", spell: "Samira Q · 041", verdict: "HIT" },
      ],
    },
    trace: {
      verdict: "trace",
      status: "EVADE TRACE",
      eventFrame: 19,
      eventType: "hit",
      zone: { from: 5, to: 10, color: "#0ac8b9", label: "EVADE WINDOW" },
      window: [75, 78, 81, 85, 89, 92, 94, 93, 90, 86, 80, 73, 65, 58, 52, 47, 43, 48, 56, 63, 71],
      vel: [320, 318, 315, 312, 310, 308, 306, 315, 340, 380, 435, 505, 590, 690, 805, 935, 1080, 940, 820, 720, 640],
      samples: [77, 77, 80, 86, 88, 93, 93, 94, 89, 87, 79, 74, 64, 59, 51, 48, 42, 49, 55, 64, 70],
      stats: { hitchance: "71%", gate: "PASSED", trace: "UNSTABLE" },
      casts: [
        { time: "14:11", spell: "Samira Q · 046", verdict: "HIT" },
        { time: "14:08", spell: "Samira Q · 045", verdict: "TRACE" },
        { time: "14:05", spell: "Samira Q · 043", verdict: "BLOCKED" },
      ],
    },
  };

  const timingCases = {
    "last-hit": {
      title: "LAST HIT",
      contract: "LAST HIT / AA WINDOW",
      decision: "HIT CONFIRMED",
      next: "ATTACK RESET / 0.033 S",
      baseFrame: 184,
      ticks: 24,
      lanes: [
        {
          label: "CORE / PRE-TICK",
          bars: [
            { from: 0, to: 4, kind: "core", label: "PRE-TICK" },
            { from: 4, to: 8, kind: "active", label: "TARGET" },
            { from: 8, to: 12, kind: "confirmed", label: "GATE OPEN" },
            { from: 12, to: 24, kind: "muted", label: "READY" },
          ],
        },
        {
          label: "ORB / ATTACK",
          bars: [
            { from: 0, to: 3, kind: "muted", label: "WAIT" },
            { from: 3, to: 8, kind: "active", label: "WINDUP" },
            { from: 8, to: 10, kind: "confirmed", label: "IMPACT" },
            { from: 10, to: 16, kind: "muted", label: "RESET" },
          ],
        },
        {
          label: "FARM / MINION 03",
          bars: [
            { from: 0, to: 6, kind: "warning", label: "HP > AA" },
            { from: 6, to: 10, kind: "confirmed", label: "HP <= AA" },
            { from: 10, to: 18, kind: "muted", label: "PREDICT" },
          ],
        },
        {
          label: "DECISION / LAST HIT",
          bars: [
            { from: 0, to: 8, kind: "muted", label: "HOLD" },
            { from: 8, to: 11, kind: "confirmed", label: "ATTACK" },
            { from: 11, to: 24, kind: "muted", label: "CONFIRMED" },
          ],
        },
      ],
      events: [
        { at: 0, code: "PRE-TICK", title: "PRE-TICK", detail: "Native Last Hit mode is read before the Orbwalker processes its next order.", kind: "core" },
        { at: 6, code: "HP PRED", title: "PREDICTED HP CLEARS", detail: "Minion health is projected through attack wait time and hit travel before the gate opens.", kind: "active" },
        { at: 8, code: "AA 184", title: "HIT CONFIRMED", detail: "The attack lands inside the damage window. No early cast, no wasted reset.", kind: "confirmed" },
        { at: 12, code: "RESET", title: "NEXT WINDOW ARMED", detail: "The Orbwalker can move or issue the next order on the following aligned tick.", kind: "core" },
      ],
    },
    weave: {
      title: "PIXEL-PERFECT WEAVE",
      contract: "WEAVE / POST-ATTACK",
      decision: "Q CAST AFTER ATTACK",
      next: "MOVE GAP / 0.033 S",
      baseFrame: 212,
      ticks: 24,
      lanes: [
        {
          label: "CORE / PRIORITY",
          bars: [
            { from: 0, to: 3, kind: "core", label: "PRE-TICK" },
            { from: 3, to: 7, kind: "active", label: "PRIORITY" },
            { from: 7, to: 10, kind: "confirmed", label: "CAST GATE" },
            { from: 10, to: 24, kind: "muted", label: "NEXT" },
          ],
        },
        {
          label: "ORB / ATTACK",
          bars: [
            { from: 0, to: 6, kind: "active", label: "WINDUP PROTECTED" },
            { from: 6, to: 8, kind: "confirmed", label: "ATTACK CONFIRMED" },
            { from: 8, to: 12, kind: "muted", label: "RECOVERY" },
            { from: 12, to: 24, kind: "active", label: "NEXT ATTACK" },
          ],
        },
        {
          label: "WEAVE / SPELL",
          bars: [
            { from: 0, to: 8, kind: "muted", label: "PROTECT AA" },
            { from: 8, to: 10, kind: "confirmed", label: "AFTER ATTACK" },
            { from: 10, to: 13, kind: "active", label: "Q CAST" },
            { from: 13, to: 17, kind: "confirmed", label: "MOVE" },
          ],
        },
        {
          label: "SYNC / POSITION",
          bars: [
            { from: 0, to: 8, kind: "muted", label: "LOCK" },
            { from: 8, to: 13, kind: "confirmed", label: "WEAVE GAP" },
            { from: 13, to: 24, kind: "active", label: "REPOSITION" },
          ],
        },
      ],
      events: [
        { at: 0, code: "PRE-TICK", title: "WINDUP PROTECTED", detail: "The core refuses to interrupt a confirmed attack windup with a competing action.", kind: "core" },
        { at: 7, code: "AA 212", title: "ATTACK CONFIRMED", detail: "The post-attack route opens exactly after the attack callback, not before it.", kind: "confirmed" },
        { at: 9, code: "Q + 1", title: "WEAVE WINDOW OPEN", detail: "Q is placed in the recovery gap while the next Orbwalker order remains aligned.", kind: "active" },
        { at: 13, code: "MOVE", title: "POSITION RECOVERED", detail: "Movement resumes without stealing the next attack window.", kind: "confirmed" },
      ],
    },
    evade: {
      title: "EVADE WINDOW",
      contract: "EVADE / SAFE ENDPOINT",
      decision: "HOLD UNTIL SAFE",
      next: "THREAT END / 0.033 S",
      baseFrame: 241,
      ticks: 24,
      lanes: [
        {
          label: "CORE / PRE-TICK",
          bars: [
            { from: 0, to: 4, kind: "core", label: "PRE-TICK" },
            { from: 4, to: 8, kind: "active", label: "THREAT READ" },
            { from: 8, to: 13, kind: "confirmed", label: "SAFE CHECK" },
            { from: 13, to: 24, kind: "muted", label: "CLEAR" },
          ],
        },
        {
          label: "ORB / ACTION",
          bars: [
            { from: 0, to: 6, kind: "active", label: "ATTACK WINDUP" },
            { from: 6, to: 9, kind: "warning", label: "FINISH" },
            { from: 9, to: 14, kind: "confirmed", label: "MOVE" },
            { from: 14, to: 24, kind: "muted", label: "RE-ARM" },
          ],
        },
        {
          label: "EVADE / SKILLSHOT",
          bars: [
            { from: 0, to: 3, kind: "muted", label: "DETECTED" },
            { from: 3, to: 13, kind: "danger", label: "THREAT WINDOW" },
            { from: 7, to: 12, kind: "active", label: "HIT TIME" },
            { from: 12, to: 17, kind: "confirmed", label: "SAFE ENDPOINT" },
          ],
        },
        {
          label: "DECISION / FAIL-CLOSED",
          bars: [
            { from: 0, to: 8, kind: "danger", label: "HOLD" },
            { from: 8, to: 13, kind: "confirmed", label: "REPOSITION" },
            { from: 13, to: 24, kind: "muted", label: "CAST ALLOWED" },
          ],
        },
      ],
      events: [
        { at: 0, code: "EVADE", title: "SKILLSHOT DETECTED", detail: "The active spell enters the rail with its own start and end timing.", kind: "danger" },
        { at: 5, code: "HIT TIME", title: "ACTION HELD", detail: "The current attack can finish, but a new action is held until the endpoint is evaluated.", kind: "danger" },
        { at: 9, code: "SAFE", title: "SAFE ENDPOINT", detail: "Evade safety clears the destination, so movement can resume without guessing.", kind: "confirmed" },
        { at: 14, code: "CLEAR", title: "CAST GATE OPEN", detail: "The threat window closes and the shared core re-arms the next action.", kind: "core" },
      ],
    },
  };

  function clampHorizontalScroll() {
    if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
  }

  try {
    window.history.scrollRestoration = "manual";
  } catch (_error) {
    // Some embedded clients do not expose scroll restoration.
  }

  clampHorizontalScroll();
  window.addEventListener("scroll", clampHorizontalScroll, { passive: true });
  window.addEventListener("pageshow", clampHorizontalScroll);

  const localeAliases = {
    en: "en-US",
    "en-us": "en-US",
    pt: "pt-BR",
    "pt-br": "pt-BR",
    zh: "zh-CN",
    "zh-cn": "zh-CN",
    "zh-hans": "zh-CN",
    de: "de-DE",
    "de-de": "de-DE",
    tr: "tr-TR",
    "tr-tr": "tr-TR",
    pl: "pl-PL",
    "pl-pl": "pl-PL",
  };

  const dom = {
    language: document.querySelector("[data-language]"),
    championSelectors: Array.from(document.querySelectorAll("[data-champion-select]")),
    heroArt: Array.from(document.querySelectorAll("[data-hero-art]")),
    profileStage: document.querySelector(".champion-stage"),
    profileArt: document.querySelector("[data-profile-art]"),
    release: document.querySelector(".champion-stage__release"),
    championName: document.querySelector("[data-champion-name]"),
    championEpithet: document.querySelector("[data-champion-epithet]"),
    championRole: document.querySelector("[data-champion-role]"),
    championIntro: document.querySelector("[data-champion-intro]"),
    controlCount: document.querySelector("[data-control-count]"),
    menuSource: document.querySelector("[data-menu-source]"),
    abilityTabs: document.querySelector("[data-ability-tabs]"),
    abilityPanel: document.querySelector(".ability-detail"),
    abilityKey: document.querySelector("[data-ability-key]"),
    abilityName: document.querySelector("[data-ability-name]"),
    abilitySummary: document.querySelector("[data-ability-summary]"),
    systemList: document.querySelector("[data-system-list]"),
    communityChampion: document.querySelector("[data-community-champion]"),
    communityFeature: document.querySelector("[data-community-feature]"),
    communityFeedback: document.querySelector("[data-community-feedback]"),
    communityForm: document.querySelector("[data-community-form]"),
    communityFormMessage: document.querySelector("[data-community-form-message]"),
    communityList: document.querySelector("[data-community-list]"),
    scrollProgress: document.querySelector("[data-scroll-progress]"),
    heroRelease: document.querySelector("[data-hero-release]"),
    predictionPanel: document.querySelector("[data-prediction-panel]"),
    predictionStatus: document.querySelector("[data-case-status]"),
    predictionStats: Array.from(document.querySelectorAll("[data-stat]")),
    castLog: document.querySelector("[data-cast-log]"),
    predictionChartCanvas: document.querySelector("[data-prediction-chart]"),
    timingLab: document.querySelector("[data-timing-lab]"),
    timingCaseButtons: Array.from(document.querySelectorAll("[data-timing-case]")),
    timingPlay: document.querySelector("[data-timing-play]"),
    timingPlayIcon: document.querySelector("[data-timing-play-icon]"),
    timingPlayLabel: document.querySelector("[data-timing-play-label]"),
    timingTitle: document.querySelector("[data-timing-title]"),
    timingStatus: document.querySelector("[data-timing-status]"),
    timingTick: document.querySelector("[data-timing-tick]"),
    timingFrame: document.querySelector("[data-timing-frame]"),
    timingSync: document.querySelector("[data-timing-sync]"),
    timingRailNodes: document.querySelector("[data-timing-rail-nodes]"),
    timingContract: document.querySelector("[data-timing-contract]"),
    timingDecision: document.querySelector("[data-timing-decision]"),
    timingNext: document.querySelector("[data-timing-next]"),
    timingRuler: document.querySelector("[data-timing-ruler]"),
    timingLabels: document.querySelector("[data-timing-labels]"),
    timingTracks: document.querySelector("[data-timing-tracks]"),
    timingCursor: document.querySelector("[data-timing-cursor]"),
    timingViewport: document.querySelector("[data-timing-viewport]"),
    timingScrubber: document.querySelector("[data-timing-scrubber]"),
    timingPosition: document.querySelector("[data-timing-position]"),
    timingEventCode: document.querySelector("[data-timing-event-code]"),
    timingEvent: document.querySelector("[data-timing-event]"),
    timingEventDetail: document.querySelector("[data-timing-event-detail]"),
    menuToggle: document.querySelector("[data-menu-toggle]"),
    menuDrawer: document.querySelector(".client-drawer"),
    menuBackdrop: document.querySelector(".client-backdrop"),
  };

  const params = new URLSearchParams(window.location.search);
  const storedLocale = readStoredLocale();
  const requestedLocale = params.get("lang") || storedLocale || detectBrowserLocale();

  const state = {
    locale: normalizeLocale(requestedLocale),
    champion: content.champions[params.get("champion")] ? params.get("champion") : "samira",
    ability: content.abilityOrder.includes(params.get("ability")) ? params.get("ability") : "passive",
    transitionTimer: 0,
    scrollFrame: 0,
    community: readCommunityState(),
    predictionCase: "accepted",
    timingCase: "last-hit",
    timingTick: 0,
    timingPlaying: false,
    timingFrame: 0,
    timingElapsed: 0,
    timingLastTimestamp: 0,
  };

  let predictionChart = null;
  let predictionCaseButtons = [];
  let timingAnimationFrame = 0;

  const communitySeeds = [
    { id: "samira-q-flash-window", champion: "samira", ability: "q", copyKey: "communityProposalSamiraQ", votes: 31, threshold: 40 },
    { id: "graves-e-wall-return", champion: "graves", ability: "e", copyKey: "communityProposalGravesE", votes: 42, threshold: 55 },
    { id: "ezreal-wq-collision", champion: "ezreal", ability: "w", copyKey: "communityProposalEzrealW", votes: 38, threshold: 50 },
    { id: "samira-w-threat-filter", champion: "samira", ability: "w", copyKey: "communityProposalSamiraW", votes: 18, threshold: 30 },
    { id: "jinx-wr-lethal-sequence", champion: "jinx", ability: "r", copyKey: "communityProposalJinxQ", votes: 14, threshold: 30 },
  ];

  function readCommunityState() {
    try {
      const raw = window.localStorage.getItem("riftrebornCommunityState");
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        votes: parsed && parsed.votes && typeof parsed.votes === "object" ? parsed.votes : {},
        submissions: Array.isArray(parsed?.submissions) ? parsed.submissions.slice(-12) : [],
      };
    } catch (_error) {
      return { votes: {}, submissions: [] };
    }
  }

  function storeCommunityState() {
    try {
      window.localStorage.setItem("riftrebornCommunityState", JSON.stringify(state.community));
    } catch (_error) {
      // The board remains usable when browser storage is unavailable.
    }
  }

  function normalizeLocale(locale) {
    if (!locale) return content.defaultLocale;
    const normalized = String(locale).toLowerCase();
    return localeAliases[normalized] || localeAliases[normalized.split("-")[0]] || content.defaultLocale;
  }

  function readStoredLocale() {
    try {
      return window.localStorage.getItem("riftrebornLocale");
    } catch (_error) {
      return null;
    }
  }

  function storeLocale(locale) {
    try {
      window.localStorage.setItem("riftrebornLocale", locale);
    } catch (_error) {
      // Localization still works when storage is unavailable.
    }
  }

  function detectBrowserLocale() {
    const locales = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language];

    for (const locale of locales) {
      const normalized = normalizeLocale(locale);
      if (normalized !== content.defaultLocale || String(locale).toLowerCase().startsWith("en")) {
        return normalized;
      }
    }

    return content.defaultLocale;
  }

  function translation() {
    return content.translations[state.locale] || content.translations[content.defaultLocale];
  }

  function updateMetadata(copy) {
    document.title = copy.metaTitle;
    setMeta("meta[name='description']", copy.metaDescription);
    setMeta("meta[property='og:title']", copy.metaTitle);
    setMeta("meta[property='og:description']", copy.metaDescription);
    setMeta("meta[name='twitter:title']", copy.metaTitle);
    setMeta("meta[name='twitter:description']", copy.metaDescription);
    setMeta("meta[property='og:locale']", state.locale.replace("-", "_"));
  }

  function setMeta(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute("content", value);
  }

  function applyTranslations() {
    const copy = translation();
    document.documentElement.lang = state.locale;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = copy[element.dataset.i18n];
      if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const value = copy[element.dataset.i18nAria];
      if (typeof value === "string") element.setAttribute("aria-label", value);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const value = copy[element.dataset.i18nPlaceholder];
      if (typeof value === "string") element.setAttribute("placeholder", value);
    });

    if (dom.language) {
      dom.language.value = state.locale;
      dom.language.setAttribute("aria-label", copy.languageLabel);
    }

    updateMetadata(copy);
    renderCommunity();
  }

  function renderChampion(options) {
    const settings = options || {};
    const champion = content.champions[state.champion];
    const copy = translation().champions[state.champion];

    document.documentElement.dataset.champion = state.champion;

    dom.championSelectors.forEach((button) => {
      const selected = button.dataset.championSelect === state.champion;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));

      const label = button.querySelector("strong");
      const buttonCopy = translation().champions[button.dataset.championSelect];
      if (label && buttonCopy) label.textContent = buttonCopy.displayName;
    });

    dom.heroArt.forEach((image) => {
      image.classList.toggle("is-active", image.dataset.heroArt === state.champion);
    });

    if (settings.animate !== false && dom.profileStage) {
      window.clearTimeout(state.transitionTimer);
      dom.profileStage.classList.add("is-changing");
      state.transitionTimer = window.setTimeout(() => {
        dom.profileStage.classList.remove("is-changing");
      }, 420);
    }

    dom.profileArt.src = champion.image;
    dom.profileArt.alt = copy.alt;
    dom.release.textContent = `${champion.release} ${champion.order}`;
    dom.championName.textContent = copy.displayName;
    dom.championEpithet.textContent = copy.epithet;
    dom.championRole.textContent = champion.role;
    dom.championIntro.textContent = copy.intro;
    dom.controlCount.textContent = String(champion.controlCount);
    dom.menuSource.textContent = champion.menuSource;

    if (dom.heroRelease) {
      dom.heroRelease.textContent = `${translation().heroTimingLabel} · ${champion.release} ${champion.order} · ${copy.displayName.toUpperCase()}`;
    }

    renderAbilityTabs();
    renderAbility();
    renderCommunityFeatureOptions();
    renderCommunity();
  }

  function renderAbilityTabs() {
    const champion = content.champions[state.champion];
    const championCopy = translation().champions[state.champion];
    const fragment = document.createDocumentFragment();

    dom.abilityTabs.textContent = "";
    dom.abilityTabs.setAttribute("aria-label", translation().abilityNavigation);

    content.abilityOrder.forEach((abilityId, index) => {
      const ability = champion.abilities[abilityId];
      const selected = state.ability === abilityId;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `ability-tab${selected ? " is-active" : ""}${ability.icon ? "" : " ability-tab--utility"}`;
      button.id = `ability-tab-${state.champion}-${abilityId}`;
      button.dataset.abilitySelect = abilityId;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(selected));
      button.setAttribute("aria-controls", "ability-panel");
      button.setAttribute("aria-label", `${ability.key}: ${championCopy.abilities[abilityId]}`);
      button.tabIndex = selected ? 0 : -1;

      if (ability.icon) {
        const image = document.createElement("img");
        image.src = ability.icon;
        image.alt = "";
        image.width = 38;
        image.height = 38;
        button.appendChild(image);

        const key = document.createElement("span");
        key.textContent = ability.key;
        button.appendChild(key);
      } else {
        const key = document.createElement("span");
        key.textContent = ability.key;
        button.appendChild(key);
      }

      button.addEventListener("click", () => selectAbility(abilityId, true));
      button.addEventListener("keydown", (event) => handleAbilityKey(event, index));
      fragment.appendChild(button);
    });

    dom.abilityTabs.appendChild(fragment);
  }

  function renderAbility() {
    const champion = content.champions[state.champion];
    const championCopy = translation().champions[state.champion];
    const ability = champion.abilities[state.ability];

    dom.abilityPanel.id = "ability-panel";
    dom.abilityPanel.setAttribute("aria-labelledby", `ability-tab-${state.champion}-${state.ability}`);
    dom.abilityKey.textContent = ability.key;
    dom.abilityName.textContent = championCopy.abilities[state.ability];
    dom.abilitySummary.textContent = championCopy.summaries[state.ability];

    const fragment = document.createDocumentFragment();
    ability.items.forEach((item) => {
      const row = document.createElement("li");
      row.textContent = item;
      fragment.appendChild(row);
    });
    dom.systemList.textContent = "";
    dom.systemList.appendChild(fragment);

    updateAbilityScrollCue();
  }

  function updateAbilityScrollCue() {
    if (!dom.abilityPanel) return;
    dom.abilityPanel.classList.toggle("is-scrollable", dom.abilityPanel.scrollHeight > dom.abilityPanel.clientHeight + 8);
  }

  function renderCommunityFeatureOptions() {
    if (!dom.communityChampion || !dom.communityFeature) return;
    const championId = content.champions[dom.communityChampion.value] ? dom.communityChampion.value : "samira";
    const championCopy = translation().champions[championId];
    const selected = dom.communityFeature.value;
    dom.communityFeature.textContent = "";
    content.abilityOrder.forEach((abilityId) => {
      const option = document.createElement("option");
      option.value = abilityId;
      option.textContent = `${content.champions[championId].abilities[abilityId].key} · ${championCopy.abilities[abilityId]}`;
      dom.communityFeature.appendChild(option);
    });
    if (content.abilityOrder.includes(selected)) dom.communityFeature.value = selected;
  }

  function communityProposalCopy(proposal) {
    const champion = content.champions[proposal.champion];
    const championCopy = translation().champions[proposal.champion];
    const ability = champion.abilities[proposal.ability];
    return {
      championName: championCopy.displayName,
      featureName: championCopy.abilities[proposal.ability],
      featureKey: ability.key,
    };
  }

  function renderCommunity() {
    if (!dom.communityList) return;
    const copy = translation();
    const proposals = [...communitySeeds, ...state.community.submissions];
    dom.communityList.textContent = "";

    proposals.forEach((proposal) => {
      const labels = communityProposalCopy(proposal);
      const isSubmission = proposal.status === "review";
      const extraVote = state.community.votes[proposal.id] ? 1 : 0;
      const votes = Number(proposal.votes || 0) + extraVote;
      const threshold = Number(proposal.threshold || 30);
      const isRelease = !isSubmission && votes >= threshold;
      const card = document.createElement("article");
      card.className = "community-proposal";
      card.dataset.proposalId = proposal.id;

      const header = document.createElement("div");
      header.className = "community-proposal__header";
      const tag = document.createElement("span");
      tag.className = "community-proposal__tag";
      tag.textContent = `${labels.championName} / ${labels.featureKey}`;
      const status = document.createElement("span");
      status.className = `community-proposal__status${isRelease ? " is-release" : ""}`;
      status.textContent = isSubmission
        ? copy.communityStatusReview
        : isRelease ? copy.communityStatusRelease : copy.communityStatusVoting;
      header.append(tag, status);

      const title = document.createElement("h4");
      title.textContent = labels.featureName;
      const description = document.createElement("p");
      description.textContent = proposal.copyKey ? copy[proposal.copyKey] : proposal.description;

      const footer = document.createElement("div");
      footer.className = "community-proposal__footer";
      const meter = document.createElement("div");
      meter.className = "community-proposal__meter";
      const meterText = document.createElement("span");
      meterText.textContent = isSubmission
        ? copy.communityFormHint
        : copy.communityVotesToShip.replace("{votes}", String(votes)).replace("{threshold}", String(threshold));
      const bar = document.createElement("span");
      bar.className = "community-proposal__bar";
      const fill = document.createElement("span");
      fill.style.width = `${isSubmission ? 18 : Math.min(100, (votes / threshold) * 100)}%`;
      bar.appendChild(fill);
      meter.append(meterText, bar);
      footer.appendChild(meter);

      if (!isSubmission && !isRelease) {
        const voted = Boolean(state.community.votes[proposal.id]);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "action action--compact community-vote";
        button.dataset.communityVote = proposal.id;
        button.disabled = voted;
        button.textContent = voted ? copy.communityVoted : copy.communityVoteYes;
        footer.appendChild(button);
      } else if (isRelease) {
        const release = document.createElement("span");
        release.className = "community-proposal__release-mark";
        release.textContent = copy.communityStatusRelease;
        footer.appendChild(release);
      }

      card.append(header, title, description, footer);
      dom.communityList.appendChild(card);
    });
  }

  function submitCommunityProposal(event) {
    event.preventDefault();
    if (!dom.communityFeedback || !dom.communityChampion || !dom.communityFeature) return;
    const description = dom.communityFeedback.value.trim();
    if (!description) {
      dom.communityFormMessage.textContent = translation().communityFormEmpty;
      dom.communityFormMessage.className = "community-form__message is-error";
      dom.communityFeedback.focus();
      return;
    }

    state.community.submissions.push({
      id: `submission-${Date.now()}`,
      champion: dom.communityChampion.value,
      ability: dom.communityFeature.value,
      description,
      status: "review",
      votes: 0,
      threshold: 30,
    });
    state.community.submissions = state.community.submissions.slice(-12);
    storeCommunityState();
    dom.communityFeedback.value = "";
    dom.communityFormMessage.textContent = translation().communityFormSuccess;
    dom.communityFormMessage.className = "community-form__message is-success";
    renderCommunity();
  }

  function voteForCommunityProposal(proposalId) {
    if (!proposalId || state.community.votes[proposalId]) return;
    const proposal = communitySeeds.find((entry) => entry.id === proposalId);
    if (!proposal) return;
    state.community.votes[proposalId] = true;
    storeCommunityState();
    renderCommunity();
  }

  function selectChampion(championId, updateUrl) {
    if (!content.champions[championId] || state.champion === championId) return;
    state.champion = championId;
    state.ability = "passive";
    renderChampion({ animate: true });
    if (updateUrl) writeUrlState();
  }

  function selectAbility(abilityId, updateUrl, focus) {
    if (!content.abilityOrder.includes(abilityId)) return;
    state.ability = abilityId;
    renderAbilityTabs();
    renderAbility();
    if (focus) document.querySelector(`[data-ability-select="${abilityId}"]`)?.focus();
    if (updateUrl) writeUrlState();
  }

  function handleAbilityKey(event, currentIndex) {
    let nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % content.abilityOrder.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + content.abilityOrder.length) % content.abilityOrder.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = content.abilityOrder.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectAbility(content.abilityOrder[nextIndex], true, true);
  }

  function writeUrlState() {
    const url = new URL(window.location.href);
    url.searchParams.set("champion", state.champion);
    if (state.ability === "passive") url.searchParams.delete("ability");
    else url.searchParams.set("ability", state.ability);
    url.searchParams.set("lang", state.locale);
    window.history.replaceState({}, "", url);
  }

  function updateScrollProgress() {
    state.scrollFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (dom.scrollProgress) dom.scrollProgress.style.transform = `scaleX(${progress})`;
  }

  function requestScrollProgress() {
    if (state.scrollFrame) return;
    state.scrollFrame = window.requestAnimationFrame(updateScrollProgress);
  }

  function renderCastLog(caseData) {
    if (!dom.castLog) return;
    dom.castLog.textContent = "";
    const fragment = document.createDocumentFragment();
    caseData.casts.forEach((cast) => {
      const row = document.createElement("li");
      const time = document.createElement("span");
      time.className = "cast-log__time";
      time.textContent = cast.time;
      const spell = document.createElement("span");
      spell.className = "cast-log__spell";
      spell.textContent = cast.spell;
      const verdict = document.createElement("span");
      verdict.className = `cast-log__verdict is-${cast.verdict === "HIT" ? "hit" : cast.verdict === "BLOCKED" ? "blocked" : "trace"}`;
      verdict.textContent = cast.verdict;
      row.append(time, spell, verdict);
      fragment.appendChild(row);
    });
    dom.castLog.appendChild(fragment);
  }

  function selectPredictionCase(caseId) {
    const caseData = predictionCases[caseId];
    if (!caseData) return;
    state.predictionCase = caseId;

    if (dom.predictionPanel) dom.predictionPanel.dataset.verdict = caseData.verdict;
    if (dom.predictionStatus) dom.predictionStatus.textContent = caseData.status;

    predictionCaseButtons.forEach((button) => {
      const active = button.dataset.predictionCase === caseId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    dom.predictionStats.forEach((stat) => {
      const value = caseData.stats[stat.dataset.stat];
      if (typeof value === "string") stat.textContent = value;
    });

    renderCastLog(caseData);

    if (predictionChart) {
      predictionChart.data.datasets[0].data = caseData.window;
      predictionChart.data.datasets[3].data = caseData.vel;
      predictionChart.data.datasets[4].data = caseData.samples;
      predictionChart.data.datasets[6].data = [{ x: caseData.eventFrame, y: caseData.window[caseData.eventFrame] }];
      predictionChart.data.datasets[6].pointStyle = caseData.eventType === "block" ? "crossRot" : caseData.eventType === "cast" ? "triangle" : "rectRot";
      predictionChart.data.datasets[6].pointBackgroundColor = caseData.zone.color;
      predictionChart.options.plugins.zone = caseData.zone;
      predictionChart.update();
    }
  }

  const TIMING_TICK_MS = 33;

  function timingScenario() {
    return timingCases[state.timingCase] || timingCases["last-hit"];
  }

  function timingPercent(value, total) {
    return `${Math.max(0, Math.min(100, (value / total) * 100))}%`;
  }

  function renderTimingRuler(scenario) {
    if (!dom.timingRuler) return;
    dom.timingRuler.textContent = "";

    const label = document.createElement("span");
    label.className = "timing-ruler__label";
    label.textContent = "TICK";
    dom.timingRuler.appendChild(label);

    const track = document.createElement("div");
    track.className = "timing-ruler__track";
    for (let index = 0; index <= scenario.ticks; index += 1) {
      const mark = document.createElement("span");
      mark.className = "timing-ruler__mark";
      mark.style.left = timingPercent(index, scenario.ticks);
      mark.textContent = String(index).padStart(2, "0");
      track.appendChild(mark);
    }
    dom.timingRuler.appendChild(track);
  }

  function renderTimingRail(scenario) {
    if (!dom.timingRailNodes) return;
    dom.timingRailNodes.textContent = "";

    scenario.events.forEach((event, index) => {
      const node = document.createElement("div");
      node.className = "timing-rail__node";
      node.dataset.timingRailAt = String(event.at);
      node.dataset.timingRailKind = event.kind;

      const ring = document.createElement("i");
      ring.setAttribute("aria-hidden", "true");
      const frame = document.createElement("b");
      frame.textContent = `T${scenario.baseFrame + event.at}`;
      const label = document.createElement("span");
      label.textContent = event.code;
      node.append(ring, frame, label);
      dom.timingRailNodes.appendChild(node);

      if (index < scenario.events.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "timing-rail__arrow";
        arrow.setAttribute("aria-hidden", "true");
        dom.timingRailNodes.appendChild(arrow);
      }
    });
  }

  function renderTimingTimeline(scenario) {
    if (!dom.timingLabels || !dom.timingTracks) return;
    dom.timingLabels.textContent = "";
    dom.timingTracks.textContent = "";
    dom.timingLabels.style.setProperty("--timing-rows", scenario.lanes.length);
    dom.timingTracks.style.setProperty("--timing-rows", scenario.lanes.length);

    scenario.lanes.forEach((lane) => {
      const label = document.createElement("div");
      label.className = "timing-lane-label";
      label.textContent = lane.label;
      dom.timingLabels.appendChild(label);

      const track = document.createElement("div");
      track.className = "timing-lane-track";
      track.style.setProperty("--timing-columns", scenario.ticks);

      lane.bars.forEach((bar) => {
        const element = document.createElement("span");
        element.className = `timing-bar timing-bar--${bar.kind}`;
        element.style.left = timingPercent(bar.from, scenario.ticks);
        element.style.width = timingPercent(bar.to - bar.from, scenario.ticks);
        element.textContent = bar.label;
        element.title = bar.label;
        track.appendChild(element);
      });
      dom.timingTracks.appendChild(track);
    });

    scenario.events.forEach((event) => {
      const marker = document.createElement("span");
      marker.className = `timing-event-line timing-event-line--${event.kind}`;
      marker.style.left = timingPercent(event.at, scenario.ticks);
      marker.title = `${event.code}: ${event.title}`;
      dom.timingTracks.appendChild(marker);
    });

    if (dom.timingCursor) {
      dom.timingCursor.style.setProperty("--timing-rows", scenario.lanes.length);
      dom.timingTracks.appendChild(dom.timingCursor);
    }
  }

  function updateTimingDisplay() {
    if (!dom.timingLab) return;
    const scenario = timingScenario();
    const currentTick = Math.max(0, Math.min(scenario.ticks - 1, state.timingTick));
    const currentEvent = scenario.events.reduce((selected, event) => (
      event.at <= currentTick ? event : selected
    ), scenario.events[0]);
    const frame = scenario.baseFrame + currentTick;

    dom.timingLab.dataset.timingState = currentEvent.kind;
    if (dom.timingTitle) dom.timingTitle.textContent = scenario.title;
    if (dom.timingStatus) dom.timingStatus.textContent = state.timingPlaying ? "LIVE / ALIGNED" : "ALIGNED / READY";
    if (dom.timingTick) dom.timingTick.textContent = `${(TIMING_TICK_MS / 1000).toFixed(3)} S`;
    if (dom.timingFrame) dom.timingFrame.textContent = String(frame);
    if (dom.timingSync) dom.timingSync.textContent = "LOCKED";
    if (dom.timingContract) dom.timingContract.textContent = scenario.contract;
    if (dom.timingDecision) dom.timingDecision.textContent = currentEvent.title;
    if (dom.timingNext) dom.timingNext.textContent = scenario.next;
    dom.timingRailNodes?.querySelectorAll(".timing-rail__node").forEach((node) => {
      const eventTick = Number(node.dataset.timingRailAt);
      node.classList.toggle("is-complete", eventTick <= currentTick);
      node.classList.toggle("is-current", eventTick === currentEvent.at);
    });
    if (dom.timingCursor) {
      dom.timingCursor.style.left = timingPercent(currentTick, scenario.ticks);
      const cursorLabel = dom.timingCursor.querySelector("b");
      if (cursorLabel) cursorLabel.textContent = `T${frame}`;
    }
    if (dom.timingScrubber) {
      dom.timingScrubber.max = String(scenario.ticks - 1);
      dom.timingScrubber.value = String(currentTick);
    }
    if (dom.timingPosition) dom.timingPosition.textContent = `${String(currentTick).padStart(2, "0")} / ${String(scenario.ticks).padStart(2, "0")}`;
    if (dom.timingEventCode) dom.timingEventCode.textContent = `T${frame} / ${currentEvent.code}`;
    if (dom.timingEvent) dom.timingEvent.textContent = currentEvent.title;
    if (dom.timingEventDetail) dom.timingEventDetail.textContent = currentEvent.detail;
    if (dom.timingPlay) dom.timingPlay.setAttribute("aria-pressed", String(state.timingPlaying));
    if (dom.timingPlayIcon) dom.timingPlayIcon.textContent = state.timingPlaying ? "||" : ">";
    if (dom.timingPlayLabel) dom.timingPlayLabel.textContent = state.timingPlaying
      ? translation().timingPause
      : translation().timingPlay;
  }

  function renderTimingScenario() {
    if (!dom.timingLab) return;
    const scenario = timingScenario();
    state.timingTick = 0;
    state.timingElapsed = 0;
    dom.timingCaseButtons.forEach((button) => {
      const active = button.dataset.timingCase === state.timingCase;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderTimingRuler(scenario);
    renderTimingRail(scenario);
    renderTimingTimeline(scenario);
    updateTimingDisplay();
  }

  function selectTimingCase(caseId) {
    if (!timingCases[caseId]) return;
    state.timingCase = caseId;
    renderTimingScenario();
  }

  function setTimingTick(tick) {
    const scenario = timingScenario();
    state.timingTick = Math.max(0, Math.min(scenario.ticks - 1, Number(tick) || 0));
    state.timingElapsed = state.timingTick * TIMING_TICK_MS;
    updateTimingDisplay();
  }

  function timingPlaybackStep(timestamp) {
    if (!state.timingPlaying) return;
    if (!state.timingLastTimestamp) state.timingLastTimestamp = timestamp;
    state.timingElapsed += Math.min(100, timestamp - state.timingLastTimestamp);
    state.timingLastTimestamp = timestamp;

    const scenario = timingScenario();
    const duration = scenario.ticks * TIMING_TICK_MS;
    if (state.timingElapsed >= duration) state.timingElapsed = 0;
    const nextTick = Math.floor(state.timingElapsed / TIMING_TICK_MS);
    if (nextTick !== state.timingTick) {
      state.timingTick = nextTick;
      updateTimingDisplay();
    }
    timingAnimationFrame = window.requestAnimationFrame(timingPlaybackStep);
  }

  function toggleTimingPlayback() {
    if (!dom.timingLab) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.timingPlaying = false;
      updateTimingDisplay();
      return;
    }
    state.timingPlaying = !state.timingPlaying;
    if (state.timingPlaying) {
      const scenario = timingScenario();
      if (state.timingTick >= scenario.ticks - 1) state.timingElapsed = 0;
      state.timingLastTimestamp = 0;
      timingAnimationFrame = window.requestAnimationFrame(timingPlaybackStep);
    } else {
      window.cancelAnimationFrame(timingAnimationFrame);
      state.timingLastTimestamp = 0;
    }
    updateTimingDisplay();
  }

  function initTimingLab() {
    if (!dom.timingLab) return;
    dom.timingCaseButtons.forEach((button) => {
      button.addEventListener("click", () => selectTimingCase(button.dataset.timingCase));
    });
    dom.timingPlay?.addEventListener("click", toggleTimingPlayback);
    dom.timingScrubber?.addEventListener("input", (event) => setTimingTick(event.target.value));
    dom.timingViewport?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setTimingTick(state.timingTick + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setTimingTick(state.timingTick - 1);
      }
    });
    renderTimingScenario();
  }

  const castZonePlugin = {
    id: "castZone",
    afterDatasetsDraw(chart, _args, pluginOptions) {
      const { from, to, color, label } = pluginOptions || {};
      if (from === undefined || to === undefined || to <= from) return;
      const xScale = chart.scales.x;
      const { top, bottom } = chart.chartArea;
      const left = xScale.getPixelForValue(from);
      const right = xScale.getPixelForValue(to);
      const ctx = chart.ctx;
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = color;
      ctx.fillRect(left, top, right - left, bottom - top);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = color;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.moveTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = color;
      ctx.font = '9px "SFMono-Regular", Consolas, monospace';
      ctx.letterSpacing = "0.08em";
      ctx.textBaseline = "top";
      ctx.fillText(label, left + 6, top + 8);
      ctx.restore();
    },
  };

  function initPredictionChart() {
    const canvas = dom.predictionChartCanvas;
    if (!canvas || !window.Chart) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = predictionCases[state.predictionCase];
    const band = (value) => value + 4;

    predictionChart = new window.Chart(canvas.getContext("2d"), {
      type: "line",
      plugins: [castZonePlugin],
      data: {
        labels: initial.window.map((_value, index) => `t${index}`),
        datasets: [
          {
            label: "HIT CONFIDENCE",
            data: initial.window,
            borderColor: "rgba(214, 180, 91, 0.9)",
            backgroundColor: "rgba(214, 180, 91, 0.12)",
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHitRadius: 12,
            tension: 0.35,
            fill: "origin",
          },
          {
            label: "BAND+",
            data: initial.window.map((value) => band(value)),
            borderWidth: 0,
            pointRadius: 0,
            fill: false,
          },
          {
            label: "BAND-",
            data: initial.window.map((value) => band(value) - 8),
            borderWidth: 0,
            pointRadius: 0,
            backgroundColor: "rgba(214, 180, 91, 0.09)",
            fill: 1,
          },
          {
            label: "TARGET DRIFT",
            yAxisID: "y2",
            data: initial.vel,
            borderColor: "rgba(10, 200, 185, 0.55)",
            borderWidth: 1.2,
            borderDash: [2, 4],
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: "OBSERVATIONS",
            data: initial.samples,
            showLine: false,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            pointHitRadius: 10,
            pointBackgroundColor: "rgba(10, 200, 185, 0.8)",
          },
          {
            label: "GATE",
            data: initial.window.map(() => 42),
            borderColor: "rgba(217, 81, 78, 0.8)",
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
          },
          {
            type: "scatter",
            label: "EVENT",
            data: [{ x: initial.eventFrame, y: initial.window[initial.eventFrame] }],
            pointStyle: "triangle",
            pointBackgroundColor: initial.zone.color,
            pointBorderColor: "rgba(233, 228, 216, 0.9)",
            pointBorderWidth: 1.5,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : { duration: 650, easing: "easeOutQuart" },
        interaction: { mode: "index", intersect: false },
        plugins: {
          zone: initial.zone,
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(3, 11, 18, 0.95)",
            borderColor: "rgba(200, 155, 60, 0.4)",
            borderWidth: 1,
            titleColor: "#d6b45b",
            bodyColor: "#e9e4d8",
            displayColors: false,
            filter: (item) => item.dataset.label !== "BAND+" && item.dataset.label !== "BAND-",
            callbacks: {
              label: (item) => {
                switch (item.dataset.label) {
                  case "HIT CONFIDENCE":
                    return `hit confidence ${item.parsed.y}%`;
                  case "GATE":
                    return "gate threshold 42%";
                  case "TARGET DRIFT":
                    return `target drift ${item.parsed.y} rel.`;
                  case "OBSERVATIONS":
                    return `observation ${item.parsed.y}%`;
                  case "EVENT":
                    return "verdict point";
                  default:
                    return `${item.dataset.label} ${item.parsed.y}`;
                }
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(200, 155, 60, 0.07)" },
            ticks: {
              color: "rgba(233, 228, 216, 0.45)",
              font: { family: "SFMono-Regular, Consolas, monospace", size: 10 },
              maxTicksLimit: 8,
            },
            title: {
              display: true,
              text: "FRAME",
              color: "rgba(200, 155, 60, 0.7)",
              font: { family: "SFMono-Regular, Consolas, monospace", size: 9 },
            },
          },
          y: {
            min: 20,
            max: 100,
            grid: { color: "rgba(200, 155, 60, 0.07)" },
            ticks: {
              color: "rgba(233, 228, 216, 0.45)",
              font: { family: "SFMono-Regular, Consolas, monospace", size: 10 },
              callback: (value) => `${value}%`,
            },
            title: {
              display: true,
              text: "HIT CONFIDENCE (REL.)",
              color: "rgba(200, 155, 60, 0.7)",
              font: { family: "SFMono-Regular, Consolas, monospace", size: 9 },
            },
          },
          y2: {
            position: "right",
            min: 250,
            max: 2100,
            grid: { drawOnChartArea: false },
            afterBuildTicks: (scale) => {
              scale.ticks = [250, 500, 1000, 1500, 2000].map((value) => ({ value }));
            },
            ticks: {
              color: "rgba(10, 200, 185, 0.5)",
              font: { family: "SFMono-Regular, Consolas, monospace", size: 10 },
              callback: (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value),
            },
            title: {
              display: true,
              text: "TARGET DRIFT (REL.)",
              color: "rgba(10, 200, 185, 0.55)",
              font: { family: "SFMono-Regular, Consolas, monospace", size: 9 },
            },
          },
        },
      },
    });
  }

  function initPredictionCases() {
    if (!dom.predictionPanel) return;
    predictionCaseButtons = Array.from(document.querySelectorAll("[data-prediction-case]"));
    predictionCaseButtons.forEach((button) => {
      button.addEventListener("click", () => selectPredictionCase(button.dataset.predictionCase));
    });
    renderCastLog(predictionCases[state.predictionCase]);
    initPredictionChart();
  }

  function initMobileMenu() {
    const toggle = dom.menuToggle;
    const drawer = dom.menuDrawer;
    const backdrop = dom.menuBackdrop;
    if (!toggle || !drawer) return;

    const setMenu = (open) => {
      drawer.classList.toggle("is-open", open);
      backdrop?.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("is-menu-open", open);
      if (open) drawer.querySelector("a")?.focus();
      else toggle.focus();
    };

    toggle.addEventListener("click", () => setMenu(!drawer.classList.contains("is-open")));
    backdrop?.addEventListener("click", () => setMenu(false));
    drawer.querySelectorAll("[data-menu-link]").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) setMenu(false);
    });
  }

  function observeSections() {
    if (!("IntersectionObserver" in window)) return;
    const links = Array.from(document.querySelectorAll(".client-nav a"));
    const linkById = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle("is-active", link === linkById.get(visible.target.id)));
    }, { rootMargin: "-30% 0px -55%", threshold: [0, 0.15, 0.4] });

    linkById.forEach((_link, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  function observeReveals() {
    const targets = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-inview"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    targets.forEach((target) => observer.observe(target));
  }

  function observePredictionReveal() {
    const asset = document.querySelector(".prediction-asset");
    if (!asset) return;
    if (!("IntersectionObserver" in window)) {
      asset.classList.add("is-inview");
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          asset.classList.add("is-inview");
          observer.disconnect();
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
    observer.observe(asset);
  }

  dom.championSelectors.forEach((button) => {
    button.addEventListener("click", () => selectChampion(button.dataset.championSelect, true));
  });

  dom.communityChampion?.addEventListener("change", () => {
    renderCommunityFeatureOptions();
  });

  dom.communityForm?.addEventListener("submit", submitCommunityProposal);

  dom.communityList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-community-vote]");
    if (button) voteForCommunityProposal(button.dataset.communityVote);
  });

  if (dom.language) {
    dom.language.addEventListener("change", (event) => {
      state.locale = normalizeLocale(event.target.value);
      storeLocale(state.locale);
      applyTranslations();
      renderChampion({ animate: false });
      writeUrlState();
    });
  }

  window.addEventListener("scroll", requestScrollProgress, { passive: true });
  window.addEventListener("resize", requestScrollProgress, { passive: true });
  window.addEventListener("resize", updateAbilityScrollCue);

  applyTranslations();
  renderChampion({ animate: false });
  updateScrollProgress();
  observeSections();
  observeReveals();
  observePredictionReveal();
  initPredictionCases();
  initTimingLab();
  initMobileMenu();
})();
