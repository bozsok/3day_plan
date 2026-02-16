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

### 7.3. DesignerStatus.tsx (Részletes szavazatok táblázat)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 167 | [x] | Szekció gyökér konténer | `designer-status-root` | |
| 168 | [x] | Szekció fejléc sáv | `designer-status-header` | Szürke sáv |
| 169 | [x] | Szekció címe (H3) | `designer-status-title` | "Részletes Szavazatok" |
| 170 | [x] | "Szavazat módosítása" gomb | `designer-status-manage-btn` | Fejlécben |
| 171 | [x] | Táblázat görgethető konténere | `designer-status-table-container` | |
| 172 | [x] | Szavazati táblázat (table) | `designer-status-table` | |
| 173 | [x] | Táblázat fejléce (thead) | `designer-status-thead` | |
| 174 | [x] | Táblázat tartalom (tbody) | `designer-status-tbody` | |
| 175 | [x] | Egyedi szavazati sor (tr) | `designer-status-row-{id}` | |
| 176 | [x] | Felhasználó avatar doboza | `designer-status-avatar-box-{userId}` | |
| 177 | [x] | Felhasználó neve (span) | `designer-status-user-name-{userId}` | |
| 178 | [x] | Időpont cella | `designer-status-cell-dates-{userId}` | |
| 179 | [x] | Helyszín cella | `designer-status-cell-region-{userId}` | |
| 180 | [x] | Csomag cella | `designer-status-cell-package-{userId}` | |
| 181 | [x] | Státusz cella | `designer-status-cell-status-{userId}` | Végleges/Függőben |
| 182 | [x] | Táblázat lábléc (footer) | `designer-status-footer` | |
| 183 | [x] | "Összes mutatása" gomb | `designer-status-expand-btn` | Expand gomb |
| 184 | [x] | Dátum rangsor kártya gyökér | `ranking-card-date-{idx}` | RankingCard.tsx |
| 185 | [x] | Dátum kártya tartalom (belső) | `ranking-card-date-{idx}-content` | |
| 186 | [x] | Dátum kártya szavazatszám | `ranking-card-date-{idx}-count-value` | |
| 187 | [x] | Helyszín rangsor kártya gyökér | `ranking-card-location-{id}` | RankingCard.tsx |
| 188 | [x] | Helyszín kártya kép | `ranking-card-location-{id}-img` | |
| 189 | [x] | Helyszín kártya szavazat badge | `ranking-card-location-{id}-count-badge` | |
| 190 | [x] | Helyszín kártya győztes jelvény | `ranking-card-location-{id}-winner-badge` | Csak az 1. helyezettnél |

---
## 8. Adminisztrációs Felület (PackageBuilder.tsx)

### 8.1. Dashboard és Keretrendszer (Strukturális elemek)
| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 191 | [x] | Admin felület gyökér konténer | `admin-package-builder-root` | PackageBuilder.tsx |
| 192 | [x] | Dashboard fejléc konténer | `admin-dashboard-header` | Cím és gomb tárolója |
| 193 | [x] | Dashboard rács nézet | `admin-dashboard-grid` | Csomaglista containere |
| 194 | [x] | "Új kaland tervezése" gomb | `admin-dashboard-new-adventure-button` | Jobb fent |
| 195 | [x] | "Új Csomag" kártya | `admin-dashboard-card-new` | Lista eleje |
| 196 | [x] | Csomag kártya | `admin-dashboard-card-{id}` | Lista elem |
| 197 | [x] | Csomag törlése gomb | `admin-dashboard-card-delete-{id}` | Kártyán hoverre |

### 8.2. Varázsló Keret
| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 198 | [x] | Varázsló fő elrendezés | `admin-wizard-layout` | Bal: Form, Jobb: Preview |
| 199 | [x] | Űrlap konténer | `admin-wizard-form-container` | Bal oldal |
| 200 | [x] | Varázsló kártya | `admin-wizard-card` | Fehér doboz |
| 201 | [x] | Varázsló fejléc | `admin-wizard-header` | Cím és lépések |
| 202 | [x] | Lépés indikátor sáv | `admin-wizard-steps-indicator` | 1-2-3 lépések |
| 203 | [x] | Aktuális lépés címe | `admin-wizard-step-title` | H2 cím |
| 204 | [x] | Tartalmi terület | `admin-wizard-content-area` | Változó tartalom |
| 205 | [x] | "Kilépés" gomb | `admin-wizard-exit-button` | Fejléc jobb széle |
| 206 | [x] | Lábléc navigáció | `admin-wizard-footer` | Gombok tárolója |

