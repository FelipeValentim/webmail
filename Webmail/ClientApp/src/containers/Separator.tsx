import { FC } from "react";

interface SeparatorProps {
  height: number;
}

const Separator: FC<SeparatorProps> = ({ height }) => {
  return <div className="separator" style={{ height: height }}></div>;
};

export default Separator;
