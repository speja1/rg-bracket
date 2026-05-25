// fetch-results.js for Roland Garros 2026 — Run with: node fetch-results.js
// Primary source: ESPN scoreboard API
// Verification source: https://www.rolandgarros.com/en-us/matches
// Draw verification: https://www.atptour.com/en/scores/current/roland-garros/520/draws
// If you see NO MATCH errors, cross-reference draw on ATP website above

const FIREBASE_KEY  = 'AIzaSyAy8L1XOEVMVVzcnG_n3U51lFHCFfpTCVM';
const PROJECT_ID    = 'roland-garros-6b9f6';
const TOURNAMENT_ID = 'roland-garros-2026';
const ESPN_ATP      = 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard';
const TOURNEY_NAMES = ['roland','french open','roland garros','roland-garros'];
const TOURNEY_START = '20260524';
const TOURNEY_END   = '20260607';

const ROUND_ORDER = ['R128','R64','R32','R16','QF','SF','F'];

const ATP_DRAW = [
  {id:'m01',p1:'Sinner J.',p2:'Tabur C.',bye:false},
  {id:'m02',p1:'Fearnley J.',p2:'Cerundolo J.',bye:false},
  {id:'m03',p1:'Landaluce M.',p2:'Prado Angelo J.',bye:false},
  {id:'m04',p1:'Moutet C.',p2:'Kopriva V.',bye:false},
  {id:'m05',p1:'Rinderknech A.',p2:'Rodionov J.',bye:false},
  {id:'m06',p1:'Fucsovics M.',p2:'Berrettini M.',bye:false},
  {id:'m07',p1:'Quinn E.',p2:'Comesana F.',bye:false},
  {id:'m08',p1:'Darderi L.',p2:'Ofner S.',bye:false},
  {id:'m09',p1:'Bublik A.',p2:'Struff J.',bye:false},
  {id:'m10',p1:'Shapovalov D.',p2:'Faria J.',bye:false},
  {id:'m11',p1:'Munar J.',p2:'Hurkacz H.',bye:false},
  {id:'m12',p1:'Tiafoe F.',p2:'Spizzirri E.',bye:false},
  {id:'m13',p1:'Griekspoor T.',p2:'Arnaldi M.',bye:false},
  {id:'m14',p1:'Muller A.',p2:'Tsitsipas S.',bye:false},
  {id:'m15',p1:'Vukic A.',p2:'Collignon R.',bye:false},
  {id:'m16',p1:'Shelton B.',p2:'Merida D.',bye:false},
  {id:'m17',p1:'Auger-Aliassime F.',p2:'Altmaier D.',bye:false},
  {id:'m18',p1:'Baez S.',p2:'Burruchaga R.',bye:false},
  {id:'m19',p1:'Van Assche L.',p2:'Kypson P.',bye:false},
  {id:'m20',p1:'Nakashima B.',p2:'Bautista Agut R.',bye:false},
  {id:'m21',p1:'Norrie C.',p2:'Vallejo A.',bye:false},
  {id:'m22',p1:'Cilic M.',p2:'Kouame M.',bye:false},
  {id:'m23',p1:'Tabilo A.',p2:'Majchrzak K.',bye:false},
  {id:'m24',p1:'Vacherot V.',p2:'Faurel T.',bye:false},
  {id:'m25',p1:'Cobolli F.',p2:'Pellegrino A.',bye:false},
  {id:'m26',p1:'Wu Y.',p2:'Giron M.',bye:false},
  {id:'m27',p1:'Zhang Z.',p2:'Diaz Acosta F.',bye:false},
  {id:'m28',p1:'Tien L.',p2:'Garin C.',bye:false},
  {id:'m29',p1:'Cerundolo F.',p2:'Van de Zandschulp B.',bye:false},
  {id:'m30',p1:'Gaston H.',p2:'Monfils G.',bye:false},
  {id:'m31',p1:'Popyrin A.',p2:'Svajda Z.',bye:false},
  {id:'m32',p1:'Medvedev D.',p2:'Walton A.',bye:false},
  {id:'m33',p1:'De Minaur A.',p2:'Samuel T.',bye:false},
  {id:'m34',p1:'Blockx A.',p2:'Wong C.',bye:false},
  {id:'m35',p1:'Navone M.',p2:'Brooksby J.',bye:false},
  {id:'m36',p1:'Mensik J.',p2:'Droguet T.',bye:false},
  {id:'m37',p1:'Etcheverry T.',p2:'Borges N.',bye:false},
  {id:'m38',p1:'Kecmanovic M.',p2:'Marozsan F.',bye:false},
  {id:'m39',p1:'Ugo Carabelli C.',p2:'Nava E.',bye:false},
  {id:'m40',p1:'Rublev A.',p2:'Buse I.',bye:false},
  {id:'m41',p1:'Ruud C.',p2:'Safiullin R.',bye:false},
  {id:'m42',p1:'Medjedovic H.',p2:'Hanfmann Y.',bye:false},
  {id:'m43',p1:'Sonego L.',p2:'Herbert P.',bye:false},
  {id:'m44',p1:'Paul T.',p2:'Hijikata R.',bye:false},
  {id:'m45',p1:'Fonseca J.',p2:'Pavlovic L.',bye:false},
  {id:'m46',p1:'Prizmic D.',p2:'Zheng M.',bye:false},
  {id:'m47',p1:'Royer V.',p2:'Dellien H.',bye:false},
  {id:'m48',p1:'Mpetshi Perricard G.',p2:'Djokovic N.',bye:false},
  {id:'m49',p1:'Fritz T.',p2:'Basavareddy N.',bye:false},
  {id:'m50',p1:'Shevchenko A.',p2:'Michelsen A.',bye:false},
  {id:'m51',p1:'Duckworth J.',p2:'Diallo G.',bye:false},
  {id:'m52',p1:'Kovacevic A.',p2:'Jodar R.',bye:false},
  {id:'m53',p1:'Davidovich Fokina A.',p2:'Dzumhur D.',bye:false},
  {id:'m54',p1:'Llamas Ruiz P.',p2:'Tirante T.',bye:false},
  {id:'m55',p1:'Kokkinakis T.',p2:'Atmane T.',bye:false},
  {id:'m56',p1:'Carreno Busta P.',p2:'Lehecka J.',bye:false},
  {id:'m57',p1:'Khachanov K.',p2:'Gea A.',bye:false},
  {id:'m58',p1:'Jacquet K.',p2:'Trungelliti M.',bye:false},
  {id:'m59',p1:'Opelka R.',p2:'Cina F.',bye:false},
  {id:'m60',p1:'de Jong J.',p2:'Wawrinka S.',bye:false},
  {id:'m61',p1:'Humbert U.',p2:'Mannarino A.',bye:false},
  {id:'m62',p1:'Halys Q.',p2:'Bellucci M.',bye:false},
  {id:'m63',p1:'Machac T.',p2:'Bergs Z.',bye:false},
  {id:'m64',p1:'Bonzi B.',p2:'Zverev A.',bye:false},
];

