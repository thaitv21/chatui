import React, {useState, useCallback, useRef, useEffect} from "react";
import './chat_ui.css';
import logo from './logo.svg';
import send from './send.svg';

function MessageFromMe(props) {
    return (
        <>
            <div className="response">
                <div className="user-caption-response-wrapper">
                    <div className="caption">
                        <div className="caption-text">You</div>
                    </div>
                </div>
                <div className="user-response-wrapper">
                    {
                        props.messages.map(msg => (
                            <div className="response-text">
                                {msg.text}
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}

function MessageFromBot(props) {
    return (
        <>
            <div className="response">
                <div className="bot-caption-response-wrapper">
                    <div className="caption">
                        <div className="avatar">
                            <img src={logo} alt={''}/>
                        </div>
                        <div className="caption-text">Bot</div>
                    </div>
                </div>
                <div className="bot-response-wrapper">
                    {
                        props.messages.map((message, index) => {
                            const styles = {
                                borderTopLeftRadius: 5,
                                borderTopRightRadius: 5,
                                borderBottomRightRadius: 5,
                                borderBottomLeftRadius: 5,
                                marginTop: 0,
                                marginBottom: 0,
                            }
                            if (index === 0) {
                                styles.borderTopLeftRadius = 5;
                                styles.borderTopRightRadius = 20;
                            }
                            if (index === props.messages.length - 1) {
                                styles.borderBottomRightRadius = 20;
                                styles.borderBottomLeftRadius = 20;
                            }
                            if (index !== 0 && index !== props.messages.length - 1) {
                                styles.marginTop = 5;
                            }
                            if (message.image) {
                                return (
                                    <div style={styles} className="response-img" key={index}>
                                        <img
                                            src={"https://cdn.vox-cdn.com/thumbor/zTBzOjycX07hspHfHerM385iAag=/0x0:2040x1360/1200x800/filters:focal(857x517:1183x843)/cdn.vox-cdn.com/uploads/chorus_image/image/69773669/acastro_210104_1777_google_0001.0.jpg"}
                                            alt={''}/>
                                    </div>
                                )
                            }
                            return (
                                <div style={styles} className="response-text" key={index}>
                                    {message.text || ''}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}

function BotLoading() {
    return (
        <>
            <div className="response">
                <div className="bot-caption-response-wrapper">
                    <div className="caption">
                        <div className="avatar">
                            <img src={logo} alt={''}/>
                        </div>
                        <div className="caption-text">Bot</div>
                    </div>
                </div>
                <div className="bot-response-wrapper">
                    <div style={{
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 20,
                        borderBottomRightRadius: 20,
                        borderBottomLeftRadius: 20,
                    }} className="response-text">
                        <div className="wave">
                            <span className="dot"/>
                            <span className="dot"/>
                            <span className="dot"/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const sendMessageToServer = async (messages, message) => {
    const response = await fetch('http://18.139.217.55:5005/webhooks/rest/webhook', {
        method: 'POST',
        body: JSON.stringify({
            sender: 'test_user',
            message: message,
            metadata: {},
        })
    });
    const data = await response.json();
    console.log('data', data);
    return messages.concat([{
        from: 'bot',
        messages: data.map(item => {
            if (item.image) {
                return {image: item.image}
            } else {
                return {text: item.text}
            }
        })
    }])
}

const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef}/>;
};

export default function ChatUI() {
    const [messages, setMessages] = useState([]);
    const [typingMessage, setTypingMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const sendMessage = useCallback(() => {
        if (!typingMessage.trim()) {
            return;
        }
        const newMessages = messages.concat([{from: 'me', messages: [{text: typingMessage}]}]);
        setLoading(true);
        sendMessageToServer(newMessages, typingMessage).then((list) => {
            setMessages(list);
            setLoading(false);
        })
        setTypingMessage('');
        setMessages(newMessages);
    }, [messages, typingMessage]);
    return (
        <div className="chat-app-wrapper">
            <div className="chat-open">
                <div className="chat-app">
                    <div className="top">
                        <div className="avatar">
                            <img src={logo} alt={''}/>
                        </div>
                        <div className="company">
                            <div className="header">ChatBot</div>
                            <div className="status">Online</div>
                        </div>
                    </div>
                    <div className="conversation">
                        {
                            messages.map((item, index) => {
                                if (item.from === 'me') {
                                    return <MessageFromMe messages={item.messages} key={index}/>
                                } else {
                                    return <MessageFromBot messages={item.messages} key={index}/>
                                }
                            })
                        }
                        {
                            loading && <BotLoading />
                        }
                        <AlwaysScrollToBottom/>
                    </div>
                    <div className="typing">
                        <input
                            type="text" maxLength={256} placeholder={"Type your message here"}
                            value={typingMessage}
                            disabled={loading}
                            onKeyUp={event => {
                                if (event.key === 'Enter') {
                                    sendMessage();
                                }
                            }}
                            onChange={event => setTypingMessage(event.target.value)}
                        />
                        <div className="send-icon" onClick={sendMessage}>
                            <img src={send} alt={''}/>
                        </div>
                    </div>
                    <div className="power-by">
                        Powered by Viettel
                    </div>
                </div>
            </div>
        </div>
    )
}