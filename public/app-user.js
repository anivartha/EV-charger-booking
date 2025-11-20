// public/app-user.js
async function api(path, options) {
  const res = await fetch(path, options);
  return res.json();
}

async function loadStationsDropdown() {
  const stations = await api('/api/stations');
  const sel = document.getElementById('stationSelect');
  sel.innerHTML = '';
  stations.forEach(s => sel.appendChild(Object.assign(document.createElement('option'), { value: s.station_id, textContent: s.station_name })));
  if(stations.length) loadChargersForStation();
}

async function loadChargersForStation() {
  const station_id = document.getElementById('stationSelect').value;
  const chargers = await api('/api/chargers?station_id=' + station_id);
  const sel = document.getElementById('chargerSelect'); sel.innerHTML = '';
  chargers.forEach(c => sel.appendChild(Object.assign(document.createElement('option'), { value: c.booth_id, textContent: c.booth_name + ' ('+ c.charger_type +')' })));
  if(chargers.length) loadSlotsForCharger();
}

async function loadSlotsForCharger() {
  const booth_id = document.getElementById('chargerSelect').value;
  const date = document.getElementById('dateInput').value;
  let url = '/api/slots?booth_id=' + booth_id;
  if(date) url += '&date=' + date;
  const slots = await api(url);
  const area = document.getElementById('slotsArea'); area.innerHTML = '';
  slots.forEach(s => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div>${s.slot_date} ${s.start_time} - ${s.end_time}</div>`;
    if(!s.is_booked) {
      const btn = document.createElement('button'); btn.textContent='Book';
      btn.onclick = ()=> bookSlot(s.slot_id);
      wrapper.appendChild(btn);
    } else {
      const span = document.createElement('span'); span.textContent='Booked';
      wrapper.appendChild(span);
    }
    area.appendChild(wrapper);
  });
}

async function bookSlot(slot_id) {
  const user = JSON.parse(localStorage.getItem('ev_user') || '{}');
  if(!user.user) return alert('login first');
  const user_id = user.user.user_id;
  const res = await api('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ slot_id, user_id }) });
  alert('Booking created (id: ' + res.booking_id + '). Booking status: ' + res.payment_status);
  loadSlotsForCharger();
}

document.addEventListener('DOMContentLoaded', ()=> {
  const user = JSON.parse(localStorage.getItem('ev_user') || '{}');
  document.getElementById('userWelcome').textContent = user.user ? `Welcome, ${user.user.name}` : '';
  document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.removeItem('ev_user'); location.href = '/login.html'; });

  loadStationsDropdown();
  document.getElementById('stationSelect').addEventListener('change', loadChargersForStation);
  document.getElementById('chargerSelect').addEventListener('change', loadSlotsForCharger);
  document.getElementById('dateInput').addEventListener('change', loadSlotsForCharger);
});
