// === Telegram WebApp ===
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// === Регионы (топ-5 дорогих + остальные) ===
const REGIONS = [
  { code: '77', mult: 1.5 },
  { code: '99', mult: 1.4 },
  { code: '97', mult: 1.3 },
  { code: '78', mult: 1.2 },
  { code: '98', mult: 1.1 },
];
const OTHER_REGIONS = ['02', '102', '116', '23', '161', '34', '52', '66', '74', '86'];

// === Комбинации номеров ===
const COMBOS = [
  { name: 'Номер 1', test: (n) => n === '001' || n === '0001', mult: 200, mult4: 800 },
  { name: 'Номер 007', test: (n) => n === '007', mult: 150 },
  { name: 'Все семёрки', test: (n) => /^7+$/.test(n) && n.length >= 3, mult: 600, mult4: 2500 },
  { name: 'Все одинаковые', test: (n) => /^(\d)\1{2,}$/.test(n), mult: 150, mult4: 1000 },
  { name: 'Три семёрки из четырёх', test: (n) => n.length === 4 && (n.match(/7/g) || []).length === 3, mult: 300 },
  { name: '3 одинаковые из 4', test: (n) => n.length === 4 && /(\d)\1\1/.test(n), mult: 180 },
  { name: 'Круглый', test: (n) => /^[1-9]0{2,}$/.test(n), mult: 25, mult4: 150 },
  { name: 'Ровные сотни', test: (n) => n.length === 4 && n.endsWith('00'), mult: 4 },
  { name: 'Цифры подряд', test: (n) => /123|234|345|456|567|678|789/.test(n), mult: 15, mult4: 100 },
  { name: 'Цифры через одну', test: (n) => /135|246|357|468|579/.test(n), mult: 5, mult4: 30 },
  { name: 'Зеркальные', test: (n) => n === n.split('').reverse().join('') && n.length >= 3, mult: 4, mult4: 40 },
  { name: 'Повтор пары', test: (n) => n.length === 4 && n[0] === n[2] && n[1] === n[3], mult: 35 },
  { name: '2 пары', test: (n) => n.length === 4 && /(\d)\1(\d)\2/.test(n), mult: 10 },
  { name: 'Номер 0X0', test: (n) => /^0\d0$/.test(n), mult: 8 },
  { name: 'Номер 228', test: (n) => n === '228', mult: 8 },
  { name: 'Две семёрки', test: (n) => (n.match(/7/g) || []).length === 2, mult: 2.5 },
  { name: '2 одинаковые цифры', test: (n) => /(\d)\1/.test(n), mult: 1.8, mult4: 1.3 },
];

// === Блатные серии ===
const VIP_SERIES = [
  { code: 'АМР', mult: 250 },
  { code: 'ЕКХ', mult: 120 },
  { code: 'ММР', mult: 60 },
  { code: 'ККХ', mult: 50 },
  { code: 'АУЕ', mult: 40 },
  { code: 'СКР', mult: 40 },
  { code: 'ВОО', mult: 30 },
  { code: 'ОМР', mult: 30 },
  { code: 'МОО', mult: 30 },
  { code: 'ВМР', mult: 25 },
];

// === Обычные буквы ===
const LETTERS = 'АВЕКМНОРСТУХ';

// === Редкости по множителю ===
function getRarity(mult) {
  if (mult >= 5000) return { name: 'Секретный', color: '#ff00ff' };
  if (mult >= 1000) return { name: 'Мифический', color: '#ff4444' };
  if (mult >= 500) return { name: 'Легендарный', color: '#ffaa00' };
  if (mult >= 200) return { name: 'Эпический', color: '#aa44ff' };
  if (mult >= 50) return { name: 'Редкий', color: '#4488ff' };
  if (mult >= 5) return { name: 'Необычный', color: '#44ff88' };
  return { name: 'Обычный', color: '#888888' };
}

