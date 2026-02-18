import { useEffect, useRef, useCallback } from 'react';
import { counties } from '../../data/mockData';

interface HungaryMapProps {
    selectedRegionId: string | undefined;
    hoveredRegionId: string | null;
    onRegionClick: (regionId: string) => void;
    onRegionHover: (regionId: string | null) => void;
}

/**
 * Interaktív Magyarország térkép (Megye alapú).
 * Betölti a /country.svg fájlt, és a path-okat a counties tömb alapján azonosítja.
 */
export function HungaryMap({ selectedRegionId, hoveredRegionId, onRegionClick, onRegionHover }: HungaryMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgLoadedRef = useRef(false);

    // 1. SVG betöltése és inicializálás
    useEffect(() => {
        if (svgLoadedRef.current) return;

        const basePath = import.meta.env.BASE_URL || './';

        fetch(`${basePath}country.svg`)
            .then(r => r.text())
            .then(text => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');
                const svg = doc.querySelector('svg');
                if (!svg || !containerRef.current) return;

                // Felesleges háttér rect törlése (de a location-öket békén hagyjuk!)
                svg.querySelectorAll('rect').forEach(rect => {
                    const cls = rect.getAttribute('class') || '';
                    if (!cls.includes('sm_location')) {
                        rect.remove();
                    }
                });

                // SVG stílusok
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.setAttribute('class', 'w-full h-auto');
                svg.style.display = 'block';
                svg.removeAttribute('style');

                // Path-ok és Rect-ek (város jelölők) előkészítése
                const elements = svg.querySelectorAll<SVGElement>('path, rect');

                // Város kód -> Megye kód (mockData id) összerendelés
                // Ez tünteti el a "fekete foltokat" azzal, hogy a várost a megyéhez csatolja
                const cityToCountyMap: Record<string, string> = {
                    'HUBC': 'bekes', 'HUDE': 'hajdu-bihar', 'HUDU': 'fejer', 'HUEG': 'heves',
                    'HUER': 'pest', 'HUGY': 'gyor-moson-sopron', 'HUHV': 'csongrad-csanad',
                    'HUKM': 'bacs-kiskun', 'HUKV': 'somogy', 'HUMI': 'borsod-abauj-zemplen',
                    'HUNK': 'zala', 'HUNY': 'szabolcs-szatmar-bereg', 'HUPS': 'baranya',
                    'HUSD': 'csongrad-csanad', 'HUSF': 'fejer', 'HUSH': 'vas', 'HUSK': 'jasz-nagykun-szolnok',
                    'HUSN': 'gyor-moson-sopron', 'HUSS': 'tolna', 'HUST': 'nograd',
                    'HUTB': 'komarom-esztergom', 'HUVM': 'veszprem', 'HUZE': 'zala'
                };

                // Különleges helyszínek (négyzetek)
                const specialLocations: Record<string, string> = {
                    'sm_location_0': 'budapest', // Piros négyzet -> Budapest
                    'sm_location_1': 'pest'      // Zöld négyzet -> Nagykőrös (Pest megye)
                };

                elements.forEach(el => {
                    const classList = el.getAttribute('class') || '';
                    const isSpecialLocation = /sm_location_\d+/.test(classList);

                    // Minden elemről levesszük az eredeti stílust, hogy a CSS uralkodjon
                    el.removeAttribute('fill');
                    el.removeAttribute('stroke');
                    el.removeAttribute('style');
                    el.removeAttribute('opacity');
                    el.removeAttribute('fill-opacity');
                    el.removeAttribute('stroke-opacity');

                    // 1. Állapot/Megye (sm_state_XXXX)
                    const stateMatch = classList.match(/sm_state_(HU[A-Z]{2})/);
                    let targetCountyId: string | undefined;
                    let county;

                    if (stateMatch) {
                        const pathId = stateMatch[1];
                        county = counties.find(c => c.pathId === pathId);
                        targetCountyId = county?.id;

                        if (!targetCountyId && cityToCountyMap[pathId]) {
                            targetCountyId = cityToCountyMap[pathId];
                            county = counties.find(c => c.id === targetCountyId);
                        }
                    }

                    // 2. Különleges helyszínek (sm_location_X)
                    const locationMatch = classList.match(/sm_location_\d+/);
                    if (locationMatch) {
                        const locClass = locationMatch[0];
                        if (specialLocations[locClass]) {
                            targetCountyId = specialLocations[locClass];
                            county = counties.find(c => c.id === targetCountyId);
                        }
                    }

                    if (targetCountyId && county) {
                        el.setAttribute('data-county', targetCountyId);
                        el.setAttribute('data-region', county.regionId);

                        if (!isSpecialLocation) {
                            el.classList.add('county-path');
                            // Ha a pathId szerepel a cityToCountyMap-ben, akkor ez egy város/megyeszékhely
                            const stateMatch = el.getAttribute('class')?.match(/sm_state_(HU[A-Z]{2})/);
                            if (stateMatch && cityToCountyMap[stateMatch[1]]) {
                                el.classList.add('city-path');
                            }
                        } else {
                            // Speciális helyszínek (rect): kattinthatók és LÁTHATÓK kell maradjanak
                            el.setAttribute('style', 'cursor: pointer');
                            el.classList.add('special-location');
                            // NEM adjuk hozzá a city-path-t, mert azt elrejtjük!
                        }
                    }
                });

                // Z-index / Layering javítás: 
                // A városokat (city-path) a végére rakjuk, hogy mindenképpen a megyék (county-path) felett legyenek.
                // Így a rajtuk lévő vastag 'stroke' el tudja takarni a megye belső szürke éleit (lyukait).
                const cities = svg.querySelectorAll('.city-path');
                cities.forEach(c => svg.appendChild(c));

                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(svg);
                svgLoadedRef.current = true;
            })
            .catch(err => console.error('SVG betöltési hiba:', err));
    }, []);

    // 2. Kijelölés és hover CSS frissítése
    useEffect(() => {
        if (!containerRef.current) return;
        // Most már data-county attribútumot keresünk bármilyen elemen (path vagy rect)
        const elements = containerRef.current.querySelectorAll<SVGElement>('[data-county]');

        // Először takarítás: minden honnan levesszük a region-hover-t
        elements.forEach(el => el.classList.remove('region-hover'));

        // Ha van hoverelt megye, megkeressük a régióját
        let activeRegionId: string | undefined;
        if (hoveredRegionId) {
            const hoveredCounty = counties.find(c => c.id === hoveredRegionId);
            activeRegionId = hoveredCounty?.regionId;
        }

        elements.forEach(el => {
            const cid = el.getAttribute('data-county');
            const rid = el.getAttribute('data-region');
            const isSpecial = el.classList.contains('special-location');

            if (!isSpecial) {
                el.classList.toggle('selected', cid === selectedRegionId);
                el.classList.toggle('hovered', cid === hoveredRegionId);

                // Régió highlight minden elemnek (path és rect is)
                if (activeRegionId && rid === activeRegionId) {
                    el.classList.add('region-hover');
                }
            }
        });
    }, [selectedRegionId, hoveredRegionId]);

    // 3. Kattintás kezelés (event delegation)
    const handleClick = useCallback((e: React.MouseEvent) => {
        const target = (e.target as Element).closest('[data-county]');
        const countyId = target?.getAttribute('data-county');
        if (countyId) {
            onRegionClick(countyId);
        }
    }, [onRegionClick]);

    // 4. Hover kezelés (event delegation)
    const handleMouseOver = useCallback((e: React.MouseEvent) => {
        const target = (e.target as Element).closest('[data-county]');
        const countyId = target?.getAttribute('data-county') || null;
        onRegionHover(countyId);
    }, [onRegionHover]);

    const handleMouseLeave = useCallback(() => {
        onRegionHover(null);
    }, [onRegionHover]);

    return (
        <div
            id="hungary-map-root"
            ref={containerRef}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            className="w-full"
        />
    );
}
