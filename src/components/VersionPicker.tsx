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
    <select
      value={props.version}
      className="border text-sm p-1 rounded bg-background"
      onChange={onVersionChanged}
    >
      {VERSIONS.map((version) => (
        <option key={version} value={version}>
          v{version}
        </option>
      ))}
    </select>
  );
}
