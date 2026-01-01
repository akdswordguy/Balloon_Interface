const API_URL = "https://script.google.com/macros/s/AKfycbx14AuLZJSQ9qPyGseVV1C97aHY1qmvzidV-A-fgMHsiwbP0srvqi9PIw9zqDgSqxjeWA/exec";

const searchInput = document.getElementById('search');
const balloonsContainer = document.getElementById('balloons');
const emptyEl = document.getElementById('empty');

let allBalloons = [];

function nicerTime(ts){
  const d = new Date(ts);
  return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

async function fetchBalloons(){
  try{
    const res = await fetch(`${API_URL}?action=getPending`);
    const data = await res.json();
    allBalloons = Array.isArray(data) ? data : [];
    renderBalloons(filterFromInput());
  }catch(err){
    console.error('Failed to fetch balloons', err);
  }
}

function filterFromInput(){
  const q = searchInput?.value?.trim().toLowerCase() || '';
  if(!q) return allBalloons;
  return allBalloons.filter(b => {
    return (b.username||'').toLowerCase().includes(q)
      || (b.lab||'').toLowerCase().includes(q)
      || (b.question||'').toLowerCase().includes(q)
      || (String(b.seat)||'').toLowerCase().includes(q);
  });
}

function renderBalloons(balloons){
  balloonsContainer.innerHTML = '';
  if(!balloons || balloons.length === 0){
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  balloons.forEach((b, idx)=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role','article');

    const badge = document.createElement('div');
    badge.className = 'balloon-badge ' + (idx % 2 === 0 ? 'red' : 'blue');
    badge.textContent = (b.username || '?').slice(0,2).toUpperCase();

    const team = document.createElement('div');
    team.className = 'team';
    team.textContent = `${b.username || 'Unknown'} — ${b.question || ''}`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    const lab = document.createElement('div'); lab.className='lab'; lab.textContent = `📍 ${b.lab || '—'}`;
    const seat = document.createElement('div'); seat.className='seat'; seat.textContent = `Seat ${b.seat || '—'}`;
    meta.appendChild(lab); meta.appendChild(seat);

    const time = document.createElement('div'); time.className='time'; time.textContent = `⏱ ${nicerTime(b.timestamp)}`;

    const actions = document.createElement('div'); actions.className='actions';
    const mark = document.createElement('button'); mark.className='primary'; mark.textContent='Mark Delivered';
    mark.setAttribute('aria-label', `Mark balloon for ${b.username} delivered`);
    // show loading state while the mark-delivered request is in progress
    mark.onclick = async () => {
      try{
        mark.disabled = true;
        mark.classList.add('loading');
        // inline spinner + label
        mark.innerHTML = '<span class="spinner" aria-hidden="true"></span>Marking...';
        await markDelivered(b.row);
        // note: fetchBalloons() will re-render the list; if it fails, restore state below
      }catch(err){
        console.error('Error marking delivered', err);
        mark.disabled = false;
        mark.classList.remove('loading');
        mark.textContent = 'Mark Delivered';
      }
    };
    actions.appendChild(mark);

    card.appendChild(badge);
    card.appendChild(team);
    card.appendChild(meta);
    card.appendChild(time);
    card.appendChild(actions);

    balloonsContainer.appendChild(card);
  });
}

async function markDelivered(row){
  try{
    await fetch(`${API_URL}?action=markDelivered&row=${row}`,{method:'POST'});
    fetchBalloons();
  }catch(err){
    console.error('failed to mark delivered', err);
  }
}

if(searchInput){
  searchInput.addEventListener('input', ()=> renderBalloons(filterFromInput()));
}

fetchBalloons();
setInterval(fetchBalloons, 5000);
