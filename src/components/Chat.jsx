
import { useState } from "react";

function Chat({nomeChat,descricao,}) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState([]);

  function enviarMensagem() {
    if (text.trim() === "") return;

    setMessage([...message, text]);
    setText("");
  }

  return (
    <main className="chat">
      <header className="chat-header">
        <h2># {nomeChat}</h2>
        <p>{descricao}</p>
      </header>

      <div className="messages">
        {message.length === 0 ? (
          <div className="welcome-message">
            <h1>Bem-vindo ao #{nomeChat}!</h1>
            <p>
              Este é o começo do seu servidor local.
            </p>
          </div>

          
        ) : (
          message.map((mensagem, index) => (
            <div className="message" key={index}>
              <strong>Usuário</strong>
              <p>{mensagem}</p>
            </div>
          ))
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Enviar mensagem em #geral"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              enviarMensagem();
            }
          }}
        />
      </div>
    </main>
  );
}

export default Chat;
