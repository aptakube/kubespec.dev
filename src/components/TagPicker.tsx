type Props = {
  tag: string;
  latestTag: string;
  allTags: string[];
};

export function TagPicker(props: Props) {
  const onVersionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = window.location.pathname.replace(`/${props.tag}`, ``);

    if (props.latestTag === e.target.value) {
      window.location.href = path || "/";
    } else if (path === `/` || path === ``) {
      window.location.href = `/${e.target.value}`;
    } else {
      window.location.href = `/${e.target.value}${path}`;
    }
  };

  return (
    <div className="relative border text-sm py-1 pl-2 pr-1 rounded">
      <select
        value={props.tag}
        onChange={onVersionChanged}
        className="ring-0 bg-background outline-none border-r-2 border-transparent pr-1 font-medium"
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
