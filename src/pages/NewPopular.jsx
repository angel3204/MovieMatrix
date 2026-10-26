import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import { t } from '../data/translations';

export default function NewPopular(props) {
    const context = useOutletContext() || {};
    const effectiveProps = { ...context, ...props };

    const {
        catalogData = [],
        tabConfigs = {},
        myList = [],
        userRatings = {},
        onToggleList,
        onPlayTrailer,
        onToast,
        lang = "en"
    } = effectiveProps;

    const npConfig = tabConfigs["new-popular"] || {};

    return (
        <div className="page-newpopular">
            <HeroBanner
                currentTab="new-popular"
                catalogData={catalogData}
                tabConfigs={tabConfigs}
                myList={myList}
                onToggleList={onToggleList}
                onPlayTrailer={onPlayTrailer}
                onToast={onToast}
                lang={lang}
            />

            <div id="content-rows-container">
                {npConfig.rows && npConfig.rows.map((row) => {
                    const matchingItems = catalogData.filter(item =>
                        item.categories && item.categories.includes(row.category)
                    );
                    if (matchingItems.length === 0) return null;

                    const isTop10 = row.category === "top10" || row.title.toLowerCase().includes("top 10");
                    const rowTitle = row.titleKey ? t(row.titleKey, lang) : row.title;

                    return (
                        <MovieRow
                            key={row.category}
                            title={rowTitle}
                            items={matchingItems}
                            isTop10={isTop10}
                            myList={myList}
                            userRatings={userRatings}
                            onToggleList={onToggleList}
                            onPlayTrailer={onPlayTrailer}
                            lang={lang}
                        />
                    );
                })}
            </div>
        </div>
    );
}
