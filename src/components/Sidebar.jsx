import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="server-header">
        <h2>Meu Servidor</h2>
      </div>

      <div className="channel-section">
        <h3>CANAIS DE TEXTO</h3>

        <div className="channel" >
          <Link to="/geral"># geral</Link>
        </div>
        <div className="channel">
          <Link to="/midia"># midia</Link>
          </div>
        <div className="channel"># imagens</div>
      </div>

      <div className="channel-section">
        <h3>CANAIS DE VOZ</h3>

        <div className="channel">🔊 Sala Geral</div>
      </div>
    </aside>
  );
}

export default Sidebar;