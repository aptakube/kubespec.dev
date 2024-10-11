import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useState } from "react";

export type Props = {
  index: number;
  frontmatter: Record<string, any>;
  children: React.ReactNode;
};

export function Example(props: Props) {
  const [open, setOpen] = useState(props.index === 0);

  const toggle = () => setOpen((o) => !o);

  return (
    <div className="pt-6">
      <dt>
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-start justify-between text-left"
        >
          <div>
            <span className="text-base font-semibold leading-7">
              {props.index + 1}. {props.frontmatter.title}
            </span>
            <p className="text-sm">{props.frontmatter.description}</p>
          </div>
          <span className="ml-6 flex h-7 items-center">
            {open ? (
              <IconMinus className="h-6 w-6" aria-hidden="true" />
            ) : (
              <IconPlus className="h-6 w-6" aria-hidden="true" />
            )}
          </span>
        </button>
      </dt>
      {open && <dd className="mt-2 leading-6">{props.children}</dd>}
    </div>
  );
}
