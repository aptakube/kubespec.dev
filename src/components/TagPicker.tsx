type Props = {
  project: string;
  gvkRef?: string;

  tag: string;
  latestTag: string;
  allTags: string[];
};

export function TagPicker(props: Props) {
  const onChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const pathSegments = [props.project];

    if (selectedValue !== props.latestTag) {
      pathSegments.push(selectedValue);
    }

    if (props.gvkRef) {
      pathSegments.push(props.gvkRef);
    }

    const path = `/${pathSegments.join("/")}`;
    window.location.href = path;
  };

  return (
    <div className="relative border text-sm py-1 pl-2 pr-1 rounded bg-card">
      <select
        value={props.tag}
        onChange={onChanged}
        className="ring-0 outline-none border-r-2 bg-card border-transparent pr-1 font-medium"
      >
        {props.allTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  );
}
