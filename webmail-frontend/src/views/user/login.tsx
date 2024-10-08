import React, { Provider } from "react";
import auth from "assets/auth.svg";
import logo from "assets/logo/logo.svg";
import logomarca from "assets/logo/logomarca.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faGear } from "@fortawesome/free-solid-svg-icons";
import Errors from "../../interfaces/Errors";
import { AxiosError, AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import { loginUser } from "../../redux/user";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { UserAPI } from "../../services/UserAPI";
import User from "../../interfaces/User";
import { setUser } from "../../helpers/storage";
import { ORIGIN_URL, httpStatus } from "../../constants/default";
import AuthResult from "../../interfaces/AuthResult";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
  ConnectionSettings,
  ProviderSettings,
} from "../../interfaces/Provider";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const options = [
  { value: 0, label: "Nenhum" },
  { value: 1, label: "SSL/TLS" },
  { value: 2, label: "SslOnConnect" },
  { value: 3, label: "StartTls" },
  { value: 4, label: "StartTlsWhenAvailable" },
];

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Login = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = React.useState<string>("");
  const [settings, setSettings] = React.useState<any>({
    open: false,
    tab: 0,
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>("");
  const [errors, setErrors] = React.useState<Errors>({
    email: undefined,
    password: undefined,
    invalidCredentials: undefined,
  });
  const [passwordHide, setPasswordHide] = React.useState<boolean>(true);
  const [provider, setProvider] = React.useState<ProviderSettings | null>(null);
  const [imap, setImap] = React.useState<ConnectionSettings>({
    host: "",
    port: undefined,
    secureSocketOptions: 0,
    type: "IMAP",
  });
  const [smtp, setSmtp] = React.useState<ConnectionSettings>({
    host: "",
    port: undefined,
    secureSocketOptions: 0,
    type: "SMTP",
  });

  const testConnection = async (protocol: ConnectionSettings, name: string) => {
    try {
      if (!loading) {
        setLoading(true);

        await UserAPI.testConnection(protocol);

        setProvider({ ...provider, [name]: imap });
      }
    } finally {
      setLoading(false);
    }
  };

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

  React.useEffect(() => {
    const oAuthLogin = async (authResult: AuthResult) => {
      const response: AxiosResponse = await UserAPI.loginOAuth(authResult);

      if (response.status === httpStatus.ok) {
        setUser(authResult.email);
        dispatch(loginUser(authResult.email));
      } else {
        setErrors({ ...errors, invalidCredentials: response.data });
      }
    };

    // Ouça a mensagem enviada pela guia secundária
    const messageListener = (event: MessageEvent) => {
      // Certifique-se de verificar a origem da mensagem para garantir a segurança
      if (event.origin !== ORIGIN_URL) {
        return;
      }

      // Verifique se a mensagem contém o token
      if (event.data.authResult) {
        // Faça o que quiser com os tokens na guia principal
        if (event.data.authResult.succeeded) {
          oAuthLogin(event.data.authResult);
        } else {
          setErrors({
            ...errors,
            invalidCredentials: "Ocorreu algum erro na autenticação",
          });
        }
      }
    };

    // Adicione o event listener ao montar o componente
    window.addEventListener("message", messageListener);

    // Remova o event listener ao desmontar o componente
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  const logIn = async () => {
    if (!loading) {
      if (!email || !password) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: !email ? "E-mail é obrigatório" : undefined,
          password: !password ? "Senha é obrigatória" : undefined,
        }));
      } else {
        setLoading(true);

        try {
          const user: User = {
            username: email,
            password: password,
            serviceType: 3,
            imapProvider: imap,
            smtpProvider: smtp,
          };

          const response: AxiosResponse = await UserAPI.login(user);

          if (response.status === httpStatus.ok) {
            setUser(user.username);
            dispatch(loginUser(user.username));
          } else {
            setErrors({ ...errors, invalidCredentials: response.data });
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            setErrors({
              ...errors,
              invalidCredentials: error.response?.data,
            });
          }
        } finally {
          setLoading(false);
        }

        setTimeout(
          () =>
            setErrors({
              ...errors,
              invalidCredentials: undefined,
            }),
          5000
        );
      }
    }
  };

  const authGoogle = async () => {
    if (!loading) {
      setLoading(true);

      try {
        const response: AxiosResponse = await UserAPI.authGoogle();

        if (response.status === httpStatus.ok) {
          const { data } = response;

          const newWindow = window.open(data, "_blank");

          const checkWindowClosed = setInterval(() => {
            if (newWindow && newWindow.closed) {
              setLoading(false);
              clearInterval(checkWindowClosed);
            }
          }, 1000);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          setErrors({
            ...errors,
            invalidCredentials: "Ocorreu algum erro na autenticação",
          });
        }
      }
    }
  };

  return (
    <div className="user-container mr-10">
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
          <h5>
            <strong>
              No momento o Login apenas funciona com contas da Google e Outlook
            </strong>
          </h5>
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
                {errors.invalidCredentials && (
                  <div className="invalid-credentials">
                    {errors.invalidCredentials}
                  </div>
                )}
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block">
                  {errors.password}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center  gap-1">
            <button
              type="button"
              className="btn btn-primary mt-2 mb-2 position-relative"
              onClick={logIn}
            >
              Login
              {loading && <div className="loading-button"></div>}
            </button>
            <div className="settings">
              <div
                className="settings-button"
                onClick={() =>
                  setSettings({ ...settings, open: !settings.open })
                }
              >
                <FontAwesomeIcon icon={faGear} size="xl" />
              </div>
              {settings.open && (
                <div className="settings-provider">
                  <Box sx={{ width: "100%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <Tabs
                        value={settings.tab}
                        onChange={(
                          event: React.SyntheticEvent,
                          newValue: number
                        ) => setSettings({ ...settings, tab: newValue })}
                        aria-label="basic tabs example"
                      >
                        <Tab label="IMAP" />
                        <Tab label="SMTP" />
                      </Tabs>
                    </Box>
                    <CustomTabPanel value={settings.tab} index={0}>
                      <h3 className="mb-1">Configuraçao do Servidor IMAP</h3>
                      <div className="input-group">
                        <div className="form-control">
                          <label htmlFor="host">Host</label>
                          <input
                            value={imap.host}
                            onChange={({ target }) =>
                              setImap({ ...imap, host: target.value })
                            }
                            placeholder="Digite o Host"
                            id="host"
                            type="host"
                          ></input>
                        </div>
                        <div className="form-control">
                          <label htmlFor="port">Porta</label>
                          <input
                            value={imap.port}
                            onChange={({ target }) =>
                              setImap({ ...imap, port: Number(target.value) })
                            }
                            placeholder="Digite a Porta"
                            id="port"
                            type="port"
                          ></input>
                        </div>
                        <div className="form-control">
                          <label htmlFor="secureSocketOptions">Segurança</label>
                          <select
                            title="Segurança"
                            name="secureSocketOptions"
                            onChange={(e) =>
                              setImap({
                                ...imap,
                                secureSocketOptions: Number(e.target.value),
                              })
                            }
                            value={imap.secureSocketOptions}
                          >
                            {options.map((option) => (
                              <option value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {!provider?.imap && (
                        <button
                          type="button"
                          onClick={() => testConnection(imap, "imap")}
                          className="btn btn-primary mt-2 position-relative"
                        >
                          Testar conexão
                          {loading && <div className="loading-button"></div>}
                        </button>
                      )}
                    </CustomTabPanel>
                    <CustomTabPanel value={settings.tab} index={1}>
                      <h3 className="mb-1">Configuraçao do Servidor SMTP</h3>
                      <div className="input-group">
                        <div className="form-control">
                          <label htmlFor="host">Host</label>
                          <input
                            value={smtp.host}
                            onChange={({ target }) =>
                              setSmtp({ ...smtp, host: target.value })
                            }
                            placeholder="Digite o Host"
                            id="host"
                            type="host"
                          ></input>
                        </div>
                        <div className="form-control">
                          <label htmlFor="port">Porta</label>
                          <input
                            value={smtp.port}
                            onChange={({ target }) =>
                              setSmtp({ ...smtp, port: Number(target.value) })
                            }
                            placeholder="Digite a Porta"
                            id="port"
                            type="port"
                          ></input>
                        </div>
                        <div className="form-control">
                          <label htmlFor="secureSocketOptions">Segurança</label>
                          <select
                            title="Segurança"
                            name="secureSocketOptions"
                            onChange={({ target }) =>
                              setSmtp({
                                ...smtp,
                                secureSocketOptions: Number(target.value),
                              })
                            }
                            value={smtp.secureSocketOptions}
                          >
                            {options.map((option) => (
                              <option value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {!provider?.smtp && (
                        <button
                          onClick={() => testConnection(smtp, "smtp")}
                          type="button"
                          className="btn btn-primary mt-2 position-relative"
                        >
                          Testar conexão
                          {loading && <div className="loading-button"></div>}
                        </button>
                      )}
                    </CustomTabPanel>
                    <Box sx={{ p: 3 }}>
                      <div className="d-flex align-items-center gap-1">
                        {provider?.imap && provider?.smtp && (
                          <button type="button" className="btn btn-error">
                            Remover
                          </button>
                        )}
                      </div>
                    </Box>
                  </Box>
                </div>
              )}
            </div>
          </div>

          <h4 className="mb-2 text-align-center lines-around">OU</h4>
          <button
            type="button"
            className="btn btn-google d-flex align-items-center gap-0-5"
            onClick={authGoogle}
          >
            <FontAwesomeIcon icon={faGoogle} />
            <span className="color-white">Autenticar com Google</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