// === Генерация номера ===
function generatePlate(luck) {
  const basePrice = Math.floor(Math.random() * 801);

  let region;
  if (Math.random() < luck / 400) {
    region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  } else {
    region = { code: OTHER_REGIONS[Math.floor(Math.random() * OTHER_REGIONS.length)], mult: 1.0 };
  }

  const isFour = Math.random() < 0.5;
  let number;
  if (isFour) {
    number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  } else {
    number = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  }

  let comboMult = 1;
  let comboName = 'Обычный';
  for (const c of COMBOS) {
    if (c.test(number)) {
      comboMult = isFour && c.mult4 ? c.mult4 : c.mult;
      comboName = c.name;
      break;
    }
  }

  let series = '';
  let seriesMult = 1;
  let seriesName = '';
  if (Math.random() < luck / 2000) {
    const vip = VIP_SERIES[Math.floor(Math.random() * VIP_SERIES.length)];
    series = vip.code;
    seriesMult = vip.mult;
    seriesName = `Серия «${vip.code}»`;
  } else {
    series = LETTERS[Math.floor(Math.random() * LETTERS.length)] +
             LETTERS[Math.floor(Math.random() * LETTERS.length)] +
             LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }

  const totalMult = comboMult * region.mult * seriesMult;
  const finalPrice = Math.round(basePrice * totalMult * 100) / 100;
  const rarity = getRarity(totalMult);

  return {
    plate: `${series} ${number} ${region.code}`,
    number,
    series,
    region: region.code,
    basePrice,
    comboName,
    seriesName,
    comboMult,
    regionMult: region.mult,
    seriesMult,
    totalMult,
    price: finalPrice,
    rarity: rarity.name,
    rarityColor: rarity.color,
  };
}

// === Состояние ===
let state = {
  balance: 10000,
  garage: [],
};

// === Сохранение ===
function saveState() {
  if (tg?.CloudStorage) {
    tg.CloudStorage.setItem('gameState', JSON.stringify(state));
  } else {
    localStorage.setItem('gameState', JSON.stringify(state));
  }
}

function loadState(callback) {
  if (tg?.CloudStorage) {
    tg.CloudStorage.getItem('gameState', (err, value) => {
      if (!err && value) {
        try { state = JSON.parse(value); } catch (e) {}
      }
      callback();
    });
  } else {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      try { state = JSON.parse(saved); } catch (e) {}
    }
    callback();
  }
}

// === UI ===
const balanceEl = document.getElementById('balance');
const resultEl = document.getElementById('result');
const garageListEl = document.getElementById('garage-list');

function updateBalance() {
  balanceEl.textContent = state.balance.toLocaleString('ru-RU');
}

function updateGarage() {
  if (state.garage.length === 0) {
    garageListEl.innerHTML = '<p class="empty">Гараж пуст. Крути номера!</p>';
    return;
  }
  garageListEl.innerHTML = state.garage.map((item, i) => `
    <div class="garage-item" style="border-left-color: ${item.rarityColor}">
      <div class="info">
        <div class="plate">${item.plate}</div>
        <div class="rarity" style="color: ${item.rarityColor}">${item.rarity} · ×${item.totalMult.toFixed(1)}</div>
      </div>
      <button class="sell-btn" data-index="${i}">${item.price.toLocaleString('ru-RU')} ₽</button>
    </div>
  `).join('');

  garageListEl.querySelectorAll('.sell-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const item = state.garage[idx];
      state.balance += item.price;
      state.garage.splice(idx, 1);
      saveState();
      updateBalance();
      updateGarage();
    });
  });
}

function spin(price, luck) {
  if (state.balance < price) {
    resultEl.textContent = '❌ Недостаточно денег!';
    resultEl.classList.remove('win');
    return;
  }
  state.balance -= price;

  resultEl.classList.remove('win');
  resultEl.textContent = '🎰 Крутим...';

  let counter = 0;
  const interval = setInterval(() => {
    const temp = generatePlate(luck);
    resultEl.innerHTML = `<div class="plate">${temp.plate}</div>`;
    counter++;
    if (counter > 10) {
      clearInterval(interval);
      const result = generatePlate(luck);
      state.garage.push(result);
      saveState();
      updateBalance();
      updateGarage();

      resultEl.classList.add('win');
      resultEl.innerHTML = `
        <div>
          <div class="plate">${result.plate}</div>
          <div class="rarity" style="color: ${result.rarityColor}">${result.rarity}</div>
          <div class="price">${result.price.toLocaleString('ru-RU')} ₽</div>
        </div>
      `;
    }
  }, 60);
}

// === Инициализация ===
loadState(() => {
  updateBalance();
  updateGarage();

  document.querySelectorAll('.spin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      spin(parseInt(btn.dataset.price), parseInt(btn.dataset.luck));
    });
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
});