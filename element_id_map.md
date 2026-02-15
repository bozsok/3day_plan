# Projekt ID Térkép - Ellenőrző Lista (v0.10.2)

Ez a dokumentum tartalmazza az alkalmazás összes vizuális elemének azonosítóját (ID), a megjelenés sorrendjében és logikai egységekbe bontva.

## 1. Alkalmazás Keret és Főképernyő (Nyitóoldal)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 1 | [x] | Alkalmazás legkülső konténere | `app-main-layout-root` | Teljes háttér |
| 2 | [ ] | Fő tartalmi terület (main tag) | `main-layout-container` | MainLayout.tsx / Wrapper |
| 3 | [x] | Fő tartalmi terület (Route váltó) konténer | `main-content-router-wrapper` | Minden kártya felett |
| 4 | [x] | Oldalváltás animációs rétege | `page-transition-layer` | Az áttűnésekért felel |
| 5 | [x] | Statikus kártya befoglaló | `static-page-card-holder` | A kártyán belüli div |
| 6 | [x] | Külső fő kártya konténer | `hero-root-card` | Maga a fehér kártya |
| 7 | [x] | Felső dekoratív háttér elem (zöld) | `hero-bg-blob-top` | Derengés jobb fent |
| 8 | [x] | Alsó dekoratív háttér elem (kék) | `hero-bg-blob-bottom` | Derengés bal lent |
| 9 | [x] | Tartalmi rész központi konténere | `hero-content-wrapper` | Szövegek gyűjtője |
| 10 | [x] | Felső státusz jelző felirat (bejelentkezve) | `hero-status-badge` | Kis kapszula |
| 11 | [x] | Státusz jelző kis lüktető kör | `hero-status-pulse` | Zöld pont |
| 12 | [x] | Státusz jelző szöveges felirat | `hero-status-text` | Szöveg |
| 13 | [x] | Főoldali kiemelt címsor (H1) | `hero-main-title` | |
| 14 | [x] | Kiemelt színes szövegrész a címben | `hero-title-gradient-text` | Gradiens szöveg |
| 15 | [x] | Alszöveg / Leírás | `hero-description-text` | |
| 16 | [x] | Funkciókat bemutató ikonok sávja | `hero-features-container` | |
| 17 | [x] | "Időzítés" ikon és felirat egysége | `feature-timing-box` | |
| 18 | [x] | "Tájegység" ikon és felirat egysége | `feature-region-box` | |
| 19 | [x] | "Program" ikon és felirat egysége | `feature-program-box` | |
| 20 | [x] | Bejelentkezési / Üdvözlő doboz kerete | `hero-auth-container` | |
| 21 | [x] | Üdvözlő doboz (bejelentkezve) | `hero-auth-logged-in` | Wrapper |
| 22 | [x] | Üdvözlő felirat névvel (bejelentkezve) | `welcome-user-title` | |
| 23 | [x] | Üdvözlő alszöveg (bejelentkezve) | `welcome-user-subtitle` | |
| 24 | [x] | "Tervezés" fő gomb (bejelentkezve) | `action-start-plan-button` | |
| 25 | [x] | "Eredmények" gomb (bejelentkezve) | `action-view-results-button` | |
| 26 | [x] | Bejelentkezési űrlap kerete (kijelentkezve) | `login-form-wrapper` | |
| 27 | [x] | Név beviteli mező konténere | `login-input-container` | |
| 28 | [x] | Felhasználó ikon a beviteli mezőben | `login-input-icon` | |
| 29 | [x] | Név beviteli mező (input) | `login-name-input` | |
| 30 | [x] | "Kezdés" gomb (kijelentkezve) | `login-submit-button` | |
| 31 | [x] | Hibaüzenet felirata | `hero-error-message` | |

