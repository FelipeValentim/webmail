import React from "react";
import TagsInput from "react-tagsinput";
import "assets/css/react-tag-input-component.css";
import "react-tagsinput/react-tagsinput.css";

interface InputTagsProps {
  value: string[];
  placeholder?: string;
  onChange?: (tags: string[], value: string[], indexes: number[]) => void;
  addTag: (value: string, index: number) => void;
  deleteTag: (value: string, index: number) => void;
}

const InputTags: React.FC<InputTagsProps> = ({
  value,
  addTag,
  deleteTag,
  onChange,
  placeholder = "Para",
  ...props
}) => {
  const handleChange = (tags, val, index) => {
    const [v] = val;
    const [i] = index;

    if (tags.length > value.length) {
      addTag(v, i);
    } else {
      deleteTag(v, i);
    }

    if (onChange) {
      onChange(tags, val, index);
    }
  };

  return (
    <TagsInput
      value={value}
      addOnBlur
      addKeys={[9, 13, 188, 32]}
      inputProps={{ placeholder: placeholder }}
      onChange={handleChange}
      {...props}
    />
  );
};

export { InputTags };