function toks(s){
  if(!s)return new Set();
  // Normalize accented chars: é→e, ž→z, ć→c, etc.
  const norm=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  return new Set(norm.toLowerCase().replace(/[^a-z0-9]/g,' ').split(/\s+/).filter(w=>w.length>1));
}
function nm(a,b){const ta=toks(a),tb=toks(b);for(const t of ta)if(tb.has(t))return true;return false;}
function matchAny(bn,...ns){return ns.some(n=>n&&nm(bn,n));}
function parseScore(str){if(!str)return[];return str.trim().split(/\s+/).map(s=>{const m=s.match(/^(\d+)-(\d+)(?:\((\d+)\))?$/);return m?{mine:+m[1],opp:+m[2],tb:m[3]!=null?+m[3]:null}:null;}).filter(Boolean);}

function buildTree(draw){
  const rounds=[{key:'R128',slots:draw.map(m=>({id:m.id,p1:m.p1,p2:m.p2,bye:m.bye||false}))}];
  let prev=rounds[0].slots,roundIdx=1;
  while(prev.length>1){
    const next=[];
    for(let i=0;i<prev.length;i+=2){
      // ESPN uses the index of the LEFT feeder slot as the match ID
      // In R64: feeder indices are 0,2,4,6... (each R128 match pair)
      // In R32: feeder indices are 0,2,4,6... (each R64 match pair, ESPN-numbered)
      // So we track the ESPN-style index based on position in the round
      const espnIdx = i * Math.pow(2, roundIdx-1);
      next.push({id:`g${roundIdx}_${espnIdx}`,p1:'TBD',p2:'TBD'});
    }
    rounds.push({key:ROUND_ORDER[roundIdx]||`R${roundIdx+1}`,slots:next});
    prev=next;roundIdx++;
  }
  return rounds;
}
function cascade(rounds,live){
  for(let p=0;p<8;p++)rounds.forEach((rnd,ri)=>rnd.slots.forEach((s,si)=>{
    // Auto-resolve byes: the non-BYE player always wins
    if(s.bye&&!live[s.id]){
      const byeWinner=s.p2==='BYE'?s.p1:s.p1==='BYE'?s.p2:null;
      if(byeWinner)live[s.id]={p1:s.p1,p2:s.p2,winner:byeWinner,state:'post',completed:true,live:false,scheduled:false,p1Sets:[],p2Sets:[],bye:true,round:'R128',updatedAt:Date.now()};
    }
    const w=live[s.id]?.winner;if(!w||w==='BYE')return;
    const nr=rounds[ri+1];if(!nr)return;
    const ns=nr.slots[Math.floor(si/2)];if(!ns)return;
    if(si%2===0)ns.p1=w;else ns.p2=w;
  }));
}

