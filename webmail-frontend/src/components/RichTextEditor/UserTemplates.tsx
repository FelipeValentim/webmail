import React, { WheelEvent } from "react";
import { getTemplates } from "../../helpers/storage";
import "/src/assets/css/UserTemplates.css";
import NewTemplate from "./NewTemplate";
import TemplateList from "./TemplateList";

interface UserTemplatesProps {
  generateText: (text: string) => void;
}

const UserTemplates: React.FC<UserTemplatesProps> = ({ generateText }) => {
  const [templates, setTemplates] = React.useState(getTemplates());
  const templatesRef = React.useRef<HTMLUListElement>(null);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  const handleWheel = (event: WheelEvent<HTMLUListElement>) => {
    event.preventDefault();
    const element = templatesRef?.current;

    if (element) {
      element.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
      });
    }
  };

  return (
    <div>
      {templates && (
        <ul
          ref={templatesRef}
          className={`templates ${isHovered ? "show-scrollbar" : ""}`}
          onWheel={handleWheel}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {templates
            .filter((x) => x.favorite)
            .map(({ guid, title, text }) => (
              <li key={guid} onClick={() => generateText(text)}>
                {title}
              </li>
            ))}
        </ul>
      )}

      <div className="d-flex justify-content-space-between">
        <NewTemplate templates={templates} setTemplates={setTemplates} />
        <TemplateList
          templates={templates}
          setTemplates={setTemplates}
          generateText={generateText}
        />
      </div>
    </div>
  );
};

export default UserTemplates;
