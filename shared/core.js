export const styles = ['All','Boxing','Muay Thai','Kickboxing','Brazilian Jiu-Jitsu','Wrestling','MMA'];
export const levels = ['All','Beginner','Intermediate','Advanced'];
export const availabilities = ['Early mornings','Daytime','Weeknights','Weekends'];
export const sessionTypes = ['Technical sparring','Drilling','Pad work','Open mat','Wrestling rounds','Conditioning'];
export const reportReasons = ['Unsafe intensity','Disrespectful behavior','Misrepresented experience','Harassment','Spam / fake profile','Other'];

export const intensityDefinitions = {
  Technical: 'Timing, defense, positioning, and clean technique. No power exchanges.',
  Light: 'Controlled contact with an emphasis on learning and communication.',
  'Light–Medium': 'Moderate pace while keeping power and ego under control.',
  Medium: 'Competitive rounds with agreed limits and full protective gear.',
  'Medium–Hard': 'Experienced partners only. Higher pace with explicit boundaries before the round.',
  'Hard / fight camp': 'Fight-camp work only with qualified coaching/supervision and mutually agreed rules.'
};

export const gyms = [
  {id:'southside',name:'Southside Fight Lab',city:'Providence'},
  {id:'ocean-state',name:'Ocean State Muay Thai',city:'Cranston'},
  {id:'anchor',name:'Anchor Grappling',city:'Pawtucket'},
  {id:'401-mma',name:'401 MMA',city:'Warwick'},
  {id:'capital-city',name:'Capital City Boxing',city:'Johnston'},
  {id:'north-end',name:'North End Combat',city:'Lincoln'}
];

export const fighters = [
  {
    id:'maya',name:'Maya',age:27,city:'Providence',distance:2,style:'Boxing',cross:'Muay Thai',level:'Intermediate',weight:135,
    goal:'Technical sparring',availability:['Weeknights','Weekends'],intensity:'Light–Medium',gym:'Southside Fight Lab',verified:true,initials:'MA',
    stance:'Orthodox',yearsTraining:4,competition:'2 amateur bouts',roundLength:'3 min',gear:'16 oz gloves, headgear',contactLevel:'Controlled head + body',
    bio:'Fast hands, footwork rounds, and technical work. Looking for controlled rounds and good communication.'
  },
  {
    id:'dre',name:'Dre',age:31,city:'Cranston',distance:5,style:'Muay Thai',cross:'Boxing',level:'Advanced',weight:170,
    goal:'Fight camp',availability:['Early mornings','Weekends'],intensity:'Medium–Hard',gym:'Ocean State Muay Thai',verified:true,initials:'DR',
    stance:'Switch',yearsTraining:8,competition:'Active amateur',roundLength:'3–5 min',gear:'16 oz gloves, shin guards',contactLevel:'Agreed technical or camp pace',
    bio:'Active amateur. Happy to drill or spar depending on experience. Defense first, ego last.'
  },
  {
    id:'luis',name:'Luis',age:24,city:'Pawtucket',distance:6,style:'Brazilian Jiu-Jitsu',cross:'Wrestling',level:'Intermediate',weight:155,
    goal:'Open mat',availability:['Weekends','Daytime'],intensity:'Technical',gym:'Anchor Grappling',verified:true,initials:'LU',
    stance:'N/A',yearsTraining:5,competition:'Local grappling tournaments',roundLength:'5 min',gear:'No-gi / gi',contactLevel:'Technical submissions',
    bio:'Purple belt rounds, positional work, takedown entries, and no-gi on weekends.'
  },
  {
    id:'nia',name:'Nia',age:29,city:'Providence',distance:3,style:'Kickboxing',cross:'Boxing',level:'Beginner',weight:145,
    goal:'Skill building',availability:['Weeknights'],intensity:'Light',gym:'Independent',verified:false,initials:'NI',
    stance:'Orthodox',yearsTraining:1,competition:'No competition',roundLength:'2 min',gear:'16 oz gloves, shin guards',contactLevel:'Body + touch contact',
    bio:'Building confidence with controlled drills, pads, and very light sparring. Looking for patient partners.'
  },
  {
    id:'marcus',name:'Marcus',age:34,city:'Warwick',distance:10,style:'MMA',cross:'Wrestling',level:'Advanced',weight:185,
    goal:'Mixed rounds',availability:['Weekends','Early mornings'],intensity:'Medium',gym:'401 MMA',verified:true,initials:'MC',
    stance:'Southpaw',yearsTraining:10,competition:'Former amateur MMA',roundLength:'5 min',gear:'MMA gloves + striking gear',contactLevel:'Situational / agreed MMA pace',
    bio:'MMA rounds with an emphasis on transitions. Open to helping newer athletes with structured drills.'
  },
  {
    id:'sam',name:'Sam',age:26,city:'East Providence',distance:4,style:'Wrestling',cross:'Brazilian Jiu-Jitsu',level:'Intermediate',weight:165,
    goal:'Takedowns',availability:['Weeknights'],intensity:'Medium',gym:'Independent',verified:false,initials:'SA',
    stance:'N/A',yearsTraining:6,competition:'Former scholastic wrestler',roundLength:'3 min',gear:'Wrestling shoes optional',contactLevel:'Live takedowns / controlled mat returns',
    bio:'Former high-school wrestler getting back into consistent rounds. Looking for chain wrestling and mat returns.'
  },
  {
    id:'keisha',name:'Keisha',age:30,city:'Johnston',distance:8,style:'Boxing',cross:'Strength',level:'Advanced',weight:140,
    goal:'Technical sparring',availability:['Early mornings'],intensity:'Medium',gym:'Capital City Boxing',verified:true,initials:'KE',
    stance:'Orthodox',yearsTraining:9,competition:'Experienced amateur boxer',roundLength:'3 min',gear:'16 oz gloves, headgear',contactLevel:'Technical to medium',
    bio:'Experienced boxer. Prefer structured rounds, agreed pace, and a clear plan before gloves go on.'
  },
  {
    id:'omar',name:'Omar',age:28,city:'Lincoln',distance:12,style:'Muay Thai',cross:'Brazilian Jiu-Jitsu',level:'Intermediate',weight:160,
    goal:'Skill exchange',availability:['Weekends'],intensity:'Light–Medium',gym:'North End Combat',verified:true,initials:'OM',
    stance:'Orthodox',yearsTraining:4,competition:'Smokers / in-house rounds',roundLength:'3 min',gear:'16 oz gloves, shin guards',contactLevel:'Technical striking + clinch',
    bio:'Want to trade striking and grappling knowledge. Technical work, pads, clinch, and situational rounds.'
  }
];

