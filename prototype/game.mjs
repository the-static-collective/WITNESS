/**
 * WITNESS / FREEPLAY-001 — a voluntary, evidence-derived exploration layer.
 *
 * Nothing here assigns Scripture, ranks spirituality, edits a recording or
 * awards a Full Measure Deed. Game "glimmers" are transient illustrations of
 * explored passage addresses, not exchangeable currency or personal worth.
 */
export const GAME_ID = "witness.freeplay.v1";

const SHA256 = /^[a-f0-9]{64}$/i;
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export function normalizeRecordings(input, { chapterId = "matthew.5", totalVerses = 48 } = {}) {
  const unique = new Map();
  for (const rec of Array.isArray(input) ? input : []) {
    if (!rec || typeof rec.recording_id !== "string" || !rec.recording_id.trim()) continue;
    const verse = Number(rec.verse);
    if (!Number.isInteger(verse) || verse < 1 || verse > totalVerses) continue;
    if (rec.chapter_id && rec.chapter_id !== chapterId) continue;
    if (rec.passage_start && rec.passage_start !== chapterId + "." + verse) continue;
    if (!SHA256.test(rec.sha256 || "")) continue;
    // First occurrence wins by immutable recording ID. More imports don't mean more acts.
    if (unique.has(rec.recording_id)) continue;
    unique.set(rec.recording_id, {
      recordingId: rec.recording_id,
      verse,
      passage: chapterId + "." + verse,
      edition: String(rec.text_edition_id || ""),
      sha256: rec.sha256.toLowerCase(),
      slot: rec.reader_slot === "A" || rec.reader_slot === "B" ? rec.reader_slot : "unknown",
      readerLabel: String(rec.reader_name || "Unattributed voice").slice(0, 80),
      identityRef: typeof rec.reader_user_id === "string" ? rec.reader_user_id : null,
      recordedAt: String(rec.recorded_at || ""),
      local: Boolean(rec.audio_blob),
      rightsDeclaration: String(rec.recording_license || "")
    });
  }
  return [...unique.values()];
}

