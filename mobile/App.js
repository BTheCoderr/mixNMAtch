import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  availabilities,
  createSession,
  defaultFilters,
  defaultProfile,
  fighters,
  filterFighters,
  intensityDefinitions,
  levels,
  sessionStatuses,
  sessionTypes,
  styles,
} from '../shared/core.js';

const STORAGE_KEY='mix-n-match-mobile-v1';

const defaultState={
  passed:[],matches:[],blocked:[],sessions:[],
  filters:{...defaultFilters},profile:{...defaultProfile},
  onboardingComplete:false,theme:'dark',lastAction:null
};

const hydrate=saved=>({
  ...defaultState,...saved,
  filters:{...defaultFilters,...(saved?.filters||{})},
  profile:{...defaultProfile,...(saved?.profile||{})},
  passed:Array.isArray(saved?.passed)?saved.passed:[],
  matches:Array.isArray(saved?.matches)?saved.matches:[],
  blocked:Array.isArray(saved?.blocked)?saved.blocked:[],
  sessions:Array.isArray(saved?.sessions)?saved.sessions:[]
});

const Chip=({label,active,onPress})=><Pressable onPress={onPress} style={[ui.chip,active&&ui.chipActive]}>
  <Text style={[ui.chipText,active&&ui.chipTextActive]}>{label}</Text>
</Pressable>;