async function fetchDate(date){
  const url=`${ESPN_ATP}?dates=${date}&limit=200`;
  try{
    const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}});
    if(!res.ok)return[];
    const data=await res.json();
    const out=[];
    for(const event of data.events||[]){
      const tname=(event.name||'').toLowerCase();
      if(!TOURNEY_NAMES.some(n=>tname.includes(n)))continue;
      for(const grp of event.groupings||[]){
        const slug=(grp.grouping&&grp.grouping.slug)||'';
        if(slug&&!slug.includes('singles'))continue;
        for(const comp of grp.competitions||[]){
          const comps=[...(comp.competitors||[])].sort((a,b)=>(a.order||0)-(b.order||0));
          if(comps.length!==2)continue;
          const[c1,c2]=comps;
          const st=(comp.status&&comp.status.type)||{};
          const completed=!!(st.completed);
          let winnerComp=comps.find(c=>c.winner);
          const c1LS=c1.linescores||[],c2LS=c2.linescores||[];
          if(!winnerComp&&completed&&c1LS.length>0){
            const s1=c1LS.filter((s,i)=>Math.round(s.value||0)>Math.round((c2LS[i]||{}).value||0)).length;
            const s2=c2LS.filter((s,i)=>Math.round(s.value||0)>Math.round((c1LS[i]||{}).value||0)).length;
            if(s1>s2)winnerComp=c1;else if(s2>s1)winnerComp=c2;
          }
          const c1Sets=c1LS.map((s,i)=>({mine:Math.round(s.value??0),opp:Math.round((c2LS[i]||{}).value??0),tb:s.tiebreak??((c2LS[i]||{}).tiebreak??null)}));
          const c2Sets=c2LS.map((s,i)=>({mine:Math.round(s.value??0),opp:Math.round((c1LS[i]||{}).value??0),tb:s.tiebreak??((c1LS[i]||{}).tiebreak??null)}));
          // Filter out qualifying rounds — only keep main draw matches
          const roundName=((comp.round&&comp.round.displayName)||grp?.grouping?.displayName||'').toLowerCase();
          if(roundName.includes('qualify')||roundName.includes('q1')||roundName.includes('q2')||roundName.includes('q3'))continue;
          out.push({
            espnId:comp.id,
            p1Short:(c1.athlete&&c1.athlete.shortName)||'',p1Full:(c1.athlete&&c1.athlete.fullName)||'',
            p2Short:(c2.athlete&&c2.athlete.shortName)||'',p2Full:(c2.athlete&&c2.athlete.fullName)||'',
            winnerShort:winnerComp?(winnerComp.athlete&&winnerComp.athlete.shortName)||null:null,
            winnerFull:winnerComp?(winnerComp.athlete&&winnerComp.athlete.fullName)||null:null,
            c1Score:c1.score||'',c2Score:c2.score||'',c1Sets,c2Sets,
            state:st.state||'unknown',completed,live:st.state==='in',scheduled:st.state==='pre',
            serving:c1.serve?'p1':c2.serve?'p2':null,scheduledTime:comp.date||null,timeValid:!!(comp.timeValid),
            roundName,
          });
        }
      }
    }
    return out;
  }catch(e){console.error(`ESPN ${date}:`,e.message);return[];}
}

