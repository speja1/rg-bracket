// fetch-odds.js — Run with: node fetch-odds.js
// Fetches Roland Garros match odds from The Odds API → saves to Firestore
// Run once per day or before each round

const ODDS_API_KEY = '26c5a1a7b910ff7e0a8eff5aba1230c7';
const FIREBASE_KEY = 'AIzaSyAy8L1XOEVMVVzcnG_n3U51lFHCFfpTCVM';
const PROJECT_ID   = 'roland-garros-6b9f6';
const TOURNAMENT_ID = 'roland-garros-2026';

// Preferred bookmakers in order (first available wins)
const BOOKS = ['draftkings','fanduel','betmgm','bovada','williamhill_us','betrivers'];

// Sport key for French Open / Roland Garros on The Odds API
// Try both common keys
const SPORT_KEYS = ['tennis_atp_french_open'];

function toks(s){
  if(!s)return new Set();
  const norm=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  return new Set(norm.toLowerCase().replace(/[^a-z0-9]/g,' ').split(/\s+/).filter(w=>w.length>1));
}
function nm(a,b){const ta=toks(a),tb=toks(b);for(const t of ta)if(tb.has(t))return true;return false;}

// Convert American odds to implied probability string e.g. "-450" → "82%" or "+320" → "24%"
function impliedProb(american){
  if(!american)return null;
  const n=Number(american);
  if(n>0)return Math.round(100/(n+100)*100)+'%';
  else return Math.round(-n/(-n+100)*100)+'%';
}

// Format odds for display: -450 stays "-450", +320 stays "+320"
function fmtOdds(price){
  if(!price&&price!==0)return null;
  const n=Number(price);
  return n>0?'+'+n:String(n);
}

async function fetchOddsForSport(sportKey){
  const url=`https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=american&bookmakers=${BOOKS.join(',')}`;
  const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});
  if(!res.ok){
    const err=await res.text();
    console.log(`  ${sportKey}: HTTP ${res.status} — ${err.slice(0,100)}`);
    return null;
  }
  const data=await res.json();
  console.log(`  ${sportKey}: ${data.length||0} events found`);
  // Log remaining quota
  const rem=res.headers.get('x-requests-remaining');
  const used=res.headers.get('x-requests-used');
  if(rem)console.log(`  API quota: ${used} used, ${rem} remaining`);
  return data;
}

async function main(){
  console.log('Fetching Roland Garros odds from The Odds API...');

  // Try each sport key until we find events
  let events=null;
  for(const key of SPORT_KEYS){
    console.log(`Trying sport key: ${key}`);
    events=await fetchOddsForSport(key);
    if(events&&events.length>0)break;
  }

  if(!events||events.length===0){
    // Try listing all available tennis sports
    console.log('\nNo events found. Checking available tennis sports...');
    const sportsRes=await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${ODDS_API_KEY}`);
    if(sportsRes.ok){
      const sports=await sportsRes.json();
      const tennis=sports.filter(s=>s.key.toLowerCase().includes('tennis'));
      console.log('Available tennis sports:');
      tennis.forEach(s=>console.log(' ',s.key,'-',s.title,'active:',s.active));
    }
    return;
  }

  // Build odds map: "Player1 vs Player2" → {p1_odds, p2_odds, p1_prob, p2_prob, book}
  const oddsMap={};
  let matched=0;

  for(const event of events){
    // Extract player names from home_team / away_team
    const p1=event.home_team||'';
    const p2=event.away_team||'';
    if(!p1||!p2)continue;

    // Find best available bookmaker odds
    let p1odds=null,p2odds=null,bookUsed=null;
    for(const book of BOOKS){
      const bk=event.bookmakers?.find(b=>b.key===book);
      if(!bk)continue;
      const h2h=bk.markets?.find(m=>m.key==='h2h');
      if(!h2h)continue;
      const o1=h2h.outcomes?.find(o=>nm(o.name,p1));
      const o2=h2h.outcomes?.find(o=>nm(o.name,p2));
      if(o1&&o2){
        p1odds=o1.price;
        p2odds=o2.price;
        bookUsed=bk.title;
        break;
      }
    }

    if(!p1odds&&!p2odds){
      // Try any bookmaker
      for(const bk of event.bookmakers||[]){
        const h2h=bk.markets?.find(m=>m.key==='h2h');
        if(!h2h)continue;
        if(h2h.outcomes?.length>=2){
          p1odds=h2h.outcomes[0]?.price;
          p2odds=h2h.outcomes[1]?.price;
          bookUsed=bk.title;
          break;
        }
      }
    }

    if(!p1odds&&!p2odds)continue;

    const key=[p1,p2].sort().join('__').replace(/[^a-zA-Z0-9_]/g,'_');
    oddsMap[key]={
      p1,p2,
      p1_odds:fmtOdds(p1odds),
      p2_odds:fmtOdds(p2odds),
      p1_prob:impliedProb(p1odds),
      p2_prob:impliedProb(p2odds),
      book:bookUsed,
      commence_time:event.commence_time,
    };
    console.log(`  ✓ ${p1} ${fmtOdds(p1odds)} vs ${p2} ${fmtOdds(p2odds)} (${bookUsed})`);
    matched++;
  }

  console.log(`\nFound odds for ${matched} matches`);
  if(matched===0)return;

  // Save to Firestore
  console.log('Saving to Firestore...');
  const url=`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/meta/odds_${TOURNAMENT_ID}?key=${FIREBASE_KEY}`;
  const body={fields:{
    data:{stringValue:JSON.stringify(oddsMap)},
    updatedAt:{stringValue:new Date().toISOString()},
  }};
  const res=await fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(res.ok)console.log(`✅ Odds saved for ${matched} matches`);
  else console.log('❌ Firestore save failed:',res.status,await res.text().then(t=>t.slice(0,100)));
}

main().catch(console.error);
