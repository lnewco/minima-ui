import { create } from "zustand";
import { uploadFiles, getUploadedFiles } from "../services/api";

// Ensure the URL is correctly formatted without double slashes
const WS_BASE_URL = "wss://minima-chat.vitaliti.org/chat";

const constructWebSocketUrl = (userId, conversationName, fileIds = []) => {
    if (!userId || !conversationName) {
        console.error("❌ Missing userId or conversationName for WebSocket connection.");
        return null;
    }

    const fileIdsParam = fileIds.length > 0 ? fileIds.join(",") : "default";
    return `${WS_BASE_URL}/${userId}/${conversationName}/${fileIdsParam}`;
};

const useChatStore = create((set, get) => ({
    messages: [],
    setMessages: (updateFn) => set((state) => ({ messages: updateFn(state.messages) })),
    ws: null,
    isConnected: false,
    connectionAttempts: 0,
    maxRetries: 3,

    fileIds: [],
    uploadedFiles: [],
    uploading: false,
    uploadError: null,

    connectWebSocket: (userId, conversationName, fileIds = []) => {
        const wsUrl = constructWebSocketUrl(userId, conversationName, fileIds);

        if (!wsUrl) return;

        console.log("🔌 Connecting to WebSocket:", wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("✅ WebSocket connected!");
            set({ isConnected: true, ws });
        };

        ws.onmessage = (event) => {
            console.log("📩 Received WebSocket message:", event.data);

            try {
                const newMessage = JSON.parse(event.data);
                if (newMessage.reporter === "output_message" && newMessage.message) {
                    set((state) => ({
                        messages: [...state.messages, { text: newMessage.message, sender: "bot" }]
                    }));
                }
            } catch (error) {
                console.error("❌ Failed to parse WebSocket message:", event.data, error);
            }
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.warn(`⚠️ WebSocket closed, reason: ${event.code}`);

            if (event.code === 1006) {
                console.log("🔄 Retrying WebSocket connection in 5s...");
                setTimeout(() => {
                    get().connectWebSocket(userId, conversationName, fileIds);
                }, 5000);
            }

            set({ isConnected: false });
        };
    },

    uploadFiles: async (userId, files) => {
        set({ uploading: true, uploadError: null });

        const response = await uploadFiles(userId, files);

        if (response.error) {
            console.warn("❌ Upload failed:", response.error);
            set({ uploadError: response.error, uploading: false });
            return;
        }

        console.log("✅ File upload successful:", response);
        set({ fileIds: response.fileIds || [], uploading: false });

        await get().fetchUploadedFiles(userId);

        const updatedFiles = get().uploadedFiles;
        if (updatedFiles.length > 0) {
            await get().connectWebSocket(userId, "default_conversation", updatedFiles.map(file => file.file_id));
        }
    },

    fetchUploadedFiles: async (userId) => {
        try {
            const response = await getUploadedFiles(userId);
            console.log("📂 API Response for files:", response);

            const files = Array.isArray(response) ? response : [];

            if (files.length === 0) {
                console.warn("⚠️ No files found or invalid response format");
            }

            set({ uploadedFiles: files });

            if (files.length > 0) {
                await get().connectWebSocket(userId, "default_conversation", files.map(file => file.file_id));
            }
        } catch (error) {
            console.error("❌ Error fetching files:", error);
            set({ uploadedFiles: [] });
        }
    },

    disconnectWebSocket: () => {
        const { ws } = get();
        if (ws) {
            ws.close(1000, "Normal closure");
            set({
                ws: null,
                isConnected: false,
                connectionAttempts: 0
            });
        }
    },

    sendMessage: (message) => {
        const { ws } = get();
        if (ws && ws.readyState === WebSocket.OPEN) {
            const messageData = {
                type: 'message',
                content: message,
                timestamp: new Date().toISOString()
            };

            try {
                ws.send(JSON.stringify(messageData));

                set(state => ({
                    messages: [...state.messages, {
                        id: Date.now(),
                        text: message,
                        sender: 'user',
                        timestamp: messageData.timestamp
                    }]
                }));
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        } else {
            console.warn("WebSocket is not connected");
        }
    },

    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

    clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;