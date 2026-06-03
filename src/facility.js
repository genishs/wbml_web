// 비전투 시설(문 열고 들어가는 walk-in 화면). 상점과 별개.
//  hospital 병원 : 체력 풀 회복 + 모래시계 타이머 리셋. 비용은 이용할수록 상승(20→40→70→100→110).
//  bar      술집 : 드링크 15G로 소량 회복 + 바텐더 힌트.
import { HUD_W, VIEW_W, CANVAS_H } from './constants.js';

const HOSPITAL_COSTS = [20, 40, 70, 100, 110];
const DRINK_COST = 15;

// 라운드별 바텐더 힌트(원작 감각의 플레이버; R6 스핑크스 등 핵심 힌트는 해당 기능 구현 시 연결)
const BAR_HINTS = {
  1: '검 없이는 앞으로 못 가네. 마을의 노인을 찾아가게.',
  4: '바다 건너 마을의 메리에게 편지를 전하면 좋은 걸 준다더군.',
  6: '스핑크스는 늘 "자기 자신"에 대해 묻지. 답을 잘 새겨두게.',
  9: '용암 너머 갑옷 가게엔 전설의 갑옷이 있다네. 비싸지만.',
  10: '점쟁이의 "더 나은 것"을 고르게 — 종이냐 루비냐, 길이 갈리지.',
};

export class Facility {
  constructor() {
    this.open = false;
    this.type = null;          // 'hospital' | 'bar'
    this.player = null;
    this.round = 1;
    this.message = '';
    this.msgTimer = 0;
    this.hintShown = false;
  }

  openFacility(type, player, round) {
    this.open = true;
    this.type = type;
    this.player = player;
    this.round = round;
    this.message = '';
    this.msgTimer = 0;
    this.hintShown = false;
  }

  close() { this.open = false; }

  hospitalCost() {
    const i = Math.min(this.player.hospitalVisits ?? 0, HOSPITAL_COSTS.length - 1);
    return HOSPITAL_COSTS[i];
  }

  update(input) {
    if (!this.open) return;
    if (this.msgTimer > 0) { this.msgTimer--; return; }
    if (input.wasPressed('KeyZ') || input.wasPressed('Space')) {
      this.type === 'hospital' ? this._useHospital() : this._useBar();
    }
    if (input.wasPressed('Escape') || input.wasPressed('KeyX')) this.close();
  }

  _useHospital() {
    const p = this.player, cost = this.hospitalCost();
    if (p.hp >= p.maxHp && p.timer >= p.timerMax) { this._msg('아직 멀쩡하군. 또 오게.'); return; }
    if (p.gold < cost) { this._msg('GOLD가 부족하다!'); return; }
    p.gold -= cost;
    p.hp = p.maxHp;
    p.timer = p.timerMax;
    p.hospitalVisits = (p.hospitalVisits ?? 0) + 1;
    this._msg('치료 완료! 체력과 시간이 회복되었다.');
  }

  _useBar() {
    const p = this.player;
    if (p.gold < DRINK_COST) { this._msg('GOLD가 부족하다!'); return; }
    p.gold -= DRINK_COST;
    p.hp = Math.min(p.maxHp, p.hp + 2);
    this.hintShown = true;
    this._msg('한 잔 들이켰다. (+2 HP)');
  }

  _msg(t) { this.message = t; this.msgTimer = 80; }

