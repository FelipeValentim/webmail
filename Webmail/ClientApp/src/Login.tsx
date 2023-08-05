import React from "react";
import auth from "./assets/auth.svg";
function Login() {
  return (
    <div className="container mr-10 ">
      <div className="info">
        <img src={auth} className="logo react" alt="React logo" />
        <div>
          <h1>MailBox</h1>
          <h3>Bem-vindo ao Webmail</h3>
          <h2>Tente logar com sua conta!</h2>
        </div>
      </div>
      <div className="login">
        <div className="titles mb-2">
          <h1>Log In</h1>
          <h4>Entre com sua conta do E-mail</h4>
        </div>

        <form>
          <div className="input-group">
            <div className="form-control">
              <label htmlFor="email">Email</label>
              <input
                placeholder="Digite seu email"
                id="email"
                type="text"
              ></input>
            </div>

            <div className="form-control">
              <label htmlFor="password">Senha</label>
              <input
                placeholder="Digite sua senha"
                id="password"
                type="password"
              ></input>
            </div>
          </div>

          <button
            className="btn btn-primary mt-2 mb-2"
            onClick={(e) => e.preventDefault()}
          >
            Login
          </button>
          <h4 className="mb-2 text-align-center">OU</h4>
          <button className="btn btn-google">Autenticar com Google</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
