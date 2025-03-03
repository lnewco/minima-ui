import { useRef } from "react";
import useChatStore from "../stores/useChatStore";

const Chat = () => {
    const textareaRef = useRef(null);
    const {
        sendMessage,
        messages,
        isConnected,
    } = useChatStore();

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!isConnected) {
            console.warn("Not connected to WebSocket");
            return;
        }

        const message = textareaRef.current.value.trim();
        if (message === "") return;

        textareaRef.current.value = "";
        await sendMessage(message);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const form = e.target.closest('form');
            if (form) {
                form.requestSubmit();
            }
        }
    };

    return (
        <div className="text-col">
            {/*<div className="connection-status">*/}
            {/*    <span className={isConnected ? 'status-connected' : 'status-disconnected'}>*/}
            {/*        {isConnected ? 'Connected' : 'Disconnected'}*/}
            {/*    </span>*/}
            {/*</div>*/}

            {messages.length === 0 ? (
                <div className="initial-scene">
                    <img src="../img/welcome.svg" alt="Welcome" />
                    <div className="initial-scene-title">
                        Welcome to Your AI Workspace
                    </div>
                    <div className="initial-scene-subtitle">
                        Start a conversation!
                    </div>
                </div>
            ) : (
                <div className="chat-body">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message-container ${msg.sender}-message-container`}
                        >
                            <div className={`message ${msg.sender}-message`}>
                                <div className="message-text">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <form
                className="chat-form"
                onSubmit={handleSendMessage}
            >
                <textarea
                    ref={textareaRef}
                    placeholder={isConnected ? "Start typing..." : "Connecting..."}
                    disabled={!isConnected}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="submit"
                    disabled={!isConnected}
                >
                    <svg>
                        <use xlinkHref="#icon-paper-plane" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Chat;