  draw(ctx) {
    if (!this.open) return;
    const x0 = HUD_W, cx = HUD_W + VIEW_W / 2, floorY = 250;
    const isHosp = this.type === 'hospital';

    // 실내 배경
    ctx.fillStyle = isHosp ? '#cdd6e0' : '#2a1c14';
    ctx.fillRect(x0, 0, VIEW_W, 360);
    ctx.fillStyle = isHosp ? '#b8c4d0' : '#241812';
    for (let bx = x0; bx < x0 + VIEW_W; bx += 40) ctx.fillRect(bx, 0, 2, floorY);
    ctx.fillStyle = isHosp ? '#8a96a4' : '#4a3420';
    ctx.fillRect(x0, floorY, VIEW_W, 360 - floorY);

    // 간판
    ctx.fillStyle = '#1a1008'; ctx.fillRect(cx - 110, 12, 220, 30);
    ctx.strokeStyle = isHosp ? '#ff5566' : '#c89030'; ctx.lineWidth = 2;
    ctx.strokeRect(cx - 110, 12, 220, 30);
    ctx.fillStyle = isHosp ? '#ff6677' : '#ffdd66';
    ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
    ctx.fillText(isHosp ? 'HOSPITAL' : 'BAR', cx, 33);

    if (isHosp) this._drawHospital(ctx, cx, floorY);
    else        this._drawBar(ctx, cx, floorY);

    // 소지 골드
    ctx.fillStyle = '#207030'; ctx.font = 'bold 11px monospace';
    ctx.fillText(`소지 GOLD: ${this.player.gold}`, cx, 56);

    // 안내(비용/효과)
    ctx.fillStyle = isHosp ? '#334' : '#ffcc99'; ctx.font = '12px monospace';
    if (isHosp) {
      ctx.fillText(`치료비 ${this.hospitalCost()} G  —  체력·시간 완전 회복`, cx, 200);
    } else {
      ctx.fillText(`드링크 ${DRINK_COST} G  —  +2 HP`, cx, 196);
      if (this.hintShown) {
        ctx.fillStyle = '#ffe27a'; ctx.font = 'italic 11px monospace';
        _wrap(ctx, '바텐더: ' + (BAR_HINTS[this.round] || '조심해서 가게, 친구.'), cx, 216, VIEW_W - 80, 14);
      }
    }

    // 메시지 / 조작 안내
    if (this.msgTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(cx - 150, 300, 300, 28);
      ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 1; ctx.strokeRect(cx - 150, 300, 300, 28);
      ctx.fillStyle = '#ffff88'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.message, cx, 319);
    } else {
      ctx.fillStyle = isHosp ? '#445' : '#bbbbbb'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`Z ${isHosp ? '치료' : '한 잔'}    X 나가기`, cx, 318);
    }
    ctx.textAlign = 'left';
  }

  _drawHospital(ctx, cx, floorY) {
    // 침대 + 적십자 + 간호사
    const bx = cx - 40, by = floorY - 34;
    ctx.fillStyle = '#e8e8f0'; ctx.fillRect(bx, by, 80, 22);          // 매트리스
    ctx.fillStyle = '#c0c0cc'; ctx.fillRect(bx, by + 22, 80, 8);      // 프레임
    ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + 60, by - 8, 18, 12); // 베개
    // 적십자 벽 장식
    ctx.fillStyle = '#ff3344';
    ctx.fillRect(cx + 70, floorY - 96, 26, 8); ctx.fillRect(cx + 79, floorY - 105, 8, 26);
    // 간호사
    const nx = cx - 78;
    ctx.fillStyle = '#ffd9b8'; ctx.fillRect(nx, floorY - 56, 14, 14);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(nx - 1, floorY - 60, 16, 6);
    ctx.fillStyle = '#ff3344'; ctx.fillRect(nx + 5, floorY - 59, 4, 3);
    ctx.fillStyle = '#eef0f4'; ctx.fillRect(nx, floorY - 42, 14, 24);
  }

  _drawBar(ctx, cx, floorY) {
    // 카운터 + 바텐더 + 술병 선반
    ctx.fillStyle = '#3a2614'; ctx.fillRect(cx - 90, floorY - 16, 180, 28);
    ctx.fillStyle = '#5a4024'; ctx.fillRect(cx - 90, floorY - 18, 180, 5);
    // 바텐더
    const x = cx, y = floorY - 70;
    ctx.fillStyle = '#e8b888'; ctx.fillRect(x - 8, y, 16, 14);
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - 9, y - 5, 18, 6);
    ctx.fillStyle = '#222'; ctx.fillRect(x - 4, y + 6, 3, 3); ctx.fillRect(x + 2, y + 6, 3, 3);
    ctx.fillStyle = '#444a55'; ctx.fillRect(x - 11, y + 14, 22, 24);
    // 술병 선반
    ctx.fillStyle = '#1a1008'; ctx.fillRect(cx - 70, 70, 140, 6);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = ['#88cc66', '#cc7744', '#6688cc', '#cc66aa'][i % 4];
      ctx.fillRect(cx - 62 + i * 22, 54, 8, 16);
    }
  }
}

function _wrap(ctx, text, cx, y, maxW, lh) {
  const words = text.split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, cx, yy); line = w; yy += lh; }
    else line = test;
  }
  if (line) ctx.fillText(line, cx, yy);
}
