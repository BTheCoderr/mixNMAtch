import { useMemo, useState, useEffect } from 'react';

const STORAGE_KEY = 'mix-n-match-v2';

const fighters = [
  {id:'maya',name:'Maya',age:27,city:'Providence',distance:2,style:'Boxing',cross:'Muay Thai',level:'Intermediate',weight:135,goal:'Technical sparring',availability:'Weeknights',intensity:'Light–Medium',gym:'Southside Fight Lab',bio:'Fast hands, footwork rounds, and technical work. Looking for controlled rounds and good communication.',verified:true,initials:'MA'},
  {id:'dre',name:'Dre',age:31,city:'Cranston',distance:5,style:'Muay Thai',cross:'Boxing',level:'Advanced',weight:170,goal:'Fight camp',availability:'Early mornings',intensity:'Medium–Hard',gym:'Ocean State Muay Thai',bio:'Active amateur. Happy to drill or spar depending on experience. Defense first, ego last.',verified:true,initials:'DR'},
  {id:'luis',name:'Luis',age:24,city:'Pawtucket',distance:6,style:'Brazilian Jiu-Jitsu',cross:'Wrestling',level:'Intermediate',weight:155,goal:'Open mat',availability:'Weekends',intensity:'Technical',gym:'Anchor Grappling',bio:'Purple belt rounds, positional work, takedown entries, and no-gi on weekends.',verified:true,initials:'LU'},
  {id:'nia',name:'Nia',age:29,city:'Providence',distance:3,style:'Kickboxing',cross:'Boxing',level:'Beginner',weight:145,goal:'Skill building',availability:'Weeknights',intensity:'Light',gym:'Independent',bio:'Building confidence with controlled drills, pads, and very light sparring. Looking for patient partners.',verified:false,initials:'NI'},
  {id:'marcus',name:'Marcus',age:34,city:'Warwick',distance:10,style:'MMA',cross:'Wrestling',level:'Advanced',weight:185,goal:'Mixed rounds',availability:'Weekends',intensity:'Medium',gym:'401 MMA',bio:'MMA rounds with an emphasis on transitions. Open to helping newer athletes with structured drills.',verified:true,initials:'MC'},
  {id:'sam',name:'Sam',age:26,city:'East Providence',distance:4,style:'Wrestling',cross:'BJJ',level:'Intermediate',weight:165,goal:'Takedowns',availability:'Weeknights',intensity:'Medium',gym:'Independent',bio:'Former high-school wrestler getting back into consistent rounds. Looking for chain wrestling and mat returns.',verified:false,initials:'SA'},
  {id:'keisha',name:'Keisha',age:30,city:'Johnston',distance:8,style:'Boxing',cross:'Strength',level:'Advanced',weight:140,goal:'Technical sparring',availability:'Early mornings',intensity:'Medium',gym:'Capital City Boxing',bio:'Experienced boxer. Prefer structured rounds, agreed pace, and a clear plan before gloves go on.',verified:true,initials:'KE'},
  {id:'omar',name:'Omar',age:28,city:'Lincoln',distance:12,style:'Muay Thai',cross:'BJJ',level:'Intermediate',weight:160,goal:'Skill exchange',availability:'Weekends',intensity:'Light–Medium',gym:'North End Combat',bio:'Want to trade striking and grappling knowledge. Technical work, pads, clinch, and situational rounds.',verified:true,initials:'OM'}
];

const defaultState = {
  passed:[],
  matches:[],
  sessions:[],
  theme:'dark',
  filters:{style:'All',level:'All',distance:25,weightMin:120,weightMax:200},
  profile:{name:'You',style:'Boxing',level:'Intermediate',weight:160,goal:'Technical sparring'},
  lastAction:null
};

function loadState(){
  try { return {...defaultState,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}; }
  catch { return defaultState; }
}

const styles = ['All','Boxing','Muay Thai','Kickboxing','Brazilian Jiu-Jitsu','Wrestling','MMA'];
const levels = ['All','Beginner','Intermediate','Advanced'];

