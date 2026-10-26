import React from 'react';
import { t } from '../data/translations';

export default function Footer({ lang = "en" }) {
    const team = [
        { name: "ANGEL ARORA" },
        { name: "PARAS WALIA" },
        { name: "GARIMA BHEL" },
        { name: "UDAYVIR SINGH" }
    ];

    return (
        <footer className="cinematic-team-footer" aria-label="Meet The Team">
            <div className="cinematic-divider">
                <span className="cinematic-divider-line"></span>
                <span className="cinematic-divider-symbol">✦</span>
                <span className="cinematic-divider-line"></span>
            </div>

            <h2 className="cinematic-team-title">{t("meetTheTeam", lang)}</h2>

            <div className="cinematic-team-grid">
                {team.map((member, idx) => (
                    <div key={idx} className="team-card">
                        <div className="team-card-inner">
                            <h3 className="team-member-name">{member.name}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cinematic-team-branding">
                <div className="team-brand-logo">MOVIE MATRIX</div>
                <p className="team-brand-tagline">{t("footerBrandTagline", lang)}</p>
            </div>

            <div className="cinematic-team-bottom">
                <span className="team-copyright">{t("footerCopyright", lang)}</span>
            </div>
        </footer>
    );
}
