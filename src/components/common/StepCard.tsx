import React from 'react';

interface StepCardProps {
    children: React.ReactNode;
    className?: string;
    /** Ha true, nem tesz rá alapértelmezett paddingot */
    noPadding?: boolean;
    /** Egyedi padding felülbíráláshoz */
    padding?: string;
}

/**
 * Egységesített kártya komponens az összes lépéshez.
 * Tartalmazza az árnyékot, lekerekítést, szegélyt és reszponzív viselkedést.
 */
export function StepCard({ children, className = '', noPadding = false, padding }: StepCardProps) {
    const baseClasses = "bg-white rounded-2xl min-[440px]:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 relative";

    // Alapértelmezett padding, ha nincs kikapcsolva és nincs egyedi megadva
    const paddingClasses = padding ? padding : (noPadding ? "" : "p-[15px] min-[440px]:p-8 md:p-14 lg:p-16");

    return (
        <div className={`${baseClasses} ${paddingClasses} ${className}`}>
            {children}
        </div>
    );
}