function App(){
  const [state,setState] = useState(loadState);
  const [tab,setTab] = useState('discover');
  const [filterOpen,setFilterOpen] = useState(false);
  const [plannerOpen,setPlannerOpen] = useState(false);
  const [plannerPartner,setPlannerPartner] = useState('');
  const [toast,setToast] = useState('');
  const [installPrompt,setInstallPrompt] = useState(null);

  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state)),[state]);
  useEffect(()=>{
    document.documentElement.dataset.theme=state.theme;
  },[state.theme]);
  useEffect(()=>{
    const onPrompt=e=>{e.preventDefault();setInstallPrompt(e)};
    window.addEventListener('beforeinstallprompt',onPrompt);
    return()=>window.removeEventListener('beforeinstallprompt',onPrompt);
  },[]);

  const filtered = useMemo(()=>fighters.filter(f=>
    !state.passed.includes(f.id) &&
    !state.matches.includes(f.id) &&
    (state.filters.style==='All' || f.style===state.filters.style || f.cross===state.filters.style) &&
    (state.filters.level==='All' || f.level===state.filters.level) &&
    f.distance<=state.filters.distance &&
    f.weight>=state.filters.weightMin &&
    f.weight<=state.filters.weightMax
  ),[state]);

  const current = filtered[0];
  const matchProfiles = fighters.filter(f=>state.matches.includes(f.id));

  const flash = msg => {setToast(msg);setTimeout(()=>setToast(''),1800)};

  const act = (type, fighter=current) => {
    if(!fighter) return;
    setState(prev=>({
      ...prev,
      passed:type==='pass'?[...prev.passed,fighter.id]:prev.passed,
      matches:type==='match'?[fighter.id,...prev.matches.filter(id=>id!==fighter.id)]:prev.matches,
      lastAction:{type,id:fighter.id}
    }));
    flash(type==='match'?`Matched with ${fighter.name}`:`Skipped ${fighter.name}`);
  };

  const undo = () => {
    const last=state.lastAction;
    if(!last) return flash('Nothing to undo');
    setState(prev=>({
      ...prev,
      passed:last.type==='pass'?prev.passed.filter(id=>id!==last.id):prev.passed,
      matches:last.type==='match'?prev.matches.filter(id=>id!==last.id):prev.matches,
      lastAction:null
    }));
    flash('Last action undone');
  };

  const resetDiscovery = () => {
    setState(prev=>({...prev,passed:[],lastAction:null}));
    flash('Skipped profiles restored');
  };

  const saveSession = e => {
    e.preventDefault();
    const form=new FormData(e.currentTarget);
    const partner=fighters.find(f=>f.id===form.get('partner'));
    const session={
      id:Date.now().toString(36),
      partnerId:partner?.id||'',
      partnerName:partner?.name||'Open session',
      type:form.get('type'),
      date:form.get('date'),
      time:form.get('time'),
      intensity:form.get('intensity'),
      notes:form.get('notes')
    };
    setState(prev=>({...prev,sessions:[session,...prev.sessions]}));
    setPlannerOpen(false);
    flash('Training session planned');
  };

  const removeSession=id=>setState(prev=>({...prev,sessions:prev.sessions.filter(s=>s.id!==id)}));

  const openPlanner=id=>{
    setPlannerPartner(id||'');
    setPlannerOpen(true);
  };

  const install=async()=>{
    if(!installPrompt)return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
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
            <p>Match by style, size, experience, goals, distance, and preferred intensity before you ever step on the mat.</p>
          </div>
          <div className="hero-stats">
            <div><span>Matches</span><strong>{state.matches.length}</strong></div>
            <div><span>Planned</span><strong>{state.sessions.length}</strong></div>
            <div><span>Radius</span><strong>{state.filters.distance}mi</strong></div>
          </div>
        </div>

        <div className="discover-toolbar">
          <div className="filter-summary">
            <span>{state.filters.style}</span><span>{state.filters.level}</span><span>≤ {state.filters.distance} mi</span><span>{state.filters.weightMin}–{state.filters.weightMax} lb</span>
          </div>
          <button className="secondary-button" onClick={()=>setFilterOpen(true)}>Filters</button>
        </div>

        <div className="discover-grid">
          <section className="card-stage">
            {current ? <article className="fighter-card">
              <div className="fighter-visual">
                <div className="avatar-xl">{current.initials}</div>
                <div className="visual-badges">
                  {current.verified&&<span>✓ Verified gym</span>}
                  <span>{current.distance} mi away</span>
                </div>
                <div className="fighter-overlay">
                  <span>{current.city}</span>
                  <h2>{current.name}, {current.age}</h2>
                  <p>{current.style} <b>+</b> {current.cross}</p>
                </div>
              </div>
              <div className="fighter-details">
                <div className="pill-row">
                  <span>{current.level}</span><span>{current.weight} lb</span><span>{current.intensity}</span>
                </div>
                <p className="bio">{current.bio}</p>
                <div className="detail-grid">
                  <div><span>Looking for</span><strong>{current.goal}</strong></div>
                  <div><span>Available</span><strong>{current.availability}</strong></div>
                  <div><span>Home gym</span><strong>{current.gym}</strong></div>
                  <div><span>Primary style</span><strong>{current.style}</strong></div>
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
              <span className="eyebrow">BEFORE YOU TRAIN</span>
              <h3>Set the round before the round sets you.</h3>
              <div className="safety-list">
                <div><span>1</span><p><strong>Agree on intensity</strong><small>Light, technical, medium, or hard should mean the same thing to both people.</small></p></div>
                <div><span>2</span><p><strong>Name the rules</strong><small>Round length, contact level, gear, and what techniques are off-limits.</small></p></div>
                <div><span>3</span><p><strong>Train where people know you</strong><small>Use a gym or supervised training environment whenever possible.</small></p></div>
              </div>
            </section>
            <section className="panel quick-plan">
              <span className="eyebrow">QUICK PLAN</span>
              <h3>Already have a partner?</h3>
              <p>Put the session on your board so the pace, focus, and time are decided before you meet.</p>
              <button className="primary-button" onClick={()=>openPlanner('')}>Plan a session</button>
            </section>
          </aside>
        </div>
      </section>}

      {tab==='matches'&&<section className="section-page">
        <div className="section-head"><div><span className="eyebrow">YOUR NETWORK</span><h1>Training matches</h1><p>People you chose to connect with on this device.</p></div><button className="primary-button" onClick={()=>setTab('discover')}>Find partners</button></div>
        {matchProfiles.length ? <div className="match-grid">{matchProfiles.map(f=><article className="match-card" key={f.id}>
          <div className="match-top"><div className="avatar">{f.initials}</div><div><h3>{f.name}</h3><p>{f.city} · {f.distance} mi</p></div>{f.verified&&<span className="verified">✓</span>}</div>
          <div className="pill-row"><span>{f.style}</span><span>{f.level}</span><span>{f.weight} lb</span></div>
          <p>{f.bio}</p>
          <div className="match-actions"><button className="primary-button" onClick={()=>openPlanner(f.id)}>Plan session</button><button className="secondary-button" onClick={()=>{setState(p=>({...p,matches:p.matches.filter(id=>id!==f.id)}));flash('Match removed')}}>Remove</button></div>
        </article>)}</div>:
        <div className="empty-page"><span>＋</span><h2>No matches yet</h2><p>Connect with compatible training partners from Discover.</p><button className="primary-button" onClick={()=>setTab('discover')}>Start discovering</button></div>}
      </section>}

      {tab==='sessions'&&<section className="section-page">
        <div className="section-head"><div><span className="eyebrow">TRAINING BOARD</span><h1>Planned sessions</h1><p>Keep the who, when, and intensity clear before training starts.</p></div><button className="primary-button" onClick={()=>openPlanner('')}>New session</button></div>
        {state.sessions.length?<div className="session-list">{state.sessions.map(s=><article className="session-card" key={s.id}>
          <div className="session-date"><strong>{s.date?new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}):'TBD'}</strong><span>{s.time||'Time TBD'}</span></div>
          <div className="session-info"><span className="eyebrow">{s.type}</span><h3>{s.partnerName}</h3><p>{s.intensity} · {s.notes||'No notes added.'}</p></div>
          <button className="icon-button" onClick={()=>removeSession(s.id)}>×</button>
        </article>)}</div>:
        <div className="empty-page"><span>◫</span><h2>Your board is empty</h2><p>Plan a technical session, pads, drilling, open mat, or sparring round.</p><button className="primary-button" onClick={()=>openPlanner('')}>Plan first session</button></div>}
      </section>}

      {tab==='profile'&&<section className="section-page">
        <div className="section-head"><div><span className="eyebrow">YOUR TRAINING PROFILE</span><h1>What should partners know?</h1><p>This prototype stores your profile locally on this device.</p></div></div>
        <div className="profile-layout">
          <section className="profile-card">
            <div className="avatar-xl small">YO</div><h2>{state.profile.name}</h2><p>{state.profile.style} · {state.profile.level} · {state.profile.weight} lb</p>
            <div className="profile-goal"><span>Current goal</span><strong>{state.profile.goal}</strong></div>
          </section>
          <form className="profile-form" onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);setState(p=>({...p,profile:{name:fd.get('name'),style:fd.get('style'),level:fd.get('level'),weight:Number(fd.get('weight')),goal:fd.get('goal')}}));flash('Profile updated')}}>
            <label>Name<input name="name" defaultValue={state.profile.name}/></label>
            <label>Primary style<select name="style" defaultValue={state.profile.style}>{styles.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Experience<select name="level" defaultValue={state.profile.level}>{levels.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Weight<input name="weight" type="number" min="80" max="350" defaultValue={state.profile.weight}/></label>
            <label className="full">Training goal<input name="goal" defaultValue={state.profile.goal}/></label>
            <div className="full form-actions"><button className="primary-button">Save profile</button><button type="button" className="secondary-button" onClick={()=>{localStorage.removeItem(STORAGE_KEY);setState(defaultState);flash('Local data reset')}}>Reset local data</button></div>
          </form>
        </div>
      </section>}
    </main>

    <nav className="mobile-nav">
      <button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')}><span>⌁</span>Discover</button>
      <button className={tab==='matches'?'active':''} onClick={()=>setTab('matches')}><span>＋</span>Matches</button>
      <button className={tab==='sessions'?'active':''} onClick={()=>setTab('sessions')}><span>◫</span>Sessions</button>
      <button className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}><span>○</span>Profile</button>
    </nav>

    {filterOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setFilterOpen(false)}>
      <section className="modal">
        <div className="modal-head"><div><span className="eyebrow">DISCOVERY</span><h2>Match filters</h2></div><button className="icon-button" onClick={()=>setFilterOpen(false)}>×</button></div>
        <div className="filter-form">
          <label>Style<select value={state.filters.style} onChange={e=>setState(p=>({...p,filters:{...p.filters,style:e.target.value}}))}>{styles.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Experience<select value={state.filters.level} onChange={e=>setState(p=>({...p,filters:{...p.filters,level:e.target.value}}))}>{levels.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Max distance <strong>{state.filters.distance} mi</strong><input type="range" min="2" max="50" value={state.filters.distance} onChange={e=>setState(p=>({...p,filters:{...p.filters,distance:Number(e.target.value)}}))}/></label>
          <div className="weight-pair"><label>Min weight<input type="number" min="80" max="350" value={state.filters.weightMin} onChange={e=>setState(p=>({...p,filters:{...p.filters,weightMin:Number(e.target.value)}}))}/></label><label>Max weight<input type="number" min="80" max="350" value={state.filters.weightMax} onChange={e=>setState(p=>({...p,filters:{...p.filters,weightMax:Number(e.target.value)}}))}/></label></div>
        </div>
        <button className="primary-button wide" onClick={()=>setFilterOpen(false)}>Show {filtered.length} partners</button>
      </section>
    </div>}

    {plannerOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setPlannerOpen(false)}>
      <form className="modal" onSubmit={saveSession}>
        <div className="modal-head"><div><span className="eyebrow">TRAINING BOARD</span><h2>Plan a session</h2></div><button type="button" className="icon-button" onClick={()=>setPlannerOpen(false)}>×</button></div>
        <div className="filter-form">
          <label>Partner<select name="partner" defaultValue={plannerPartner}><option value="">Open / not listed</option>{matchProfiles.map(f=><option value={f.id} key={f.id}>{f.name} · {f.style}</option>)}</select></label>
          <label>Session type<select name="type"><option>Technical sparring</option><option>Drilling</option><option>Pad work</option><option>Open mat</option><option>Wrestling rounds</option><option>Conditioning</option></select></label>
          <div className="weight-pair"><label>Date<input name="date" type="date" required/></label><label>Time<input name="time" type="time"/></label></div>
          <label>Intensity<select name="intensity"><option>Technical / light</option><option>Light–Medium</option><option>Medium</option><option>Hard / fight camp</option></select></label>
          <label>Notes<textarea name="notes" placeholder="Round length, gear, focus, rules, location…"/></label>
        </div>
        <button className="primary-button wide">Add to training board</button>
      </form>
    </div>}

    {toast&&<div className="toast">{toast}</div>}
  </div>;
}

export default App;
