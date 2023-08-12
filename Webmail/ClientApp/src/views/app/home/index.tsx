import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import api from "../../../api";
import Message from "../../../interfaces/Message";
import RootState from "../../../interfaces/RootState";
import { setMessages } from "../../../redux/messages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";

const Index = () => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.user);
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  React.useEffect(() => {
    if (loading) return;

    const getFolders = async () => {
      try {
        setLoading(true);
        const response = await api.post(
          "webmail/Emails",
          { FolderName: selectedFolder.path, Page: 1, RowsPerPage: 30 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: Array<Message> = response.data;
        console.log("ssad");
        dispatch(setMessages(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedFolder) getFolders();
  }, [selectedFolder]);

  return (
    <ul className="messages">
      <li className="read">
        <input title="Selecionar" className="select" type="checkbox"></input>
        <FontAwesomeIcon className="favorite" icon={starRegular} />
        <span className="address">PicPay</span>
        <span className="subject">
          Pagamento confirmado para o pedido Amazon.com.br #702-5368428-1413837
        </span>
        <span className="content">
          Agradecemos por comprar na Amazon.com.br. Seu pagamento foi confirmado
          e seu pedido está sendo processado.{" "}
        </span>
        <span className="time">22:40</span>
      </li>

      <li className="read">
        <input title="Selecionar" type="checkbox"></input>
        <FontAwesomeIcon className="favorite" icon={starRegular} />
        <span className="address">PicPay</span>
        <span className="subject">
          Pagamento confirmado para o pedido Amazon.com.br #702-5368428-1413837
        </span>
        <span className="content">
          Agradecemos por comprar na Amazon.com.br. Seu pagamento foi confirmado
          e seu pedido está sendo processado.{" "}
        </span>
        <span className="time">22:40</span>
      </li>

      <li>
        <input title="Selecionar" type="checkbox"></input>
        <FontAwesomeIcon className="favorite" icon={starRegular} />
        <span className="address">PicPay</span>
        <span className="subject">
          Pagamento confirmado para o pedido Amazon.com.br #702-5368428-1413837
        </span>
        <span className="content">
          Agradecemos por comprar na Amazon.com.br. Seu pagamento foi confirmado
          e seu pedido está sendo processado.{" "}
        </span>
        <span className="time">22:40</span>
      </li>

      <li>
        <input title="Selecionar" type="checkbox"></input>
        <FontAwesomeIcon className="favorite" icon={starRegular} />
        <span className="address">PicPay</span>
        <span className="subject">
          Pagamento confirmado para o pedido Amazon.com.br #702-5368428-1413837
        </span>
        <span className="content">
          Agradecemos por comprar na Amazon.com.br. Seu pagamento foi confirmado
          e seu pedido está sendo processado.{" "}
        </span>
        <span className="time">10 de ago.</span>
      </li>

      <li className="read">
        <input title="Selecionar" type="checkbox"></input>
        <FontAwesomeIcon className="favorite" icon={starRegular} />
        <span className="address">PicPay</span>
        <span className="subject">
          Pagamento confirmado para o pedido Amazon.com.br #702-5368428-1413837
        </span>
        <span className="content">
          Agradecemos por comprar na Amazon.com.br. Seu pagamento foi confirmado
          e seu pedido está sendo processado.{" "}
        </span>
        <span className="time">10 de ago.</span>
      </li>

      <li>
        <input title="Selecionar" type="checkbox"></input>
        <FontAwesomeIcon className="favorite" icon={starRegular} />
        <span className="address">PicPay</span>
        <span className="subject">
          Pagamento confirmado para o pedido Amazon.com.br #702-5368428-1413837
        </span>
        <span className="content">
          Agradecemos por comprar na Amazon.com.br. Seu pagamento foi confirmado
          e seu pedido está sendo processado.{" "}
        </span>
        <span className="time">10 de ago.</span>
      </li>

      <li>
        <input title="Selecionar" type="checkbox"></input>
        <FontAwesomeIcon className="favorite" icon={starRegular} />
        <span className="address">PicPay</span>
        <span className="subject">
          Pagamento confirmado para o pedido Amazon.com.br #702-5368428-1413837
        </span>
        <span className="content">
          Agradecemos por comprar na Amazon.com.br. Seu pagamento foi confirmado
          e seu pedido está sendo processado.{" "}
        </span>
        <span className="time">10 de ago.</span>
      </li>
    </ul>
  );
};

export default Index;
