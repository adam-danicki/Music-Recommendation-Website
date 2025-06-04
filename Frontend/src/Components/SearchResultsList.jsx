import TrackItem from './TrackItem'

function SearchResultsList({results, onDragStart}) {
    return (
        <div>
            <h3>Searched Songs</h3>
            <ul className='song-list'>
                {results.map((track) => (
                    <li className='list-item' key={track.id}>
                        <TrackItem 
                        track={track} 
                        draggable={true}
                        onDragStart={onDragStart}
                        />
                    </li>
                ))}
            </ul>

        </div>
    )
}

export default SearchResultsList