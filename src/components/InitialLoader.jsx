import React, { useState, useEffect } from 'react';
import { t } from '../data/translations';

export default function InitialLoader({ lang }) {
    const [visible, setVisible] = useState(() => {
        try {
            return sessionStorage.getItem("movieMatrixIntroSeen") !== "true";
        } catch {
            return true;
        }
    });
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (!visible) return;

        const timer1 = setTimeout(() => {
            setFadeOut(true);
        }, 900);

        const timer2 = setTimeout(() => {
            setVisible(false);
        }, 1400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [visible]);

    if (!visible) return null;

    return (
        <div id="initial-loader" className={`initial-loader ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loader-content">
                <h1 className="loader-logo">MOVIE MATRIX</h1>
                <p className="loader-sub">{t("initializingExperience", lang)}</p>
                <div className="loader-progress-ring">
                    <div className="loader-bar-fill"></div>
                </div>
            </div>
        </div>
    );
}
