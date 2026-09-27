import { roomSync } from "./room-sync.js";

const CHAPTER = {
  id: "matthew.5",
  work: "Bible",
  book: "Matthew",
  chapter: 5,
  edition: {
    id: "engwebp",
    name: "World English Bible — Protestant Edition",
    rights: "Public Domain",
    source: "https://ebible.org/engwebp/MAT05.htm"
  },
  verses: [
    [1, "Seeing the multitudes, he went up onto the mountain. When he had sat down, his disciples came to him."],
    [2, "He opened his mouth and taught them, saying,"],
    [3, "“Blessed are the poor in spirit, for theirs is the Kingdom of Heaven."],
    [4, "Blessed are those who mourn, for they shall be comforted."],
    [5, "Blessed are the gentle, for they shall inherit the earth."],
    [6, "Blessed are those who hunger and thirst for righteousness, for they shall be filled."],
    [7, "Blessed are the merciful, for they shall obtain mercy."],
    [8, "Blessed are the pure in heart, for they shall see God."],
    [9, "Blessed are the peacemakers, for they shall be called children of God."],
    [10, "Blessed are those who have been persecuted for righteousness’ sake, for theirs is the Kingdom of Heaven."],
    [11, "“Blessed are you when people reproach you, persecute you, and say all kinds of evil against you falsely, for my sake."],
    [12, "Rejoice, and be exceedingly glad, for great is your reward in heaven. For that is how they persecuted the prophets who were before you."],
    [13, "“You are the salt of the earth, but if the salt has lost its flavor, with what will it be salted? It is then good for nothing, but to be cast out and trodden under the feet of men."],
    [14, "“You are the light of the world. A city located on a hill can’t be hidden."],
    [15, "Neither do you light a lamp and put it under a measuring basket, but on a stand; and it shines to all who are in the house."],
    [16, "Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven."],
    [17, "“Don’t think that I came to destroy the law or the prophets. I didn’t come to destroy, but to fulfill."],
    [18, "For most certainly, I tell you, until heaven and earth pass away, not even one smallest letter or one tiny pen stroke shall in any way pass away from the law, until all things are accomplished."],
    [19, "Therefore, whoever shall break one of these least commandments and teach others to do so, shall be called least in the Kingdom of Heaven; but whoever shall do and teach them shall be called great in the Kingdom of Heaven."],
    [20, "For I tell you that unless your righteousness exceeds that of the scribes and Pharisees, there is no way you will enter into the Kingdom of Heaven."],
    [21, "“You have heard that it was said to the ancient ones, ‘You shall not murder;’ and ‘Whoever murders will be in danger of the judgment.’"],
    [22, "But I tell you that everyone who is angry with his brother without a cause will be in danger of the judgment. Whoever says to his brother, ‘Raca!’ will be in danger of the council. Whoever says, ‘You fool!’ will be in danger of the fire of Gehenna."],
    [23, "“If therefore you are offering your gift at the altar, and there remember that your brother has anything against you,"],
    [24, "leave your gift there before the altar, and go your way. First be reconciled to your brother, and then come and offer your gift."],
    [25, "Agree with your adversary quickly while you are with him on the way; lest perhaps the prosecutor deliver you to the judge, and the judge deliver you to the officer, and you be cast into prison."],
    [26, "Most certainly I tell you, you shall by no means get out of there until you have paid the last penny."],
    [27, "“You have heard that it was said, ‘You shall not commit adultery;’"],
    [28, "but I tell you that everyone who gazes at a woman to lust after her has committed adultery with her already in his heart."],
    [29, "If your right eye causes you to stumble, pluck it out and throw it away from you. For it is more profitable for you that one of your members should perish than for your whole body to be cast into Gehenna."],
    [30, "If your right hand causes you to stumble, cut it off, and throw it away from you. For it is more profitable for you that one of your members should perish, than for your whole body to be cast into Gehenna."],
    [31, "“It was also said, ‘Whoever shall put away his wife, let him give her a writing of divorce,’"],
    [32, "but I tell you that whoever puts away his wife, except for the cause of sexual immorality, makes her an adulteress; and whoever marries her when she is put away commits adultery."],
    [33, "“Again you have heard that it was said to the ancient ones, ‘You shall not make false vows, but shall perform to the Lord your vows,’"],
    [34, "but I tell you, don’t swear at all: neither by heaven, for it is the throne of God;"],
    [35, "nor by the earth, for it is the footstool of his feet; nor by Jerusalem, for it is the city of the great King."],
    [36, "Neither shall you swear by your head, for you can’t make one hair white or black."],
    [37, "But let your ‘Yes’ be ‘Yes’ and your ‘No’ be ‘No.’ Whatever is more than these is of the evil one."],
    [38, "“You have heard that it was said, ‘An eye for an eye, and a tooth for a tooth.’"],
    [39, "But I tell you, don’t resist him who is evil; but whoever strikes you on your right cheek, turn to him the other also."],
    [40, "If anyone sues you to take away your coat, let him have your cloak also."],
    [41, "Whoever compels you to go one mile, go with him two."],
    [42, "Give to him who asks you, and don’t turn away him who desires to borrow from you."],
    [43, "“You have heard that it was said, ‘You shall love your neighbor and hate your enemy.’"],
    [44, "But I tell you, love your enemies, bless those who curse you, do good to those who hate you, and pray for those who mistreat you and persecute you,"],
    [45, "that you may be children of your Father who is in heaven. For he makes his sun to rise on the evil and the good, and sends rain on the just and the unjust."],
    [46, "For if you love those who love you, what reward do you have? Don’t even the tax collectors do the same?"],
    [47, "If you only greet your friends, what more do you do than others? Don’t even the tax collectors do the same?"],
    [48, "Therefore you shall be perfect, just as your Father in heaven is perfect."]
  ]
};

