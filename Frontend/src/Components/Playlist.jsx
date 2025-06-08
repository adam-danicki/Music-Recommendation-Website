import { useLocation } from 'react-router-dom';
import TrackItem from './TrackItem';

function Playlist() {
    const { state } = useLocation();
    const tracks = state?.recommendedTracks || [];
    
    return (
      <div className='playlist-page'>
        {tracks.length === 0 ? (
          <p>No recommendations to show.</p>
        ) : (
          <div className='song-list'>
            {tracks.map((track) => (
              <TrackItem
              key={track.id}
              track={track}
              draggable={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

export default Playlist;
