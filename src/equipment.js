export const SHOP_TYPE = {
  STARTER_GIFT: 'starter_gift',
  SHIELD: 'shield',
  ARMOR: 'armor',
  BOOTS: 'boots',
  WEAPON: 'weapon',
};

export const SHOP_ITEMS = [
  {
    id: 'knife',
    slot: 'sword',
    tier: 0,
    label: 'KNIFE',
    cost: 0,
    desc: '기본 칼. 상인에게서 무료로 받는다',
    iconKey: 'sword',
    appearanceKey: 'sword',
    stageValue: 0,
    bonuses: { attack: 1, range: 6 },
  },
  {
    id: 'broad_sword',
    slot: 'sword',
    tier: 1,
    label: 'BROAD SWORD',
    cost: 50,
    desc: '공격력 +1, 사거리 증가',
    iconKey: 'swordBroad',
    appearanceKey: 'swordBroad',
    stageValue: 2,
    bonuses: { attack: 1, range: 16 },
  },
  {
    id: 'shield',
    slot: 'shield',
    tier: 1,
    label: 'SHIELD',
    cost: 40,
    desc: '기본 방패',
    iconKey: 'shield',
    appearanceKey: 'shield',
    stageValue: 1,
    bonuses: {},
  },
  {
    id: 'armor',
    slot: 'armor',
    tier: 1,
    label: 'ARMOR',
    cost: 80,
    desc: '피해 감소 +1',
    iconKey: 'armor',
    appearanceKey: 'armor',
    stageValue: 1,
    bonuses: { defense: 1 },
  },
  {
    id: 'boots',
    slot: 'boots',
    tier: 1,
    label: 'BOOTS',
    cost: 60,
    desc: '이동속도 증가',
    iconKey: 'boots',
    appearanceKey: 'boots',
    stageValue: 1,
    bonuses: { speedMultiplier: 1.4 },
  },
];

export const REFERENCE_EQUIPMENT = {
  swords: [
    { key: 'sword', label: 'KNIFE' },
    { key: 'swordBroad', label: 'BROAD SWORD' },
    { key: 'swordGradius', label: 'GRADIUS' },
    { key: 'swordExcalibur', label: 'EXCALIBUR' },
    { key: 'swordLegend', label: 'SWORD OF LEGEND' },
  ],
  shields: [{ key: 'shield', label: 'SHIELD' }],
  armors: [{ key: 'armor', label: 'ARMOR' }],
  boots: [{ key: 'boots', label: 'BOOTS' }],
};

const SHOP_ITEM_MAP = Object.fromEntries(SHOP_ITEMS.map(item => [item.id, item]));

const SHOP_TYPE_TO_SLOT = {
  [SHOP_TYPE.SHIELD]: 'shield',
  [SHOP_TYPE.ARMOR]: 'armor',
  [SHOP_TYPE.BOOTS]: 'boots',
  [SHOP_TYPE.WEAPON]: 'sword',
};

export function getShopItem(id) {
  return SHOP_ITEM_MAP[id] || null;
}

export function getOwnedShopItems(player) {
  return Object.values(player.equipment)
    .filter(Boolean)
    .map(getShopItem)
    .filter(Boolean);
}

export function getEquipmentAppearanceKeys(player) {
  return {
    sword: getShopItem(player.equipment.sword)?.appearanceKey || null,
    shield: getShopItem(player.equipment.shield)?.appearanceKey || null,
    armor: getShopItem(player.equipment.armor)?.appearanceKey || null,
    boots: getShopItem(player.equipment.boots)?.appearanceKey || null,
  };
}

export function getPlayerAppearanceStage(player) {
  const stageScore = getOwnedShopItems(player).reduce((sum, item) => sum + (item.stageValue || 0), 0);
  return Math.min(stageScore, 5);
}

export function getCurrentTier(player, slot) {
  const item = getShopItem(player.equipment[slot]);
  return item?.tier ?? -1;
}

export function getShopItemsForType(shopType, player) {
  if (shopType === SHOP_TYPE.STARTER_GIFT) {
    return player.equipment.sword ? [] : [getShopItem('knife')];
  }

  const slot = SHOP_TYPE_TO_SLOT[shopType];
  if (!slot) return [];

  const currentTier = getCurrentTier(player, slot);
  return SHOP_ITEMS.filter(item =>
    item.slot === slot &&
    item.tier > currentTier &&
    item.id !== 'knife'
  ).sort((a, b) => a.tier - b.tier);
}

export function getShopTitle(shopType) {
  switch (shopType) {
    case SHOP_TYPE.STARTER_GIFT: return '* SWORD GIFT *';
    case SHOP_TYPE.SHIELD: return '* SHIELD SHOP *';
    case SHOP_TYPE.ARMOR: return '* ARMOR SHOP *';
    case SHOP_TYPE.BOOTS: return '* BOOTS SHOP *';
    case SHOP_TYPE.WEAPON: return '* WEAPON SHOP *';
    default: return '* SHOP *';
  }
}
