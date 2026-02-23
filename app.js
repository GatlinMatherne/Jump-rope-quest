const state = {
  currentUser: null,
  users: JSON.parse(localStorage.getItem('tmq_users') || '{}'),
  shopItems: [
    { id: 'mossy', name: 'Forest Sprout', cost: 0, className: 'mossy' },
    { id: 'sunset', name: 'Sunset Scout', cost: 35, className: 'sunset' },
    { id: 'ocean', name: 'Ocean Hopper', cost: 55, className: 'ocean' }
  ]
};

const defaults = {
  credits: 0,
  miles: 0,
  workouts: [],
  friends: [],
  monster: 'mossy',
  owned: ['mossy']
};

const el = {
  authCard: document.getElementById('authCard'),
  appContent: document.getElementById('appContent'),
  tabBar: document.getElementById('tabBar'),
  authForm: document.getElementById('authForm'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  logoutBtn: document.getElementById('logoutBtn'),
  welcomeTitle: document.getElementById('welcomeTitle'),
  creditCount: document.getElementById('creditCount'),
  milesCount: document.getElementById('milesCount'),
  workoutCount: document.getElementById('workoutCount'),
  workoutList: document.getElementById('workoutList'),
  workoutForm: document.getElementById('workoutForm'),
  friendForm: document.getElementById('friendForm'),
  friendName: document.getElementById('friendName'),
  friendList: document.getElementById('friendList'),
  monsterAvatar: document.getElementById('monsterAvatar'),
  monsterName: document.getElementById('monsterName'),
  shopGrid: document.getElementById('shopGrid'),
  medals: document.getElementById('medals'),
  donateForm: document.getElementById('donateForm'),
  donateMsg: document.getElementById('donateMsg')
};

const saveUsers = () => localStorage.setItem('tmq_users', JSON.stringify(state.users));

const getUserData = () => {
  if (!state.currentUser) return null;
  return state.users[state.currentUser];
};

function switchAuth(isAuthed) {
  el.authCard.classList.toggle('hidden', isAuthed);
  el.appContent.classList.toggle('hidden', !isAuthed);
  el.tabBar.classList.toggle('hidden', !isAuthed);
  el.logoutBtn.classList.toggle('hidden', !isAuthed);
}

function calcMedals(user) {
  return [
    { name: 'Bronze Distance', unlocked: user.miles >= 10, hint: 'Run 10 miles total' },
    { name: 'Silver Distance', unlocked: user.miles >= 30, hint: 'Run 30 miles total' },
    { name: 'Fast Feet', unlocked: user.workouts.some(w => w.pace <= 8), hint: 'Any run at 8:00 pace or faster' },
    { name: 'Consistency', unlocked: user.workouts.length >= 7, hint: 'Log 7 workouts' }
  ];
}

function render() {
  const user = getUserData();
  if (!user) return;

  el.welcomeTitle.textContent = `Hi ${state.currentUser}!`;
  el.creditCount.textContent = user.credits;
  el.milesCount.textContent = user.miles.toFixed(2);
  el.workoutCount.textContent = user.workouts.length;

  const currentMonster = state.shopItems.find(i => i.id === user.monster);
  el.monsterAvatar.className = `monster ${currentMonster.className}`;
  el.monsterName.textContent = currentMonster.name;

  el.workoutList.innerHTML = user.workouts.length
    ? user.workouts
        .slice()
        .reverse()
        .map(w => `<li>${w.distance.toFixed(2)} mi in ${w.minutes.toFixed(1)} min (pace ${w.pace.toFixed(2)})</li>`)
        .join('')
    : '<li>No workouts yet. Start your quest!</li>';

  el.friendList.innerHTML = user.friends.length
    ? user.friends.map(name => `<li>@${name}</li>`).join('')
    : '<li>No friends yet. Add teammates!</li>';

  const medals = calcMedals(user);
  el.medals.innerHTML = medals
    .map(m => `<div class="badge">${m.unlocked ? '🏅' : '🌱'} <strong>${m.name}</strong><br><span class="tiny">${m.unlocked ? 'Unlocked!' : m.hint}</span></div>`)
    .join('');

  el.shopGrid.innerHTML = state.shopItems
    .map(item => {
      const owned = user.owned.includes(item.id);
      const equipped = user.monster === item.id;
      return `
        <article class="shop-item">
          <strong>${item.name}</strong>
          <div class="tiny">Cost: ${item.cost} credits</div>
          <button class="primary-btn" data-buy="${item.id}">${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'}</button>
        </article>
      `;
    })
    .join('');
}

el.authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = el.username.value.trim();
  const pass = el.password.value.trim();
  if (!state.users[user]) state.users[user] = { ...defaults, password: pass };
  if (state.users[user].password !== pass) return alert('Wrong password for this username.');

  state.currentUser = user;
  saveUsers();
  switchAuth(true);
  render();
  el.authForm.reset();
});

el.workoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = getUserData();
  const distance = parseFloat(document.getElementById('distance').value);
  const minutes = parseFloat(document.getElementById('minutes').value);
  const pace = minutes / distance;

  user.workouts.push({ distance, minutes, pace, date: Date.now() });
  user.miles += distance;
  user.credits += Math.round(distance * 10 + Math.max(0, 10 - pace));

  saveUsers();
  render();
  el.workoutForm.reset();
});

el.friendForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const friend = el.friendName.value.trim();
  const user = getUserData();
  if (!friend || friend === state.currentUser) return;
  if (!user.friends.includes(friend)) user.friends.push(friend);
  saveUsers();
  render();
  el.friendForm.reset();
});

el.logoutBtn.addEventListener('click', () => {
  state.currentUser = null;
  switchAuth(false);
});

document.getElementById('tabBar').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-tab]');
  if (!btn) return;
  const target = btn.dataset.tab;

  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === target));
  document.querySelectorAll('.tab-btn').forEach(panelBtn => panelBtn.classList.toggle('active', panelBtn === btn));
});

el.shopGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-buy]');
  if (!btn) return;
  const user = getUserData();
  const item = state.shopItems.find(i => i.id === btn.dataset.buy);
  const owned = user.owned.includes(item.id);

  if (!owned) {
    if (user.credits < item.cost) return alert('Not enough credits yet!');
    user.credits -= item.cost;
    user.owned.push(item.id);
  }

  user.monster = item.id;
  saveUsers();
  render();
});

el.donateForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = Number(document.getElementById('donation').value);
  el.donateMsg.textContent = `Thank you for your $${amount.toFixed(0)} support! 💚`;
  el.donateForm.reset();
});

switchAuth(false);
