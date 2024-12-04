import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { IoSend } from 'react-icons/io5';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Heading1 } from './components/text/Heading';
import { Paragraph1 } from './components/text/Paragraph';
import backgroundImage from './background.png';
import einsteinIcon from './Albert-Einstein-Icon-PNG-621960607.png';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const BotContainer = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
`;

const StyledForm = styled(Form)`
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border: 2px solid #A1DA39;
  box-sizing: border-box;
  border-radius: 9px;
  padding: 30px 50px;
`;

const ChatContainer = styled.div`
  max-height: 50vh; /* Adjust the maximum height to prevent overlapping */
  overflow-y: auto;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 5px;
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
  position: relative;

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
  font-size: 1rem;
  text-align: left;
  width: 100%;
  margin-top: 5px;
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 10px;
`;

function Bot() {
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);

  const validationSchema = Yup.object({
    message: Yup.string().required(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userMessage = values.message;
    const newMessage = { role: 'user', content: userMessage };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      const response = await axios.post(`${backendUrl}/api/chat`, { messages: [...messages, newMessage] });
      const botReply = { role: 'assistant', content: response.data.reply };
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
    <BotContainer>
      <Overlay />
      <ContentContainer>
        <Formik
          initialValues={{ message: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <StyledForm>
              <Heading1>
                <Icon src={einsteinIcon} alt="Einstein Icon" />
                Chat con EinsteinBot
              </Heading1>
              <Paragraph1>Conversa con nuestro EinsteinBot desarrollado mediante IA!
                          Preguntale sobre temas academico y por recomendación de publicaciones!
              </Paragraph1>

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
      </ContentContainer>
    </BotContainer>
  );
}

export default Bot;