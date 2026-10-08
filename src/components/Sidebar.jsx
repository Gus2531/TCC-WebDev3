import App from "../App.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="server-header">
        <h2>Meu Servidor</h2>
      </div>

      <div className="channel-section">
        <h3>CANAIS DE TEXTO</h3>

        <div className="channel"># geral</div>
        <div className="channel"># jogos</div>
        <div className="channel"># imagens</div>
      </div>

      <div className="channel-section">
        <h3>CANAIS DE VOZ</h3>

        <div className="channel">🔊 Sala Geral</div>
      </div>

      <div className="user-area">
        <div className="user-avatar">U</div>

        <div>
          <strong>Usuário</strong>
          <span>Online</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;