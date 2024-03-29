import React from "react";
import { getTemplates } from "../../helpers/storage";

import NewTemplate from "./NewTemplate";
import "/src/assets/css/UserTemplates.css";

const UserTemplates = () => {
  const [templates, setTemplates] = React.useState(getTemplates());
  console.log(templates);
  return (
    <div>
      {templates && (
        <ul className="templates">
          {templates.map(({ guid, title, text }) => (
            <li key={guid}>{title}</li>
          ))}
        </ul>
      )}

      <NewTemplate templates={templates} setTemplates={setTemplates} />
    </div>
  );
};

export default UserTemplates;
