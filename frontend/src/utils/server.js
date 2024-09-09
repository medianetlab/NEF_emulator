import http from 'http';
import WebSocket from 'ws';
import fetch from 'node-fetch'; 

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const fetchDataAndUpdateClients = async () => {
    try {
        const response = await fetch('http://localhost:4443/api/v1/ue_movement/state-ues');
        const data = await response.json();

        // Broadcast data
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
};

setInterval(fetchDataAndUpdateClients, 1000);   //1 sec

wss.on('connection', ws => {
    console.log('New connection');

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
