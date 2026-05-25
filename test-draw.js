// test-draw.js — Run BEFORE deploying to verify ESPN name matching
// Usage: node test-draw.js
// This does a dry run: fetches ESPN data, tries to match all 64 R1 slots
// but does NOT write to Firestore

const TOURNEY_NAMES = ['roland','french open','roland-garros'];
const TOURNEY_START = '20260524';
const TOURNEY_END   = '20260607';

const ATP_DRAW = [
  {id:'m01',p1:'Sinner J.',p2:'Tabur C.'},
  {id:'m02',p1:'Fearnley J.',p2:'Cerundolo J.'},
  {id:'m03',p1:'Landaluce M.',p2:'Prado Angelo J.'},
  {id:'m04',p1:'Moutet C.',p2:'Kopriva V.'},
  {id:'m05',p1:'Rinderknech A.',p2:'Rodionov J.'},
  {id:'m06',p1:'Fucsovics M.',p2:'Berrettini M.'},
  {id:'m07',p1:'Quinn E.',p2:'Comesana F.'},
  {id:'m08',p1:'Darderi L.',p2:'Ofner S.'},
  {id:'m09',p1:'Bublik A.',p2:'Struff J.'},
  {id:'m10',p1:'Shapovalov D.',p2:'Faria J.'},
  {id:'m11',p1:'Munar J.',p2:'Hurkacz H.'},
  {id:'m12',p1:'Tiafoe F.',p2:'Spizzirri E.'},
  {id:'m13',p1:'Griekspoor T.',p2:'Arnaldi M.'},
  {id:'m14',p1:'Muller A.',p2:'Tsitsipas S.'},
  {id:'m15',p1:'Vukic A.',p2:'Collignon R.'},
  {id:'m16',p1:'Shelton B.',p2:'Merida D.'},
  {id:'m17',p1:'Auger-Aliassime F.',p2:'Altmaier D.'},
  {id:'m18',p1:'Baez S.',p2:'Burruchaga R.'},
  {id:'m19',p1:'Van Assche L.',p2:'Kypson P.'},
  {id:'m20',p1:'Nakashima B.',p2:'Bautista Agut R.'},
  {id:'m21',p1:'Norrie C.',p2:'Vallejo A.'},
  {id:'m22',p1:'Cilic M.',p2:'Kouame M.'},
  {id:'m23',p1:'Tabilo A.',p2:'Majchrzak K.'},
  {id:'m24',p1:'Vacherot V.',p2:'Faurel T.'},
  {id:'m25',p1:'Cobolli F.',p2:'Pellegrino A.'},
  {id:'m26',p1:'Wu Y.',p2:'Giron M.'},
  {id:'m27',p1:'Zhang Z.',p2:'Diaz Acosta F.'},
  {id:'m28',p1:'Tien L.',p2:'Garin C.'},
  {id:'m29',p1:'Cerundolo F.',p2:'Van de Zandschulp B.'},
  {id:'m30',p1:'Gaston H.',p2:'Monfils G.'},
  {id:'m31',p1:'Popyrin A.',p2:'Svajda Z.'},
  {id:'m32',p1:'Medvedev D.',p2:'Walton A.'},
  {id:'m33',p1:'De Minaur A.',p2:'Samuel T.'},
  {id:'m34',p1:'Blockx A.',p2:'Wong C.'},
  {id:'m35',p1:'Navone M.',p2:'Brooksby J.'},
  {id:'m36',p1:'Mensik J.',p2:'Droguet T.'},
  {id:'m37',p1:'Etcheverry T.',p2:'Borges N.'},
  {id:'m38',p1:'Kecmanovic M.',p2:'Marozsan F.'},
  {id:'m39',p1:'Ugo Carabelli C.',p2:'Nava E.'},
  {id:'m40',p1:'Rublev A.',p2:'Buse I.'},
  {id:'m41',p1:'Ruud C.',p2:'Safiullin R.'},
  {id:'m42',p1:'Medjedovic H.',p2:'Hanfmann Y.'},
  {id:'m43',p1:'Sonego L.',p2:'Herbert P.'},
  {id:'m44',p1:'Paul T.',p2:'Hijikata R.'},
  {id:'m45',p1:'Fonseca J.',p2:'Pavlovic L.'},
  {id:'m46',p1:'Prizmic D.',p2:'Zheng M.'},
  {id:'m47',p1:'Royer V.',p2:'Dellien H.'},
  {id:'m48',p1:'Mpetshi Perricard G.',p2:'Djokovic N.'},
  {id:'m49',p1:'Fritz T.',p2:'Basavareddy N.'},
  {id:'m50',p1:'Shevchenko A.',p2:'Michelsen A.'},
  {id:'m51',p1:'Duckworth J.',p2:'Diallo G.'},
  {id:'m52',p1:'Kovacevic A.',p2:'Jodar R.'},
  {id:'m53',p1:'Davidovich Fokina A.',p2:'Dzumhur D.'},
  {id:'m54',p1:'Llamas Ruiz P.',p2:'Tirante T.'},
  {id:'m55',p1:'Kokkinakis T.',p2:'Atmane T.'},
  {id:'m56',p1:'Carreno Busta P.',p2:'Lehecka J.'},
  {id:'m57',p1:'Khachanov K.',p2:'Gea A.'},
  {id:'m58',p1:'Jacquet K.',p2:'Trungelliti M.'},
  {id:'m59',p1:'Opelka R.',p2:'Cina F.'},
  {id:'m60',p1:'de Jong J.',p2:'Wawrinka S.'},
  {id:'m61',p1:'Humbert U.',p2:'Mannarino A.'},
  {id:'m62',p1:'Halys Q.',p2:'Bellucci M.'},
  {id:'m63',p1:'Machac T.',p2:'Bergs Z.'},
  {id:'m64',p1:'Bonzi B.',p2:'Zverev A.'},
];

