import { create } from "zustand";
import { uploadFiles, getUploadedFiles } from "../services/api";

// ToDo: fix env vars
// ✅ WebSocket base URL
const WS_BASE_URL = import.meta.env.VITE_WS_URL;

const useChatStore = create((set, get) => ({
    messages: [],
    setMessages: (updateFn) => set((state) => ({ messages: updateFn(state.messages) })),
    isConnected: false,
    ws: null,
    fileIds: [],
    uploadedFiles: [], // ✅ Always an array
    uploading: false,
    uploadError: null,

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

        // ✅ Fetch updated file list after upload
        await get().fetchUploadedFiles(userId);

        // ✅ Connect WebSocket if there are uploaded files
        const updatedFiles = get().uploadedFiles;
        if (updatedFiles.length > 0) {
            get().connectWebSocket(userId, "default_conversation", updatedFiles.map(file => file.file_id));
        }
    },

    fetchUploadedFiles: async (userId) => {
        const response = await getUploadedFiles(userId);

        console.log("📂 API Response for files:", response);

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response);
        } catch {
            console.error("❌ Failed to parse API response:", response);
            parsedResponse = [];
        }

        if (!Array.isArray(parsedResponse)) {
            console.warn("⚠️ Unexpected API response. Expected an array but got:", parsedResponse);
            return;
        }

        set({ uploadedFiles: parsedResponse });
        console.log("✅ Updated uploadedFiles state:", parsedResponse);

        // ✅ Automatically connect WebSocket if files exist
        if (parsedResponse.length > 0) {
            get().connectWebSocket(userId, "default_conversation", parsedResponse.map(file => file.file_id));
        }
    },

    connectWebSocket: (userId, conversationName, fileIds = []) => {
        if (!WS_BASE_URL) {
            console.error("WebSocket URL is not defined in .env");
            return;
        }

        if (fileIds.length === 0) {
            console.warn("⚠️ No uploaded files, skipping WebSocket connection.");
            return;
        }

        const fileIdsParam = fileIds.length > 0 ? fileIds.join(",") : "default";
        const wsUrl = `${WS_BASE_URL}/${userId}/${conversationName}/${fileIdsParam}`;

        console.log("🔌 Connecting to WebSocket:", wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("✅ WebSocket connected!");
            set({ isConnected: true });
        };

        ws.onmessage = (event) => {
            console.log("📩 WebSocket received:", event.data);

            try {
                const newMessage = JSON.parse(event.data);

                // ❌ Ignore 'input_message' (question echoes)
                if (newMessage.reporter === "input_message") {
                    return; // Ignore echoed input messages
                }

                // ✅ Only process 'output_message' (AI response)
                if (newMessage.reporter === "output_message" && newMessage.message) {
                    set((state) => ({
                        messages: [...state.messages, { text: newMessage.message, sender: "bot" }]
                    }));
                }
            } catch {
                console.error("❌ Failed to parse WebSocket message:", event.data);
            }
        };

        ws.onerror = () => {
            console.error("❌ WebSocket error occurred");
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

        set({ ws });
    },

    sendMessage: (message) => {
        const ws = get().ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log("📤 Sending WebSocket message:", message);
            ws.send(JSON.stringify({ text: message }));
        } else {
            console.warn("⚠️ WebSocket is not open!");
        }
    },

    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

    clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;