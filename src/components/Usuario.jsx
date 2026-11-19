
import { useState, useEffect } from "react";
import { supabase } from "../lib/supaBaseClient";
import "./Usuario.css";

function Usuario() {
  const [aberto, setAberto] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [nickname, setNickname] = useState("");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [removerAvatar, setRemoverAvatar] = useState(false);

  // Carregar perfil do usuário
  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error.message);
        return;
      }

      setPerfil(data);
      setNickname(data.username);
    }

    carregarPerfil();
  }, []);

  // Limpar prévia da imagem
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Selecionar foto
  function selecionarFoto(e) {
    const arquivo = e.target.files[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      alert("Selecione uma imagem.");
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setFoto(arquivo);
    setPreview(URL.createObjectURL(arquivo));
  }

  // Salvar alterações
  async function salvarPerfil() {
    if (!nickname.trim()) {
      alert("O nickname não pode ficar vazio.");
      return;
    }

    setSalvando(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado.");

      let avatarPath = removerAvatar ? null : perfil.avatar_path;
 
      if (!foto && !preview && perfil.avatar_path === null) {
      avatarPath = null;
      }


      // Enviar nova foto, caso tenha sido selecionada
      if (foto) {
        const extensao = foto.name.split(".").pop().toLowerCase();
        const caminho = `${user.id}/avatar-${crypto.randomUUID()}.${extensao}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(caminho, foto, {
            contentType: foto.type
          });

        if (uploadError) throw uploadError;

        avatarPath = caminho;
      }

      // Atualizar perfil no banco
      const { data, error } = await supabase
        .from("profiles")
        .update({
          username: nickname.trim(),
          avatar_path: avatarPath,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setPerfil(data);
      setFoto(null);
      setPreview(null);
      setAberto(false);

    } catch (error) {
      console.error("Erro ao salvar perfil:", error.message);
      alert("Não foi possível salvar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  if (!perfil) return null;

  const avatarUrl = preview || (
    perfil.avatar_path
      ? supabase.storage.from("avatars").getPublicUrl(perfil.avatar_path).data.publicUrl
      : null
  );

  return (
    <>
      <div
        className="user-area"
        onClick={() => setAberto(true)}
      >
        <div className="user-avatar">
          {avatarUrl
            ? <img src={avatarUrl} alt="Foto de perfil" />
            : perfil.username.charAt(0).toUpperCase()
          }
        </div>

        <div className="user-info">
          <strong>{perfil.username}</strong>
          <span>{perfil.status}</span>
        </div>
      </div>

      {aberto && (
        <div
          className="profile-overlay"
          onClick={() => setAberto(false)}
        >
          <div
            className="profile-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="profile-close"
              onClick={() => setAberto(false)}
            >
              ×
            </button>

            <h2>Editar perfil</h2>

            
<div className="profile-photo">
  <div className="user-avatar large">
    {avatarUrl
      ? <img src={avatarUrl} alt="Foto de perfil" />
      : perfil.username.charAt(0).toUpperCase()
    }
  </div>

  <div className="photo-actions">
    <label className="change-photo">
      Alterar foto
      <input
        type="file"
        accept="image/*"
        onChange={selecionarFoto}
        hidden
      />
    </label>

    <button
      className="remove-photo"
      onClick={() => {
        setFoto(null);
        setPreview(null);
        setRemoverAvatar(true)
      }}
      disabled={!foto && !perfil.avatar_path}
    >
      Remover foto
    </button>
  </div>
</div>


            <label className="profile-label">
              Nickname
            </label>

            <input
              className="profile-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={32}
              placeholder="Seu nickname"
            />

            <button
              className="save-profile"
              onClick={salvarPerfil}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Usuario;
