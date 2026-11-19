import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Usuario from './components/Usuario';
import Home from './pages/Home';
import Geral from './pages/geral';
import Login from './components/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { supabase } from "./lib/supabaseClient";

function App() {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarUsuario() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error.message);
      }

      setUser(data.session?.user ?? null);
      setCarregando(false);
    }

    verificarUsuario();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (carregando) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  async function testarBanco() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Nenhum usuário autenticado.");
    return;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      user_id: user.id,
      channel_name: "geral",
      content: "Minha primeira mensagem!",
    })
    .select();

  if (error) {
    console.error("Erro ao salvar:", error.message);
  } else {
    console.log("Mensagem salva!", data);
  }
}

  return (
    <BrowserRouter>
      <div className="discord">
        <button onClick={testarBanco}>
  Testar banco
</button>
        <Sidebar />
        <Usuario />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/geral" element={<Geral />} />
        </Routes>

        <button onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </div>
    </BrowserRouter>
  );
}

export default App;
