import { useEffect, useState } from 'react';

const WebSocketClient = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = (event) => {
            console.log(`Received message: ${event.data}`);
            setData(JSON.parse(event.data)); // Update state with the new data
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error: ${error}`);
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            <h1>WebSocket Data</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default WebSocketClient;