export function summarizeWitnessGame(input, listens = [], options = {}) {
  const totalVerses = options.totalVerses ?? 48;
  const chapterId = options.chapterId ?? "matthew.5";
  const slot = options.slot === "A" || options.slot === "B" ? options.slot : null;
  const takes = normalizeRecordings(input, { chapterId, totalVerses });
  const byPassage = new Map();
  for (const take of takes) {
    if (!byPassage.has(take.verse)) byPassage.set(take.verse, []);
    byPassage.get(take.verse).push(take);
  }
  const coveredVerses = [...byPassage.keys()].sort((a, b) => a - b);
  const openVerses = Array.from({ length: totalVerses }, (_, i) => i + 1)
    .filter(n => !byPassage.has(n));
  const voiceKey = take => take.identityRef ? "id:" + take.identityRef : "slot:" + take.slot + ":" + take.readerLabel;
  const voices = new Map();
  for (const take of takes) {
    const key = voiceKey(take);
    if (!voices.has(key)) voices.set(key, {
      label: take.readerLabel, slot: take.slot, passages: new Set(), takes: 0
    });
    voices.get(key).passages.add(take.verse);
    voices.get(key).takes += 1;
  }
  const participants = [...voices.values()]
    .map(voice => ({ label: voice.label, slot: voice.slot, passages: voice.passages.size, takes: voice.takes }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const voicePassages = slot === null ? 0
    : new Set(takes.filter(take => take.slot === slot).map(take => take.verse)).size;

  let longestPath = 0, path = 0;
  for (let i = 1; i <= totalVerses; i++) {
    if (byPassage.has(i)) { path++; longestPath = Math.max(path, longestPath); }
    else path = 0;
  }
  // This is deliberately not an ordinal leaderboard. It is a coverage map.
  let changedVoiceEdges = 0;
  for (let i = 1; i < totalVerses; i++) {
    const left = byPassage.get(i), right = byPassage.get(i + 1);
    if (!left || !right) continue;
    // A listener could choose one take on either address to create a cross-voice seam.
    if (left.some(a => right.some(b => voiceKey(a) !== voiceKey(b)))) changedVoiceEdges++;
  }

  const available = new Map(takes.map(take => [take.recordingId, take]));
  const heard = new Set();
  for (const event of Array.isArray(listens) ? listens : []) {
    if (!event || typeof event.recordingId !== "string") continue;
    const known = available.get(event.recordingId);
    if (!known || event.sha256 !== known.sha256) continue;
    heard.add(known.recordingId);
  }

  const hasTwoVoices = voices.size >= 2;
  const badges = [
    { id: "first-voice", title: "First Voice", detail: "One recorded passage joined the archive", achieved: takes.length > 0 },
    { id: "open-three", title: "Three Open Doors", detail: "Three distinct passages have a voice", achieved: coveredVerses.length >= 3 },
    { id: "two-voices", title: "Two Voices, One Walk", detail: "More than one reader contributes to the chapter", achieved: hasTwoVoices },
    { id: "return", title: "A Second Witness", detail: "A passage carries more than one independent take", achieved: takes.length > coveredVerses.length },
    { id: "listen", title: "Listening Post", detail: "Playback finished for three distinct recorded takes on this device", achieved: heard.size >= 3 },
    { id: "woven-eight", title: "Living Thread", detail: "Eight neighboring passage addresses are recorded", achieved: longestPath >= 8 },
    { id: "whole-chapter", title: "A Complete Chapter", detail: "Every passage address in this chapter has a take", achieved: coveredVerses.length === totalVerses }
  ];

  // Glimmers are one-time per chapter address or locally completed playbacks.
  // Repeated takes remain welcome but cannot be farmed for unlimited points.
  const glimmers = coveredVerses.length * 5 + Math.min(heard.size, 12) * 3 +
    (hasTwoVoices ? 15 : 0) + (coveredVerses.length === totalVerses ? 30 : 0);
  return {
    chapterId,
    totalVerses,
    totalTakes: takes.length,
    coveredVerses,
    openVerses,
    coverage: coveredVerses.length,
    abundance: takes.length - coveredVerses.length,
    longestPath,
    changedVoiceEdges,
    voices: participants,
    voicePassages,
    locallyPlayed: heard.size,
    badges,
    glimmers,
    hasTwoVoices,
    complete: coveredVerses.length === totalVerses,
    takes
  };
}

/** Suggestions are invitations, never assigned, reserved or enforced. */
export function suggestOpenDoor(summary, position = 0) {
  if (!summary || !Array.isArray(summary.openVerses) || !summary.openVerses.length) return null;
  return summary.openVerses[Math.abs(Math.trunc(position)) % summary.openVerses.length];
}

export function suggestUnheardVoice(summary, listens = []) {
  const heard = new Set((Array.isArray(listens) ? listens : []).map(item => item?.recordingId));
  return (summary?.takes || []).find(take => !heard.has(take.recordingId)) || null;
}

/** Single-device playback completion, not a claim that a human understood audio. */
export function makePlaybackReceipt(take, at = new Date().toISOString()) {
  if (!take || typeof take.recording_id !== "string" || !SHA256.test(take.sha256 || "")) return null;
  return { recordingId: take.recording_id, sha256: take.sha256.toLowerCase(), completedAt: at };
}

export function addPlaybackReceipt(old, item, limit = 2000) {
  const list = Array.isArray(old) ? old.filter(e => e && typeof e.recordingId === "string") : [];
  if (!item || list.some(e => e.recordingId === item.recordingId && e.sha256 === item.sha256)) return list;
  return [...list, item].slice(-limit);
}

/**
 * Portable, non-authenticating overview for a reader to bring to PACT or
 * Full Measure as a review candidate; no audio or raw biblical text.
 * Source recordings remain authoritative only in WITNESS.
 */
export function makeGameReviewPacket(summary, { roomId = null, edition = "engwebp" } = {}) {
  return {
    schema: "static-collective.witness-freeplay-review.v1",
    source: { project: "WITNESS", game: GAME_ID, chapter: summary.chapterId, roomId, edition },
    progress: {
      coveredAddresses: summary.coveredVerses,
      takeCount: summary.totalTakes,
      localPlaybackCompletions: summary.locallyPlayed,
      voiceLabels: summary.voices.map(v => v.label),
      mosaicEdges: summary.changedVoiceEdges,
      badges: summary.badges.filter(b => b.achieved).map(b => b.id)
    },
    sample: summary.takes.slice(0, 120).map(take => ({
      recordingId: take.recordingId, passage: take.passage, edition: take.edition,
      sha256: take.sha256, declaredReader: take.readerLabel, declaredRights: take.rightsDeclaration
    })),
    bounds: {
      notIdentityProof: true, notSpiritualMerit: true, notVerifiedHumanListening: true,
      noAudioIncluded: true, noAutomaticFullMeasureAwards: true
    },
    awards: { Deeds: 0, Harvests: 0, Capacity: 0 },
    status: "REVIEW_ONLY_UNVERIFIED"
  };
}
