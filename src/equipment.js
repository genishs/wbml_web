export const SWORD = {
  none:      { id: 'none',     name: '없음',          atk: 0,  reach: 0,  cost: 0,    bladeColor: null,     guardColor: null },
  gradius:   { id: 'gradius',  name: '그라디우스',     atk: 2,  reach: 14, cost: 50,   bladeColor: '#a8c8f0', guardColor: '#c0a020' },
  broad:     { id: 'broad',    name: '브로드소드',     atk: 4,  reach: 18, cost: 150,  bladeColor: '#c8c8d8', guardColor: '#c0a020' },
  great:     { id: 'great',    name: '그레이트소드',   atk: 6,  reach: 22, cost: 350,  bladeColor: '#d8d8e8', guardColor: '#d0b020' },
  excalibur: { id: 'excalibur',name: '엑스칼리버',     atk: 9,  reach: 26, cost: 800,  bladeColor: '#ffe080', guardColor: '#d0a010' },
  legend:    { id: 'legend',   name: '레전드소드',     atk: 14, reach: 30, cost: 2000, bladeColor: '#ff88ff', guardColor: '#ff4080' },
};

export const SHIELD = {
  none:   { id: 'none',   name: '없음',        def: 0,  block: 0.0, cost: 0,    bodyColor: null,     rimColor: null },
  light:  { id: 'light',  name: '라이트 방패',  def: 5,  block: 0.3, cost: 80,   bodyColor: '#b8c8d8', rimColor: '#808898' },
  knight: { id: 'knight', name: '나이트 방패',  def: 10, block: 0.5, cost: 200,  bodyColor: '#6080b8', rimColor: '#405080' },
  heavy:  { id: 'heavy',  name: '무거운 방패',  def: 15, block: 0.7, cost: 500,  bodyColor: '#506070', rimColor: '#304050' },
  legend: { id: 'legend', name: '전설의 방패',  def: 20, block: 0.9, cost: 1500, bodyColor: '#e8d050', rimColor: '#c0a020' },
};

export const ARMOR = {
  none:   { id: 'none',   name: '없음',        def: 0,  cost: 0,    bodyColor: null,     helmetColor: null,    trimColor: null },
  light:  { id: 'light',  name: '라이트 갑옷',  def: 5,  cost: 60,   bodyColor: '#d0dce8', helmetColor: '#c0ccd8', trimColor: '#9098a8' },
  knight: { id: 'knight', name: '나이트 갑옷',  def: 12, cost: 180,  bodyColor: '#d8b840', helmetColor: '#c0a030', trimColor: '#907010' },
  heavy:  { id: 'heavy',  name: '무거운 갑옷',  def: 20, cost: 400,  bodyColor: '#a07840', helmetColor: '#906830', trimColor: '#604020' },
  hard:   { id: 'hard',   name: '단단한 갑옷',  def: 28, cost: 900,  bodyColor: '#5870a0', helmetColor: '#486090', trimColor: '#304060' },
  legend: { id: 'legend', name: '전설의 갑옷',  def: 38, cost: 2000, bodyColor: '#e8e8e0', helmetColor: '#d8d8d0', trimColor: '#8090c0' },
};

export const BOOTS = {
  none:    { id: 'none',    name: '없음',       speed: 0,   jump: 0,   cost: 0,    color: null },
  cloth:   { id: 'cloth',   name: '천 부츠',    speed: 0.3, jump: 0.5, cost: 40,   color: '#c8a060' },
  leather: { id: 'leather', name: '가죽 부츠',  speed: 0.6, jump: 1.0, cost: 120,  color: '#7a4820' },
  ceramic: { id: 'ceramic', name: '세라믹 부츠', speed: 1.0, jump: 1.5, cost: 350,  color: '#5060b0' },
  legend:  { id: 'legend',  name: '전설의 부츠', speed: 1.5, jump: 2.5, cost: 1200, color: '#e03020' },
};

export const SHOP_TYPE = {
  WEAPON: 'weapon',
  SHIELD: 'shield',
  ARMOR:  'armor',
  BOOTS:  'boots',
};

export function getShopItems(shopType, player) {
  const eq = player.eq;
  switch (shopType) {
    case SHOP_TYPE.WEAPON:
      return Object.values(SWORD).filter(i => i.id !== 'none' && i.atk > (eq.sword?.atk ?? 0));
    case SHOP_TYPE.SHIELD:
      return Object.values(SHIELD).filter(i => i.id !== 'none' && i.def > (eq.shield?.def ?? 0));
    case SHOP_TYPE.ARMOR:
      return Object.values(ARMOR).filter(i => i.id !== 'none' && i.def > (eq.armor?.def ?? 0));
    case SHOP_TYPE.BOOTS:
      return Object.values(BOOTS).filter(i => i.id !== 'none' && i.speed > (eq.boots?.speed ?? 0));
    default:
      return [];
  }
}

export function shopTypeName(shopType) {
  return { weapon: '무기 상점', shield: '방패 상점', armor: '갑옷 상점', boots: '신발 상점' }[shopType] || '상점';
}

const _SWORD_ORDER = ['none', 'gradius', 'broad', 'great', 'excalibur', 'legend'];
export function getPlayerAppearanceStage(player) {
  const idx = _SWORD_ORDER.indexOf(player?.eq?.sword?.id ?? 'none');
  return Math.max(0, idx);
}