const DB_NAME = "witness-local-v1";
const STORE = "recordings";
const state = {
  readerA: localStorage.getItem("witness.readerA") || "Lu",
  readerB: localStorage.getItem("witness.readerB") || "Paula",
  deviceReader: localStorage.getItem("witness.deviceReader") || "A",
  records: [],
  recorder: null,
  recordingVerse: null,
  stream: null,
  chapterAbort: 0
};

const $ = (id) => document.getElementById(id);
const versesEl = $("verses");
const statusEl = $("status");

function status(message) {
  statusEl.textContent = message || "";
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "recording_id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbAll() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result.filter(r => r.chapter_id === CHAPTER.id));
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(record) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function assignedReader(verse) {
  const slot = verse % 2 === 1 ? "A" : "B";
  const localName = slot === "A" ? state.readerA : state.readerB;
  return { slot, name: roomSync.nameForSlot(slot) || localName };
}

function allRecords() {
  const merged = new Map();
  for (const record of roomSync.state.recordings || []) merged.set(record.recording_id, record);
  for (const record of state.records) merged.set(record.recording_id, record);
  return [...merged.values()];
}

function latestForVerse(verse) {
  return allRecords()
    .filter(r => r.verse === verse)
    .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0] || null;
}

function takesForVerse(verse) {
  return allRecords().filter(r => r.verse === verse).length;
}

async function audioUrl(record) {
  const blob = await roomSync.audioBlob(record);
  return URL.createObjectURL(blob);
}

function safeName(value) {
  return String(value || "reader").trim().replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase() || "reader";
}

function chooseMime() {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return options.find(type => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) || "";
}

async function sha256(blob) {
  const data = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function refresh() {
  state.records = await dbAll();
  render();
}

function renderRoomPanel() {
  const connected = Boolean(roomSync.state.roomId && roomSync.currentMember());
  const badge = $("roomBadge");
  const members = $("roomMembers");
  const hint = $("roomHint");
  const roomCode = $("roomCode");

  badge.textContent = connected ? "shared · live" : "local only";
  badge.classList.toggle("live", connected);

  if (connected) {
    const names = roomSync.state.members
      .filter(member => member.reader_slot === "A" || member.reader_slot === "B")
      .map(member => member.display_name + " · Voice " + member.reader_slot);
    members.textContent = names.length ? names.join(" / ") : "Shared room connected.";
    hint.textContent = "Local receipt first · private audio sync · realtime chapter assembly.";
    roomCode.value = roomSync.state.roomId;
    $("createRoom").hidden = true;
    $("joinRoom").hidden = true;
    roomCode.hidden = true;
    $("copyRoomLink").hidden = false;
    $("deviceReader").disabled = true;
  } else {
    members.textContent = roomSync.state.joinCandidate
      ? "Room link detected. Choose your voice and join."
      : "No shared room yet.";
    roomCode.hidden = false;
    if (roomSync.state.joinCandidate && !roomCode.value) roomCode.value = roomSync.state.joinCandidate;
    $("createRoom").hidden = false;
    $("joinRoom").hidden = false;
    $("copyRoomLink").hidden = true;
    $("deviceReader").disabled = false;

    if (roomSync.state.error) {
      hint.textContent = "Cloud unavailable: " + roomSync.state.error + " Local recording still works.";
    } else if (roomSync.state.authReady) {
      hint.textContent = "Cloud identity ready. Start a room or join one; no email account is required.";
    } else {
      hint.textContent = "Recordings are always kept locally first. Shared-room identity is initializing.";
    }
  }
}

async function markSynced(results) {
  if (!results?.length) return;
  for (const result of results) {
    const record = state.records.find(item => item.recording_id === result.recording_id);
    if (!record) continue;
    record.synced_room_id = roomSync.state.roomId;
    record.storage_path = result.storage_path;
    record.sync_state = "synced";
    await dbPut(record);
  }
  await refresh();
}

async function syncLocalRecord(record) {
  if (!roomSync.state.roomId) return;
  try {
    const result = await roomSync.syncRecord(record);
    if (!result?.synced) return;
    record.synced_room_id = roomSync.state.roomId;
    record.storage_path = result.storagePath;
    record.sync_state = "synced";
    await dbPut(record);
    await refresh();
    status("Witnessed locally + shared to room: Matthew 5:" + record.verse + ".");
  } catch (error) {
    record.sync_state = "pending";
    await dbPut(record);
    await refresh();
    status("Witnessed locally. Shared-room sync is pending: " + error.message);
  }
}

async function syncPendingLocal() {
  if (!roomSync.state.roomId) return;
  const results = await roomSync.syncPending(state.records);
  await markSynced(results);
}

async function createSharedRoom() {
  try {
    const slot = state.deviceReader;
    const displayName = slot === "A" ? state.readerA : state.readerB;
    status("Opening shared Matthew 5 room…");
    await roomSync.createRoom({
      title: "Matthew 5 — " + state.readerA + " + " + state.readerB,
      displayName,
      readerSlot: slot,
      passageId: CHAPTER.id,
      editionId: CHAPTER.edition.id
    });
    await syncPendingLocal();
    render();
    status("Shared room is live. Copy the room link and send it to the other reader.");
  } catch (error) {
    status("Could not start shared room: " + error.message);
  }
}

async function joinSharedRoom() {
  try {
    const slot = state.deviceReader;
    const displayName = slot === "A" ? state.readerA : state.readerB;
    status("Joining shared room…");
    await roomSync.joinRoom({
      roomId: $("roomCode").value,
      displayName,
      readerSlot: slot
    });
    await syncPendingLocal();
    render();
    status("Joined. Your witnessed verses will now sync automatically.");
  } catch (error) {
    status("Could not join room: " + error.message);
  }
}

async function copyRoomLink() {
  try {
    await roomSync.copyShareUrl();
    status("Room link copied.");
  } catch (error) {
    status("Could not copy room link: " + error.message);
  }
}

function nextMine() {
  const activeSlot = roomSync.currentSlot() || state.deviceReader;
  const next = CHAPTER.verses.find(([verse]) => assignedReader(verse).slot === activeSlot && !latestForVerse(verse));
  if (!next) {
    status("Your assigned verses are all witnessed.");
    return;
  }
  const row = versesEl.querySelector('[data-verse="' + next[0] + '"]');
  versesEl.querySelectorAll(".is-next").forEach(el => el.classList.remove("is-next"));
  row?.classList.add("is-next");
  row?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function render() {
  const cloudA = roomSync.nameForSlot("A");
  const cloudB = roomSync.nameForSlot("B");
  $("readerA").value = cloudA || state.readerA;
  $("readerB").value = cloudB || state.readerB;
  $("readerA").disabled = Boolean(cloudA);
  $("readerB").disabled = Boolean(cloudB);
  $("deviceReader").value = roomSync.currentSlot() || state.deviceReader;
  renderRoomPanel();

  versesEl.innerHTML = "";
  let complete = 0;
  const activeSlot = roomSync.currentSlot() || state.deviceReader;

  for (const [verse, text] of CHAPTER.verses) {
    const assigned = assignedReader(verse);
    const latest = latestForVerse(verse);
    if (latest) complete += 1;

    const row = document.createElement("article");
    row.className = "verse" + (assigned.slot === activeSlot ? " assigned-here" : "");
    row.dataset.verse = verse;

    const top = document.createElement("div");
    top.className = "verse-top";

    const number = document.createElement("span");
    number.className = "verse-number";
    number.textContent = "Matthew 5:" + verse;

    const who = document.createElement("span");
    who.className = "assignee";
    who.textContent = assigned.name;

    top.append(number, who);

    const p = document.createElement("p");
    p.className = "verse-text";
    p.textContent = text;

    const actions = document.createElement("div");
    actions.className = "verse-actions";

    const record = document.createElement("button");
    record.className = "record";
    record.textContent = state.recordingVerse === verse ? "Stop & keep take" : latest ? "Record another take" : "Record verse";
    record.disabled = assigned.slot !== activeSlot || (state.recordingVerse !== null && state.recordingVerse !== verse);
    if (state.recordingVerse === verse) record.classList.add("recording");
    record.addEventListener("click", () => toggleRecording(verse));

    const play = document.createElement("button");
    play.textContent = "Play";
    play.disabled = !latest || state.recordingVerse !== null;
    play.addEventListener("click", () => playRecord(latest));

    const download = document.createElement("button");
    download.textContent = "Download";
    download.disabled = !latest || state.recordingVerse !== null;
    download.addEventListener("click", () => downloadRecord(latest));

    const takeState = document.createElement("span");
    takeState.className = "take-state";
    takeState.textContent = latest
      ? takesForVerse(verse) + " take" + (takesForVerse(verse) === 1 ? "" : "s") + " · newest by " + latest.reader_name
      : "unwitnessed";

    actions.append(record, play, download, takeState);
    row.append(top, p, actions);
    versesEl.append(row);
  }

  $("progress").textContent = complete + " / " + CHAPTER.verses.length + " witnessed";
}

async function toggleRecording(verse) {
  if (state.recordingVerse === verse && state.recorder) {
    state.recorder.stop();
    return;
  }
  if (state.recordingVerse !== null) return;

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    status("This browser does not expose microphone recording. Try current Chrome, Firefox, or Safari over HTTPS.");
    return;
  }

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = chooseMime();
    const chunks = [];
    const options = mimeType ? { mimeType, audioBitsPerSecond: 64000 } : { audioBitsPerSecond: 64000 };
    const recorder = new MediaRecorder(state.stream, options);
    state.recorder = recorder;
    state.recordingVerse = verse;

    recorder.ondataavailable = event => {
      if (event.data && event.data.size) chunks.push(event.data);
    };

    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
        const assigned = assignedReader(verse);
        const now = new Date().toISOString();
        const recordingId = "wit-" + CHAPTER.id.replace(".", "-") + "-v" + String(verse).padStart(3, "0") + "-" + crypto.randomUUID();
        const record = {
          recording_id: recordingId,
          chapter_id: CHAPTER.id,
          verse,
          passage_start: "matthew.5." + verse,
          text_edition_id: CHAPTER.edition.id,
          reader_slot: assigned.slot,
          reader_name: assigned.name,
          identity_mode: "pseudonymous",
          recorded_at: now,
          submitted_at: now,
          recording_license: roomSync.state.roomId ? "contributor-permission-room-001" : "contributor-permission-local-prototype",
          media_type: blob.type,
          sha256: await sha256(blob),
          audio_blob: blob,
          sync_state: roomSync.state.roomId ? "pending" : "local",
          relations: []
        };
        await dbPut(record);
        void syncLocalRecord(record);
        status("Witnessed Matthew 5:" + verse + " — " + assigned.name + ". Local receipt saved.");
      } finally {
        state.stream?.getTracks().forEach(track => track.stop());
        state.stream = null;
        state.recorder = null;
        state.recordingVerse = null;
        await refresh();
      }
    };

    recorder.start();
    status("Recording Matthew 5:" + verse + " for " + assignedReader(verse).name + "…");
    render();
  } catch (error) {
    state.stream?.getTracks().forEach(track => track.stop());
    state.stream = null;
    state.recorder = null;
    state.recordingVerse = null;
    status("Microphone error: " + error.message);
    render();
  }
}

