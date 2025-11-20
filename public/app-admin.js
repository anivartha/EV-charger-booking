// public/app-admin.js
async function api(path, options) {
  const res = await fetch(path, options);
  return res.json();
}

async function loadOverview() {
  const stations = await api('/api/stations');
  document.getElementById('totalStations').textContent = stations.length;
  // dummy users/booking counts
  document.getElementById('totalUsers').textContent = 5;
  document.getElementById('activeBookings').textContent = 0;
}

async function loadStations() {
  const stations = await api('/api/stations');
  const tbody = document.querySelector('#stationsTable tbody'); tbody.innerHTML = '';
  stations.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.station_id}</td><td>${s.station_name}</td><td>${s.location}</td>`;
    tbody.appendChild(tr);
  });
  const sel = document.getElementById('chargerStationSelect'); sel.innerHTML = '';
  stations.forEach(s => sel.appendChild(Object.assign(document.createElement('option'), { value: s.station_id, textContent: s.station_name })));
}

async function loadChargers() {
  const all = await api('/api/chargers');
  const tbody = document.querySelector('#chargersTable tbody'); tbody.innerHTML = '';
  for(const c of all) {
    // get its station name quickly by fetching stations (or can join in backend)
    const sres = await api('/api/stations');
    const st = sres.find(x=>x.station_id===c.station_id);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.booth_id}</td><td>${st?st.station_name:c.station_id}</td><td>${c.booth_name}</td><td>${c.charger_type}</td><td>${c.price_per_hour}</td>`;
    tbody.appendChild(tr);
  }
}

async function addStation() {
  const name = document.getElementById('stationName').value.trim();
  const location = document.getElementById('stationLocation').value.trim();
  if(!name) return alert('enter name');
  await api('/api/stations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ station_name:name, location }) });
  document.getElementById('stationName').value=''; document.getElementById('stationLocation').value='';
  await loadStations(); await loadChargers(); await loadOverview();
  alert('Station added');
}

async function addCharger() {
  const station_id = document.getElementById('chargerStationSelect').value;
  const booth_name = document.getElementById('chargerName').value.trim();
  const charger_type = document.getElementById('chargerType').value.trim();
  const price = document.getElementById('chargerPrice').value || 50;
  if(!station_id || !booth_name) return alert('fill fields');
  await api('/api/chargers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ station_id, booth_name, charger_type, price_per_hour: price }) });
  document.getElementById('chargerName').value=''; document.getElementById('chargerType').value=''; document.getElementById('chargerPrice').value='';
  await loadChargers(); alert('Charger added');
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('ev_user') || '{}');
  document.getElementById('adminWelcome').textContent = user.user ? `Welcome, ${user.user.name}` : '';
  document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.removeItem('ev_user'); location.href = '/login.html'; });

  document.getElementById('addStationBtn').addEventListener('click', addStation);
  document.getElementById('addChargerBtn').addEventListener('click', addCharger);

  await loadOverview();
  await loadStations();
  await loadChargers();
});
