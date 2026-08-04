import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "hanbot/index.html"), "utf8");
const contentSource = readFileSync(resolve(root, "hanbot/content.js"), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(contentSource, context, { filename: "content.js" });
const content = context.window.RIFTREBORN_CONTENT;

const locales = ["en-US", "pt-BR", "zh-CN", "de-DE", "tr-TR", "pl-PL"];
const championIds = ["samira", "graves", "ezreal"];
const abilityIds = ["passive", "q", "w", "e", "r", "utility"];

test("publishes only the completed Samira, Graves, and Ezreal releases", () => {
  assert.deepEqual(Object.keys(content.champions), championIds);
  assert.equal(content.champions.samira.release, "RELEASE");
  assert.equal(content.champions.graves.release, "RELEASE");
  assert.equal(content.champions.samira.controlCount, 112);
  assert.equal(content.champions.graves.controlCount, 144);
  assert.equal(content.champions.ezreal.controlCount, 121);
  assert.deepEqual(Array.from(content.abilityOrder), abilityIds);

  const publicSource = `${html}\n${contentSource}`.toLowerCase();
  for (const unpublished of ["irelia", "jinx", "pyke", "yasuo"]) {
    assert.equal(publicSource.includes(unpublished), false, `${unpublished} must not appear in the release page`);
  }
});

test("ships the six requested locales with matching translation contracts", () => {
  assert.deepEqual(Array.from(content.supportedLocales), locales);
  const referenceShape = objectShape(content.translations[content.defaultLocale]);

  for (const locale of locales) {
    assert.deepEqual(objectShape(content.translations[locale]), referenceShape, `${locale} translation keys differ`);
    for (const championId of championIds) {
      const championCopy = content.translations[locale].champions[championId];
      for (const abilityId of abilityIds) {
        assert.ok(championCopy.abilities[abilityId]?.trim(), `${locale}/${championId}/${abilityId} name is empty`);
        assert.ok(championCopy.summaries[abilityId]?.trim(), `${locale}/${championId}/${abilityId} summary is empty`);
      }
    }
  }
});

test("uses the official localized Data Dragon ability names", () => {
  const officialNames = {
    "en-US": {
      samira: ["Daredevil Impulse", "Flair", "Blade Whirl", "Wild Rush", "Inferno Trigger"],
      graves: ["New Destiny", "End of the Line", "Smoke Screen", "Quickdraw", "Collateral Damage"],
      ezreal: ["Rising Spell Force", "Mystic Shot", "Essence Flux", "Arcane Shift", "Trueshot Barrage"],
    },
    "pt-BR": {
      samira: ["Impulso Audacioso", "Talento Natural", "Voragem Afiada", "Ímpeto Indomável", "Gatilho Infernal"],
      graves: ["Nova Destino", "Fim da Linha", "Cortina de Fumaça", "Saque Rápido", "Efeito Colateral"],
      ezreal: ["Feitiço do Poder Crescente", "Disparo Místico", "Fluxo Essencial", "Translocação Arcana", "Barragem Incendiária"],
    },
    "zh-CN": {
      samira: ["悍勇本色", "交火", "锋旋", "狂飙", "炼狱扳机"],
      graves: ["新命运", "穷途末路", "烟幕弹", "快速拔枪", "终极爆弹"],
      ezreal: ["咒能高涨", "秘术射击", "精华跃动", "奥术跃迁", "精准弹幕"],
    },
    "de-DE": {
      samira: ["Draufgängerin", "Flair", "Klingenwirbel", "Ungezügelter Rausch", "Infernaler Abzug"],
      graves: ["Destiny Deluxe", "Endstation", "Nebelwand", "Schnelles Ziehen", "Kollateralschaden"],
      ezreal: ["Erhöhte Zaubermacht", "Mystischer Schuss", "Essenzflux", "Arkaner Sprung", "Energietrommelfeuer"],
    },
    "tr-TR": {
      samira: ["Deliduman", "Gösteriş", "Kılıç Girdabı", "Heyecan Dorukta", "Cehennem Tetiği"],
      graves: ["Yeni Kader", "Yolun Sonu", "Sis Perdesi", "Hızlı Tetik", "Parça Tesiri"],
      ezreal: ["Büyü Gücü Yükselişi", "Gizemli Atış", "Özüt Akışı", "Sihir Geçişi", "İsabet Dalgası"],
    },
    "pl-PL": {
      samira: ["Chojracki Impuls", "Smykałka", "Wirujące Ostrze", "Dziki Pęd", "Piekielny Spust"],
      graves: ["Nowy Los", "To Koniec!", "Zasłona Dymna", "Rozpęd", "Obrażenia Przypadkowe"],
      ezreal: ["Wzmacniająca Siła Czarów", "Mistyczny Strzał", "Strumień Esencji", "Magiczne Przejście", "Celna Salwa"],
    },
  };

  for (const locale of locales) {
    for (const championId of championIds) {
      const actual = abilityIds.slice(0, 5).map((abilityId) => content.translations[locale].champions[championId].abilities[abilityId]);
      assert.deepEqual(Array.from(actual), officialNames[locale][championId], `${locale}/${championId} official names differ`);
    }
  }
});

test("keeps Hanbot vocabulary and menu controls in English", () => {
  const structuralCopy = championIds.flatMap((championId) => abilityIds.flatMap((abilityId) => content.champions[championId].abilities[abilityId].items)).join("\n");
  for (const term of ["Combo", "Harass", "Killsteal", "Prediction", "Evade", "Flash", "Flee", "Farm", "Last Hit", "Draw", "Diagnostics"]) {
    assert.ok(structuralCopy.includes(term), `${term} is missing from the literal menu vocabulary`);
  }
});

test("resolves every local visual asset referenced by the release data", () => {
  const assets = ["./assets/meta/riftreborn-mark.svg"];
  for (const champion of Object.values(content.champions)) {
    assets.push(champion.image, champion.portrait);
    for (const ability of Object.values(champion.abilities)) {
      if (ability.icon) assets.push(ability.icon);
    }
  }

  for (const asset of assets) {
    assert.ok(existsSync(resolve(root, "hanbot", asset)), `missing asset: ${asset}`);
  }
});

test("covers every i18n key used by the HTML", () => {
  const keys = new Set([
    ...Array.from(html.matchAll(/data-i18n="([^"]+)"/g), (match) => match[1]),
    ...Array.from(html.matchAll(/data-i18n-aria="([^"]+)"/g), (match) => match[1]),
  ]);

  for (const locale of locales) {
    for (const key of keys) {
      assert.equal(typeof content.translations[locale][key], "string", `${locale} is missing ${key}`);
    }
  }
});

const aioRoot = process.env.RIFTREBORN_AIO_ROOT;
const aioRef = process.env.RIFTREBORN_AIO_REF || "HEAD";
test("matches the validated AIO ref and public control counts", { skip: !aioRoot }, () => {
  const expectedLabels = {
    samira: ["Q Flash", "Fast S", "Insanity S", "Block Evade Skillshots", "Require Evade-safe Endpoint", "Attack Hard CC Targets", "Enable Killsteal"],
    graves: ["Flash Combo", "Reverse E + R", "Quick Q during E Dash", "Terrain Policy", "Require Return Hit near Wall", "Anti-Flash", "Enable Finish Routes"],
    ezreal: ["Auto Q", "Q without Collision", "Wait for W Mark", "Calculate Epic Monster Collision", "Anti-Skillshot", "Steal Epic Monsters", "Keep Passive with Q"],
  };

  for (const championId of championIds) {
    const champion = content.champions[championId];
    const source = execFileSync("git", ["-C", aioRoot, "show", `${aioRef}:${champion.menuSource}`], { encoding: "utf8" });
    const dynamicControls = championId === "ezreal" ? Array.from(source.matchAll(/root\.q\.enemies:boolean\(/g)).length : 0;
    const count = Array.from(source.matchAll(/:(boolean|slider|dropdown|keybind|color)\(/g)).length - dynamicControls;
    assert.equal(count, champion.controlCount, `${championId} control count differs from the menu`);
    for (const label of expectedLabels[championId]) assert.ok(source.includes(`"${label}"`), `${championId} menu is missing ${label}`);
  }
});

function objectShape(value) {
  if (Array.isArray(value)) return value.map(objectShape);
  if (!value || typeof value !== "object") return typeof value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, objectShape(value[key])]));
}
