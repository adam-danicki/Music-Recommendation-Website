import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import axios from 'axios'
import Modal from 'react-modal';
import SearchBar from "./SearchBar";
import SearchResultsList from "./SearchResultsList";
import SelectedTracksList from "./SelectedTracksList";
import  './SearchPage.css'

function SearchPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (query) => {
        try {
            const res = await axios.get(`http://localhost:3001/search?query=${encodeURIComponent(query)}`);
            setSearchResults(res.data.tracks);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleDragStart = (e, track) => {
        e.dataTransfer.setData('track', JSON.stringify(track));
    };

    const handleDropTrack = (track) => {
        if (selectedTracks.length >= 5) {
            setShowLimitWarning(true);
            return
        }

        if (!selectedTracks.find(t => t.id === track.id)) {
            setSelectedTracks((prev) => [...prev, track]);
            setShowLimitWarning(false);
        }
    };

    const handleDeleteTrack = (track) => {
        setSelectedTracks((prev) => prev.filter((t) => t.id !== track.id));

        if (!searchResults.find((t) => t.id === track.id)) {
            setSearchResults((prev) => [...prev, track]);
        }
    };

    const handleGeneratePlaylist = async () => {
        console.log('Generate button clicked');
        
        const ids = selectedTracks.map(t => t.id).join(',');

        try {
            const res = await axios.get(`http://localhost:3001/recommendations?trackIDs=${ids}`, {
                withCredentials: true
            });
            const recommendedTracks = res.data.recommendations;

            navigate('/playlist', { state: { recommendedTracks } });
        } catch (err) {
            console.error('Failed to generate playlist:', err);
        }
};

    return (
        <>
            <div>
                <Modal
                className="limit-warning"
                overlayClassName="limit-warning-overlay"
                isOpen = {showLimitWarning}
                onRequestClose={() => setShowLimitWarning(false)}
                contentLabel="Song Limit Warning"
                >
                    <h2>Song Limit Reached</h2>
                    <p>You can only select up to 5 songs.</p>
                    <button
                    onClick={() => setShowLimitWarning(false)}>
                        Close
                    </button>
                </Modal>
            </div>
            <div className="drag-drop-interface">
                <SearchBar onSearch={handleSearch} />
                <div className="list-wrapper">
                    <SearchResultsList results={searchResults} onDragStart={handleDragStart} />
                    <SelectedTracksList 
                    tracks={selectedTracks} 
                    onDropTrack={handleDropTrack}
                    onDeleteTrack={handleDeleteTrack}
                    onGeneratePlaylist={handleGeneratePlaylist}
                    />
                </div>
            </div>
        </>
    );
}

export default SearchPage;