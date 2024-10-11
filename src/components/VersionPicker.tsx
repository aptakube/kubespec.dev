import { LATEST_VERSION, VERSIONS } from "@lib/swagger";

type Props = {
  version: string;
};

export function VersionPicker(props: Props) {
  const onVersionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = window.location.pathname.replace(`/v${props.version}`, ``);

    if (LATEST_VERSION === e.target.value) {
      window.location.href = path || "/";
    } else if (path === `/` || path === ``) {
      window.location.href = `/v${e.target.value}`;
    } else {
      window.location.href = `/v${e.target.value}${path}`;
    }
  };

  return (
    <div className="relative border text-sm py-1 pl-2 pr-1 rounded">
      <select
        value={props.version}
        onChange={onVersionChanged}
        className="ring-0 bg-background outline-none border-r-2 border-transparent pr-1 font-medium"
      >
        {VERSIONS.map((version) => (
          <option key={version} value={version}>
            v{version}
          </option>
        ))}
      </select>
    </div>
  );
}
