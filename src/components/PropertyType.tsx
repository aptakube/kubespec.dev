import { twMerge } from "tailwind-merge";

type Props = {
  type: string;
  hasChildren: boolean;
  className?: string;
};

export function PropertyType(props: Props) {
  const color = props.hasChildren
    ? "text-pink-600 dark:text-pink-400"
    : props.type === "string"
      ? "text-orange-600 dark:text-pink-400"
      : props.type === "boolean"
        ? "text-blue-600 dark:text-blue-400"
        : props.type === "integer"
          ? "text-sky-600 dark:text-sky-400"
          : props.type === "Time" || props.type === "object"
            ? "text-violet-600 dark:text-violet-400"
            : "text-emerald-600 dark:text-emerald-400";

  return <span className={twMerge(color, props.className)}>{props.type}</span>;
}
