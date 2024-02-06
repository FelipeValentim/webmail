import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "assets/css/RichTextEditor.css";

interface RichTextEditorProps {
  data: string;
  setData: (data: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  data,
  setData,
}) => {
  return (
    <>
      <CKEditor
        editor={ClassicEditor}
        data={data}
        config={{ placeholder: "Seu texto" }}
        onReady={(editor) => {
          // You can store the "editor" and use when it is needed.
          console.log("Editor is ready to use!", editor);
        }}
        onChange={(_, editor) => {
          setData(editor.getData());
        }}
      />
    </>
  );
};

export default RichTextEditor;
