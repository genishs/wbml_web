export const SWORD = {
  none:      { id: 'none',     name: '없음',          atk: 0,  reach: 0,  cost: 0,    bladeColor: null,     guardColor: null },
  gradius:   { id: 'gradius',  name: '그라디우스',     atk: 1, reach: 14, cost: 50,   bladeColor: '#88bbff', guardColor: '#ffcc00' },
  broad:     { id: 'broad',    name: '브로드소드',     atk: 2, reach: 18, cost: 150,  bladeColor: '#cccccc', guardColor: '#ffcc00' },
  great:     { id: 'great',    name: '그레이트소드',   atk: 3, reach: 22, cost: 350,  bladeColor: '#dddddd', guardColor: '#ffdd00' },
  excalibur: { id: 'excalibur',name: '엑스칼리버',     atk: 4, reach: 26, cost: 800,  bladeColor: '#ffee00', guardColor: '#ffaa00' },
  legend:    { id: 'legend',   name: '레전드소드',     atk: 8, reach: 30, cost: 2000, bladeColor: '#cc00ff', guardColor: '#ff5500' },
};

// 방패: 투사체 방어 + 강할수록 넉백 저항(kbResist) ↑. (원작: 강한 방패일수록 덜 밀림)
export const SHIELD = {
  none:   { id: 'none',   name: '없음',        def: 0,  block: 0.0, kbResist: 0.0,  cost: 0,    bodyColor: null,     rimColor: null },
  light:  { id: 'light',  name: '라이트 방패',  def: 5,  block: 0.3, kbResist: 0.15, cost: 40,   bodyColor: '#88bbbb', rimColor: '#558888' },
  knight: { id: 'knight', name: '나이트 방패',  def: 10, block: 0.5, kbResist: 0.30, cost: 120,  bodyColor: '#5588cc', rimColor: '#3344aa' },
  heavy:  { id: 'heavy',  name: '하드 방패',    def: 15, block: 0.7, kbResist: 0.45, cost: 250,  bodyColor: '#558888', rimColor: '#225555' },
  legend: { id: 'legend', name: '전설의 방패',  def: 20, block: 0.9, kbResist: 0.60, cost: 360,  bodyColor: '#ffcc00', rimColor: '#aa8800' },
};

// 갑옷: 데미지 감소 ↑. 단 무거운 갑옷은 민첩성(agi: 이동/점프) ↓ 너프. 레전드는 방어 최고+가벼움.
export const ARMOR = {
  none:   { id: 'none',   name: '없음',        def: 0,  agi: 0,     cost: 0,    bodyColor: null,     helmetColor: null,    trimColor: null },
  light:  { id: 'light',  name: '라이트 갑옷',  def: 5,  agi:  0.00, cost: 60,   bodyColor: '#bbbbff', helmetColor: '#99ddff', trimColor: '#5588cc' },
  knight: { id: 'knight', name: '나이트 갑옷',  def: 12, agi: -0.10, cost: 180,  bodyColor: '#ffcc00', helmetColor: '#ffaa00', trimColor: '#aa8800' },
  heavy:  { id: 'heavy',  name: '무거운 갑옷',  def: 20, agi: -0.35, cost: 400,  bodyColor: '#aa7766', helmetColor: '#885544', trimColor: '#663322' },
  hard:   { id: 'hard',   name: '단단한 갑옷',  def: 28, agi: -0.50, cost: 900,  bodyColor: '#5588cc', helmetColor: '#3344aa', trimColor: '#223388' },
  legend: { id: 'legend', name: '전설의 갑옷',  def: 38, agi: -0.12, cost: 2000, bodyColor: '#ffffff', helmetColor: '#ccccff', trimColor: '#88bbff' },
};

