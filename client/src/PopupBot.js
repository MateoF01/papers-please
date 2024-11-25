import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaTimes} from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Paragraph1 } from './components/text/Paragraph';
import einsteinIcon from './Albert-Einstein-Icon-PNG-621960607.png';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const PopupContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background-color: #f0f0f0;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(calc(100% - 60px))'};
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  animation: ${fadeIn} 0.3s ease-out, ${slideUp} 0.3s ease-out;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #A1DA39;
  color: white;
  cursor: pointer;
  border-bottom: 2px solid #8bc34a;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.2em;
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
  margin-right: 10px;
  border-radius: 50%;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const PopupContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
  background-color: white;
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ChatContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const messageBubbleAnimation = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isUser ? '#A1DA39' : '#e0e0e0'};
  color: ${props => props.isUser ? 'white' : 'black'};
  border-radius: 18px;
  padding: 12px 16px;
  margin: 5px;
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: ${messageBubbleAnimation} 0.3s ease-out;

  &:before {
    content: '';
    position: absolute;
    ${props => props.isUser ? 'right: -10px;' : 'left: -10px;'}
    top: 50%;
    border: 10px solid transparent;
    border-top-color: ${props => props.isUser ? '#A1DA39' : '#e0e0e0'};
    border-bottom: 0;
    margin-top: -5px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 5px;
`;

const StyledInput = styled(Field)`
  flex-grow: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  background-color: transparent;
  outline: none;

  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background-color: #A1DA39;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #8bc34a;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease-in-out;
  }

  &:hover svg {
    transform: translateX(2px);
  }
`;

const StyledErrorMessage = styled.div`
  font-family: "InterRegular";
  color: #DE4C38;
  font-size: 0.9rem;
  text-align: left;
  width: 100%;
  margin-top: 5px;
`;

function PopupBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);

  const validationSchema = Yup.object({
    message: Yup.string().required('Por favor, ingrese un mensaje'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userMessage = values.message;
    const newMessage = { role: 'user', content: userMessage };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      const response = await axios.post(`${backendUrl}/api/chat`, { messages: [...messages, newMessage] });
      const botReply = { role: 'assistant', content: response.data.reply};
      setMessages(prevMessages => [...prevMessages, botReply]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error. Por favor, intenta de nuevo.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }

    setSubmitting(false);
    resetForm();
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <PopupContainer isOpen={isOpen}>
      <PopupHeader onClick={() => onClose(!isOpen)}>
        <HeaderTitle>
          <Icon src={einsteinIcon} alt="Einstein Icon" />
          Chat con EinsteinBot
        </HeaderTitle>
        <CloseButton onClick={(e) => { e.stopPropagation(); onClose(false); }}>
          <FaTimes />
        </CloseButton>
      </PopupHeader>
      <PopupContent>
        <Formik
          initialValues={{ message: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <StyledForm>
              <Paragraph1>Conversa con nuestro EinsteinBot desarrollado mediante IA!</Paragraph1>

              <ChatContainer ref={chatContainerRef}>
                {messages.map((message, index) => (
                  <MessageBubble key={index} isUser={message.role === 'user'}>
                    {message.content}
                  </MessageBubble>
                ))}
              </ChatContainer>

              <InputContainer>
                <StyledInput
                  type="text"
                  name="message"
                  placeholder="Escribe tu mensaje aquí..."
                />
                <SendButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <TailSpin stroke="#ffffff" width={20} height={20} />
                  ) : (
                    <IoSend />
                  )}
                </SendButton>
              </InputContainer>
              {errors.message && touched.message && (
                <StyledErrorMessage>{errors.message}</StyledErrorMessage>
              )}
            </StyledForm>
          )}
        </Formik>
      </PopupContent>
    </PopupContainer>
  );
}

export default PopupBot;