async function playRecord(record) {
  if (!record) return;
  try {
    const url = await audioUrl(record);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch (error) {
    status("Playback error: " + error.message);
  }
}

async function downloadRecord(record) {
  if (!record) return;
  try {
    const extension = record.media_type.includes("ogg") ? "ogg" : record.media_type.includes("mp4") ? "m4a" : "webm";
    const a = document.createElement("a");
    const url = await audioUrl(record);
    a.href = url;
    a.download = "matthew-5-v" + String(record.verse).padStart(2, "0") + "__" + safeName(record.reader_name) + "__" + record.recording_id.slice(-8) + "." + extension;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    status("Download error: " + error.message);
  }
}

async function playChapter() {
  const token = ++state.chapterAbort;
  const missing = [];
  const queue = [];
  for (const [verse] of CHAPTER.verses) {
    const rec = latestForVerse(verse);
    if (rec) queue.push(rec);
    else missing.push(verse);
  }
  if (!queue.length) {
    status("No recorded verses yet.");
    return;
  }
  status(missing.length ? "Playing assembled chapter; missing verses: " + missing.join(", ") : "Playing complete Matthew 5.");
  for (const record of queue) {
    if (token !== state.chapterAbort) return;
    await playAndWait(record, token);
  }
  if (token === state.chapterAbort) status("Chapter playback finished.");
}

async function playAndWait(record, token) {
  const url = await audioUrl(record);
  return new Promise(resolve => {
    const audio = new Audio(url);
    const done = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);

    const watcher = setInterval(() => {
      if (token !== state.chapterAbort) {
        clearInterval(watcher);
        audio.pause();
        done();
      }
      if (audio.ended) clearInterval(watcher);
    }, 150);
  });
}

