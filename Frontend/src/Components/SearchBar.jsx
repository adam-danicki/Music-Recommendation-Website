import { useState } from 'react';

function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');
    
    const handleSearch = () => {
        if (!query.trim()) return;
        onSearch(query);
    };
    
    return (
        <input 
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === 'Enter') handleSearch();
            }}
            placeholder='Search for a song...'
        />
    );
}

export default SearchBar;