## 2. Idővonal sáv felül (Lépésjelző)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 32 | [x] | Lépésjelző animációs konténere | `step-indicator-animation-wrapper` | A sáv mozgása |
| 33 | [x] | Lépésjelző középre igazító doboza | `step-indicator-centering-box` | |
| 34 | [x] | Lépésjelző fehér navigációs sáv | `step-indicator-nav` | Maga a kapszula |
| 35 | [x] | Egyedi lépés konténere (1-4) | `step-item-container-{idx}` | |
| 36 | [x] | Lépés kör/buborék (1-4) | `step-circle-{idx}` | |
| 37 | [x] | Lépés száma vagy pipa ikon (1-4) | `step-indicator-value-{idx}` | |
| 38 | [x] | Lépéseket összekötő vízszintes vonal (1-3) | `step-connector-line-{idx}` | |

## 3. 1. Lépés: Időpont választás (Dátumválasztás)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 39 | [x] | Lépés fejléc gyűjtő konténere | `step-header-container` | StepHeader.tsx |
| 40 | [x] | Lépés fejléc főcíme (H1) | `step-header-title` | StepHeader.tsx |
| 41 | [x] | Lépés fejléc leírása | `step-header-description` | StepHeader.tsx |
| 42 | [x] | Lépés számát jelző címke keret | `step-label-wrapper` | StepLabel.tsx |
| 43 | [x] | Időpont választó kártya befoglaló | `date-selection-step-card` | StepCard wrapper |
| 44 | [x] | Bal oldali tartalmi sáv | `date-selection-content-left` | Szöveg és gombok |
| 45 | [x] | Navigációs gombok konténere | `date-selection-nav-container` | |
| 46 | [x] | Navigációs "Vissza" gomb | `date-selection-back-btn` | NavButton |
| 47 | [x] | Navigációs "Tovább" gomb | `date-selection-next-btn` | |
| 48 | [x] | "Tovább" gomb belső ikonja | `date-selection-next-icon` | ArrowRight |
| 49 | [x] | Jobb oldali tartalmi sáv | `date-selection-content-right` | Naptár terület |
| 50 | [x] | Naptár komponens közvetlen befoglalója | `calendar-wrapper-box` | |
| 51 | [x] | Naptár gyökér eleme | `calendar-root` | CustomCalendar |
| 52 | [x] | Naptár navigációs fejléce | `calendar-nav-header` | Hónap váltó felett |
| 53 | [x] | Aktuális hónap/év kijelző | `calendar-view-month` | |
| 54 | [x] | Hónapváltó gombok konténere | `calendar-nav-buttons` | |
| 55 | [x] | Előző hónap gomb | `calendar-prev-month-btn` | |
| 56 | [x] | Következő hónap gomb | `calendar-next-month-btn` | |
| 57 | [x] | Napfejlécek rácsa (H-V) | `calendar-day-headers-grid` | |
| 58 | [x] | Naptári napok rácsa | `calendar-days-grid` | 42 cella |
| 59 | [x] | Egyedi naptári nap gomb | `calendar-day-btn-{idx}` | |
| 60 | [x] | Kijelölt időpont infó doboza | `calendar-info-box` | Naptár alatt |

## 4. 2. Lépés: Úti cél (Régióválasztás)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 61 | [x] | Régió választó kártya befoglaló | `region-selection-step-card` | MapSelection.tsx |
| 62 | [x] | Bal oldali tartalmi sáv | `region-selection-content-left` | Szöveg és gombok |
| 63 | [x] | Navigációs gombok konténere | `region-selection-nav-container` | |
| 64 | [x] | Navigációs "Vissza" gomb | `region-selection-back-btn` | NavButton |
| 65 | [x] | Navigációs "Tovább" gomb | `region-selection-next-btn` | Button |
| 66 | [x] | Jobb oldali tartalmi sáv | `region-selection-content-right` | Térkép terület |
| 67 | [x] | Térkép belső konténere | `region-selection-map-wrapper` | |
| 68 | [x] | Térkép fejléc konténere | `region-selection-map-header` | |
| 69 | [x] | Térkép fejléc felirata (H2) | `region-selection-map-title` | |
| 70 | [x] | Régió infó (pill) doboza | `region-info-box` | Térkép alatt |
| 71 | [x] | Info pilélet (root) | `info-pill-root` | InfoPill.tsx |
| 72 | [x] | Info pilula ikon doboz | `info-pill-icon-box` | InfoPill.tsx |
| 73 | [x] | Info pilula tartalom konténer | `info-pill-content` | InfoPill.tsx |
| 74 | [x] | Info pilula címke (label) | `info-pill-label` | InfoPill.tsx |
| 75 | [x] | Info pilula érték (value) | `info-pill-value` | InfoPill.tsx |
| 76 | [x] | Magyarország térkép (SVG) gyökér | `hungary-map-root` | HungaryMap.tsx |