export const defaultProfile = {
  name:'You',
  style:'Boxing',
  secondaryStyle:'Muay Thai',
  level:'Intermediate',
  weight:160,
  goal:'Technical sparring',
  availability:['Weeknights','Weekends'],
  intensity:'Light–Medium',
  stance:'Orthodox',
  yearsTraining:3,
  competition:'Recreational / developing',
  roundLength:'3 min',
  gear:'16 oz gloves',
  homeGym:'Independent',
  contactLevel:'Controlled head + body'
};

export const defaultFilters = {
  style:'All',
  level:'All',
  distance:25,
  weightMin:120,
  weightMax:200,
  verifiedOnly:false
};

const levelIndex = value => ['Beginner','Intermediate','Advanced'].indexOf(value);

const goalFamily = value => {
  const text=String(value||'').toLowerCase();
  if(text.includes('technical')||text.includes('skill')) return 'technical';
  if(text.includes('fight')||text.includes('camp')) return 'camp';
  if(text.includes('open mat')||text.includes('grappl')||text.includes('takedown')) return 'grappling';
  return 'general';
};

const intensityFamily = value => {
  const text=String(value||'').toLowerCase();
  if(text.includes('hard')) return 4;
  if(text==='medium') return 3;
  if(text.includes('medium')) return 2;
  if(text.includes('light')) return 1;
  return 0;
};

