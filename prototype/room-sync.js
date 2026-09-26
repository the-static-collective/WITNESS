import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm";

const SUPABASE_URL = "https://edxoiynjspjtxjauxhlz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FZSwl6w49aDzH7-UEf5zHA_OTTWFUfM";
const AUDIO_BUCKET = "witness-audio";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const cache = new Map();

function roomIdFrom(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("room");
  } catch {
    return trimmed;
  }
}

function extensionFor(mediaType = "") {
  if (mediaType.includes("ogg")) return "ogg";
  if (mediaType.includes("mp4") || mediaType.includes("m4a")) return "m4a";
  if (mediaType.includes("mpeg")) return "mp3";
  return "webm";
}

export const roomSync = {
  state: {
    authReady: false,
    userId: null,
    roomId: null,
    room: null,
    members: [],
    recordings: [],
    error: null,
    realtime: null,
    joinCandidate: null
  },

  onChange: () => {},

  async initialize(onChange = () => {}) {
    this.onChange = onChange;
    this.state.joinCandidate =
      new URL(location.href).searchParams.get("room") ||
      localStorage.getItem("witness.roomId") ||
      null;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      let session = sessionData.session;
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        session = data.session;
      }

      this.state.authReady = true;
      this.state.userId = session?.user?.id || null;

      if (this.state.joinCandidate) {
        const connected = await this.tryConnectExisting(this.state.joinCandidate);
        if (!connected) this.onChange();
      } else {
        this.onChange();
      }
    } catch (error) {
      this.state.error = error?.message || String(error);
      this.state.authReady = false;
      this.onChange();
    }
  },

  async tryConnectExisting(roomIdLike) {
    const roomId = roomIdFrom(roomIdLike);
    if (!roomId || !this.state.userId) return false;

    const { data, error } = await supabase
      .from("witness_rooms")
      .select("id,title,passage_id,edition_id,assignment_strategy,is_open,created_at")
      .eq("id", roomId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      this.state.joinCandidate = roomId;
      return false;
    }

    await this.connect(roomId);
    return true;
  },

  async createRoom({ title, displayName, readerSlot, passageId = "matthew.5", editionId = "engwebp" }) {
    if (!this.state.authReady || !this.state.userId) throw new Error("Cloud identity is not ready.");

    const { data: room, error: roomError } = await supabase
      .from("witness_rooms")
      .insert({
        title,
        work: "Bible",
        passage_id: passageId,
        edition_id: editionId,
        assignment_strategy: "alternating-verses",
        created_by: this.state.userId
      })
      .select("id,title,passage_id,edition_id,assignment_strategy,is_open,created_at")
      .single();

    if (roomError) throw roomError;

    const { error: memberError } = await supabase
      .from("witness_room_members")
      .insert({
        room_id: room.id,
        user_id: this.state.userId,
        display_name: displayName,
        reader_slot: readerSlot
      });

    if (memberError) throw memberError;

    await this.connect(room.id);
    return room;
  },

  async joinRoom({ roomId, displayName, readerSlot }) {
    const resolved = roomIdFrom(roomId);
    if (!resolved) throw new Error("Paste a room link or room UUID.");
    if (!this.state.authReady || !this.state.userId) throw new Error("Cloud identity is not ready.");

    const { error } = await supabase
      .from("witness_room_members")
      .insert({
        room_id: resolved,
        user_id: this.state.userId,
        display_name: displayName,
        reader_slot: readerSlot
      });

    if (error && error.code !== "23505") throw error;

    await this.connect(resolved);
  },

  async connect(roomId) {
    this.state.roomId = roomId;
    this.state.joinCandidate = roomId;
    localStorage.setItem("witness.roomId", roomId);

    const url = new URL(location.href);
    url.searchParams.set("room", roomId);
    history.replaceState(null, "", url);

    await this.refreshRoom();
    this.subscribe();
    this.onChange();
  },

  async refreshRoom() {
    if (!this.state.roomId) return;

    const [roomResult, membersResult, recordingsResult] = await Promise.all([
      supabase
        .from("witness_rooms")
        .select("id,title,passage_id,edition_id,assignment_strategy,is_open,created_at")
        .eq("id", this.state.roomId)
        .single(),
      supabase
        .from("witness_room_members")
        .select("room_id,user_id,display_name,reader_slot,joined_at")
        .eq("room_id", this.state.roomId)
        .order("joined_at", { ascending: true }),
      supabase
        .from("witness_recordings")
        .select("*")
        .eq("room_id", this.state.roomId)
        .order("recorded_at", { ascending: true })
    ]);

    if (roomResult.error) throw roomResult.error;
    if (membersResult.error) throw membersResult.error;
    if (recordingsResult.error) throw recordingsResult.error;

    this.state.room = roomResult.data;
    this.state.members = membersResult.data || [];
    this.state.recordings = (recordingsResult.data || []).map(record => ({
      ...record,
      chapter_id: "matthew.5",
      remote: true
    }));
    this.state.error = null;
    this.onChange();
  },

  subscribe() {
    if (!this.state.roomId) return;
    if (this.state.realtime) supabase.removeChannel(this.state.realtime);

    const filter = "room_id=eq." + this.state.roomId;
    this.state.realtime = supabase
      .channel("witness-room:" + this.state.roomId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "witness_recordings", filter },
        () => this.refreshRoom().catch(error => {
          this.state.error = error.message;
          this.onChange();
        })
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "witness_room_members", filter },
        () => this.refreshRoom().catch(error => {
          this.state.error = error.message;
          this.onChange();
        })
      )
      .subscribe();
  },

  currentMember() {
    return this.state.members.find(member => member.user_id === this.state.userId) || null;
  },

  memberForSlot(slot) {
    return this.state.members.find(member => member.reader_slot === slot) || null;
  },

  nameForSlot(slot) {
    return this.memberForSlot(slot)?.display_name || null;
  },

  currentSlot() {
    return this.currentMember()?.reader_slot || null;
  },

  shareUrl() {
    if (!this.state.roomId) return null;
    const url = new URL(location.href);
    url.search = "";
    url.searchParams.set("room", this.state.roomId);
    return url.toString();
  },

  async copyShareUrl() {
    const url = this.shareUrl();
    if (!url) throw new Error("No shared room yet.");
    await navigator.clipboard.writeText(url);
    return url;
  },

  async syncRecord(record) {
    if (!this.state.roomId || !this.state.userId) return { skipped: true };
    const member = this.currentMember();
    if (!member) return { skipped: true };
    if (record.reader_slot !== member.reader_slot) return { skipped: true };

    const existing = await supabase
      .from("witness_recordings")
      .select("id,recording_id,storage_path")
      .eq("recording_id", record.recording_id)
      .maybeSingle();

    if (existing.error) throw existing.error;
    if (existing.data) return { synced: true, storagePath: existing.data.storage_path };

    const ext = extensionFor(record.media_type);
    const storagePath =
      this.state.roomId + "/" +
      this.state.userId + "/" +
      record.recording_id + "." + ext;

    const { error: uploadError } = await supabase
      .storage
      .from(AUDIO_BUCKET)
      .upload(storagePath, record.audio_blob, {
        contentType: record.media_type,
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError && !/duplicate|already exists/i.test(uploadError.message || "")) {
      throw uploadError;
    }

    const previous = await supabase
      .from("witness_recordings")
      .select("id")
      .eq("room_id", this.state.roomId)
      .eq("verse", record.verse)
      .eq("reader_user_id", this.state.userId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (previous.error) throw previous.error;

    const { error: insertError } = await supabase
      .from("witness_recordings")
      .insert({
        recording_id: record.recording_id,
        room_id: this.state.roomId,
        passage_start: record.passage_start,
        verse: record.verse,
        text_edition_id: record.text_edition_id,
        reader_user_id: this.state.userId,
        reader_slot: member.reader_slot,
        reader_name: member.display_name,
        storage_path: storagePath,
        media_type: record.media_type,
        sha256: record.sha256,
        duration_ms: record.duration_ms ?? null,
        recorded_at: record.recorded_at,
        submitted_at: new Date().toISOString(),
        supersedes: previous.data?.id || null,
        identity_mode: record.identity_mode || "pseudonymous",
        recording_license: record.recording_license || "contributor-permission-room-001",
        relations: record.relations || [],
        provenance_note: "Captured local-first in IndexedDB; synced to WITNESS ROOM-001 after capture."
      });

    if (insertError && insertError.code !== "23505") throw insertError;

    await this.refreshRoom();
    return { synced: true, storagePath };
  },

  async syncPending(records = []) {
    const member = this.currentMember();
    if (!member) return [];
    const synced = [];

    for (const record of records) {
      if (!record.audio_blob) continue;
      if (record.reader_slot !== member.reader_slot) continue;
      if (record.synced_room_id === this.state.roomId) continue;
      try {
        const result = await this.syncRecord(record);
        if (result.synced) synced.push({ recording_id: record.recording_id, storage_path: result.storagePath });
      } catch {
        // Local receipt remains authoritative; caller can retry.
      }
    }

    return synced;
  },

  async audioBlob(record) {
    if (record.audio_blob) return record.audio_blob;
    if (!record.storage_path) throw new Error("No audio artifact is attached to this witness.");
    if (cache.has(record.storage_path)) return cache.get(record.storage_path);

    const { data, error } = await supabase
      .storage
      .from(AUDIO_BUCKET)
      .download(record.storage_path);

    if (error) throw error;
    cache.set(record.storage_path, data);
    return data;
  }
};
