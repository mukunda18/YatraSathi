import { useEffect, useRef, useState } from 'react';

export const useSocket = (url: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            console.log('Message received:', event.data);
            setMessages((prev) => [...prev, event.data]);
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
        };

        return () => {
            socket.close();
        };
    }, [url]);

    const sendMessage = (event: string, payload: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ event, payload }));
        }
    };

    return { isConnected, messages, sendMessage };
};
