import React from 'react';
import Modal from './Modal';

export default function TrailerModal({
    item,
    isOpen = false,
    onClose
}) {
    if (!isOpen || !item) return null;

    const youtubeId = item.youtubeId || item.id || "9ix7TUGVYIo";
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="video"
            contentClassName="video-modal-content"
            ariaLabel={`${item.title} Trailer`}
            showCloseButton={true}
        >
            <div className="video-container">
                <iframe
                    id="youtube-player"
                    src={embedUrl}
                    frameBorder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={`${item.title} Trailer`}
                />
            </div>
            <div className="video-modal-footer">
                <h3 id="trailer-modal-title" className="trailer-title">
                    {item.title} - Official Trailer
                </h3>
                <button
                    className="secondary-btn close-trailer-btn"
                    onClick={onClose}
                    type="button"
                >
                    Close Trailer
                </button>
            </div>
        </Modal>
    );
}
