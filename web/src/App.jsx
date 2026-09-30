import { useEffect, useMemo, useState } from 'react';
import {
  availabilities,
  createSession,
  defaultFilters,
  defaultProfile,
  fighters,
  filterFighters,
  intensityDefinitions,
  levels,
  reportReasons,
  sessionStatuses,
  sessionTypes,
  styles,
} from '../../shared/core.js';

const STORAGE_KEY = 'mix-n-match-v3';

const defaultState = {
  passed:[], matches:[], blocked:[], reports:[], sessions:[], theme:'dark',
  filters:{...defaultFilters}, profile:{...defaultProfile},
  onboardingComplete:false, lastAction:null
};

function loadState(){
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    return {
      ...defaultState, ...saved,
      filters:{...defaultFilters,...(saved.filters||{})},
      profile:{...defaultProfile,...(saved.profile||{})},
      passed:Array.isArray(saved.passed)?saved.passed:[],
      matches:Array.isArray(saved.matches)?saved.matches:[],
      blocked:Array.isArray(saved.blocked)?saved.blocked:[],
      reports:Array.isArray(saved.reports)?saved.reports:[],
      sessions:Array.isArray(saved.sessions)?saved.sessions:[]
    };
  } catch { return defaultState; }
}

function App(){
  const [state,setState]=useState(loadState);
  const [tab,setTab]=useState('discover');
  const [filterOpen,setFilterOpen]=useState(false);
  const [plannerOpen,setPlannerOpen]=useState(false);
  const [plannerPartner,setPlannerPartner]=useState('');
  const [toast,setToast]=useState('');
  const [installPrompt,setInstallPrompt]=useState(null);
  const [whyOpen,setWhyOpen]=useState(null);
  const [reportOpen,setReportOpen]=useState(null);

  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state)),[state]);
  useEffect(()=>{document.documentElement.dataset.theme=state.theme},[state.theme]);
  useEffect(()=>{
    const onPrompt=e=>{e.preventDefault();setInstallPrompt(e)};
    window.addEventListener('beforeinstallprompt',onPrompt);
    return()=>window.removeEventListener('beforeinstallprompt',onPrompt);
  },[]);

  const excluded=[...state.passed,...state.matches,...state.blocked];
  const filtered=useMemo(
    ()=>filterFighters(fighters,state.filters,state.profile,excluded),
    [state.filters,state.profile,state.passed,state.matches,state.blocked]
  );
  const current=filtered[0];
  const matchProfiles=useMemo(
    ()=>filterFighters(
      fighters.filter(f=>state.matches.includes(f.id)),
      {...defaultFilters,distance:100,weightMin:0,weightMax:500},
      state.profile, []
    ),
    [state.matches,state.profile]
  );
  const completedSessions=state.sessions.filter(s=>s.status==='completed');
  const repeatPartners=new Set(completedSessions.map(s=>s.partnerId).filter(Boolean)).size;
  const blockedProfiles=fighters.filter(f=>state.blocked.includes(f.id));

  const flash=msg=>{setToast(msg);setTimeout(()=>setToast(''),1800)};

  const act=(type,fighter=current)=>{
    if(!fighter)return;
    setState(prev=>({
      ...prev,
      passed:type==='pass'?[...prev.passed,fighter.id]:prev.passed,
      matches:type==='match'?[fighter.id,...prev.matches.filter(id=>id!==fighter.id)]:prev.matches,
      lastAction:{type,id:fighter.id}
    }));
    flash(type==='match'?`Connected with ${fighter.name}`:`Skipped ${fighter.name}`);
  };

  const undo=()=>{
    const last=state.lastAction;
    if(!last)return flash('Nothing to undo');
    setState(prev=>({
      ...prev,
      passed:last.type==='pass'?prev.passed.filter(id=>id!==last.id):prev.passed,
      matches:last.type==='match'?prev.matches.filter(id=>id!==last.id):prev.matches,
      lastAction:null
    }));
    flash('Last action undone');
  };

  const resetDiscovery=()=>{
    setState(prev=>({...prev,passed:[],lastAction:null}));
    flash('Skipped profiles restored');
  };

  const saveSession=e=>{
    e.preventDefault();
    const form=new FormData(e.currentTarget);
    const partner=fighters.find(f=>f.id===form.get('partner'));
    const session=createSession({
      partner,type:form.get('type'),date:form.get('date'),time:form.get('time'),
      intensity:form.get('intensity'),notes:form.get('notes')
    });
    setState(prev=>({...prev,sessions:[session,...prev.sessions]}));
    setPlannerOpen(false);
    flash('Session proposed');
  };

  const setSessionStatus=(id,status)=>{
    setState(prev=>({...prev,sessions:prev.sessions.map(s=>s.id===id?{...s,status}:s)}));
    flash(sessionStatuses.find(s=>s.id===status)?.label||'Session updated');
  };

  const removeMatch=id=>{
    setState(prev=>({...prev,matches:prev.matches.filter(item=>item!==id)}));
    flash('Match removed');
  };

  const blockPartner=id=>{
    setState(prev=>({
      ...prev,
      matches:prev.matches.filter(item=>item!==id),
      passed:prev.passed.filter(item=>item!==id),
      blocked:[...new Set([...prev.blocked,id])]
    }));
    flash('Hidden from your local deck');
  };

  const unblockPartner=id=>{
    setState(prev=>({...prev,blocked:prev.blocked.filter(item=>item!==id)}));
    flash('Profile restored');
  };

  const submitReport=(fighter,reason)=>{
    setState(prev=>({
      ...prev,
      matches:prev.matches.filter(item=>item!==fighter.id),
      passed:prev.passed.filter(item=>item!==fighter.id),
      blocked:[...new Set([...prev.blocked,fighter.id])],
      reports:[{
        id:Date.now().toString(36),
        fighterId:fighter.id,
        fighterName:fighter.name,
        reason,
        createdAt:new Date().toISOString()
      },...prev.reports]
    }));
    setReportOpen(null);
    flash('Report saved locally and profile hidden');
  };

  const openPlanner=id=>{setPlannerPartner(id||'');setPlannerOpen(true)};

  const install=async()=>{
    if(!installPrompt)return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const finishOnboarding=e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget);
    setState(prev=>({
      ...prev,onboardingComplete:true,
      profile:{
        ...prev.profile,
        style:fd.get('style'),level:fd.get('level'),weight:Number(fd.get('weight')),
        goal:fd.get('goal'),intensity:fd.get('intensity'),availability:[fd.get('availability')]
      }
    }));
    flash('Your deck is tuned');
  };

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>setTab('discover')}>
        <span className="brand-mark">M</span>
        <span><strong>Mix N' Match</strong><small>train better together</small></span>
      </button>
      <nav className="desktop-nav">
        <button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')}>Discover</button>
        <button className={tab==='matches'?'active':''} onClick={()=>setTab('matches')}>Matches <em>{state.matches.length}</em></button>
        <button className={tab==='sessions'?'active':''} onClick={()=>setTab('sessions')}>Sessions <em>{state.sessions.length}</em></button>
      </nav>
      <div className="top-actions">
        {installPrompt&&<button className="secondary-button install" onClick={install}>Install</button>}
        <button className="icon-button" onClick={()=>setState(p=>({...p,theme:p.theme==='dark'?'light':'dark'}))}>{state.theme==='dark'?'☀':'☾'}</button>
        <button className="profile-chip" onClick={()=>setTab('profile')}><span>YO</span><strong>{state.profile.name}</strong></button>
      </div>
    </header>

    <main>
      {tab==='discover'&&<section className="discover-page">
        <div className="hero-row">
          <div>
            <span className="eyebrow">LOCAL TRAINING NETWORK</span>
            <h1>Find the right rounds.<br/><span>Skip the wrong energy.</span></h1>
            <p>Compatibility is based on size, style, experience, availability, goals, intensity, and distance — not random swiping.</p>
          </div>
          <div className="hero-stats">
            <div><span>Matches</span><strong>{state.matches.length}</strong></div>
            <div><span>Rounds logged</span><strong>{completedSessions.length}</strong></div>
            <div><span>Partners</span><strong>{repeatPartners}</strong></div>
          </div>
        </div>

        <div className="discover-toolbar">
          <div className="filter-summary">
            <span>{state.filters.style}</span><span>{state.filters.level}</span><span>≤ {state.filters.distance} mi</span><span>{state.filters.weightMin}–{state.filters.weightMax} lb</span>
            {state.filters.verifiedOnly&&<span>Verified gyms</span>}
          </div>
          <button className="secondary-button" onClick={()=>setFilterOpen(true)}>Filters</button>
        </div>

        <div className="discover-grid">
          <section className="card-stage">
            {current ? <article className="fighter-card">
              <div className="fighter-visual">
                <div className="avatar-xl">{current.initials}</div>
                <div className="visual-badges">
                  <button className="compatibility score-button" onClick={()=>setWhyOpen(current)}>{current.compatibility.score}% match · why?</button>
                  <span>{current.distance} mi away</span>
                </div>
                <div className="fighter-overlay">
                  <span>{current.city}{current.verified?' · ✓ gym verified':''}</span>
                  <h2>{current.name}, {current.age}</h2>
                  <p>{current.style} <b>+</b> {current.cross}</p>
                </div>
              </div>
              <div className="fighter-details">
                <div className="match-reasons">{current.compatibility.reasons.map(reason=><span key={reason}>✓ {reason}</span>)}</div>
                <div className="pill-row">
                  <span>{current.level}</span><span>{current.weight} lb</span><span>{current.intensity}</span><span>{current.stance}</span>
                </div>
                <p className="bio">{current.bio}</p>
                <div className="detail-grid">
                  <div><span>Looking for</span><strong>{current.goal}</strong></div>
                  <div><span>Available</span><strong>{current.availability.join(' · ')}</strong></div>
                  <div><span>Experience</span><strong>{current.yearsTraining} yrs · {current.competition}</strong></div>
                  <div><span>Round preference</span><strong>{current.roundLength} · {current.contactLevel}</strong></div>
                  <div><span>Home gym</span><strong>{current.gym}</strong></div>
                  <div><span>Gear</span><strong>{current.gear}</strong></div>
                </div>
              </div>
              <div className="decision-row">
                <button className="decision undo" onClick={undo} aria-label="Undo">↶</button>
                <button className="decision pass" onClick={()=>act('pass')}><span>×</span><small>Pass</small></button>
                <button className="decision match" onClick={()=>act('match')}><span>＋</span><small>Connect</small></button>
              </div>
            </article> :
            <div className="empty-stage">
              <span>✓</span><h2>You cleared the deck.</h2>
              <p>Change your filters or restore skipped profiles to keep looking.</p>
              <div><button className="secondary-button" onClick={()=>setFilterOpen(true)}>Change filters</button><button className="primary-button" onClick={resetDiscovery}>Restore skipped</button></div>
            </div>}
          </section>

          <aside className="discover-side">
            <section className="panel readiness">
              <span className="eyebrow">PACE GUIDE</span>
              <h3>Agree on what “hard” means before gloves go on.</h3>
              <div className="pace-list">
                {Object.entries(intensityDefinitions).slice(0,4).map(([name,copy])=><div key={name}><strong>{name}</strong><span>{copy}</span></div>)}
              </div>
            </section>
            <section className="panel readiness">
              <span className="eyebrow">BEFORE YOU TRAIN</span>
              <h3>Set the round before the round sets you.</h3>
              <div className="safety-list">
                <div><span>1</span><p><strong>Agree on intensity</strong><small>Define the pace, contact, and techniques first.</small></p></div>
                <div><span>2</span><p><strong>Name the rules</strong><small>Round length, gear, and anything off-limits.</small></p></div>
                <div><span>3</span><p><strong>Use a real training space</strong><small>Prefer gyms and supervised environments over private locations.</small></p></div>
              </div>
            </section>
          </aside>
        </div>
      </section>}

      {tab==='matches'&&<section className="section-page">
        <div className="section-head"><div><span className="eyebrow">YOUR NETWORK</span><h1>Training matches</h1><p>Compatibility is recalculated whenever you update your profile.</p></div><button className="primary-button" onClick={()=>setTab('discover')}>Find partners</button></div>
        {matchProfiles.length ? <div className="match-grid">{matchProfiles.map(f=><article className="match-card" key={f.id}>
          <div className="match-top"><div className="avatar">{f.initials}</div><div><h3>{f.name}</h3><p>{f.city} · {f.distance} mi</p></div><button className="score-ring score-button" onClick={()=>setWhyOpen(f)}>{f.compatibility.score}%</button></div>
          <div className="match-reasons compact">{f.compatibility.reasons.slice(0,2).map(reason=><span key={reason}>✓ {reason}</span>)}</div>
          <div className="pill-row"><span>{f.style}</span><span>{f.level}</span><span>{f.weight} lb</span></div>
          <p>{f.bio}</p>
          <div className="match-actions"><button className="primary-button" onClick={()=>openPlanner(f.id)}>Plan session</button><button className="secondary-button" onClick={()=>setWhyOpen(f)}>Why matched</button></div>
          <div className="moderation-actions"><button onClick={()=>removeMatch(f.id)}>Remove match</button><button onClick={()=>blockPartner(f.id)}>Hide profile</button><button className="danger-link" onClick={()=>setReportOpen(f)}>Report</button></div>
        </article>)}</div>:
        <div className="empty-page"><span>＋</span><h2>No matches yet</h2><p>Connect with compatible training partners from Discover.</p><button className="primary-button" onClick={()=>setTab('discover')}>Start discovering</button></div>}
      </section>}

      {tab==='sessions'&&<section className="section-page">
        <div className="section-head"><div><span className="eyebrow">TRAINING BOARD</span><h1>Sessions & history</h1><p>Move a session from proposed → accepted → completed, or cancel it when plans change.</p></div><button className="primary-button" onClick={()=>openPlanner('')}>New session</button></div>
        <div className="training-summary">
          <div><span>Completed rounds</span><strong>{completedSessions.length}</strong></div>
          <div><span>Unique partners</span><strong>{repeatPartners}</strong></div>
          <div><span>Upcoming / active</span><strong>{state.sessions.filter(s=>['proposed','accepted'].includes(s.status)).length}</strong></div>
        </div>
        {state.sessions.length?<div className="session-list">{state.sessions.map(s=><article className="session-card" key={s.id}>
          <div className="session-date"><strong>{s.date?new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}):'TBD'}</strong><span>{s.time||'Time TBD'}</span></div>
          <div className="session-info"><span className="eyebrow">{s.type}</span><h3>{s.partnerName}</h3><p>{s.intensity} · {s.notes||'No notes added.'}</p><div className="status-row">{sessionStatuses.map(status=><button key={status.id} className={s.status===status.id?'active':''} onClick={()=>setSessionStatus(s.id,status.id)}>{status.label}</button>)}</div></div>
        </article>)}</div>:
        <div className="empty-page"><span>◫</span><h2>Your board is empty</h2><p>Plan a technical session, pads, drilling, open mat, or sparring round.</p><button className="primary-button" onClick={()=>openPlanner('')}>Plan first session</button></div>}
      </section>}

      {tab==='profile'&&<section className="section-page">
        <div className="section-head"><div><span className="eyebrow">YOUR TRAINING PROFILE</span><h1>Give the match engine better information.</h1><p>Everything here stays on this device in the current local-first version.</p></div></div>
        <div className="profile-layout">
          <section className="profile-card">
            <div className="avatar-xl small">YO</div><h2>{state.profile.name}</h2><p>{state.profile.style} · {state.profile.level} · {state.profile.weight} lb</p>
            <div className="profile-goal"><span>Current goal</span><strong>{state.profile.goal}</strong></div>
            <div className="profile-facts"><span>{state.profile.stance}</span><span>{state.profile.yearsTraining} yrs</span><span>{state.profile.intensity}</span><span>{state.profile.roundLength}</span></div>
          </section>
          <form className="profile-form" onSubmit={e=>{
            e.preventDefault();
            const fd=new FormData(e.currentTarget);
            setState(p=>({...p,profile:{
              ...p.profile,name:fd.get('name'),style:fd.get('style'),secondaryStyle:fd.get('secondaryStyle'),level:fd.get('level'),
              weight:Number(fd.get('weight')),goal:fd.get('goal'),intensity:fd.get('intensity'),stance:fd.get('stance'),
              yearsTraining:Number(fd.get('yearsTraining')),competition:fd.get('competition'),roundLength:fd.get('roundLength'),
              gear:fd.get('gear'),homeGym:fd.get('homeGym'),contactLevel:fd.get('contactLevel'),availability:[fd.get('availability')]
            }}));
            flash('Profile updated');
          }}>
            <label>Name<input name="name" defaultValue={state.profile.name}/></label>
            <label>Primary style<select name="style" defaultValue={state.profile.style}>{styles.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Secondary style<select name="secondaryStyle" defaultValue={state.profile.secondaryStyle}>{styles.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Experience<select name="level" defaultValue={state.profile.level}>{levels.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Weight<input name="weight" type="number" min="80" max="350" defaultValue={state.profile.weight}/></label>
            <label>Years training<input name="yearsTraining" type="number" min="0" max="50" defaultValue={state.profile.yearsTraining}/></label>
            <label>Stance<input name="stance" defaultValue={state.profile.stance}/></label>
            <label>Availability<select name="availability" defaultValue={state.profile.availability[0]}>{availabilities.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Preferred intensity<select name="intensity" defaultValue={state.profile.intensity}>{Object.keys(intensityDefinitions).map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Round length<input name="roundLength" defaultValue={state.profile.roundLength}/></label>
            <label className="full">Training goal<input name="goal" defaultValue={state.profile.goal}/></label>
            <label className="full">Competition experience<input name="competition" defaultValue={state.profile.competition}/></label>
            <label className="full">Gear<input name="gear" defaultValue={state.profile.gear}/></label>
            <label className="full">Home gym<input name="homeGym" defaultValue={state.profile.homeGym}/></label>
            <label className="full">Contact preference<input name="contactLevel" defaultValue={state.profile.contactLevel}/></label>
            <div className="full form-actions"><button className="primary-button">Save profile</button><button type="button" className="secondary-button" onClick={()=>{localStorage.removeItem(STORAGE_KEY);setState({...defaultState,filters:{...defaultFilters},profile:{...defaultProfile}});flash('Local data reset')}}>Reset local data</button></div>
          </form>
        </div>
        <section className="moderation-panel">
          <div><span className="eyebrow">SAFETY & MODERATION</span><h2>Hidden profiles</h2><p>Reports saved locally: {state.reports.length}. Hidden profiles stay out of discovery until you restore them.</p></div>
          {blockedProfiles.length?<div className="blocked-list">{blockedProfiles.map(f=><div className="blocked-row" key={f.id}><div><strong>{f.name}</strong><span>{f.style} · {f.city}</span></div><button className="secondary-button" onClick={()=>unblockPartner(f.id)}>Restore</button></div>)}</div>:<p className="empty-inline">No hidden profiles.</p>}
        </section>
      </section>}
    </main>

    <nav className="mobile-nav">
      <button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')}><span>⌁</span>Discover</button>
      <button className={tab==='matches'?'active':''} onClick={()=>setTab('matches')}><span>＋</span>Matches</button>
      <button className={tab==='sessions'?'active':''} onClick={()=>setTab('sessions')}><span>◫</span>Sessions</button>
      <button className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}><span>○</span>Profile</button>
    </nav>

    {!state.onboardingComplete&&<div className="modal-backdrop onboarding-backdrop">
      <form className="modal onboarding-modal" onSubmit={finishOnboarding}>
        <span className="eyebrow">FIRST ROUND</span>
        <h2>Tune your training deck.</h2>
        <p className="modal-copy">Give Mix N' Match a few basics and the compatibility engine will rank partners around how you actually train.</p>
        <div className="filter-form onboarding-grid">
          <label>Primary style<select name="style" defaultValue={state.profile.style}>{styles.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Experience<select name="level" defaultValue={state.profile.level}>{levels.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Weight<input name="weight" type="number" min="80" max="350" defaultValue={state.profile.weight}/></label>
          <label>Best availability<select name="availability" defaultValue={state.profile.availability[0]}>{availabilities.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Preferred intensity<select name="intensity" defaultValue={state.profile.intensity}>{Object.keys(intensityDefinitions).map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Current goal<input name="goal" defaultValue={state.profile.goal}/></label>
        </div>
        <button className="primary-button wide">Build my deck</button>
        <button type="button" className="skip-onboarding" onClick={()=>setState(p=>({...p,onboardingComplete:true}))}>Use demo defaults</button>
      </form>
    </div>}

    {filterOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setFilterOpen(false)}>
      <section className="modal">
        <div className="modal-head"><div><span className="eyebrow">DISCOVERY</span><h2>Match filters</h2></div><button className="icon-button" onClick={()=>setFilterOpen(false)}>×</button></div>
        <div className="filter-form">
          <label>Style<select value={state.filters.style} onChange={e=>setState(p=>({...p,filters:{...p.filters,style:e.target.value}}))}>{styles.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Experience<select value={state.filters.level} onChange={e=>setState(p=>({...p,filters:{...p.filters,level:e.target.value}}))}>{levels.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Max distance <strong>{state.filters.distance} mi</strong><input type="range" min="2" max="50" value={state.filters.distance} onChange={e=>setState(p=>({...p,filters:{...p.filters,distance:Number(e.target.value)}}))}/></label>
          <div className="weight-pair"><label>Min weight<input type="number" min="80" max="350" value={state.filters.weightMin} onChange={e=>setState(p=>({...p,filters:{...p.filters,weightMin:Number(e.target.value)}}))}/></label><label>Max weight<input type="number" min="80" max="350" value={state.filters.weightMax} onChange={e=>setState(p=>({...p,filters:{...p.filters,weightMax:Number(e.target.value)}}))}/></label></div>
          <label className="checkbox-row"><input type="checkbox" checked={state.filters.verifiedOnly} onChange={e=>setState(p=>({...p,filters:{...p.filters,verifiedOnly:e.target.checked}}))}/><span>Gym-verified profiles only</span></label>
        </div>
        <button className="primary-button wide" onClick={()=>setFilterOpen(false)}>Show {filtered.length} partners</button>
      </section>
    </div>}

    {whyOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setWhyOpen(null)}>
      <section className="modal score-modal">
        <div className="modal-head"><div><span className="eyebrow">WHY WE MATCHED</span><h2>{whyOpen.name} · {whyOpen.compatibility.score}%</h2></div><button className="icon-button" onClick={()=>setWhyOpen(null)}>×</button></div>
        <p className="modal-copy">This is a training-compatibility aid, not a safety guarantee. Confirm pace, rules, gear, and supervision yourself.</p>
        <div className="score-breakdown">{whyOpen.compatibility.breakdown.map(item=><div className="breakdown-row" key={item.key}><div><strong>{item.label}</strong><span>{item.detail}</span></div><b>{item.points}/{item.max}</b></div>)}</div>
      </section>
    </div>}

    {reportOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setReportOpen(null)}>
      <section className="modal">
        <div className="modal-head"><div><span className="eyebrow">LOCAL SAFETY REPORT</span><h2>Report {reportOpen.name}</h2></div><button className="icon-button" onClick={()=>setReportOpen(null)}>×</button></div>
        <p className="modal-copy">Choose a reason. This local-first prototype stores the report only on this device and hides the profile.</p>
        <div className="report-reasons">{reportReasons.map(reason=><button key={reason} onClick={()=>submitReport(reportOpen,reason)}><strong>{reason}</strong><span>Save locally and hide profile</span></button>)}</div>
      </section>
    </div>}

    {plannerOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setPlannerOpen(false)}>
      <form className="modal" onSubmit={saveSession}>
        <div className="modal-head"><div><span className="eyebrow">TRAINING BOARD</span><h2>Propose a session</h2></div><button type="button" className="icon-button" onClick={()=>setPlannerOpen(false)}>×</button></div>
        <div className="filter-form">
          <label>Partner<select name="partner" defaultValue={plannerPartner}><option value="">Open / not listed</option>{matchProfiles.map(f=><option value={f.id} key={f.id}>{f.name} · {f.style}</option>)}</select></label>
          <label>Session type<select name="type">{sessionTypes.map(x=><option key={x}>{x}</option>)}</select></label>
          <div className="weight-pair"><label>Date<input name="date" type="date" required/></label><label>Time<input name="time" type="time"/></label></div>
          <label>Intensity<select name="intensity">{Object.keys(intensityDefinitions).map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Notes<textarea name="notes" placeholder="Round length, gear, focus, rules, gym…"/></label>
        </div>
        <button className="primary-button wide">Add proposed session</button>
      </form>
    </div>}

    {toast&&<div className="toast">{toast}</div>}
  </div>;
}

export default App;
