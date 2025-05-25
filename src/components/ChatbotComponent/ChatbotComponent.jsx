import React, { useState, useEffect, useRef } from 'react';
import './ChatbotComponent.css';
import { useSelector } from 'react-redux';
import { processGoogleAloudQuery } from '../../services/ChatbotService';
import chatbotIcon from '../../assets/img/chatbot-icon.jpg';

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: 'Xin chào! Tôi là trợ lý AI của hiệu sách BookStore. Tôi có thể giúp gì cho bạn?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState('unknown'); // 'unknown', 'connected', 'error'
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);
  const user = useSelector((state) => state.user);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API connection on component mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  // Adjust position if needed
  useEffect(() => {
    if (isOpen) {
      // Make sure the chatbot is in the viewport
      setTimeout(() => {
        if (chatbotRef.current) {
          const rect = chatbotRef.current.getBoundingClientRect();
          if (rect.top < 0) {
            window.scrollTo({
              top: window.scrollY + rect.top - 20,
              behavior: 'smooth'
            });
          }
        }
      }, 300);
    }
  }, [isOpen]);

  const checkApiConnection = async () => {
    try {
      // Test the API with a simple greeting
      await processGoogleAloudQuery('hello');
      setApiConnectionStatus('connected');
    } catch (error) {
      console.error('API connection test failed:', error);
      setApiConnectionStatus('error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleQueryProcessing = async (query) => {
    setIsTyping(true);

    try {
      // Always use Gemini API
      const response = await processGoogleAloudQuery(query);
      console.log('Google Gemini API response:', response);

      // Format the response for display
      let botResponse = '';

      if (response && response.status === 'OK') {
        botResponse = response.message || '';

        // If there's data in the response, format it
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          botResponse += '\n\n';

          response.data.slice(0, 3).forEach((book, index) => {
            botResponse += `${index + 1}. "${book.productName}" bởi ${book.author}\n`;
            botResponse += `   Giá: ${book.productPrice.toLocaleString('vi-VN')} VND\n\n`;
          });

          if (response.data.length > 3) {
            botResponse += `...và ${response.data.length - 3} sách khác.`;
          }
        }
      } else {
        botResponse = 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.';
      }

      // Add bot response to messages
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            sender: 'bot',
            content: botResponse,
            timestamp: new Date()
          }
        ]);
        setIsTyping(false);
      }, 1000); // Simulate API delay

      // Update API connection status to connected on successful call
      setApiConnectionStatus('connected');

    } catch (error) {
      console.error('Error processing query:', error);

      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            sender: 'bot',
            content: 'Xin lỗi, đã xảy ra lỗi khi kết nối đến Google Gemini AI. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
            timestamp: new Date()
          }
        ]);
        setIsTyping(false);
      }, 1000);

      // Update API connection status to error
      setApiConnectionStatus('error');
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    // Process the user's query
    await handleQueryProcessing(userMessage.content);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container" ref={chatbotRef}>
      {/* Chat toggle button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <span>&times;</span>
        ) : (
          <div className="chatbot-icon-container">
            <img src={chatbotIcon} alt="Chat Bot" className="chatbot-icon" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <img src={chatbotIcon} alt="Chat Bot" className="chatbot-header-icon" />
              <h3>Trợ lý BookStore Jasmine</h3>
              {apiConnectionStatus === 'error' && (
                <div className="api-status error">
                  <span className="status-dot"></span>
                  API Lỗi
                </div>
              )}

            </div>
            <div className="chatbot-controls">
              <button className="chatbot-close" onClick={toggleChat}>
                &times;
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {message.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isTyping || apiConnectionStatus === 'error'}
            />
            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === '' || isTyping || apiConnectionStatus === 'error'}
              className="send-button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="#334e68"/>
              </svg>
            </button>
          </div>

          {apiConnectionStatus === 'error' && (
            <div className="api-error-banner">
              Không thể kết nối đến Google Gemini API. Vui lòng kiểm tra kết nối mạng và API key.
              <button onClick={checkApiConnection} className="retry-button">
                Thử lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotComponent;