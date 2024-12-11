import { useState } from "react";
import { diffWords } from "diff";

type Props = {
  path: string;
  description: string;
  description2?: string;
  color: string;
};

const DiffViewer = ({
  oldText,
  newText,
}: {
  oldText: string;
  newText: string;
}) => {
  // Compute the diff
  const diff = diffWords(oldText, newText);

  return (
    <div className="font-mono">
      {diff.map((part, index) => {
        const isAdded = part.added;
        const isRemoved = part.removed;
        const className = isAdded
          ? "bg-success/20 text-success px-1"
          : isRemoved
            ? "bg-destructive/20 text-destructive px-1 line-through"
            : "";

        return (
          <span key={index} className={className}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
};

export function DescriptionToggle(props: Props) {
  const [show, setShow] = useState(false);

  const toggle = () => setShow(!show);

  return (
    <li>
      <span
        onClick={toggle}
        className={`font-medium cursor-pointer hover:bg-accent px-1 rounded break-words ${props.color}`}
      >
        {props.path}
      </span>
      {show && !props.description2 && (
        <pre className="ml-1 mb-2 max-w-4xl whitespace-pre-line text-xs font-normal">
          {props.description}
        </pre>
      )}
      {show && props.description2 && (
        <pre className="ml-1 mb-2 max-w-4xl whitespace-pre-line text-xs font-normal">
          <DiffViewer
            oldText={props.description}
            newText={props.description2}
          />
        </pre>
      )}
    </li>
  );
}