export function calculateCompatibility(fighter, profile, maxDistance=25){
  let score=0;
  const reasons=[];
  const breakdown=[];

  const push=(key,label,points,max,detail)=>{
    score+=points;
    breakdown.push({key,label,points:Number(points.toFixed(1)),max,detail});
  };

  const weightGap=Math.abs(Number(fighter.weight)-Number(profile.weight));
  const weightScore=Math.max(0,24-Math.max(0,weightGap-5)*1.2);
  push('weight','Weight compatibility',weightScore,24,weightGap===0?'Same listed weight':`${weightGap} lb apart`);
  if(weightGap<=10) reasons.push(`Within ${weightGap} lb`);

  const directStyle=fighter.style===profile.style;
  const crossStyle=fighter.cross===profile.style || fighter.style===profile.secondaryStyle || fighter.cross===profile.secondaryStyle;
  if(directStyle){
    push('style','Style compatibility',20,20,`Both train ${profile.style}`);
    reasons.push(`Both train ${profile.style}`);
  } else if(crossStyle){
    push('style','Style compatibility',15,20,'Complementary primary / secondary styles');
    reasons.push('Complementary styles');
  } else {
    push('style','Style compatibility',7,20,'Different styles can still provide useful cross-training');
  }

  const levelGap=Math.abs(levelIndex(fighter.level)-levelIndex(profile.level));
  if(levelGap===0){
    push('experience','Experience level',16,16,'Same experience level');
    reasons.push('Same experience level');
  } else if(levelGap===1){
    push('experience','Experience level',11,16,'One experience tier apart');
    reasons.push('Compatible experience');
  } else {
    push('experience','Experience level',4,16,'Large experience gap — set expectations before live rounds');
  }

  const sharedAvailability=fighter.availability.filter(slot=>profile.availability?.includes(slot));
  if(sharedAvailability.length){
    push('availability','Availability',14,14,`Shared window: ${sharedAvailability.join(', ')}`);
    reasons.push(`Both free ${sharedAvailability[0].toLowerCase()}`);
  } else {
    push('availability','Availability',0,14,'No shared preferred training window listed');
  }

  const intensityGap=Math.abs(intensityFamily(fighter.intensity)-intensityFamily(profile.intensity));
  if(intensityGap===0){
    push('intensity','Preferred intensity',12,12,`Both prefer ${fighter.intensity}`);
    reasons.push('Same preferred pace');
  } else if(intensityGap===1) {
    push('intensity','Preferred intensity',8,12,`Close pace preferences: ${profile.intensity} / ${fighter.intensity}`);
  } else {
    push('intensity','Preferred intensity',2,12,`Different pace preferences: ${profile.intensity} / ${fighter.intensity}`);
  }

  if(goalFamily(fighter.goal)===goalFamily(profile.goal)){
    push('goal','Training goal',8,8,'Training goals are in the same family');
    reasons.push('Training goals line up');
  } else {
    push('goal','Training goal',3,8,`Different goals: ${profile.goal} / ${fighter.goal}`);
  }

  const distanceScore=Math.max(0,6-(fighter.distance/Math.max(1,maxDistance))*6);
  push('distance','Distance',distanceScore,6,`${fighter.distance} miles away within a ${maxDistance}-mile radius`);
  if(fighter.distance<=5) reasons.push(`${fighter.distance} miles away`);

  if(fighter.verified){
    push('verification','Gym verification',2,2,'Profile is marked gym verified');
    reasons.push('Gym verified');
  } else {
    push('verification','Gym verification',0,2,'Profile is not gym verified in this demo dataset');
  }

  return {
    score:Math.max(45,Math.min(99,Math.round(score))),
    rawScore:Number(score.toFixed(1)),
    reasons:reasons.slice(0,4),
    breakdown
  };
}
export function filterFighters(list, filters, profile, excludedIds=[]){
  return list
    .filter(f=>!excludedIds.includes(f.id))
    .filter(f=>filters.style==='All'||f.style===filters.style||f.cross===filters.style)
    .filter(f=>filters.level==='All'||f.level===filters.level)
    .filter(f=>f.distance<=filters.distance)
    .filter(f=>f.weight>=filters.weightMin&&f.weight<=filters.weightMax)
    .filter(f=>!filters.verifiedOnly||f.verified)
    .map(f=>({...f,compatibility:calculateCompatibility(f,profile,filters.distance)}))
    .sort((a,b)=>b.compatibility.score-a.compatibility.score);
}

export function createSession({partner,type,date,time,intensity,notes}){
  return {
    id:Date.now().toString(36),
    partnerId:partner?.id||'',
    partnerName:partner?.name||'Open session',
    type:type||'Technical sparring',
    date:date||'',
    time:time||'',
    intensity:intensity||'Technical',
    notes:notes||'',
    status:'proposed',
    createdAt:new Date().toISOString()
  };
}

export const sessionStatuses = [
  {id:'proposed',label:'Proposed'},
  {id:'accepted',label:'Accepted'},
  {id:'completed',label:'Completed'},
  {id:'canceled',label:'Canceled'}
];
