import React from "react";
import auth from "./assets/auth.svg";
import logo from "./assets/logo/logo.svg";
import logomarca from "./assets/logo/logomarca.svg";
import Errors from "./interfaces/Erros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [errors, setErrors] = React.useState<Errors>({
    email: undefined,
    password: undefined,
  });

  const [passwordHide, setPasswordHide] = React.useState<boolean>(true);

  const checkEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(value)) {
      setErrors({ ...errors, email: undefined });
      setEmail(value);
    } else {
      setErrors({ ...errors, email: "E-mail inválido" });
      setEmail("");
    }
  };

  const checkPassword = (value: string) => {
    if (value.length > 0) {
      setPassword(value);
      setErrors({ ...errors, password: undefined });
    } else {
      setPassword("");
      setErrors({ ...errors, password: "Senha é obrigatório" });
    }
  };

  const logIn = () => {
    if (!email) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "E-mail é obrigatório",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: undefined,
      }));
    }

    if (!password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Senha é obrigatório",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: undefined,
      }));
    }
  };

  return (
    <div className="container mr-10 ">
      <div className="info">
        <img src={auth} className="logo react" alt="React logo" />
        <div className="container-inner">
          <span className="logos">
            <img src={logomarca} alt="" />
            <img src={logo} alt="" />
          </span>
          <div className="texts">
            <h1>Bem-vindo ao Webmail</h1>
            <h3>Uma plataforma intuitiva para gerenciar seu email</h3>
          </div>
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
                onChange={({ target }) => checkEmail(target.value)}
                placeholder="Digite seu email"
                id="email"
                type="email"
              ></input>

              {errors.email && (
                <div className="invalid-feedback d-block">{errors.email}</div>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="password">Senha</label>
              <div className="password-group">
                <input
                  onChange={({ target }) => checkPassword(target.value)}
                  placeholder="Digite sua senha"
                  id="password"
                  type={passwordHide ? "password" : "text"}
                ></input>
                <FontAwesomeIcon
                  onClick={() => setPasswordHide(!passwordHide)}
                  className="passowrd-hide"
                  icon={passwordHide ? faEye : faEyeSlash}
                />
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block">
                  {errors.password}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary mt-2 mb-2"
            onClick={logIn}
          >
            Login
          </button>
          <h4 className="mb-2 text-align-center lines-around">OU</h4>
          <button type="button" className="btn btn-google">
            Autenticar com Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
