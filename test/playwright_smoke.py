# WBML 웹 클론 — Playwright 스모크 테스트 (페르소나 팀 공용 테스트 하니스)
#
# 목적: `node --check`로는 못 잡는 "실제 브라우저 로딩"을 검증한다.
#   - ES 모듈 그래프가 에러 없이 로드/부팅되는가 (콘솔/페이지 에러 0)
#   - 타이틀 → 스토리 → 플레이 상태 전환이 되는가
#   - 입력(이동/공격)이 게임 상태에 반영되는가
#   - 찌르기 한 번이 ≈0.5초 동안 잠기는가 (원작 감각 회귀 방지)
#
# 실행: python test/playwright_smoke.py
#   - 127.0.0.1:8000 에 dev 서버가 떠 있으면 재사용, 없으면 직접 띄웠다가 정리.
#   - 의존: Python playwright + chromium (이미 설치됨). 게임은 window.__game 으로 상태 노출.

import sys, time, socket, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

# Windows 콘솔 기본 cp949에서 한글/em-dash 출력 깨짐 방지
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

ROOT = Path(__file__).resolve().parent.parent
HOST, PORT = '127.0.0.1', 8000
BASE = f'http://{HOST}:{PORT}'
SHOTS = ROOT / 'test' / 'shots'

results = []
def check(name, ok, detail=''):
    results.append((name, ok, detail))
    mark = 'PASS' if ok else 'FAIL'
    print(f'  [{mark}] {name}' + (f'  — {detail}' if detail else ''))

def server_up():
    with socket.socket() as s:
        s.settimeout(0.3)
        try: s.connect((HOST, PORT)); return True
        except OSError: return False

def wait_state(page, target, timeout=4.0):
    """game.state 가 target 이 될 때까지 대기."""
    end = time.time() + timeout
    while time.time() < end:
        st = page.evaluate("() => window.__game && window.__game.state")
        if st == target: return True
        time.sleep(0.05)
    return False

def press(page, key, n=1):
    # keyboard.press 는 down+up이 즉시라 ~16ms 프레임 샘플링 사이에 끼면 edge-trigger를 놓친다.
    # 키를 한 프레임 이상(>16ms) 누르고 있다가 떼어 wasPressed가 확실히 잡히게 한다.
    for _ in range(n):
        page.keyboard.down(key); time.sleep(0.05)
        page.keyboard.up(key);   time.sleep(0.05)