async function fsWrite(fields){
  const url=`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/meta/live_${TOURNAMENT_ID}?key=${FIREBASE_KEY}`;
  const body={fields:{}};
  for(const[k,v]of Object.entries(fields))body.fields[k]={stringValue:typeof v==='string'?v:JSON.stringify(v)};
  const res=await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  return res.ok;
}

async function fetchAtpResults(){
  // Scrape ATP official results page for R128 completions
  // Returns map of "PlayerLastName" -> winner true/false for completed matches
  try{
    const res=await fetch('https://www.rolandgarros.com/en-us/matches',
      {headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}});
    if(!res.ok)return{};
    const html=await res.text();
    // Extract winner names from "d. PlayerName" patterns
    const winners={};
    const matches=html.matchAll(/([A-Z][a-z][\w\s\-]+?)\s+d\.\s+([A-Z][a-z][\w\s\-]+?)\s+\d/g);
    for(const m of matches){
      const w=m[1].trim().split(/\s+/).pop(); // last name
      winners[w.toLowerCase()]=true;
    }
    return winners;
  }catch(e){return{};}
}

async function main(){
  console.log('Fetching ESPN data for Roland Garros 2026 (May 24-June 7)...');
  const dates=[];
  for(let d=new Date(TOURNEY_START.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'));
      d<=new Date(TOURNEY_END.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'));
      d.setDate(d.getDate()+1)){
    const y=d.getFullYear(),mo=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
    dates.push(`${y}${mo}${dd}`);
  }
  const results=await Promise.allSettled(dates.map(fetchDate));
  const seen=new Set(),allMatches=[];
  for(const r of results)if(r.status==='fulfilled')for(const m of r.value)if(!seen.has(m.espnId)){seen.add(m.espnId);allMatches.push(m);}
  console.log(`ESPN: ${allMatches.length} matches from Roland Garros`);

  const rounds=buildTree(ATP_DRAW);
  const live={};
  let matched=0,noMatch=0;
  const usedIds=new Set();

  for(const roundKey of ROUND_ORDER){
    cascade(rounds,live);
    const ri=ROUND_ORDER.indexOf(roundKey);
    const slots=rounds[ri]?.slots||[];
    // Skip bye slots (auto-resolved above) and pure-qualifier slots
    const readySlots=slots.filter(s=>
      !s.bye &&
      !(s.p1==='Qualifier'&&s.p2==='Qualifier') &&
      !(s.p1==='TBD'&&s.p2==='TBD')
    );
    console.log(`${roundKey}: ${readySlots.length} slots ready`);

    for(const slot of readySlots){
      if(live[slot.id]?.winner)continue;
      const em=allMatches.find(m=>{
        if(usedIds.has(m.espnId)||(!m.p1Short&&!m.p1Full))return false;
        // Reject qualifying matches (filtered at parse time, but double-check via date)
        if(m.scheduledTime){
          const d=new Date(m.scheduledTime);
          // Qualifying was May 4-5; main draw starts May 6
          if(d<new Date('2026-05-06T00:00:00Z'))return false;
        }
        const p1tbd=slot.p1==='TBD', p2tbd=slot.p2==='TBD';
        if(p1tbd&&p2tbd)return false;
        if(p1tbd){
          return matchAny(slot.p2,m.p1Short,m.p1Full,m.p2Short,m.p2Full);
        }
        if(p2tbd){
          return matchAny(slot.p1,m.p1Short,m.p1Full,m.p2Short,m.p2Full);
        }
        return matchAny(slot.p1,m.p1Short,m.p1Full,m.p2Short,m.p2Full)&&
               matchAny(slot.p2,m.p1Short,m.p2Short,m.p1Full,m.p2Full);
      });
      if(!em){
        const p1t=slot.p1.toLowerCase().replace(/[^a-z]/g,' ').split(/\s+/).filter(w=>w.length>2);
        const found=allMatches.filter(m=>p1t.some(t=>(m.p1Short||'').toLowerCase().includes(t)||(m.p2Short||'').toLowerCase().includes(t)));
        const hint=found.slice(0,2).map(m=>`${m.p1Short}v${m.p2Short}@${(m.scheduledTime||'').slice(0,10)}`).join(', ');
        console.log(`  NO MATCH ${roundKey} ${slot.id}: "${slot.p1}" vs "${slot.p2}"${hint?` → ESPN has: ${hint}`:''}`);
        noMatch++;continue;}
      usedIds.add(em.espnId);matched++;
      // If slot had TBD, fill in actual player from ESPN
      if(slot.p1==='TBD'){
        const espnP1matchesSlotP2=matchAny(slot.p2,em.p1Short,em.p1Full);
        slot.p1=espnP1matchesSlotP2?em.p2Short||em.p2Full:em.p1Short||em.p1Full;
      }
      if(slot.p2==='TBD'){
        const espnP1matchesSlotP1=matchAny(slot.p1,em.p1Short,em.p1Full);
        slot.p2=espnP1matchesSlotP1?em.p2Short||em.p2Full:em.p1Short||em.p1Full;
      }
      const p1IsC1=matchAny(slot.p1,em.p1Short,em.p1Full);
      let winner=null;
      if(em.completed&&(em.winnerShort||em.winnerFull)){
        winner=matchAny(slot.p1,em.winnerShort,em.winnerFull)?slot.p1:matchAny(slot.p2,em.winnerShort,em.winnerFull)?slot.p2:null;
      }
      const p1Sets=p1IsC1?(em.c1Sets.length?em.c1Sets:parseScore(em.c1Score)):(em.c2Sets.length?em.c2Sets:parseScore(em.c2Score));
      const p2Sets=p1IsC1?(em.c2Sets.length?em.c2Sets:parseScore(em.c2Score)):(em.c1Sets.length?em.c1Sets:parseScore(em.c1Score));
      live[slot.id]={p1:slot.p1,p2:slot.p2,winner,state:em.state,completed:em.completed,live:em.live,scheduled:em.scheduled,
        p1Sets,p2Sets,serving:em.serving==='p1'?(p1IsC1?'p1':'p2'):em.serving==='p2'?(p1IsC1?'p2':'p1'):null,
        scheduledTime:em.scheduledTime,timeValid:em.timeValid,round:roundKey,updatedAt:Date.now()};
      console.log(`  ✓ ${roundKey} ${slot.id}: ${slot.p1} vs ${slot.p2} → ${winner||'TBD (scheduled)'}`);
    }
  }
  cascade(rounds,live);

  const finalSlot=rounds[5]?.slots[0];
  if(finalSlot&&!live['g5_0']?.scheduledTime){
    live['g5_0']=Object.assign({p1:finalSlot.p1,p2:finalSlot.p2,winner:null,state:'pre',completed:false,live:false,scheduled:true,
      p1Sets:[],p2Sets:[],scheduledTime:'2026-05-17T13:00:00Z',timeValid:true,round:'F',updatedAt:Date.now()},live['g5_0']||{});
  }

  const withWinners=Object.values(live).filter(m=>m.winner).length;
  console.log(`\nMatched: ${matched} | Unmatched: ${noMatch} | Winners: ${withWinners}`);
  console.log('Saving to Firestore...');
  const ok=await fsWrite({matches:JSON.stringify(live),updatedAt:new Date().toISOString(),count:String(Object.keys(live).length)});
  console.log(ok?`✅ Done! ${Object.keys(live).length} matches saved.`:'❌ Firestore write failed');
}
main().catch(console.error);
