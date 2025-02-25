import { useEffect, useState } from "react";
import useChatStore from "../stores/useChatStore";

const Chat = () => {
    const {
        fetchUploadedFiles,
        sendMessage,
        messages,
        setMessages,
    } = useChatStore();

    // ToDo: replace with actual user id
    const [userId] = useState("123");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchUploadedFiles(userId);
    }, [userId, fetchUploadedFiles]); // ✅ Fixed missing dependency warning

    const handleSendMessage = async (e) => {
        e.preventDefault(); // Prevent page refresh on form submit
        if (message.trim() === "") return;

        // ✅ Optimistically display the user's message immediately
        const userMessage = { sender: "user", text: message };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        const currentMessage = message; // Store the message
        setMessage(""); // Clear input field immediately

        // ✅ Send message to the server and wait for the response
        const response = await sendMessage(currentMessage);

        // ✅ Only process and display AI's response
        if (response) {
            try {
                const parsedResponse = JSON.parse(response);

                // ✅ Ignore `input_message`, handle only `output_message`
                if (parsedResponse.reporter === "output_message") {
                    const aiResponseText = parsedResponse.message;

                    if (aiResponseText) {
                        const serverMessage = { sender: "ai", text: aiResponseText };
                        setMessages((prevMessages) => [...prevMessages, serverMessage]);
                    }
                }
            } catch (error) {
                console.error("❌ Error parsing response: ", error);
            }
        }
    };

    return (
        <div className="text-col">
            {/* ✅ Initial Welcome Scene */}
            {messages.length === 0 ? (
                <div className="initial-scene">
                    {/* ✅ Use a proper path for Vite to resolve the image */}
                    <img src="../img/welcome.svg" alt="Welcome" />
                    <div className="initial-scene-title">Welcome to Your AI Workspace</div>
                    <div className="initial-scene-subtitle">
                        Your intelligent assistant is ready to help. Upload your files and start asking questions to get insightful answers instantly.
                    </div>
                </div>
            ) : (
                <div className="chat-body">
                    {/* ✅ Messages Section */}
                    {messages.map((msg, index) => (
                        <div key={index}>
                            {msg.sender === "user" ? (
                                <p className="user-message">
                                    <strong>You:</strong> {msg.text}
                                </p>
                            ) : (
                                <p className="ai-message">
                                    <strong>MNMA:</strong> {msg.text}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ Message Input Form */}
            <form action="/" className="chat-form" onSubmit={handleSendMessage}>
                <textarea
                    placeholder="Start typing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            handleSendMessage(e); // ✅ Send on Enter, allow new lines with Shift+Enter
                        }
                    }}
                />
                <button type="submit">
                    <svg>
                        <use xlinkHref="#icon-paper-plane" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Chat;