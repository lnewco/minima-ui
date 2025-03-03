import { useState } from 'react';
import useChatStore from './stores/useChatStore';
import Chat from "./components/Chat";
import SvgSprite from './components/SvgSprite';
import FileManager from "./components/FileManager.jsx";
import ChatHistoryList from "./components/ChatHistoryList.jsx";

function App() {
    const [selectedUser, setSelectedUser] = useState(null);
    // Store chat histories in a local state object, with user IDs as keys
    const [localChats, setLocalChats] = useState({});

    const messages = useChatStore(state => state.messages);
    const setMessages = useChatStore(state => state.setMessages);

    const handleUserSelect = (user) => {
        // Before switching, save current user's messages
        if (selectedUser) {
            setLocalChats(prev => ({
                ...prev,
                [selectedUser.id]: messages
            }));
        }

        // Load selected user's messages or start empty chat
        setMessages(() => localChats[user.id] || []);
        setSelectedUser(user);
    };

    return (
        <div className="site-wrapper">
            <header className="header">
                <div className="container">
                    <div className="logo">
                        <svg><use href="#logo"></use></svg>
                    </div>
                </div>
            </header>

            <main className="main">
                <section className="block-chat">
                    <div className="container">
                        <div className="history-col sidebar-col">
                            <div className="col-head">
                                <button className="circle-btn white-hover sidebar-toggler-mobile history-col-toggler-mobile">
                                    <svg><use href="#icon-sidebar-simple"></use></svg>
                                </button>
                                <button className="circle-btn theme-hover new-chat-btn">
                                    <svg><use href="#icon-plus"></use></svg>
                                </button>
                            </div>
                            <div className="col-body">
                                <ChatHistoryList
                                    onUserSelect={handleUserSelect}
                                    selectedUser={selectedUser}
                                />
                            </div>
                        </div>

                        <Chat userId={selectedUser?.id} />
                        {selectedUser && <FileManager userId={selectedUser.id} />}
                    </div>
                </section>
            </main>
            <SvgSprite />
        </div>
    );
}

export default App;