def run(page):
    # 1) 콘솔/페이지 에러 수집 시작
    errors = []
    page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))

    page.goto(BASE + '/index.html', wait_until='networkidle')
    time.sleep(0.6)  # 모듈 로드 + loadAssets().finally → game.start()

    # 2) 모듈 그래프가 부팅됐는가
    booted = page.evaluate("() => !!(window.__game)")
    check('게임 부팅(window.__game 존재)', booted)
    check('로드 중 콘솔/페이지 에러 없음', len(errors) == 0, '; '.join(errors[:4]))
    if not booted:
        return  # 더 진행 불가

    # 3) 초기 상태 = 타이틀
    st0 = page.evaluate("() => window.__game.state")
    check('초기 상태 = title', st0 == 'title', f'state={st0}')

    # 4) 타이틀 → 스토리
    press(page, 'Enter')
    check('Enter 후 story 진입', wait_state(page, 'story'))

    # 5) 스토리 넘겨 플레이 진입
    for _ in range(12):
        if page.evaluate("() => window.__game.state") == 'playing': break
        press(page, 'Enter')
    check('스토리 통과 → playing 진입', wait_state(page, 'playing', 2.0))

    SHOTS.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SHOTS / 'playing.png'))

    # 6) 이동 입력이 반영되는가 (오른쪽으로 이동 → player.x 증가)
    x0 = page.evaluate("() => window.__game.player.x")
    page.keyboard.down('ArrowRight'); time.sleep(0.5); page.keyboard.up('ArrowRight')
    time.sleep(0.1)
    x1 = page.evaluate("() => window.__game.player.x")
    check('오른쪽 이동 반영(player.x 증가)', x1 > x0 + 2, f'{x0:.1f} → {x1:.1f}')

    # 7) 검 지급(없으면 공격 불가) — 1라운드 첫 NPC가 검을 줌. 보장 위해 직접 장착.
    has_sword = page.evaluate("() => window.__game.player.eq.sword.id !== 'none'")
    if not has_sword:
        # 테스트 편의: 그라디우스 장착 (게임 진행과 무관한 검증용)
        page.evaluate("() => { const g=window.__game; g.player.awardSword && g.player.awardSword({id:'gradius',name:'그라디우스',atk:1,reach:14,bladeColor:'#88bbff',guardColor:'#ffcc00'}); }")
    has_sword = page.evaluate("() => window.__game.player.eq.sword.id !== 'none'")
    check('검 보유(공격 가능 상태)', has_sword)

    # 8) 찌르기 타이밍 — 한 번 찌르기가 ≈0.5초 잠기는가
    #    Z 누른 직후 state='attack' 시작, 'attack'에서 벗어날 때까지 실측.
    if has_sword:
        page.keyboard.down('z')          # 누른 채 한 사이클 측정(홀드는 edge-trigger라 재공격 안 됨)
        # attack 진입 대기
        t_enter = None
        end = time.time() + 0.5
        while time.time() < end:
            if page.evaluate("() => window.__game.player.state") == 'attack':
                t_enter = time.time(); break
            time.sleep(0.006)
        if t_enter is None:
            page.keyboard.up('z')
            check('Z 입력 → attack 상태 진입', False)
        else:
            check('Z 입력 → attack 상태 진입', True)
            page.screenshot(path=str(SHOTS / 'attack.png'))
            # attack 종료까지 대기(지속시간 실측)
            end = time.time() + 1.5
            dur = None
            while time.time() < end:
                if page.evaluate("() => window.__game.player.state") != 'attack':
                    dur = time.time() - t_enter; break
                time.sleep(0.006)
            page.keyboard.up('z')
            if dur is None:
                check('찌르기 지속 ≈0.5초', False, '종료 미감지(>1.5s)')
            else:
                # 60fps×30프레임=0.5s 목표. 폴링/렌더 변동 고려해 0.40~0.70s 허용.
                check('찌르기 지속 ≈0.5초', 0.40 <= dur <= 0.70, f'{dur*1000:.0f}ms')

    # 9) 숨은 문 — ↑로 탐색해 드러나는가 (R3: 숨은 방패 상점)
    page.evaluate("() => window.__game._loadStage(3)")
    time.sleep(0.1)
    hd = page.evaluate("""() => {
        const d = window.__game.stageData.doors.find(x => x.hidden);
        return d ? { x: d.x, w: d.w, type: d.type, revealed: !!d.revealed } : null;
    }""")
    check('숨은 문 존재(초기 미발견)', bool(hd) and not hd['revealed'], hd and hd['type'])
    if hd:
        # 플레이어를 숨은 문 앞 지면에 세우고 한 프레임 흘려 nearDoor 갱신
        cx = hd['x'] + hd['w'] / 2
        page.evaluate(f"""() => {{ const p = window.__game.player;
            p.x = {cx} - p.w/2; p.y = 300 - p.h; p.vx = 0; p.vy = 0; }}""")
        time.sleep(0.12)
        before = page.evaluate("() => window.__game.stageData.doors.find(x => x.hidden) && window.__game.stageData.doors.find(x => x.hidden).revealed")
        press(page, 'ArrowUp')
        time.sleep(0.1)
        after = page.evaluate("() => window.__game.stageData.doors.find(x => x.hidden && x.revealed) ? true : false")
        check('↑ 누르면 숨은 문 드러남(revealed)', (not before) and after, f'{before}→{after}')
        page.screenshot(path=str(SHOTS / 'hidden_revealed.png'))

    # 10) 진행방향 RL — R3는 우측 스폰 후 왼쪽으로 진행, 성문은 좌측
    page.evaluate("() => window.__game._loadStage(3)")
    time.sleep(0.15)
    rl = page.evaluate("""() => {
        const g = window.__game, s = g.stageData;
        return { dir: s.dir, px: g.player.x, len: s.groundLen,
                 gate: s.castleGate.x, cam: g.camX };
    }""")
    check('R3 = RL 방향', rl['dir'] == 'RL', rl['dir'])
    check('RL: 플레이어 우측 스폰', rl['px'] > rl['len'] * 0.5, f"x={rl['px']:.0f}/{rl['len']}")
    check('RL: 성문 좌측 배치', rl['gate'] < rl['len'] * 0.3, f"gate={rl['gate']:.0f}")
    page.screenshot(path=str(SHOTS / 'rl_spawn.png'))
    x0 = rl['px']
    page.keyboard.down('ArrowLeft'); time.sleep(0.5); page.keyboard.up('ArrowLeft')
    time.sleep(0.1)
    x1 = page.evaluate("() => window.__game.player.x")
    check('RL: 왼쪽 이동 반영(x 감소)', x1 < x0 - 2, f'{x0:.0f} → {x1:.0f}')

def main():
    started = None
    if not server_up():
        print(f'(dev 서버 없음 — serve_dev.py 자동 기동)')
        started = subprocess.Popen([sys.executable, str(ROOT / 'serve_dev.py')],
                                   cwd=str(ROOT), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(40):
            if server_up(): break
            time.sleep(0.1)
    else:
        print(f'(기존 dev 서버 재사용: {BASE})')

    print('WBML Playwright 스모크 테스트')
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 640, 'height': 360})
            try:
                run(page)
            finally:
                browser.close()
    finally:
        if started:
            started.terminate()
            try: started.wait(timeout=3)
            except Exception: started.kill()

    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    print(f'\n{passed}/{total} passed')
    sys.exit(0 if passed == total else 1)

if __name__ == '__main__':
    main()
