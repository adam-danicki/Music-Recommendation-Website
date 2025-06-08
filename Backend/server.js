//==================================================//
//  Main Backend file for Music Recommender Website
//==================================================//

// Import required modules
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const querystring = require('querystring');     // To format query parameters
const crypto = require('crypto');               // For generating random state strings

// Load environment vars
dotenv.config();

// Initialize express app
const app = express();

// Apply middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use(require('express-session')({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,         
        maxAge: 3600000          
    }
}));


// Constants for user
const PORT = 3001;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = 'http://localhost:3001/callback';
const session = require('express-session');


//==================================================//
//  Utility Function: Generate Random State String
//==================================================//
function generateRandomState(length) {
    return crypto.randomBytes(length).toString('hex');
}


//==================================================//
//  Function: Handle search
//==================================================//
async function handleSearch(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: 'Missing search query' });
    }

    const accessToken = await getAppAccessToken();
    if (!accessToken) {
        return res.status(500).json({ error: 'Unable to authenticate with Spotify' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                q: query,
                type: 'track',
                limit: 10,
                offset: 0
            }
        });

        const results = response.data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map(a => a.name).join(', '),
            uri: track.uri,
            image: track.album.images[0]?.url
        }));

        res.json({ tracks: results });

    } catch (err) {
        console.error('Search failed:', err.response?.data || err.message);
        res.status(500).json({ error: 'Spotify search failed' });
    }
}


//==================================================//
//  Function: Handle recommendations
//==================================================//
async function handleRecommendations(req, res) {
    console.log("Session on /recommendations:", req.session); //DEBUG
    const { trackIDs } = req.query;
    const accessToken = req.session.access_token;


    if (!trackIDs) {
        return res.status(400).json({ error: 'Missing trackIDs parameter' });
    }

    if (!accessToken) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const trackIdArray = trackIDs.split(',').slice(0, 5);

    //DEBUG
    console.log("Calling Spotify API with token:", accessToken);
    console.log("Track IDs:", trackIdArray);

    try {
        const featuresResponse = await axios.get('https://api.spotify.com/v1/audio-features', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                ids: trackIdArray.join(',')
            }
        });

        const features = featuresResponse.data.audio_features;

        const sums = {
            acousticness: 0,
            danceability: 0,
            energy: 0,
            instrumentalness: 0,
            loudness: 0,
            speechiness: 0,
            tempo: 0,
            valence: 0
        };

        const counts = {
            acousticness: 0,
            danceability: 0,
            energy: 0,
            instrumentalness: 0,
            loudness: 0,
            speechiness: 0,
            tempo: 0,
            valence: 0
        };

        for (const feature of features) {
            if (!feature) {continue;}

            if(feature.acousticness != null) {
                sums.acousticness += feature.acousticness;
                counts.acousticness++;
            }

            if(feature.danceability != null) {
                sums.danceability += feature.danceability;
                counts.danceability++;
            }

            if(feature.energy != null) {
                sums.energy += feature.energy;
                counts.energy++;
            }

            if(feature.instrumentalness != null) {
                sums.instrumentalness += feature.instrumentalness;
                counts.instrumentalness++;
            }

            if(feature.loudness != null) {
                sums.loudness += feature.loudness;
                counts.loudness++;
            }

            if(feature.speechiness != null) {
                sums.speechiness += feature.speechiness;
                counts.speechiness++;
            }

            if(feature.tempo != null) {
                sums.tempo += feature.tempo;
                counts.tempo++;
            }

            if(feature.valence != null) {
                sums.valence += feature.valence;
                counts.valence++;
            }
        }

        const averages = {
            acousticness: counts.acousticness ? sums.acousticness / counts.acousticness : null,
            danceability: counts.danceability ? sums.danceability / counts.danceability : null,
            energy: counts.energy ? sums.energy / counts.energy : null,
            instrumentalness: counts.instrumentalness ? sums.instrumentalness / counts.instrumentalness : null,
            loudness: counts.loudness ? sums.loudness / counts.loudness : null,
            speechiness: counts.speechiness ? sums.speechiness / counts.speechiness : null,
            tempo: counts.tempo ? sums.tempo / counts.tempo : null,
            valence: counts.valence ? sums.valence / counts.valence : null
        }

        const recResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                seed_tracks: trackIdArray.join(','),
                limit: 20,
                target_valence: averages.valence,
                target_energy: averages.energy,
                target_danceability: averages.danceability,
                target_tempo: averages.tempo
            }
        });

        const recommendations = recResponse.data.tracks.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map(a => a.name).join(', '),
            uri: track.uri
        }));

        res.json({ recommendations });

    } catch (err) {
        console.error('Error generating recommendations:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
}


//==================================================//
//  Function: Handle login
//==================================================//
function handleLogin(req, res) {
    const state = generateRandomState(16);
    const scope = 'user-read-private user-read-email user-top-read user-library-read user-read-playback-position streaming user-read-recently-played';

    // Spotify authorization URL
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',      // Request authorization code
            client_id: clientID,        // My app's client ID
            scope: scope,               // Permissions
            redirect_uri: redirectURI,  // Redirect URI after user login
            state: state,               // CSRF protection
            show_dialog: true           // for debugging
        })
    );
}


//==================================================//
//  Function: Handle callback
//==================================================//
async function handleCallback(req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const error = req.query.error;

    if(error) {
        return res.status(400).send('Authorization Failed: ' + error);
    }

    if(!state || !code) {
        return res.status(400).send('Invalid request: Missing state or code.')
    }  

    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token', 
            querystring.stringify({
                code: code,                         // Authorization code received from Spotify
                redirect_uri: redirectURI,          // Must match the one used in /login
                grant_type: 'authorization_code'    // Spotify requires this value
            }),
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64')   // Client credentials (base64 encoded)
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        req.session.access_token = access_token;

        res.redirect(`http://localhost:5173/search`);
        
    } catch (err) {
        console.error('Error exchanging code for tokens:', err.message);
        res.status(500).send('Failed to exchange code for tokens.');
    }
}


//==================================================//
//  Function: Get App Access Token
//==================================================//
async function getAppAccessToken() {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({ grant_type: 'client_credentials' }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64')
                }
            }
        );
        return response.data.access_token;
        
    } catch (err) {
        console.error('Failed to get app access token:', err.response?.data || err.message);
        return null;
    }
}


//==================================================//
//  Route: Search
//==================================================//
app.get('/search', handleSearch);


//==================================================//
//  Route: Login
//==================================================//
app.get('/login', handleLogin);


//==================================================//
//  Route: Callback
//==================================================//
app.get('/callback', handleCallback);


//==================================================//
//  Route: Recommendations
//==================================================//
app.get('/recommendations', handleRecommendations);


// test if server can run + login
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
  





