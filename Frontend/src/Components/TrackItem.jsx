function TrackItem({track, onClick, onDelete, draggable = false, onDragStart}) {
    return (
        <div 
        className="track-item" 
        draggable={draggable}
        onDragStart={(e) => onDragStart?.(e, track)}
        onClick={() => onClick?.(track)}
        >
            <img className="track-image" src={track.image} alt={track.name} />
            <div className="track-info">
                <div className="track-name">{track.name}</div>
                <p className="track-artist">{track.artists}</p>
            </div>

            {onDelete && (
                <button
                className="delete-button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(track);
                }}
                >
                    ✕
                </button>
            )}
        </div>
    );
}

export default TrackItem;