### 8.3. Varázsló 1. Lépés: Alapok
| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 207 | [x] | 1. Lépés konténer | `admin-step1-container` | Wrapper |
| 208 | [x] | Helyszín szekció | `admin-step1-section-location` | Megye választás |
| 209 | [x] | Megye választó legördülő | `admin-package-select-county` | Select elem |
| 210 | [x] | Cím szekció | `admin-step1-section-title` | Név megadás |
| 211 | [x] | Csomag címe input | `admin-package-input-title` | Text input |
| 212 | [x] | Ár szekció | `admin-step1-section-price` | Ár megadás |
| 213 | [x] | Becsült ár input | `admin-package-input-price` | Number input |
| 214 | [x] | Leírás szekció | `admin-step1-section-description` | Szöveges leírás |
| 215 | [x] | Leírás szövegdoboz | `admin-package-textarea-description` | Textarea |
| 216 | [x] | 1. Lépés "Tovább" gomb | `admin-step1-next-button` | Lábléc |

### 8.4. Varázsló 2. Lépés: Hangulat
| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 217 | [x] | 2. Lépés konténer | `admin-step2-container` | Wrapper |
| 218 | [x] | Borítókép szekció | `admin-step2-section-cover` | Képfeltöltés |
| 219 | [x] | Borítókép előnézet konténer | `admin-step2-cover-preview-container` | Képdoboz |
| 220 | [x] | Borítókép feltöltés input | `admin-package-upload-cover` | Hidden file input |
| 221 | [x] | Borítókép törlése gomb | `admin-package-delete-cover-button` | Feltöltött képnél |
| 222 | [x] | Címkék szekció | `admin-step2-section-tags` | Címkeszerkesztő wrapper |
| 223 | [x] | 2. Lépés "Vissza" gomb | `admin-step2-back-button` | Lábléc |
| 224 | [x] | 2. Lépés "Tovább" gomb | `admin-step2-next-button` | Lábléc |

### 8.5. Varázsló 3. Lépés: Program
| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 225 | [x] | 3. Lépés konténer | `admin-step3-container` | Wrapper |
| 226 | [x] | Információs doboz | `admin-step3-info-box` | Kék tipp doboz |
| 227 | [x] | Napok rács elrendezés | `admin-step3-days-grid` | Nap kártyák tárolója |
| 228 | [x] | Nap kártya konténer | `admin-step3-day-card-{dIdx}` | Egy nap doboza |
| 229 | [x] | Nap fejléce | `admin-step3-day-header-{dIdx}` | Nap neve és gomb |
| 230 | [x] | Új programpont gomb | `admin-program-add-item-button-{dayIndex}` | Nap fejléc |
| 231 | [x] | Nap tartalom / Drop area | `admin-step3-day-drop-area-{dIdx}` | Programlista |
| 232 | [x] | Üres nap állapotjelző | `admin-step3-day-empty-{dIdx}` | Ha nincs elem |
| 233 | [x] | Programpont szerkesztése | `admin-program-item-edit-{itemId}` | Lista elem gomb |
| 234 | [x] | Programpont törlése | `admin-program-item-delete-{itemId}` | Lista elem gomb |
| 235 | [x] | 3. Lépés "Vissza" gomb | `admin-step3-back-button` | Lábléc |
| 236 | [x] | "Kaland Mentése" gomb | `admin-step3-save-button` | Lábléc |

### 8.6. Élő Előnézet (Desktop Sidebar)
| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 237 | [x] | Előnézet konténer | `admin-preview-container` | Jobb oldali sáv |
| 238 | [x] | Előnézet fejléc cím | `admin-preview-header` | "Kártya Előnézet" felirat |
| 239 | [x] | Program előnézet kártya | `admin-preview-program-card` | Step 3-nál |
| 240 | [x] | Program előnézet fejléc | `admin-preview-program-header` | Csomag címe |
| 241 | [x] | Program előnézet tartalom | `admin-preview-program-content` | Görgethető lista |
| 242 | [x] | Program előnézet lábléc | `admin-preview-program-footer` | Összesítés |
| 243 | [x] | Normál kártya előnézet | `admin-preview-standard-card` | Step 1-2-nél |
| 244 | [x] | Kártya kép konténer | `admin-preview-card-image` | Kép doboz |
| 245 | [x] | Kártya tartalom | `admin-preview-card-content` | Leírás doboz |
| 246 | [x] | Kártya lábléc | `admin-preview-card-footer` | Ár sáv |

