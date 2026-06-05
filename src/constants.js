export const GAME_VERSION = 'v0.1.0';   // SemVer + git 태그와 동기화 (타이틀에 표기)

export const CANVAS_W = 640;
export const CANVAS_H = 360;
export const HUD_W = 112;        // 왼쪽 HUD 너비
export const VIEW_W = 528;       // 실제 게임 뷰포트 너비
export const VIEW_H = 360;

export const GRAVITY = 0.45;
export const JUMP_FORCE = -10;
export const SPRING_FORCE = -16;   // 스프링 발판 도약력(일반 점프보다 강함 → 높은 곳/용암 건너기)
export const PLAYER_SPEED = 2.2;

export const GROUND_Y = 300;     // 지면 y좌표 (발이 닿는 위치)

export const GAME_STATE = {
  TITLE:       'title',
  STORY:       'story',
  PLAYING:     'playing',
  SHOP:        'shop',
  GAME_OVER:   'gameover',
  STAGE_CLEAR: 'stageclear',
  WIN:         'win',
  PAUSE:       'pause',
};

export const COLORS = {
  sky:         '#5c94fc',
  cloud:       '#ffffff',
  ground:      '#a07040',
  groundTop:   '#50a830',
  hudBg:       '#000000',
  hudBorder:   '#888888',
  gold:        '#ffd700',
  heart:       '#e81020',
  heartEmpty:  '#600000',
  text:        '#ffffff',
  shopDoor:    '#8040c0',
  bossDoor:    '#800000',
};
