# Wonder Boy in Monster Land - Web Homage

클래식 아케이드 게임 **Wonder Boy in Monster Land** (1987, Sega)를 오마주한 HTML5 Canvas 기반 웹 게임입니다.

**Play:** https://genishs.github.io/wbml_web/

---

## 조작법

| 키 | 동작 |
|---|---|
| ← → | 이동 |
| Z / Space | 점프 |
| X | 공격 |
| Enter | 확인 / 상점 입장 |
| Esc / Z | 상점 나가기 |

---

## 게임 요소

- **2개 스테이지** — 각 스테이지 끝에 보스(드래곤) 존재
- **체력(하트)** — 피격 시 감소, 무적 시간 존재
- **타이머** — 시간 초과 시 즉사
- **골드** — 맵에서 수집하거나 몬스터 처치로 획득
- **상점** — 스테이지 중간에 위치, 장비 구매 가능
- **점수** — 몬스터 처치 + 골드 + 스테이지 클리어 보너스

### 장비

| 아이템 | 비용 | 효과 |
|---|---|---|
| Iron Sword | 50G | 공격력 +1, 사거리 증가 |
| Wood Shield | 40G | 방어력 +1 |
| Chain Armor | 80G | 방어력 +1, 최대 HP +2 |
| Speed Boots | 60G | 이동속도 증가 |
| Life Potion | 30G | HP 완전 회복 |

### 몬스터

| 몬스터 | HP | 공격력 | 골드 |
|---|---|---|---|
| Slime | 2 | 1 | 5G |
| Goblin | 4 | 2 | 15G |
| Knight | 8 | 3 | 30G |
| Dragon (보스) | 20 | 5 | 100G |

---

## 기술 스택

- Vanilla JavaScript (ES Modules)
- HTML5 Canvas API
- GitHub Actions — GitHub Pages 자동 배포

---

## 파일 구조

```
wbml_web/
├── index.html
├── src/
│   ├── main.js        # 진입점
│   ├── game.js        # 메인 게임 루프 및 상태 관리
│   ├── player.js      # 플레이어 이동/공격/장비
│   ├── enemy.js       # 적 AI 및 넉백
│   ├── shop.js        # 상점 UI 및 아이템 적용
│   ├── stage.js       # 스테이지 레이아웃 및 렌더링
│   ├── ui.js          # HUD, 타이틀/게임오버/클리어 화면
│   ├── input.js       # 키보드 입력 관리
│   └── constants.js   # 상수 정의
└── .github/workflows/
    └── deploy.yml     # GitHub Pages 자동 배포
```

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v0.4 | 2026-04-05 | 픽셀 아트 스프라이트 적용 — 플레이어(3프레임), 슬라임/고블린/기사/드래곤 원본 스타일 재현 |
| v0.3 | 2026-04-05 | 풀스크린 레터박스 — 창 크기에 맞게 CSS transform 스케일, 16:9 비율 유지 |
| v0.2 | 2026-04-05 | 적 피격 시 넉백 추가 — 공격 방향으로 밀려남, 넉백 중 AI 억제 |
| v0.1 | 2026-04-05 | 최초 구현 — 2스테이지, 상점, 장비, 몬스터 4종, HUD, GitHub Pages 배포 |
