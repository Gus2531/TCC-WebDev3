
import { useState } from "react";
import { supabase } from "../lib/supaBaseClient";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(e) {
    e.preventDefault();
    setErro("");

    const { data, error } = modoCadastro
      ? await supabase.auth.signUp({
          email,
          password: senha,
        })
      : await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

    if (error) {
      setErro(error.message);
      return;
    }

    if (data.session) {
      onLogin(data.session.user);
    } else if (modoCadastro) {
      setErro("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
    }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={entrar}>
        <h1>{modoCadastro ? "Criar conta" : "Entrar"}</h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {erro && <p className="login-error">{erro}</p>}

        <button type="submit">
          {modoCadastro ? "Cadastrar" : "Entrar"}
        </button>

        <p onClick={() => {
          setModoCadastro(!modoCadastro);
          setErro("");
        }}>
          {modoCadastro
            ? "Já possui conta? Entre aqui"
            : "Não possui conta? Cadastre-se"}
        </p>
      </form>
    </div>
  );
}

export default Login;
