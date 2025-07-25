import type { Project } from "@lib/kube";

type Props = {
  project: Project;
  projects: Project[];
};

export function ProjectPicker(props: Props) {
  const onChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    window.location.href =
      e.target.value === "kubernetes" ? "/" : `/${e.target.value}`;
  };

  return (
    <div className="relative border text-sm py-1 pl-2 pr-1 rounded bg-card">
      <select
        value={props.project.slug}
        onChange={onChanged}
        className="ring-0 outline-none bg-card border-r-2 border-transparent pr-1 font-medium"
      >
        <option key="kubernetes" value="kubernetes">
          kubernetes
        </option>
        <optgroup label="CRDs">
          {props.projects
            .filter((x) => x.slug !== "kubernetes")
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.name}
              </option>
            ))}
        </optgroup>
      </select>
    </div>
  );
}