export default function App(){
  const [state,setState]=useState(defaultState);
  const [loaded,setLoaded]=useState(false);
  const [tab,setTab]=useState('discover');
  const [sessionOpen,setSessionOpen]=useState(false);
  const [sessionPartner,setSessionPartner]=useState('');
  const [draftSession,setDraftSession]=useState({type:'Technical sparring',date:'',time:'',intensity:'Technical',notes:''});

  useEffect(()=>{
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value=>value&&setState(hydrate(JSON.parse(value))))
      .catch(()=>{})
      .finally(()=>setLoaded(true));
  },[]);

  useEffect(()=>{
    if(loaded) AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(state)).catch(()=>{});
  },[state,loaded]);

  const dark=state.theme==='dark';
  const c=dark?palette.dark:palette.light;
  const excluded=[...state.passed,...state.matches,...state.blocked];
  const deck=useMemo(
    ()=>filterFighters(fighters,state.filters,state.profile,excluded),
    [state.filters,state.profile,state.passed,state.matches,state.blocked]
  );
  const current=deck[0];
  const matches=useMemo(
    ()=>filterFighters(
      fighters.filter(f=>state.matches.includes(f.id)),
      {...defaultFilters,distance:100,weightMin:0,weightMax:500},
      state.profile,[]
    ),
    [state.matches,state.profile]
  );
  const completed=state.sessions.filter(s=>s.status==='completed');

  const connect=fighter=>{
    if(!fighter)return;
    setState(p=>({...p,matches:[fighter.id,...p.matches.filter(id=>id!==fighter.id)],lastAction:{type:'match',id:fighter.id}}));
  };
  const pass=fighter=>{
    if(!fighter)return;
    setState(p=>({...p,passed:[...p.passed,fighter.id],lastAction:{type:'pass',id:fighter.id}}));
  };
  const undo=()=>{
    const last=state.lastAction;
    if(!last)return;
    setState(p=>({
      ...p,
      passed:last.type==='pass'?p.passed.filter(id=>id!==last.id):p.passed,
      matches:last.type==='match'?p.matches.filter(id=>id!==last.id):p.matches,
      lastAction:null
    }));
  };
  const block=id=>setState(p=>({
    ...p,matches:p.matches.filter(item=>item!==id),passed:p.passed.filter(item=>item!==id),
    blocked:[...new Set([...p.blocked,id])]
  }));

  const openPlanner=id=>{
    setSessionPartner(id||'');
    setDraftSession({type:'Technical sparring',date:'',time:'',intensity:'Technical',notes:''});
    setSessionOpen(true);
  };

  const addSession=()=>{
    const partner=fighters.find(f=>f.id===sessionPartner);
    const next=createSession({partner,...draftSession});
    setState(p=>({...p,sessions:[next,...p.sessions]}));
    setSessionOpen(false);
    setTab('sessions');
  };

  const setSessionStatus=(id,status)=>setState(p=>({
    ...p,sessions:p.sessions.map(s=>s.id===id?{...s,status}:s)
  }));

  const toggleTheme=()=>setState(p=>({...p,theme:p.theme==='dark'?'light':'dark'}));

  if(!loaded){
    return <SafeAreaView style={[ui.safe,{backgroundColor:c.bg}]}><StatusBar barStyle={dark?'light-content':'dark-content'}/><View style={ui.loading}><Text style={[ui.loadingText,{color:c.text}]}>Mix N' Match</Text></View></SafeAreaView>;
  }

  return <SafeAreaView style={[ui.safe,{backgroundColor:c.bg}]}>
    <StatusBar barStyle={dark?'light-content':'dark-content'}/>
    <View style={[ui.header,{borderBottomColor:c.line}]}>
      <View><Text style={[ui.brand,{color:c.text}]}>Mix N' Match</Text><Text style={[ui.brandSub,{color:c.muted}]}>train better together</Text></View>
      <Pressable onPress={toggleTheme} style={[ui.roundButton,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={{color:c.text,fontSize:18}}>{dark?'☀':'☾'}</Text></Pressable>
    </View>

    <View style={ui.body}>
      {tab==='discover'&&<ScrollView contentContainerStyle={ui.page} showsVerticalScrollIndicator={false}>
        <Text style={ui.eyebrow}>LOCAL TRAINING NETWORK</Text>
        <Text style={[ui.hero,{color:c.text}]}>Find the right rounds.</Text>
        <Text style={[ui.heroMuted,{color:c.muted}]}>Skip the wrong energy.</Text>
        <Text style={[ui.copy,{color:c.muted}]}>Rank partners by style, size, experience, availability, goals, preferred pace, and distance.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.chipStrip}>
          {styles.map(item=><Chip key={item} label={item} active={state.filters.style===item} onPress={()=>setState(p=>({...p,filters:{...p.filters,style:item}}))}/>)}
        </ScrollView>

        <View style={ui.statRow}>
          <View style={[ui.stat,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={[ui.statLabel,{color:c.muted}]}>Matches</Text><Text style={[ui.statValue,{color:c.text}]}>{state.matches.length}</Text></View>
          <View style={[ui.stat,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={[ui.statLabel,{color:c.muted}]}>Completed</Text><Text style={[ui.statValue,{color:c.text}]}>{completed.length}</Text></View>
          <View style={[ui.stat,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={[ui.statLabel,{color:c.muted}]}>Radius</Text><Text style={[ui.statValue,{color:c.text}]}>{state.filters.distance}mi</Text></View>
        </View>

        {current?<View style={[ui.fighterCard,{backgroundColor:c.panel,borderColor:c.line}]}>
          <View style={ui.fighterHero}>
            <View style={ui.avatarLarge}><Text style={ui.avatarText}>{current.initials}</Text></View>
            <View style={ui.matchBadge}><Text style={ui.matchBadgeText}>{current.compatibility.score}% MATCH</Text></View>
            <View style={ui.fighterTitleWrap}>
              <Text style={ui.fighterLocation}>{current.city} · {current.distance} mi {current.verified?'· ✓ verified':''}</Text>
              <Text style={ui.fighterName}>{current.name}, {current.age}</Text>
              <Text style={ui.fighterStyle}>{current.style} + {current.cross}</Text>
            </View>
          </View>

          <View style={ui.cardBody}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.reasons}>
              {current.compatibility.reasons.map(reason=><View key={reason} style={ui.reason}><Text style={ui.reasonText}>✓ {reason}</Text></View>)}
            </ScrollView>
            <View style={ui.detailChips}>
              {[current.level,current.weight+' lb',current.intensity,current.stance].map(item=><View key={item} style={[ui.softChip,{backgroundColor:c.panel2,borderColor:c.line}]}><Text style={[ui.softChipText,{color:c.muted}]}>{item}</Text></View>)}
            </View>
            <Text style={[ui.bio,{color:c.muted}]}>{current.bio}</Text>
            <View style={[ui.infoGrid,{borderColor:c.line}]}>
              <Info label="Goal" value={current.goal} c={c}/>
              <Info label="Available" value={current.availability.join(' · ')} c={c}/>
              <Info label="Experience" value={current.yearsTraining+' yrs · '+current.competition} c={c}/>
              <Info label="Rounds" value={current.roundLength+' · '+current.contactLevel} c={c}/>
              <Info label="Gym" value={current.gym} c={c}/>
              <Info label="Gear" value={current.gear} c={c}/>
            </View>
          </View>

          <View style={[ui.actions,{borderTopColor:c.line}]}>
            <Pressable onPress={undo} style={[ui.actionSmall,{borderColor:c.line,backgroundColor:c.panel2}]}><Text style={ui.undo}>↶</Text></Pressable>
            <Pressable onPress={()=>pass(current)} style={[ui.actionBig,{borderColor:c.line,backgroundColor:c.panel2}]}><Text style={ui.pass}>×</Text><Text style={[ui.actionLabel,{color:c.muted}]}>PASS</Text></Pressable>
            <Pressable onPress={()=>connect(current)} style={[ui.actionBig,{borderColor:c.line,backgroundColor:c.panel2}]}><Text style={ui.connect}>＋</Text><Text style={[ui.actionLabel,{color:c.muted}]}>CONNECT</Text></Pressable>
          </View>
        </View>:<View style={[ui.empty,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={ui.emptyIcon}>✓</Text><Text style={[ui.emptyTitle,{color:c.text}]}>You cleared the deck.</Text><Text style={[ui.copy,{color:c.muted}]}>Change your style filter or restore skipped profiles.</Text><Pressable style={ui.primary} onPress={()=>setState(p=>({...p,passed:[],lastAction:null}))}><Text style={ui.primaryText}>Restore skipped</Text></Pressable></View>}

        <View style={[ui.safety,{backgroundColor:c.panel,borderColor:c.line}]}>
          <Text style={ui.eyebrow}>BEFORE YOU TRAIN</Text>
          <Text style={[ui.sectionTitle,{color:c.text}]}>Set the round before the round sets you.</Text>
          <Safety number="1" title="Agree on intensity" text="Define pace, contact, and techniques before the bell." c={c}/>
          <Safety number="2" title="Name the rules" text="Round length, gear, and anything off-limits." c={c}/>
          <Safety number="3" title="Use a real training space" text="Prefer gyms and supervised environments over private locations." c={c}/>
        </View>
      </ScrollView>}

      {tab==='matches'&&<ScrollView contentContainerStyle={ui.page} showsVerticalScrollIndicator={false}>
        <Text style={ui.eyebrow}>YOUR NETWORK</Text><Text style={[ui.pageTitle,{color:c.text}]}>Training matches</Text>
        <Text style={[ui.copy,{color:c.muted}]}>Scores automatically update when your training profile changes.</Text>
        {matches.length?matches.map(f=><View key={f.id} style={[ui.listCard,{backgroundColor:c.panel,borderColor:c.line}]}>
          <View style={ui.matchHead}><View style={ui.avatar}><Text style={ui.avatarSmallText}>{f.initials}</Text></View><View style={ui.flex}><Text style={[ui.cardTitle,{color:c.text}]}>{f.name}</Text><Text style={[ui.cardMeta,{color:c.muted}]}>{f.style} · {f.weight} lb · {f.distance} mi</Text></View><Text style={ui.score}>{f.compatibility.score}%</Text></View>
          <View style={ui.detailChips}>{f.compatibility.reasons.slice(0,3).map(reason=><View key={reason} style={ui.reason}><Text style={ui.reasonText}>✓ {reason}</Text></View>)}</View>
          <Text style={[ui.bio,{color:c.muted}]}>{f.bio}</Text>
          <View style={ui.buttonRow}><Pressable style={[ui.primary,ui.flex]} onPress={()=>openPlanner(f.id)}><Text style={ui.primaryText}>Plan session</Text></Pressable><Pressable style={[ui.secondary,{borderColor:c.line}]} onPress={()=>block(f.id)}><Text style={[ui.secondaryText,{color:c.muted}]}>Hide</Text></Pressable></View>
        </View>):<Empty title="No matches yet" copy="Connect with someone from Discover and they’ll appear here." c={c}/>}
      </ScrollView>}

      {tab==='sessions'&&<ScrollView contentContainerStyle={ui.page} showsVerticalScrollIndicator={false}>
        <Text style={ui.eyebrow}>TRAINING BOARD</Text><Text style={[ui.pageTitle,{color:c.text}]}>Sessions & history</Text>
        <View style={ui.statRow}><View style={[ui.stat,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={[ui.statLabel,{color:c.muted}]}>Completed</Text><Text style={[ui.statValue,{color:c.text}]}>{completed.length}</Text></View><View style={[ui.stat,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={[ui.statLabel,{color:c.muted}]}>Active</Text><Text style={[ui.statValue,{color:c.text}]}>{state.sessions.filter(s=>['proposed','accepted'].includes(s.status)).length}</Text></View></View>
        <Pressable style={ui.primary} onPress={()=>openPlanner('')}><Text style={ui.primaryText}>＋ Propose a session</Text></Pressable>
        <View style={{height:12}}/>
        {state.sessions.length?state.sessions.map(s=><View key={s.id} style={[ui.listCard,{backgroundColor:c.panel,borderColor:c.line}]}>
          <Text style={ui.eyebrow}>{s.type}</Text><Text style={[ui.cardTitle,{color:c.text}]}>{s.partnerName}</Text>
          <Text style={[ui.cardMeta,{color:c.muted}]}>{s.date||'Date TBD'} {s.time? '· '+s.time:''} · {s.intensity}</Text>
          {!!s.notes&&<Text style={[ui.bio,{color:c.muted}]}>{s.notes}</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.chipStrip}>
            {sessionStatuses.map(status=><Chip key={status.id} label={status.label} active={s.status===status.id} onPress={()=>setSessionStatus(s.id,status.id)}/>)}
          </ScrollView>
        </View>):<Empty title="Your board is empty" copy="Plan technical work, drilling, open mat, or sparring rounds." c={c}/>}
      </ScrollView>}

      {tab==='profile'&&<ScrollView contentContainerStyle={ui.page} keyboardShouldPersistTaps="handled">
        <Text style={ui.eyebrow}>YOUR TRAINING PROFILE</Text><Text style={[ui.pageTitle,{color:c.text}]}>Tune the match engine</Text>
        <Text style={[ui.copy,{color:c.muted}]}>Profile data stays on this device in the current local-first build.</Text>
        <View style={[ui.listCard,{backgroundColor:c.panel,borderColor:c.line}]}>
          <Field label="Name" value={state.profile.name} onChangeText={value=>setState(p=>({...p,profile:{...p.profile,name:value}}))} c={c}/>
          <Field label="Weight (lb)" keyboardType="numeric" value={String(state.profile.weight)} onChangeText={value=>setState(p=>({...p,profile:{...p.profile,weight:Number(value)||0}}))} c={c}/>
          <Field label="Years training" keyboardType="numeric" value={String(state.profile.yearsTraining)} onChangeText={value=>setState(p=>({...p,profile:{...p.profile,yearsTraining:Number(value)||0}}))} c={c}/>
          <Field label="Goal" value={state.profile.goal} onChangeText={value=>setState(p=>({...p,profile:{...p.profile,goal:value}}))} c={c}/>
          <Field label="Home gym" value={state.profile.homeGym} onChangeText={value=>setState(p=>({...p,profile:{...p.profile,homeGym:value}}))} c={c}/>

          <Text style={[ui.fieldLabel,{color:c.muted}]}>PRIMARY STYLE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.chipStrip}>{styles.filter(x=>x!=='All').map(item=><Chip key={item} label={item} active={state.profile.style===item} onPress={()=>setState(p=>({...p,profile:{...p.profile,style:item}}))}/>)}</ScrollView>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>EXPERIENCE</Text>
          <View style={ui.wrap}>{levels.filter(x=>x!=='All').map(item=><Chip key={item} label={item} active={state.profile.level===item} onPress={()=>setState(p=>({...p,profile:{...p.profile,level:item}}))}/>)}</View>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>BEST AVAILABILITY</Text>
          <View style={ui.wrap}>{availabilities.map(item=><Chip key={item} label={item} active={state.profile.availability.includes(item)} onPress={()=>setState(p=>({...p,profile:{...p.profile,availability:[item]}}))}/>)}</View>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>PREFERRED INTENSITY</Text>
          <View style={ui.wrap}>{Object.keys(intensityDefinitions).map(item=><Chip key={item} label={item} active={state.profile.intensity===item} onPress={()=>setState(p=>({...p,profile:{...p.profile,intensity:item}}))}/>)}</View>
        </View>
        <View style={[ui.safety,{backgroundColor:c.panel,borderColor:c.line}]}>
          <View style={ui.switchRow}><View style={ui.flex}><Text style={[ui.cardTitle,{color:c.text}]}>Gym-verified profiles only</Text><Text style={[ui.cardMeta,{color:c.muted}]}>Filter discovery to demo profiles marked as gym verified.</Text></View><Switch value={state.filters.verifiedOnly} onValueChange={value=>setState(p=>({...p,filters:{...p.filters,verifiedOnly:value}}))} trackColor={{true:'#f44b2e'}}/></View>
        </View>
        <Pressable onPress={()=>Alert.alert('Reset local data?','This clears matches, sessions, filters, and your local profile.',[{text:'Cancel',style:'cancel'},{text:'Reset',style:'destructive',onPress:async()=>{await AsyncStorage.removeItem(STORAGE_KEY);setState(defaultState);setTab('discover')}}])} style={[ui.secondary,{borderColor:c.line,alignSelf:'stretch'}]}><Text style={[ui.secondaryText,{color:c.muted}]}>Reset local data</Text></Pressable>
      </ScrollView>}
    </View>

    <View style={[ui.tabbar,{backgroundColor:c.panel,borderTopColor:c.line}]}>
      {[
        ['discover','⌁','Discover'],['matches','＋','Matches'],['sessions','◫','Sessions'],['profile','○','Profile']
      ].map(([id,icon,label])=><Pressable key={id} onPress={()=>setTab(id)} style={ui.tab}><Text style={[ui.tabIcon,{color:tab===id?'#f44b2e':c.muted}]}>{icon}</Text><Text style={[ui.tabLabel,{color:tab===id?'#f44b2e':c.muted}]}>{label}</Text></Pressable>)}
    </View>

    <Modal visible={!state.onboardingComplete} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[ui.safe,{backgroundColor:c.bg}]}>
        <ScrollView contentContainerStyle={ui.onboarding}>
          <View style={ui.avatarLarge}><Text style={ui.avatarText}>M</Text></View>
          <Text style={ui.eyebrow}>FIRST ROUND</Text>
          <Text style={[ui.pageTitle,{color:c.text,textAlign:'center'}]}>Tune your training deck.</Text>
          <Text style={[ui.copy,{color:c.muted,textAlign:'center'}]}>Choose a few basics and Mix N' Match will rank compatible training partners instead of showing a random swipe deck.</Text>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>PRIMARY STYLE</Text>
          <View style={ui.wrap}>{styles.filter(x=>x!=='All').map(item=><Chip key={item} label={item} active={state.profile.style===item} onPress={()=>setState(p=>({...p,profile:{...p.profile,style:item}}))}/>)}</View>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>EXPERIENCE</Text>
          <View style={ui.wrap}>{levels.filter(x=>x!=='All').map(item=><Chip key={item} label={item} active={state.profile.level===item} onPress={()=>setState(p=>({...p,profile:{...p.profile,level:item}}))}/>)}</View>
          <Field label="WEIGHT (LB)" keyboardType="numeric" value={String(state.profile.weight)} onChangeText={value=>setState(p=>({...p,profile:{...p.profile,weight:Number(value)||0}}))} c={c}/>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>BEST AVAILABILITY</Text>
          <View style={ui.wrap}>{availabilities.map(item=><Chip key={item} label={item} active={state.profile.availability.includes(item)} onPress={()=>setState(p=>({...p,profile:{...p.profile,availability:[item]}}))}/>)}</View>
          <Pressable style={[ui.primary,{alignSelf:'stretch',marginTop:12}]} onPress={()=>setState(p=>({...p,onboardingComplete:true}))}><Text style={ui.primaryText}>Build my deck</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>

    <Modal visible={sessionOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setSessionOpen(false)}>
      <SafeAreaView style={[ui.safe,{backgroundColor:c.bg}]}>
        <ScrollView contentContainerStyle={ui.page} keyboardShouldPersistTaps="handled">
          <View style={ui.modalHead}><View><Text style={ui.eyebrow}>TRAINING BOARD</Text><Text style={[ui.pageTitle,{color:c.text}]}>Propose a session</Text></View><Pressable onPress={()=>setSessionOpen(false)} style={[ui.roundButton,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={{color:c.text,fontSize:20}}>×</Text></Pressable></View>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>PARTNER</Text>
          <View style={ui.wrap}><Chip label="Open / not listed" active={!sessionPartner} onPress={()=>setSessionPartner('')}/>{matches.map(f=><Chip key={f.id} label={f.name} active={sessionPartner===f.id} onPress={()=>setSessionPartner(f.id)}/>)}</View>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>SESSION TYPE</Text>
          <View style={ui.wrap}>{sessionTypes.map(item=><Chip key={item} label={item} active={draftSession.type===item} onPress={()=>setDraftSession(p=>({...p,type:item}))}/>)}</View>
          <Text style={[ui.fieldLabel,{color:c.muted}]}>INTENSITY</Text>
          <View style={ui.wrap}>{Object.keys(intensityDefinitions).map(item=><Chip key={item} label={item} active={draftSession.intensity===item} onPress={()=>setDraftSession(p=>({...p,intensity:item}))}/>)}</View>
          <Field label="DATE (YYYY-MM-DD)" value={draftSession.date} onChangeText={value=>setDraftSession(p=>({...p,date:value}))} c={c}/>
          <Field label="TIME" value={draftSession.time} onChangeText={value=>setDraftSession(p=>({...p,time:value}))} c={c}/>
          <Field label="NOTES" multiline value={draftSession.notes} onChangeText={value=>setDraftSession(p=>({...p,notes:value}))} c={c}/>
          <Pressable style={[ui.primary,{alignSelf:'stretch',marginTop:10}]} onPress={addSession}><Text style={ui.primaryText}>Add proposed session</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </SafeAreaView>;
}

function Info({label,value,c}){
  return <View style={[ui.infoCell,{borderColor:c.line}]}><Text style={[ui.infoLabel,{color:c.muted}]}>{label.toUpperCase()}</Text><Text style={[ui.infoValue,{color:c.text}]}>{value}</Text></View>;
}
function Safety({number,title,text,c}){
  return <View style={ui.safetyRow}><View style={ui.safetyNumber}><Text style={ui.safetyNumberText}>{number}</Text></View><View style={ui.flex}><Text style={[ui.cardTitle,{color:c.text}]}>{title}</Text><Text style={[ui.cardMeta,{color:c.muted}]}>{text}</Text></View></View>;
}
function Field({label,c,...props}){
  return <View style={ui.field}><Text style={[ui.fieldLabel,{color:c.muted}]}>{label}</Text><TextInput {...props} placeholderTextColor={c.muted} style={[ui.input,{color:c.text,backgroundColor:c.panel2,borderColor:c.line},props.multiline&&ui.multiline]}/></View>;
}
function Empty({title,copy,c}){
  return <View style={[ui.empty,{backgroundColor:c.panel,borderColor:c.line}]}><Text style={ui.emptyIcon}>＋</Text><Text style={[ui.emptyTitle,{color:c.text}]}>{title}</Text><Text style={[ui.copy,{color:c.muted,textAlign:'center'}]}>{copy}</Text></View>;
}

const palette={
  dark:{bg:'#090b0e',panel:'#101319',panel2:'#161a22',text:'#f7f8fa',muted:'#8d96a5',line:'#252b35'},
  light:{bg:'#f2f4f6',panel:'#ffffff',panel2:'#f7f8fa',text:'#17191d',muted:'#6f7885',line:'#dce1e6'}
};

const ui=StyleSheet.create({
  safe:{flex:1},loading:{flex:1,alignItems:'center',justifyContent:'center'},loadingText:{fontSize:24,fontWeight:'900'},
  header:{height:58,paddingHorizontal:16,borderBottomWidth:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  brand:{fontSize:16,fontWeight:'900'},brandSub:{fontSize:9,marginTop:1},roundButton:{width:40,height:40,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center'},
  body:{flex:1},page:{padding:16,paddingBottom:30},eyebrow:{fontSize:9,color:'#f44b2e',fontWeight:'900',letterSpacing:1.3},
  hero:{fontSize:38,fontWeight:'900',letterSpacing:-1.8,marginTop:8},heroMuted:{fontSize:38,fontWeight:'900',letterSpacing:-1.8,marginTop:-3},
  pageTitle:{fontSize:31,fontWeight:'900',letterSpacing:-1.2,marginTop:6,marginBottom:4},copy:{fontSize:12,lineHeight:19,marginTop:8},
  chipStrip:{gap:7,paddingVertical:12},chip:{paddingHorizontal:11,paddingVertical:8,borderRadius:999,borderWidth:1,borderColor:'#2b313b',backgroundColor:'#151a21'},
  chipActive:{backgroundColor:'#f44b2e',borderColor:'#f44b2e'},chipText:{fontSize:10,fontWeight:'800',color:'#9aa4b3'},chipTextActive:{color:'#fff'},
  statRow:{flexDirection:'row',gap:8,marginVertical:12},stat:{flex:1,padding:12,borderRadius:14,borderWidth:1},statLabel:{fontSize:8,textTransform:'uppercase',letterSpacing:.6},statValue:{fontSize:20,fontWeight:'900',marginTop:4},
  fighterCard:{borderRadius:24,borderWidth:1,overflow:'hidden'},fighterHero:{height:270,backgroundColor:'#151b23',alignItems:'center',justifyContent:'center',position:'relative'},
  avatarLarge:{width:118,height:118,borderRadius:36,backgroundColor:'#f44b2e',alignItems:'center',justifyContent:'center',transform:[{rotate:'-4deg'}]},
  avatarText:{fontSize:38,fontWeight:'900',color:'#fff'},matchBadge:{position:'absolute',top:16,left:16,paddingHorizontal:10,paddingVertical:7,borderRadius:999,backgroundColor:'#17382b'},
  matchBadgeText:{fontSize:9,fontWeight:'900',color:'#7aefb1'},fighterTitleWrap:{position:'absolute',left:18,right:18,bottom:17},
  fighterLocation:{fontSize:9,color:'#d3d8e0'},fighterName:{fontSize:31,fontWeight:'900',color:'#fff',letterSpacing:-1,marginTop:3},fighterStyle:{fontSize:12,color:'#d3d8e0',marginTop:3},
  cardBody:{padding:16},reasons:{gap:7,paddingBottom:10},reason:{paddingHorizontal:8,paddingVertical:6,borderRadius:999,backgroundColor:'#17382b'},reasonText:{fontSize:9,fontWeight:'800',color:'#75e9aa'},
  detailChips:{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:8},softChip:{borderRadius:999,borderWidth:1,paddingHorizontal:8,paddingVertical:6},softChipText:{fontSize:9,fontWeight:'700'},
  bio:{fontSize:11,lineHeight:17,marginVertical:8},infoGrid:{flexDirection:'row',flexWrap:'wrap',borderTopWidth:1,borderLeftWidth:1,marginTop:8},
  infoCell:{width:'50%',padding:10,borderRightWidth:1,borderBottomWidth:1},infoLabel:{fontSize:7,letterSpacing:.5},infoValue:{fontSize:10,fontWeight:'800',marginTop:4,lineHeight:14},
  actions:{borderTopWidth:1,padding:13,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:16},actionSmall:{width:42,height:42,borderRadius:21,borderWidth:1,alignItems:'center',justifyContent:'center'},
  actionBig:{width:66,height:66,borderRadius:33,borderWidth:1,alignItems:'center',justifyContent:'center'},undo:{fontSize:22,color:'#f1b54c'},pass:{fontSize:28,color:'#ff7180'},connect:{fontSize:28,color:'#57d69a'},actionLabel:{fontSize:7,fontWeight:'800'},
  safety:{borderWidth:1,borderRadius:20,padding:16,marginTop:14},sectionTitle:{fontSize:19,fontWeight:'900',lineHeight:23,marginTop:5,marginBottom:10},safetyRow:{flexDirection:'row',gap:10,marginTop:11},safetyNumber:{width:30,height:30,borderRadius:9,backgroundColor:'#211815',alignItems:'center',justifyContent:'center'},safetyNumberText:{color:'#f44b2e',fontSize:10,fontWeight:'900'},
  listCard:{borderWidth:1,borderRadius:18,padding:15,marginTop:10},matchHead:{flexDirection:'row',alignItems:'center',gap:10},avatar:{width:48,height:48,borderRadius:15,backgroundColor:'#f44b2e',alignItems:'center',justifyContent:'center'},avatarSmallText:{fontSize:13,fontWeight:'900',color:'#fff'},flex:{flex:1},
  cardTitle:{fontSize:14,fontWeight:'900'},cardMeta:{fontSize:9,lineHeight:14,marginTop:3},score:{fontSize:14,fontWeight:'900',color:'#57d69a'},buttonRow:{flexDirection:'row',gap:8,marginTop:8},
  primary:{minHeight:44,borderRadius:12,backgroundColor:'#f44b2e',alignItems:'center',justifyContent:'center',paddingHorizontal:14},primaryText:{fontSize:10,fontWeight:'900',color:'#fff'},
  secondary:{minHeight:44,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center',paddingHorizontal:14},secondaryText:{fontSize:10,fontWeight:'800'},
  empty:{borderRadius:20,borderWidth:1,padding:32,alignItems:'center',marginTop:12},emptyIcon:{fontSize:38,color:'#57d69a'},emptyTitle:{fontSize:20,fontWeight:'900',marginTop:10},
  field:{marginTop:13},fieldLabel:{fontSize:8,fontWeight:'900',letterSpacing:.7,marginBottom:6},input:{minHeight:46,borderRadius:11,borderWidth:1,paddingHorizontal:12,fontSize:12},multiline:{minHeight:96,paddingTop:12,textAlignVertical:'top'},
  wrap:{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:6},switchRow:{flexDirection:'row',alignItems:'center',gap:12},
  tabbar:{height:66,borderTopWidth:1,flexDirection:'row'},tab:{flex:1,alignItems:'center',justifyContent:'center'},tabIcon:{fontSize:18},tabLabel:{fontSize:8,fontWeight:'800',marginTop:2},
  onboarding:{padding:22,paddingTop:38,alignItems:'center'},modalHead:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between'},
});
