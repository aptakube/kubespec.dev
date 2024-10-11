import type { ResourceDefinition } from "@lib/kube";
import { PropertyRow } from "./PropertyRow";

type Props = {
  definition: ResourceDefinition;
  level: number;
};

export function PropertyTree(props: Props) {
  const marginLeft = `${props.level > 0 ? 1 : 0}rem`;
  const border = props.level > 0 ? "border-l-2" : "";

  return (
    <ul className={`font-mono ${border}`} style={{ marginLeft }}>
      {Object.entries(props.definition.properties || []).map(
        ([name, property]) => (
          <PropertyRow
            key={name}
            name={name}
            {...property}
            level={props.level}
          />
        )
      )}
    </ul>
  );
}
