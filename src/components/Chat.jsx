import { useState, useEffect } from "react";
import { supabase } from "../lib/supaBaseClient";

function Chat({ nomeChat, descricao }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState([]);
  const [arquivos, setArquivos] = useState([]);


useEffect(() => {
  async function carregarMensagens() {
    // 1. Buscar mensagens do canal
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_name", nomeChat)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao carregar mensagens:", error.message);
      return;
    }

    // 2. Buscar os anexos de cada mensagem
    const mensagensComAnexos = await Promise.all(
      data.map(async (mensagem) => {
        const { data: anexos, error: anexoError } = await supabase
          .from("attachments")
          .select("*")
          .eq("message_id", mensagem.id);

        if (anexoError) {
          console.error("Erro ao carregar anexos:", anexoError.message);
        }

        // 3. Criar uma URL temporária para cada arquivo
        const arquivos = await Promise.all(
          (anexos || []).map(async (anexo) => {
            const { data: urlData, error: urlError } =
              await supabase.storage
                .from("chat-files")
                .createSignedUrl(anexo.file_path, 3600);

            if (urlError) {
              console.error("Erro ao criar URL:", urlError.message);
              return null;
            }

            return {
              nome: anexo.file_name,
              tipo: anexo.file_type.startsWith("image/")
                ? "imagem"
                : anexo.file_type.startsWith("video/")
                ? "video"
                : "arquivo",
              url: urlData.signedUrl,
              caminho: anexo.file_path,
            };
          })
        );

        // 4. Retornar a mensagem com seus arquivos
        return {
          texto: mensagem.content,
          arquivos: arquivos.filter(Boolean),
          user_id: mensagem.user_id,
          created_at: mensagem.created_at,
        };
      })
    );

    setMessage(mensagensComAnexos);
  }

  carregarMensagens();
}, [nomeChat]);


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
  

async function enviarMensagem() {
  if (text.trim() === "" && arquivos.length === 0) return;

  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Usuário não autenticado.");
    return;
  }

  // 1. Salvar a mensagem
  const { data: mensagem, error: mensagemError } =
    await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        channel_name: nomeChat,
        content: text.trim(),
      })
      .select()
      .single();

  if (mensagemError) {
    console.error("Erro ao salvar mensagem:", mensagemError.message);
    return;
  }

  const anexosSalvos = [];

  // 2. Enviar arquivos para o Storage
  for (const item of arquivos) {
    const nomeArquivo = item.nome.replace(/[^\w.-]/g, "_");

    const caminho =
      `${user.id}/${nomeChat}/${crypto.randomUUID()}-${nomeArquivo}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(caminho, item.arquivo, {
        contentType: item.arquivo.type,
      });

    if (uploadError) {
      console.error("Erro ao enviar arquivo:", uploadError.message);
      continue;
    }

    // 3. Salvar informações do arquivo no banco
    const { data: anexo, error: anexoError } =
      await supabase
        .from("attachments")
        .insert({
          message_id: mensagem.id,
          file_name: item.nome,
          file_type: item.arquivo.type,
          file_path: caminho,
        })
        .select()
        .single();

    if (anexoError) {
      console.error("Erro ao registrar anexo:", anexoError.message);
      continue;
    }

    // 4. Criar URL temporária para visualizar
    const { data: urlData, error: urlError } =
      await supabase.storage
        .from("chat-files")
        .createSignedUrl(caminho, 3600);

    if (urlError) {
      console.error("Erro ao criar URL:", urlError.message);
      continue;
    }

    anexosSalvos.push({
      nome: anexo.file_name,
      tipo: item.tipo,
      url: urlData.signedUrl,
      caminho: anexo.file_path,
    });
  }

  // 5. Atualizar a interface
  setMessage((mensagens) => [
    ...mensagens,
    {
      texto: mensagem.content,
      arquivos: anexosSalvos,
      user_id: mensagem.user_id,
      created_at: mensagem.created_at,
    },
  ]);

  setText("");

  arquivos.forEach((item) => URL.revokeObjectURL(item.url));
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
