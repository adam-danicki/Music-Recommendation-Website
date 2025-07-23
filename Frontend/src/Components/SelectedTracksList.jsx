import TrackItem from './TrackItem'

function SelectedTracksList({tracks, onDropTrack, onDeleteTrack, onGeneratePlaylist}) {
    const handleDragOver = (e) => {
        e.preventDefault();
    }
    
    const handleDrop = (e) => {
        const data = e.dataTransfer.getData('track');
        const track = JSON.parse(data);
        onDropTrack(track);
    };
    
    return (
        <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        >
            <h3>Selected Songs</h3>
            <ul className='song-list'>
                {tracks.map((track) => (
                    <li className='list-item' key={track.id}>
                        <TrackItem track={track} onDelete={onDeleteTrack} />
                    </li>
                ))}
            </ul>
            <button
            className='generate-button'
            onClick={onGeneratePlaylist}
            >
                Save Playlist</button>
        </div>
    )
}

export default SelectedTracksList