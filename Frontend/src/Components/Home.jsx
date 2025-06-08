function Home() {
    const handleLogin = () => {
        window.location.href = 'http://localhost:3001/login';
    }

    return (
        <div className="home-page">
            <h1>Music Recommender</h1>
            <p>Login with Spotify to generate a custom playlist</p>
            <button onClick={handleLogin}>Log in with Spotify</button>
        </div>
    )
}

export default Home;