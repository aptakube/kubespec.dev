import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";

type Props = {
  title: ReactNode;
  added: number;
  removed: number;
  updated: number;
  children: ReactNode;=
};

export function CollapsableItem(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <div
        className="inline-flex items-center gap-1 cursor-pointer hover:bg-accent p-2 rounded"
        onClick={toggle}
      >
        {isOpen ? (
          <IconChevronDown className="size-4" />
        ) : (
          <IconChevronRight className="size-4" />
        )}
        <h3 className="leading-none font-title text-lg">{props.title}</h3>
        <div className="flex items-center text-xs gap-1 font-semibold font-mono ml-2">
          {props.added > 0 && (
            <span className="text-success">+{props.added}</span>
          )}
          {props.removed > 0 && (
            <span className="text-destructive">-{props.removed}</span>
          )}
          {props.updated > 0 && (
            <span className="text-warning">~{props.updated}</span>
          )}
        </div>
      </div>
      {isOpen && <>{props.children}</>}
    </div>
  );
}
