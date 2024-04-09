import React, { useState, useEffect } from 'react';

function App() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Define loading state variable
    const [token, setToken] = useState(''); // Define token state variable

    const getToken = async () => {
        try {
            const response = await fetch('http://localhost:8888/api/v1/login/access-token', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'username=admin%40my-email.com&password=pass'
            });
            const data = await response.json();
            setToken(data.access_token);
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    };

    const getUsers = async () => {
        try {
            const response = await fetch('http://localhost:8888/api/v1/Cells?skip=0&limit=100', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` // Include the token in the request headers
                }
            });
            const data = await response.json();
            setUsers(data); // Update state with fetched user data
            setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false); // Set loading to false in case of error
        }
    };

    useEffect(() => {
        getToken(); // Fetch token when the component mounts
    }, []); // Run only once on component mount

    useEffect(() => {
        if (token) {
            getUsers(); // Fetch users when token is available
        }
    }, [token]); // Run whenever token changes

    return (
        <div>
            <h1>Users</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {Array.isArray(users) ? (
                        users.map(user => (
                            <li key={user.id}>{user.name}</li>
                        ))
                    ) : (
                        <p>No users to display</p>
                    )}
                </ul>
            )}
        </div>
    );
}

export default App;






