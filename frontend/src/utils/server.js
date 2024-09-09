import http from 'http';
import WebSocket from 'ws';
import fetch from 'node-fetch'; // Import node-fetch to make HTTP requests

// Create an HTTP server
const server = http.createServer();

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Function to fetch data from the API and send it to clients
const fetchDataAndUpdateClients = async () => {
    try {
        const response = await fetch('http://localhost:4443/api/v1/ue_movement/state-ues');
        const data = await response.json();

        // Broadcast the data to all connected WebSocket clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
};

// Check for data updates every 5 seconds
setInterval(fetchDataAndUpdateClients, 5000);

// Handle WebSocket connections
wss.on('connection', ws => {
    console.log('New WebSocket connection');
    
    // Send a welcome message
    ws.send('Welcome to the WebSocket server!');

    // Handle incoming messages
    ws.on('message', message => {
        console.log(`Received message: ${message}`);
        ws.send(`You said: ${message}`);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.on('error', error => {
        console.error(`WebSocket error: ${error}`);
    });
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
});
