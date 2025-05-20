import './TrackItem.css'

function TrackItem({track, onClick}) {
    return (
        <div className="track-item" onClick={() => onClick(track)}>
            <img className="track-image" src={track.image} alt={track.name} />
            
            <div className="track-info">
                <strong className="track-name">{track.name}</strong>
                <p className="track-artist">{track.artists}</p>
            </div>
        </div>
    )
}

export default TrackItem;