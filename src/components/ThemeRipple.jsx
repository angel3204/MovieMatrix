import React from 'react';

export default function ThemeRipple({ rippleState }) {
    if (!rippleState || !rippleState.active) {
        return <div id="theme-ripple" className="theme-ripple" style={{ display: 'none' }} />;
    }

    return (
        <div
            id="theme-ripple"
            className="theme-ripple animating"
            style={{
                left: `${rippleState.x}px`,
                top: `${rippleState.y}px`
            }}
        />
    );
}
