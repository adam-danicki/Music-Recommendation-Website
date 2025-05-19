//==================================================//
//  Main Backend file for Music Recommender Website
//==================================================//

// Import required modules
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const querystring = require('querystring'); // To format query parameters
const crypto = require('crypto'); // For generating random state strings

// Load environment vars
dotenv.config();

// Initialize express app
const app = express();

// Apply middleware
app.use(cors())
app.use(express.json());

// Constants for user
const PORT = 3001;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = 'http://localhost:3001/callback';

//==================================================//
//  Utility Function: Generate Random State String
//==================================================//
function generateRandomState(length) {
    return crypto.randomBytes(length).toString('hex');
}

//==================================================//
//  Route: Request User Authorization
//==================================================//
app.get('/login', function(req, res) {
    
    const state = generateRandomState(16);
    const scope = 'user-read-private user-read-email user-top-read' //define permissions

    // Spotify authorization URL
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code', // Request authorization code
            client_id: clientID, // My app's client ID
            scope: scope, // Permissions
            redirect_uri: redirectURI, // Redirect URI after user login
            state: state // CSRF protection
        })
    );
});

//==================================================//
//  Route: Handle Callback from Spotify
//==================================================//
app.get('/callback', function(req, res) {

    const code = req.query.code || null;
    const state = req.query.state || null;
    const error = req.query.error;

    if(error) {
        return res.status(400).send('Authorization Failed: ' + error);
    }

    if(!state || !code) {
        return res.status(400).send('Invalid request: Missing state or code.')
    }

    console.log('Authorization Code:', code);
    console.log('State:', state);

    // Simple success message
    res.send('You are connected to Spotify! Code received. Check your terminal.');    
});

  





