import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeRecordings, summarizeWitnessGame, suggestOpenDoor, suggestUnheardVoice,
  makePlaybackReceipt, addPlaybackReceipt, makeGameReviewPacket
} from "./game.mjs";

const sha = "a".repeat(64);
function take(verse, opts = {}) {
  return {
    recording_id: opts.id || "witness-" + verse + "-" + (opts.slot || "A"),
    chapter_id: "matthew.5",
    passage_start: "matthew.5." + verse,
    verse, reader_slot: opts.slot || "A", reader_name: opts.name || (opts.slot === "B" ? "Paula" : "Lu"),
    text_edition_id: "engwebp", sha256: sha, recorded_at: "2026-11-21T12:00:00Z",
    recording_license: "contributor-permission-local-prototype",
    ...opts
  };
}
const summarise = (takes, plays = []) => summarizeWitnessGame(takes, plays, {slot:"A"});

test("empty archive invites participation without fictitious points", () => {
  const g = summarise([]);
  assert.equal(g.coverage,0);assert.equal(g.glimmers,0);assert.equal(g.totalTakes,0);
  assert.equal(g.openVerses.length,48);assert.equal(suggestOpenDoor(g,0),1);
  assert.equal(g.badges.filter(b=>b.achieved).length,0);
});

test("unique recording IDs are not double-counted on sync/import merge", () => {
  const g=summarise([take(1),take(1),take(2)]);
  assert.equal(g.coverage,2);assert.equal(g.totalTakes,2);assert.equal(g.abundance,0);
  assert.equal(g.glimmers,10);
});

test("free return to the same verse increases abundance but not farmable glimmers", () => {
  const first=take(10),second=take(10,{id:"another-audio-take"});
  const g=summarise([first,second]);
  assert.equal(g.coverage,1);assert.equal(g.totalTakes,2);assert.equal(g.abundance,1);
  assert.equal(g.glimmers,5);
  assert.ok(g.badges.find(b=>b.id==="return").achieved);
});

test("different reader labels create cooperative mosaic without scoring spirituality", () => {
  const g=summarise([take(1),take(2,{slot:"B",name:"Paula"}),take(3)]);
  assert.equal(g.voices.length,2);assert.equal(g.changedVoiceEdges,2);
  assert.equal(g.voicePassages,2);
  assert.equal(g.glimmers,3*5+15);
  assert.ok(g.badges.find(b=>b.id==="two-voices").achieved);
});

test("audio playback is only counted with a matching locally known audio hash", () => {
  const recording=take(3);
  const playback=makePlaybackReceipt(recording,"2026-11-21T10:00:00Z");
  const once=addPlaybackReceipt([],playback);
  assert.equal(addPlaybackReceipt(once,playback).length,1);
  assert.equal(summarise([recording],once).locallyPlayed,1);
  assert.equal(summarise([recording],[{...playback,sha256:"b".repeat(64)}]).locallyPlayed,0);
});

test("wrong chapter addresses, missing hashes, and out of-range verses are rejected", () => {
  const r=[take(1),take(49),take(2,{chapter_id:"matthew.6"}),take(3,{sha256:"wrong"})];
  assert.equal(normalizeRecordings(r).length,1);
});

test("longest continuous run and opening suggestions are deterministic", () => {
  const g=summarise([take(2),take(3),take(4),take(7),take(8)]);
  assert.equal(g.longestPath,3);assert.equal(suggestOpenDoor(g,0),1);
  assert.equal(suggestOpenDoor(g,1),5);
  assert.equal(suggestUnheardVoice(g).recordingId,"witness-2-A");
});

test("48 covered addresses unlocks chapter assembly but not a canonical truth claim", () => {
  const all=Array.from({length:48},(_,index)=>take(index+1,{slot:index%2?"B":"A",name:index%2?"Paula":"Lu"}));
  const g=summarise(all);
  assert.equal(g.coverage,48);assert.equal(g.complete,true);assert.equal(g.openVerses.length,0);
  assert.ok(g.badges.find(b=>b.id==="whole-chapter").achieved);
  assert.equal(suggestOpenDoor(g),null);
  const packet=makeGameReviewPacket(g,{edition:"engwebp",roomId:null});
  assert.equal(packet.schema,"static-collective.witness-freeplay-review.v1");
  assert.equal(packet.source.roomId,null);
  assert.deepEqual(packet.awards,{Deeds:0,Harvests:0,Capacity:0});
  assert.equal(packet.bounds.noAudioIncluded,true);
  assert.equal("audio_base64" in packet,false);
});

test("one recording is a bounded source record, not proof of reader identity",()=>{
  const g=summarise([take(1),take(2,{slot:"A",name:"Lu"})]);
  const p=makeGameReviewPacket(g);
  assert.equal(p.bounds.notIdentityProof,true);
  assert.equal(p.bounds.notSpiritualMerit,true);
  assert.equal(p.bounds.notVerifiedHumanListening,true);
});