function stopChapter() {
  state.chapterAbort += 1;
  status("Chapter playback stopped.");
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function exportPackage() {
  const records = state.records;
  if (!records.length) {
    status("Nothing to export yet.");
    return;
  }

  status("Packing " + records.length + " witnessed take" + (records.length === 1 ? "" : "s") + "…");
  const exported = [];
  for (const record of records) {
    const bytes = new Uint8Array(await record.audio_blob.arrayBuffer());
    const { audio_blob, ...meta } = record;
    exported.push({ ...meta, audio_base64: bytesToBase64(bytes) });
  }

  const pkg = {
    witness_format: "witness-package",
    version: 1,
    exported_at: new Date().toISOString(),
    chapter: {
      id: CHAPTER.id,
      work: CHAPTER.work,
      book: CHAPTER.book,
      chapter: CHAPTER.chapter,
      text_edition: CHAPTER.edition
    },
    session: {
      strategy: "alternating-verses",
      reader_a: state.readerA,
      reader_b: state.readerB,
      odd_verses: "A",
      even_verses: "B"
    },
    recordings: exported
  };

  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "WITNESS__matthew-5__" + safeName(state.readerA) + "-" + safeName(state.readerB) + "__" + new Date().toISOString().slice(0,10) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status("WITNESS package exported. Send that one file to your partner.");
}

async function importPackage(file) {
  if (!file) return;
  try {
    const pkg = JSON.parse(await file.text());
    if (pkg.witness_format !== "witness-package" || pkg.version !== 1) throw new Error("Not a WITNESS package v1.");
    if (pkg.chapter?.id !== CHAPTER.id) throw new Error("This prototype only accepts Matthew 5 packages.");

    let imported = 0;
    const existing = new Set(state.records.map(r => r.recording_id));

    for (const record of pkg.recordings || []) {
      if (existing.has(record.recording_id)) continue;
      const bytes = base64ToBytes(record.audio_base64);
      const blob = new Blob([bytes], { type: record.media_type || "audio/webm" });
      const { audio_base64, ...meta } = record;
      const digest = await sha256(blob);
      if (meta.sha256 && digest !== meta.sha256) throw new Error("Checksum mismatch for " + meta.recording_id + ".");
      await dbPut({ ...meta, audio_blob: blob, sha256: digest });
      imported += 1;
    }

    await refresh();
    status("Imported " + imported + " new witnessed take" + (imported === 1 ? "" : "s") + ". The chapter now has " + new Set(state.records.map(r => r.verse)).size + " witnessed verses.");
  } catch (error) {
    status("Import failed: " + error.message);
  } finally {
    $("importPackage").value = "";
  }
}

function persistReaders() {
  state.readerA = $("readerA").value.trim() || "Voice A";
  state.readerB = $("readerB").value.trim() || "Voice B";
  state.deviceReader = $("deviceReader").value;
  localStorage.setItem("witness.readerA", state.readerA);
  localStorage.setItem("witness.readerB", state.readerB);
  localStorage.setItem("witness.deviceReader", state.deviceReader);
  render();
}

$("readerA").addEventListener("change", persistReaders);
$("readerB").addEventListener("change", persistReaders);
$("deviceReader").addEventListener("change", persistReaders);
$("createRoom").addEventListener("click", createSharedRoom);
$("joinRoom").addEventListener("click", joinSharedRoom);
$("copyRoomLink").addEventListener("click", copyRoomLink);
$("nextMine").addEventListener("click", nextMine);
$("playChapter").addEventListener("click", playChapter);
$("stopChapter").addEventListener("click", stopChapter);
$("exportPackage").addEventListener("click", exportPackage);
$("importPackage").addEventListener("change", event => importPackage(event.target.files?.[0]));

async function boot() {
  try {
    await refresh();
    await roomSync.initialize(() => render());
    if (roomSync.state.roomId) await syncPendingLocal();
    render();
  } catch (error) {
    status("Startup error: " + error.message);
  }
}

boot();
