export type DiffPart = { text: string; change?: "added" | "removed" };

// Word-level diff of two texts (longest common subsequence over words and whitespace),
// with neighbouring changes grouped
export function diffWords(before: string, after: string): DiffPart[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);

  // lcs[i][j]: length of the common subsequence of a[i..] and b[j..], as one flat array
  const width = b.length + 1;
  const lcs = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i * width + j] = a[i] === b[j] ? lcs[(i + 1) * width + j + 1] + 1 : Math.max(lcs[(i + 1) * width + j], lcs[i * width + j + 1]);
    }
  }

  // one entry per word or whitespace
  const ops: DiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ text: a[i++] });
      j++;
    } else if (lcs[(i + 1) * width + j] >= lcs[i * width + j + 1]) {
      ops.push({ text: a[i++], change: "removed" });
    } else {
      ops.push({ text: b[j++], change: "added" });
    }
  }
  while (i < a.length) ops.push({ text: a[i++], change: "removed" });
  while (j < b.length) ops.push({ text: b[j++], change: "added" });

  // A run of changes becomes one removed part followed by one added part. Whitespace between two changes
  // belongs to the run, so "the action" -> "a command" reads as such instead of "the" -> "a", "action" -> "command".
  const parts: DiffPart[] = [];
  const push = (text: string, change?: DiffPart["change"]) => {
    const last = parts.at(-1);
    if (!text) return;
    if (last && last.change === change) last.text += text;
    else parts.push({ text, ...(change && { change }) });
  };
  for (let k = 0; k < ops.length; ) {
    if (!ops[k].change) {
      push(ops[k++].text);
      continue;
    }
    let removed = "";
    let added = "";
    for (; k < ops.length; k++) {
      const { text, change } = ops[k];
      if (change === "removed") removed += text;
      else if (change === "added") added += text;
      else if (/^\s+$/.test(text) && ops[k + 1]?.change) {
        removed += text;
        added += text;
      } else break;
    }
    push(removed, "removed");
    push(added, "added");
  }
  return parts;
}
