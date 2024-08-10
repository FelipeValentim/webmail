import React, { useState } from "react";
import Button from "../../containers/Button";
import {
  faArrowLeftLong,
  faRotateLeft,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RootState from "../../interfaces/RootState";
import { setReturning } from "../../redux/pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TextCortexAPI } from "../../services/TextCortexAPI";
import Codes from "../../interfaces/Codes";

interface MessageHeaderProps {
  setMessage: (message) => void;
  setSummary: (summary) => void;
  content?: string;
  summary?: string;
  isSummarized: boolean;
}
const MessageHeader: React.FC<MessageHeaderProps> = ({
  setMessage,
  setSummary,
  content,
  summary,
  isSummarized,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const goBack = () => {
    dispatch(setReturning(true));
    navigate(`/#${encodeURIComponent(selectedFolder.path.toLowerCase())}`);
    // navigate(-1);
  };

  const summaryMessage = async () => {
    if (summary) {
      setSummary(summary);
      return;
    }

    if (!loading && content) {
      setLoading(true);

      try {
        console.log(content);
        const codes: Codes = { text: content };
        const { data }: { data: string } = await TextCortexAPI.summary(codes);
        setMessage((message) => ({ ...message, summary: data }));
        setSummary(data);
        console.log("resposta", data);
      } finally {
        setLoading(false);
      }
    }
  };

  const originalMessage = async () => {
    setSummary(null);
  };

  return (
    <div className="home-header">
      <div className="options">
        <Button
          onClick={goBack}
          className="btn-secondary"
          title="Voltar"
          component={<FontAwesomeIcon icon={faArrowLeftLong} />}
        />

        {isSummarized ? (
          <Button
            onClick={originalMessage}
            className="btn-secondary"
            title="Original"
            component={<FontAwesomeIcon icon={faRotateLeft} />}
          />
        ) : (
          <Button
            onClick={summaryMessage}
            className="btn-secondary"
            title="Resumir"
            component={<FontAwesomeIcon icon={faWandMagicSparkles} />}
          />
        )}
      </div>
    </div>
  );
};

export default MessageHeader;
