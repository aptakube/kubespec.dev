import * as Tooltip from "@radix-ui/react-tooltip";

type Props = {
  scope: "Cluster" | "Namespaced";
  className?: string;
};

export function ScopeIcon(props: Props) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          {props.scope === "Cluster" && (
            <img src="/kubernetes.svg" className={props.className} />
          )}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-background border px-2 py-1 text-sm rounded-lg">
            {props.scope === "Namespaced"
              ? "Namespaced Resource"
              : "Cluster-scoped Resource"}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
