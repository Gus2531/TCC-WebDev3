
import { useState } from "react";

function Chat({ nomeChat, descricao }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState([]);
  const [arquivos, setArquivos] = useState([]);

  // Selecionar arquivos
  function selecionarArquivos(e) {
    const novosArquivos = Array.from(e.target.files).map((arquivo) => ({
      arquivo,
      url: URL.createObjectURL(arquivo),
      nome: arquivo.name,
      tipo: arquivo.type.startsWith("image/")
        ? "imagem"
        : arquivo.type.startsWith("video/")
        ? "video"
        : "arquivo",
    }));

    setArquivos((anteriores) => [...anteriores, ...novosArquivos]);

    e.target.value = "";
  }

  // Remover arquivo da prévia
  function removerArquivo(index) {
    setArquivos((anteriores) => {
      const atualizado = [...anteriores];

      URL.revokeObjectURL(atualizado[index].url);
      atualizado.splice(index, 1);

      return atualizado;
    });
  }

  // Enviar mensagem e arquivos juntos
  function enviarMensagem() {
    if (text.trim() === "" && arquivos.length === 0) return;

    const novaMensagem = {
      texto: text,
      arquivos: arquivos.map((item) => ({
        ...item,
      })),
    };

    setMessage((mensagens) => [...mensagens, novaMensagem]);

    setText("");
    setArquivos([]);
  }

  return (
    <main className="chat">

      <header className="chat-header">
        <h2>#{nomeChat}</h2>
        <p>{descricao}</p>
      </header>

      <div className="messages">
        {message.length === 0 ? (
          <div className="welcome-message">
            <h1>Bem-vindo ao #{nomeChat}!</h1>
            <p>Este é o começo do seu servidor local.</p>
          </div>
        ) : (
          message.map((mensagem, index) => (
            <div className="message" key={index}>
              <strong>Usuário</strong>

              {mensagem.texto && (
                <p>{mensagem.texto}</p>
              )}

              <div className="message-files">
                {mensagem.arquivos.map((item, i) => (
                  <div key={i}>
                    {item.tipo === "imagem" && (
                      <img
                        src={item.url}
                        alt={item.nome}
                        className="chat-image"
                      />
                    )}

                    {item.tipo === "video" && (
                      <video
                        src={item.url}
                        controls
                        className="chat-video"
                      />
                    )}

                    {item.tipo === "arquivo" && (
                      <a href={item.url} download={item.nome}>
                        📎 {item.nome}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="message-input">

        {arquivos.length > 0 && (
          <div className="file-preview">
            {arquivos.map((item, index) => (
              <div className="preview-item" key={index}>

                {item.tipo === "imagem" && (
                  <img src={item.url} alt={item.nome} />
                )}

                {item.tipo === "video" && (
                  <video src={item.url} />
                )}

                {item.tipo === "arquivo" && (
                  <span>📎 {item.nome}</span>
                )}

                <button onClick={() => removerArquivo(index)}>
                  ×
                </button>

              </div>
            ))}
          </div>
        )}

        <label className="file-button" title="Anexar arquivo">
          +
          <input
            type="file"
            accept="image/*,video/*,.pdf,.txt,.doc,.docx"
            multiple
            onChange={selecionarArquivos}
          />
        </label>

        <input
          type="text"
          placeholder={`Enviar mensagem em #${nomeChat}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") enviarMensagem();
          }}
        />

      </div>
    </main>
  );
}

export default Chat;
