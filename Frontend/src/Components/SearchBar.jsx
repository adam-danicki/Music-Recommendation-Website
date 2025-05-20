import './SearchBar.css'
import { useState } from 'react';
import axios from 'axios';
import TrackItem from './TrackItem'

function SearchBar() {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const res = await axios.get(`http://localhost:3001/search?query=${encodeURIComponent(query)}`);
            setSearchResults(res.data.tracks);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleSelect = (track) => {
        console.log('USer clocked on track:', track);
    };

    return (
        <div>
            <input
                type= 'text'
                value= {query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSearch();
                    }
                }}
                placeholder= 'Search for a song...'
            />

            <ul className='song-list'>
                {searchResults.map((track =>
                    <li key={track.id}>
                        <TrackItem key={track.id} track={track} onClick={handleSelect} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SearchBar;