## 5. 3. Lépés: Csomagok (Programcsomag választó)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 77 | [x] | Csomagválasztó kártya befoglaló | `package-selection-step-card` | PackageSelection.tsx |
| 78 | [x] | Felső fejléc sáv (fejléc + nav) | `package-selection-header-row` | |
| 79 | [x] | Navigációs gombok konténere | `package-selection-nav-controls` | |
| 80 | [x] | Navigációs "Vissza" gomb | `package-selection-back-btn` | NavButton |
| 81 | [x] | Navigációs "Tovább" gomb | `package-selection-next-btn` | NavButton |
| 82 | [x] | Szűrő gombok sávja | `package-selection-filter-bar` | |
| 83 | [x] | Egyedi szűrő gomb | `package-selection-filter-btn-{category}` | |
| 84 | [x] | Csomag kártyák listája / tárolója | `package-selection-cards-list` | |
| 85 | [x] | Nincs találat üzenet doboza | `package-selection-no-results` | |
| 86 | [x] | "Válassz másik megyét" gomb | `package-selection-back-to-map-btn` | |
| 87 | [x] | Csomag kártya gyökér | `package-card-root-{id}` | |
| 88 | [x] | Csomag kártya kép konténer | `package-card-image-wrapper` | |
| 89 | [x] | Csomag kártya kép overlay | `package-card-image-overlay` | |
| 90 | [x] | Csomag kártya tartalom konténer | `package-card-content` | |
| 91 | [x] | Csomag kártya belső szövegmező | `package-card-body` | Header + Desc wrap |
| 92 | [x] | Csomag kártya fejléc csoport (cím + badge) | `package-card-header-group` | |
| 93 | [x] | Csomag kártya cím | `package-card-title` | |
| 94 | [x] | Csomag kártya nap/éj jelző | `package-card-duration-badge` | |
| 95 | [x] | Csomag kártya leírás | `package-card-description` | |
| 96 | [x] | Csomag kártya lábléc (tags + választás) | `package-card-footer` | |
| 97 | [x] | Csomag kártya címkék (tags) listája | `package-card-tags-list` | |
| 98 | [x] | Csomag kártya egyedi címke (tag) | `package-card-tag-item-{idx}` | |
| 99 | [x] | Csomag kártya "Kiválasztás" gomb | `package-card-select-btn` | |

## 6. 4. Lépés: Programterv (ProgramTimeline)