## 9. Programpont Szerkesztő Modal (`ProgramItemModal.tsx`)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 247 | [x] | Modal Overlay (Háttér) | `admin-modal-overlay` | Sötét háttér |
| 248 | [x] | Modal Ablak | `admin-modal-window` | Fehér panel |
| 249 | [x] | Modal Fejléc | `admin-modal-header` | Címsor sáv |
| 250 | [x] | Modal Cím | `admin-modal-title` | H2 Cím |
| 251 | [x] | Bezárás gomb | `admin-modal-program-close-button` | X ikon |
| 252 | [x] | Modal Tartalom (Body) | `admin-modal-body` | Görgethető rész |
| 253 | [x] | Alapadatok szekció | `admin-modal-section-basic` | Idő, Cím |
| 254 | [x] | Időpont input | `admin-modal-program-input-time` | Time input |
| 255 | [x] | Cím input | `admin-modal-program-input-title` | Text input |
| 256 | [x] | Leírás szekció | `admin-modal-section-notes` | Textarea wrapper |
| 257 | [x] | Leírás szövegdoboz | `admin-modal-program-input-notes` | Textarea |
| 258 | [x] | Kategória szekció | `admin-modal-section-category` | Kategória, Ikon |
| 259 | [x] | Kategória választó | `admin-modal-program-input-activity` | Select |
| 260 | [x] | Ikon választó gomb | `admin-modal-program-icon-trigger` | Emoji gomb |
| 261 | [x] | Ikon popover konténer | `admin-modal-icon-picker-popover` | Ikon lista |
| 262 | [x] | Ikon opció gomb | `admin-modal-program-icon-option-{icon}` | Emoji gombok |
| 263 | [x] | Marketing szekció | `admin-modal-section-marketing` | Címke, Galéria |
| 264 | [x] | Marketing/Címke input | `admin-modal-program-input-marketing` | Text input |
| 265 | [x] | Galéria rács | `admin-modal-gallery-grid` | Képek listája |
| 266 | [x] | Galéria képfeltöltés input | `admin-modal-gallery-upload-input` | Hidden file input |
| 267 | [x] | Galéria elem | `admin-modal-gallery-item-{index}` | Kép wrapper |
| 268 | [x] | Galéria kép törlése gomb | `admin-modal-gallery-delete-button-{index}` | Kuka ikon |
| 269 | [x] | Üres galéria jelző | `admin-modal-gallery-empty` | Ha nincs kép |
| 270 | [x] | Modal Lábléc | `admin-modal-footer` | Gombok sávja |
| 271 | [x] | "Mégse" gomb | `admin-modal-program-cancel-button` | Bal gomb |
| 272 | [x] | "Mentés" gomb | `admin-modal-program-save-button` | Jobb gomb |

## 10. Címke Szerkesztő Komponens (`PackageTagsEditor.tsx`)

| # | Kész | Elem megnevezése | ID | Kontextus |
|---|:---:|---|---|---|
| 273 | [x] | Editor gyökér | `admin-tags-editor-root` | Fő konténer |
| 274 | [x] | Input terület | `admin-tags-input-area` | Felső sáv |
| 275 | [x] | Ikon választó wrapper | `admin-tags-icon-wrapper` | Ikon gomb tároló |
| 276 | [x] | Ikon választó gomb | `admin-tags-icon-trigger` | Gomb |
| 277 | [x] | Ikon popover | `admin-tags-icon-popover` | Emoji lista |
| 278 | [x] | Ikon opció | `admin-tags-icon-option-{icon}` | Emoji gomb |
| 279 | [x] | Szöveg input wrapper | `admin-tags-text-wrapper` | Input mező tároló |
| 280 | [x] | Címke kereső input | `admin-tags-input-search` | Input mező |
| 281 | [x] | Hozzáadás gomb | `admin-tags-button-add` | + Gomb |
| 282 | [x] | Javaslatok terület | `admin-tags-suggestions-area` | Gyorsgombok |
| 283 | [x] | Javaslat címke gomb | `admin-tags-option-{index}` | Címke gomb |
| 284 | [x] | Aktív címkék lista | `admin-tags-active-list` | Alsó doboz |
| 285 | [x] | Aktív címke elem | `admin-tags-active-item-{index}` | Egy címke |
| 286 | [x] | Címke törlése gomb | `admin-tags-button-delete-{index}` | X gomb |
| 287 | [x] | Üres lista jelző | `admin-tags-empty-state` | Ha nincs címke |

