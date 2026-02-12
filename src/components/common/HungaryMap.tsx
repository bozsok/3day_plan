import { useEffect, useRef, useCallback } from 'react';
import { countyToRegion } from '../../data/mockData';

interface HungaryMapProps {
    selectedRegionId: string | undefined;
    hoveredRegionId: string | null;
    onRegionClick: (regionId: string) => void;
    onRegionHover: (regionId: string | null) => void;
}

/**
 * Interaktív Magyarország térkép.
 * Betölti a /hu.svg fájlt (SimpleMaps), majd a megyéket régiók szerint csoportosítja.
 * Kattintás, hover és kijelölés kezelése React event delegation-nel.
 */
export function HungaryMap({ selectedRegionId, hoveredRegionId, onRegionClick, onRegionHover }: HungaryMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgLoadedRef = useRef(false);

    // 1. SVG betöltése és inicializálás
    useEffect(() => {
        if (svgLoadedRef.current) return;

        const basePath = import.meta.env.BASE_URL || './';

        fetch(`${basePath}hu.svg`)
            .then(r => r.text())
            .then(text => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');
                const svg = doc.querySelector('svg');
                if (!svg || !containerRef.current) return;

                // Felesleges csoportok eltávolítása
                svg.querySelector('#points')?.remove();
                svg.querySelector('#label_points')?.remove();

                // SVG gyökérelem attribútumok felülírása
                svg.removeAttribute('fill');
                svg.removeAttribute('stroke');
                svg.removeAttribute('stroke-linecap');
                svg.removeAttribute('stroke-linejoin');
                svg.removeAttribute('stroke-width');
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.setAttribute('viewBox', '0 0 1000 613');
                svg.setAttribute('class', 'w-full h-auto');
                svg.style.display = 'block';

                // Minden path-hoz hozzárendeljük a régió ID-t
                const paths = svg.querySelectorAll('#features path');
                paths.forEach(path => {
                    const countyId = path.getAttribute('id');
                    if (!countyId) return;

                    const regionId = countyToRegion[countyId];
                    if (regionId) {
                        path.setAttribute('data-region', regionId);
                        path.classList.add('region-path');
                    }
                });

                // Budapest jelölő hozzáadása (piros kör + felirat)
                const NS = 'http://www.w3.org/2000/svg';
                const bpGroup = doc.createElementNS(NS, 'g');
                bpGroup.setAttribute('style', 'pointer-events: none');

                const circle = doc.createElementNS(NS, 'circle');
                circle.setAttribute('cx', '448.9');
                circle.setAttribute('cy', '245.5');
                circle.setAttribute('r', '8');
                circle.setAttribute('fill', '#ef4444');
                circle.setAttribute('stroke', '#ffffff');
                circle.setAttribute('stroke-width', '3');

                const label = doc.createElementNS(NS, 'text');
                label.setAttribute('x', '465');
                label.setAttribute('y', '250');
                label.setAttribute('font-size', '22');
                label.setAttribute('font-weight', 'bold');
                label.setAttribute('font-family', 'Plus Jakarta Sans, sans-serif');
                label.setAttribute('fill', '#1e293b');
                label.textContent = 'Budapest';

                bpGroup.appendChild(circle);
                bpGroup.appendChild(label);
                svg.appendChild(bpGroup);

                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(svg);
                svgLoadedRef.current = true;
            })
            .catch(err => console.error('SVG betöltési hiba:', err));
    }, []);

    // 2. Kijelölés és hover CSS frissítése
    useEffect(() => {
        if (!containerRef.current) return;
        const paths = containerRef.current.querySelectorAll<SVGPathElement>('path[data-region]');
        paths.forEach(path => {
            const rid = path.getAttribute('data-region');
            path.classList.toggle('selected', rid === selectedRegionId);
            path.classList.toggle('hovered', rid === hoveredRegionId);
        });
    }, [selectedRegionId, hoveredRegionId]);

    // 3. Kattintás kezelés (event delegation)
    const handleClick = useCallback((e: React.MouseEvent) => {
        const target = (e.target as Element).closest('path[data-region]');
        const regionId = target?.getAttribute('data-region');
        if (regionId) onRegionClick(regionId);
    }, [onRegionClick]);

    // 4. Hover kezelés (event delegation)
    const handleMouseOver = useCallback((e: React.MouseEvent) => {
        const target = (e.target as Element).closest('path[data-region]');
        const regionId = target?.getAttribute('data-region') || null;
        onRegionHover(regionId);
    }, [onRegionHover]);

    const handleMouseLeave = useCallback(() => {
        onRegionHover(null);
    }, [onRegionHover]);

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            className="w-full"
        />
    );
}