// 부츠: 이동성 전용(공/방 없음). 좋을수록 빠르고 높이 점프. friction↑ = 미끄러움(너프).
// 천 부츠는 미끄러워(friction 0.90) 정밀 점프가 어렵다. 좋은 부츠일수록 접지력↑(friction↓).
export const BOOTS = {
  none:    { id: 'none',    name: '없음',       speed: 0,   jump: 0,   friction: 0.80, cost: 0,    color: null },
  cloth:   { id: 'cloth',   name: '천 부츠',    speed: 0.4, jump: 0.6, friction: 0.90, cost: 40,   color: '#bbbb88' },
  leather: { id: 'leather', name: '가죽 부츠',  speed: 0.7, jump: 1.1, friction: 0.85, cost: 120,  color: '#774433' },
  ceramic: { id: 'ceramic', name: '세라믹 부츠', speed: 1.1, jump: 1.6, friction: 0.81, cost: 350,  color: '#5588cc' },
  legend:  { id: 'legend',  name: '전설의 부츠', speed: 1.6, jump: 2.6, friction: 0.78, cost: 1200, color: '#ee0000' },
};

// 서브웨폰(매직). kind = 데미지 로직 종류:
//  roll(폭탄)    : 굴러가다 적/벽에 닿으면 폭발 → 단발 피해 후 소멸
//  fly(파이어볼) : 직선 비행, 첫 적 1체 단발 피해 후 소멸(관통 없음)
//  tornado(회오리): 지면 따라 이동, 수명 동안 다단 히트(tick 간격 재타격)
//  thunder(썬더) : 즉발, 화면 내 모든 적 일괄 1회 피해
export const MAGIC = {
  bomb:     { id: 'bomb',     name: '폭탄',        kind: 'roll',    cost: 10, dmg: 3, speed: 3.2, life: 150, buy: 5, color: '#222222', core: '#ff7700' },
  fireball: { id: 'fireball', name: '파이어볼',    kind: 'fly',     cost: 20, dmg: 5, speed: 6.0, life: 110, buy: 1, color: '#ff7700', core: '#ffee00' },
  tornado:  { id: 'tornado',  name: '회오리',      kind: 'tornado', cost: 30, dmg: 2, speed: 1.8, life: 170, buy: 1, tick: 12, color: '#88bbff', core: '#ffffff' },
  thunder:  { id: 'thunder',  name: '썬더 플래시', kind: 'thunder', cost: 50, dmg: 6, speed: 0,   life: 28,  buy: 1, color: '#ffff00', core: '#ffffff' },
};
export const MAGIC_ORDER = ['bomb', 'fireball', 'tornado', 'thunder'];

export const SHOP_TYPE = {
  WEAPON: 'weapon',
  SHIELD: 'shield',
  ARMOR:  'armor',
  BOOTS:  'boots',
  MAGIC:  'magic',
};

// 상점은 한 번에 최대 2가지만 진열(원작: 좌/우 둘 중 선택).
export function getShopItems(shopType, player, stage = 1) {
  const eq = player.eq;
  switch (shopType) {
    case SHOP_TYPE.WEAPON: {
      // 아케이드: 첫 검 Gradius만 상점에서 획득. 이후는 보스 드롭(구매 불가).
      const hasSword = (eq.sword?.id ?? 'none') !== 'none';
      return hasSword ? [] : [SWORD.gradius];
    }
    case SHOP_TYPE.SHIELD:
      return Object.values(SHIELD).filter(i => i.id !== 'none' && i.def > (eq.shield?.def ?? 0)).slice(0, 2);
    case SHOP_TYPE.ARMOR:
      return Object.values(ARMOR).filter(i => i.id !== 'none' && i.def > (eq.armor?.def ?? 0)).slice(0, 2);
    case SHOP_TYPE.BOOTS:
      return Object.values(BOOTS).filter(i => i.id !== 'none' && i.speed > (eq.boots?.speed ?? 0)).slice(0, 2);
    case SHOP_TYPE.MAGIC: {
      // 전반엔 폭탄/파이어볼, 후반엔 회오리/썬더 (매직은 반복 구매)
      const list = Object.values(MAGIC);
      return stage <= 5 ? list.slice(0, 2) : list.slice(2, 4);
    }
    default:
      return [];
  }
}

export function shopTypeName(shopType) {
  return { weapon: '무기 상점', shield: '방패 상점', armor: '갑옷 상점', boots: '신발 상점', magic: '매직 상점' }[shopType] || '상점';
}

const _SWORD_ORDER = ['none', 'gradius', 'broad', 'great', 'excalibur', 'legend'];
export function getPlayerAppearanceStage(player) {
  const idx = _SWORD_ORDER.indexOf(player?.eq?.sword?.id ?? 'none');
  return Math.max(0, idx);
}
