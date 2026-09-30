import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompatibility,
  createSession,
  defaultFilters,
  defaultProfile,
  fighters,
  filterFighters,
} from './core.js';

test('compatibility exposes a bounded score and detailed breakdown', () => {
  const fighter=fighters[0];
  const result=calculateCompatibility(fighter, defaultProfile, 25);
  assert.ok(result.score >= 45 && result.score <= 99);
  assert.ok(Array.isArray(result.breakdown));
  assert.ok(result.breakdown.length >= 7);
  assert.ok(result.breakdown.every(item => typeof item.points === 'number' && typeof item.max === 'number'));
});

test('closer weight and shared style score better than a large mismatch', () => {
  const base={
    ...fighters[0],
    style:defaultProfile.style,
    cross:defaultProfile.secondaryStyle,
    level:defaultProfile.level,
    weight:defaultProfile.weight,
    availability:[...defaultProfile.availability],
    intensity:defaultProfile.intensity,
    goal:defaultProfile.goal,
    distance:2,
    verified:true,
  };
  const mismatch={
    ...base,
    id:'mismatch',
    style:'Wrestling',
    cross:'Brazilian Jiu-Jitsu',
    level:'Advanced',
    weight:225,
    availability:['Daytime'],
    intensity:'Medium–Hard',
    goal:'Fight camp',
    distance:24,
    verified:false,
  };

  assert.ok(
    calculateCompatibility(base,defaultProfile,25).score >
    calculateCompatibility(mismatch,defaultProfile,25).score
  );
});

test('filtered fighters are sorted by compatibility descending', () => {
  const results=filterFighters(fighters,{...defaultFilters,distance:100,weightMin:0,weightMax:500},defaultProfile,[]);
  for(let i=1;i<results.length;i++){
    assert.ok(results[i-1].compatibility.score >= results[i].compatibility.score);
  }
});

test('verified-only discovery removes unverified profiles', () => {
  const results=filterFighters(
    fighters,
    {...defaultFilters,distance:100,weightMin:0,weightMax:500,verifiedOnly:true},
    defaultProfile,
    []
  );
  assert.ok(results.length > 0);
  assert.ok(results.every(fighter => fighter.verified));
});

test('excluded profiles do not appear in discovery', () => {
  const excluded=[fighters[0].id,fighters[1].id];
  const results=filterFighters(fighters,{...defaultFilters,distance:100,weightMin:0,weightMax:500},defaultProfile,excluded);
  assert.ok(results.every(fighter => !excluded.includes(fighter.id)));
});

test('new sessions start proposed with stable defaults', () => {
  const session=createSession({partner:fighters[0],type:'Drilling',date:'2026-10-10',time:'18:30',intensity:'Light',notes:'Footwork'});
  assert.equal(session.partnerId,fighters[0].id);
  assert.equal(session.partnerName,fighters[0].name);
  assert.equal(session.status,'proposed');
  assert.equal(session.type,'Drilling');
});
