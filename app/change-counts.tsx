import type { ChangeCounts } from "@/lib/types";

// "+2 −1 ~3": added, removed, and changed in any other way
export function ChangeCountsBadge({ added, removed, changed }: ChangeCounts) {
  return (
    <span className="ml-1 flex gap-1.5 text-xs font-semibold tabular-nums">
      {added > 0 && <span className="text-green-700">+{added}</span>}
      {removed > 0 && <span className="text-red-700">−{removed}</span>}
      {changed > 0 && <span className="text-yellow-600">~{changed}</span>}
    </span>
  );
}