function toks(s){
  if(!s)return new Set();
  const norm=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  return new Set(norm.toLowerCase().replace(/[^a-z0-9]/g,' ').split(/\s+/).filter(w=>w.length>1));
}
function nm(a,b){const ta=toks(a),tb=toks(b);for(const t of ta)if(tb.has(t))return true;return false;}
function matchAny(bn,...ns){return ns.some(n=>n&&nm(bn,n));}

async function fetchDate(date){
  const url=`https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard?dates=${date}&limit=200`;
  try{
    const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});
    if(!res.ok)return[];
    const data=await res.json();
    const out=[];
    for(const event of data.events||[]){
      const tname=(event.name||'').toLowerCase();
      if(!TOURNEY_NAMES.some(n=>tname.includes(n)))continue;
      for(const grp of event.groupings||[]){
        const roundName=((grp.grouping&&grp.grouping.displayName)||'').toLowerCase();
        if(roundName.includes('qualify'))continue;
        for(const comp of grp.competitions||[]){
          const cs=[...(comp.competitors||[])].sort((a,b)=>(a.order||0)-(b.order||0));
          if(cs.length!==2)continue;
          const[c1,c2]=cs;
          out.push({
            espnId:comp.id,
            p1Short:(c1.athlete&&c1.athlete.shortName)||'',
            p1Full:(c1.athlete&&c1.athlete.fullName)||'',
            p2Short:(c2.athlete&&c2.athlete.shortName)||'',
            p2Full:(c2.athlete&&c2.athlete.fullName)||'',
            scheduledTime:comp.date||null,
          });
        }
      }
    }
    return out;
  }catch(e){return[];}
}

async function main(){
  console.log('Fetching ESPN data for Roland Garros test...');
  // Fetch first 3 days
  const dates=[];
  const start=new Date('2026-05-24');
  for(let i=0;i<5;i++){
    const d=new Date(start);d.setDate(d.getDate()+i);
    dates.push(d.toISOString().slice(0,10).replace(/-/g,''));
  }
  
  const results=await Promise.allSettled(dates.map(fetchDate));
  const seen=new Set();
  const allMatches=[];
  for(const r of results)if(r.status==='fulfilled')
    for(const m of r.value)if(!seen.has(m.espnId)){seen.add(m.espnId);allMatches.push(m);}
  
  console.log(`ESPN: ${allMatches.length} matches found`);
  
  let matched=0,noMatch=0;
  for(const slot of ATP_DRAW){
    const em=allMatches.find(m=>{
      if(!m.p1Short&&!m.p1Full)return false;
      if(m.scheduledTime&&new Date(m.scheduledTime)<new Date('2026-05-24T00:00:00Z'))return false;
      return matchAny(slot.p1,m.p1Short,m.p1Full,m.p2Short,m.p2Full)&&
             matchAny(slot.p2,m.p1Short,m.p2Short,m.p1Full,m.p2Full);
    });
    if(em){
      console.log(`  ✓ ${slot.id}: ${slot.p1} vs ${slot.p2} → ESPN: ${em.p1Short} vs ${em.p2Short}`);
      matched++;
    }else{
      const p1t=slot.p1.toLowerCase().replace(/[^a-z]/g,' ').split(/\s+/).filter(w=>w.length>2);
      const hints=allMatches.filter(m=>p1t.some(t=>(m.p1Short||'').toLowerCase().includes(t)||(m.p2Short||'').toLowerCase().includes(t)));
      console.log(`  NO MATCH ${slot.id}: "${slot.p1}" vs "${slot.p2}"${hints.length?` → ESPN has: ${hints.slice(0,2).map(m=>m.p1Short+'v'+m.p2Short).join(', ')}`:''}`);
      noMatch++;
    }
  }
  console.log(`\nMatched: ${matched} | No match: ${noMatch}`);
  if(noMatch===0)console.log('✅ All matches found! Safe to run fetch-results.js');
  else console.log('⚠️  Fix NO MATCH entries before tournament starts');
}
main().catch(console.error);
