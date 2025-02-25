import Chat from "./components/Chat";
import SvgSprite from './components/SvgSprite';
import FileManager from "./components/FileManager.jsx";

function App() {
    const userId = 123;
    return (
        <div className="site-wrapper">
            <header className="header">
                <div className="container">
                    <div className="logo">
                        <svg>
                            <use href="#logo"></use>
                        </svg>
                    </div>
                </div>
            </header>

            <main className="main">
                <section className="block-chat">
                    <div className="container">
                        {/* Sidebar */}
                        <div className="history-col sidebar-col">
                            <div className="col-head">
                                <button className="circle-btn white-hover sidebar-toggler-mobile history-col-toggler-mobile">
                                    <svg>
                                        <use href="#icon-sidebar-simple"></use>
                                    </svg>
                                </button>
                                <button className="circle-btn theme-hover new-chat-btn">
                                    <svg>
                                        <use href="#icon-plus"></use>
                                    </svg>
                                </button>
                            </div>
                            <div className="col-body">
                                <div className="chat-history-list">
                                    {/* Add dynamic chat items here */}
                                </div>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <Chat />
                        {/* File Sidebar */}
                        <FileManager userId={userId} />
                    </div>
                </section>
            </main>
            <SvgSprite />
        </div>
    );
}

export default App;