### 6.1. Strukturális elemek

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 100 | [x] | Programterv gyökér konténer | `program-timeline-root` | ProgramTimeline.tsx |
| 101 | [x] | Globális navigáció (Desktop) | `program-timeline-global-nav` | |
| 102 | [x] | Navigációs "Vissza" gomb | `program-timeline-back-btn` | |
| 103 | [x] | Navigációs "Tovább" gomb | `program-timeline-next-btn` | |
| 104 | [x] | Oldalsáv konténer (Sidebar) | `program-timeline-sidebar` | |
| 105 | [x] | Oldalsáv infó rész (wrapper) | `program-timeline-sidebar-info` | |
| 106 | [x] | Oldalsáv akció rész (wrapper) | `program-timeline-sidebar-actions` | |
| 107 | [x] | Megye badge konténere | `program-timeline-county-badge-wrapper` | |
| 108 | [x] | Mobil navigációs gombok sávja | `program-timeline-mobile-nav` | |
| 109 | [x] | Becsült költség doboza | `program-timeline-cost-box` | |
| 110 | [x] | Becsült költség címke | `program-timeline-cost-label` | |
| 111 | [x] | Becsült költség összeg wrapper | `program-timeline-cost-amount-wrapper` | |
| 112 | [x] | Becsült költség érték | `program-timeline-cost-value` | |
| 113 | [x] | Becsült költség pénznem | `program-timeline-cost-currency` | |
| 114 | [x] | Hibaüzenet doboza | `program-timeline-error-box` | |
| 115 | [x] | Akció gombok konténere | `program-timeline-actions-wrapper` | |
| 116 | [x] | "Szavazok erre!" gomb | `program-timeline-vote-btn` | |
| 117 | [x] | "Eredmények" gomb | `program-timeline-results-btn` | |
| 118 | [x] | Szavazás megjegyzés (disclaimer) | `program-timeline-vote-disclaimer` | |

### 6.2. Tartalmi elemek és Idővonal

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 119 | [x] | Fő tartalmi terület | `program-timeline-content` | |
| 120 | [x] | Mobil fejléc (wrapper) | `program-timeline-mobile-header` | |
| 121 | [x] | Napválasztó fülek sávja | `program-timeline-tabs-row` | |
| 121b| [x] | Napválasztó fülek belső szegélyezett sávja | `program-timeline-tabs-inner` | A szürke vonal helyzete |
| 122 | [x] | Egyedi nap választó fül | `program-day-tab-btn-{idx}` | |
| 123 | [x] | Nap neve (fülön) | `program-day-tab-name-{idx}` | |
| 124 | [x] | Nap száma (fülön) | `program-day-tab-number-{idx}` | |
| 125 | [x] | Idővonal görgethető sáv | `program-timeline-items-scroll` | |
| 126 | [x] | Idővonal elemek gyűjtője | `program-timeline-items-wrapper` | |
| 127 | [x] | Idővonal elem (egy tevékenység) | `program-timeline-item-{id}` | |
| 128 | [x] | Idővonal elem ikon doboza | `program-timeline-item-icon-box` | |
| 129 | [x] | Idővonal elem összekötő vonal | `program-timeline-item-connector` | |
| 130 | [x] | Idővonal elem szöveges rész | `program-timeline-item-content` | |
| 131 | [x] | Idővonal elem időpontja | `program-timeline-item-time` | |
| 131b| [x] | Idővonal elem kategóriája | `program-timeline-item-category` | pl. GASZTRO |
| 131c| [x] | Idővonal elem címe | `program-timeline-item-title` | |
| 132 | [x] | Idővonal elem leírása | `program-timeline-item-description` | |
| 133 | [x] | Mobil lábléc (wrapper) | `program-timeline-mobile-footer` | |

## 7. Élő Eredmények (Summary) és alkomponensei

