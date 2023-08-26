import React from "react";
import {
  faSearch,
  faSliders,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RootState from "../../interfaces/RootState";
import { useDispatch, useSelector } from "react-redux";
import { setSearch } from "../../redux/search";
import DropDownButton from "../../containers/DropDownButton";
import Button from "../../containers/Button";

const HeaderSearchBar = () => {
  const [text, setText] = React.useState("");
  const search = useSelector((state: RootState) => state.search);
  const dispatch = useDispatch();

  const setParams = (param: string) => {
    if (search.params.includes(param)) {
      if (search.params.length > 1) {
        dispatch(
          setSearch({
            ...search,
            params: search.params.filter((x) => x !== param),
          })
        );
      }
    } else {
      dispatch(setSearch({ ...search, params: [...search.params, param] }));
    }
    //  dispatch(setSearch({ ...search, params: [...search.params] }));
  };

  const cleanText = () => {
    setText("");
    dispatch(setSearch({ ...search, text: "" }));
  };

  return (
    <div className="search-bar">
      <Button
        className="search btn-secondary"
        icon={faSearch}
        onClick={() => dispatch(setSearch({ ...search, text: text }))}
      />
      <input
        placeholder="Pesquisar"
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="text"
      ></input>
      {text.length > 0 && (
        <Button
          className="clean btn-secondary"
          icon={faXmark}
          onClick={cleanText}
        />
      )}
      <DropDownButton className="settings btn-secondary" icon={faSliders}>
        <ul>
          <li
            className={
              search.params.includes("subject") ? "active" : "desactive"
            }
            onClick={() => setParams("subject")}
          >
            Assunto
          </li>
          <li
            className={
              search.params.includes("content") ? "active" : "desactive"
            }
            onClick={() => setParams("content")}
          >
            Conteúdo
          </li>
          <li
            className={search.params.includes("from") ? "active" : "desactive"}
            onClick={() => setParams("from")}
          >
            De
          </li>
          <li
            className={search.params.includes("to") ? "active" : "desactive"}
            onClick={() => setParams("to")}
          >
            Para
          </li>
        </ul>
      </DropDownButton>
    </div>
  );
};

export default HeaderSearchBar;
