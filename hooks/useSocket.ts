import { useEffect, useRef, useState } from 'react';

interface SocketEnvelope {
    event: string;
    payload: unknown;
}

interface UseSocketOptions {
    onMessage?: (message: SocketEnvelope) => void;
    onOpen?: () => void;
    onClose?: () => void;
}

export const useSocket = (url: string, options?: UseSocketOptions) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<SocketEnvelope[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef<UseSocketOptions["onMessage"]>(options?.onMessage);
    const onOpenRef = useRef<UseSocketOptions["onOpen"]>(options?.onOpen);
    const onCloseRef = useRef<UseSocketOptions["onClose"]>(options?.onClose);

    useEffect(() => {
        onMessageRef.current = options?.onMessage;
        onOpenRef.current = options?.onOpen;
        onCloseRef.current = options?.onClose;
    }, [options?.onMessage, options?.onOpen, options?.onClose]);

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            onOpenRef.current?.();
        };

        socket.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data) as SocketEnvelope;
                setMessages((prev) => [...prev, parsed]);
                onMessageRef.current?.(parsed);
            } catch {
                const fallback = { event: "raw_message", payload: event.data };
                setMessages((prev) => [...prev, fallback]);
                onMessageRef.current?.(fallback);
            }
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
            onCloseRef.current?.();
        };

        return () => {
            socket.close();
        };
    }, [url]);

    const sendMessage = (event: string, payload: unknown) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ event, payload }));
        }
    };

    return { isConnected, messages, sendMessage };
};