### 7.1. Summary.tsx (Fő oldal)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 134 | [x] | Összegzés kártya befoglaló | `summary-step-card` | StepCard |
| 135 | [x] | Titkos admin felület aktiváló | `summary-secret-admin-trigger` | Kattintható "tervezés" szó |
| 136 | [x] | Felső fejléc sáv (fejléc + nav) | `summary-header-row` | |
| 137 | [x] | Navigációs gombok konténere | `summary-nav-controls` | |
| 138 | [x] | Navigációs "Vissza" gomb | `summary-back-btn` | NavButton |
| 139 | [x] | "Szavazataim" (beállítások) gomb | `summary-manage-votes-btn` | |
| 140 | [x] | Rangsor rács (Grid) | `summary-ranking-grid` | 2 oszlopos |
| 141 | [x] | Dátum rangsor szekció | `summary-ranking-dates` | RankingSection |
| 142 | [x] | Régió rangsor szekció | `summary-ranking-regions` | RankingSection |
| 143 | [x] | Tervezői állapotok szekció | `summary-designer-status` | DesignerStatus |
| 144 | [x] | Lebegő akciógomb wrapper (FAB) | `summary-fab-wrapper` | |
| 145 | [x] | "Tovább tervezek" gomb | `summary-continue-btn` | |
| 146 | [x] | Admin overlay (háttér) | `summary-admin-overlay` | |
| 147 | [x] | Admin panel (modal) | `summary-admin-panel` | |
| 148 | [x] | Admin panel fejléc sáv | `summary-admin-header` | |
| 149 | [x] | Admin panel címe (H2) | `summary-admin-title` | |
| 150 | [x] | Admin "Bezárás" gomb | `summary-admin-close-btn` | |
| 151 | [x] | Admin állapot üzenet | `summary-admin-status-msg` | |
| 152 | [x] | Admin akciógombok tárolója | `summary-admin-actions` | |
| 153 | [x] | Admin "Adatbázis törlés" gomb | `summary-admin-reset-btn` | |
| 154 | [x] | Admin felhasználó lista | `summary-admin-user-list` | |
| 155 | [x] | Admin felh. törlő gomb | `summary-admin-delete-user-btn-{id}` | |

### 7.2. RankingSection.tsx & RankingItem.tsx

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 156 | [x] | Rangsor szekció gyökér | `ranking-section-root` | |
| 157 | [x] | Rangsor szekció fejléc | `ranking-section-header` | |
| 158 | [x] | Rangsor szekció ikon doboz | `ranking-section-icon-box` | |
| 159 | [x] | Rangsor szekció cím (H2) | `ranking-section-title` | |
| 160 | [x] | Rangsor elemek listája | `ranking-section-items-list` | |
| 161 | [x] | Rangsor elem gyökér | `ranking-item-root` | |
| 162 | [x] | Rangsor elem fejléc | `ranking-item-header` | |
| 163 | [x] | Rangsor elem cím | `ranking-item-title` | |
| 164 | [x] | Rangsor elem szavazat badge | `ranking-item-vote-badge` | |
| 165 | [x] | Rangsor elem felhasználók listája | `ranking-item-users-list` | |
| 166 | [x] | Rangsor elem felhasználó tag | `ranking-item-user-tag-{idx}` | |

### 7.3. DesignerStatus.tsx

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 167 | [x] | Tervezői állapot gyökér | `designer-status-root` | |
| 168 | [x] | Aktív tervezők szekció | `designer-status-active-section` | |
| 169 | [x] | Aktív tervezők fejléc | `designer-status-active-header` | |
| 170 | [x] | Aktív tervezők ikon doboz | `designer-status-active-icon-box` | |
| 171 | [x] | Aktív tervezők cím (H2) | `designer-status-active-title` | |
| 172 | [x] | Aktív tervezők rácsa (Grid) | `designer-status-active-grid` | |
| 173 | [x] | Felhasználói állapot kártya | `designer-status-user-card-{id}` | |
| 174 | [x] | Felhasználó neve a kártyán | `designer-status-user-name-{id}` | |
| 175 | [x] | Felhasználó statisztika konténer | `designer-status-user-stats-{id}` | |
| 176 | [x] | Felhasználó dátum állapota | `designer-status-user-dates-{id}` | |
| 177 | [x] | Felhasználó szavazat állapota | `designer-status-user-votes-{id}` | |
| 178 | [x] | Függőben lévő szavazók szekció | `designer-status-pending-section` | |
| 179 | [x] | Függőben lévő fejléc | `designer-status-pending-header` | |
| 180 | [x] | Függőben lévő ikon doboz | `designer-status-pending-icon-box` | |
| 181 | [x] | Függőben lévő cím (H2) | `designer-status-pending-title` | |
| 182 | [x] | Függőben lévő nevek listája | `designer-status-pending-tags-list` | |
| 183 | [x] | Felhasználói állapot pilula (pill) | `designer-status-user-pill-{id}` | |

---
*Folytatás következik a további lépésekkel.*
