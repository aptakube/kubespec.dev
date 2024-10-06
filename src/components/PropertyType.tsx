type Props = {
  type: string
  hasChildren: boolean
}

export function PropertyType(props: Props) {
  const color = props.hasChildren
    ? 'text-pink-600'
    : props.type === 'string'
    ? 'text-orange-600'
    : props.type === 'boolean'
    ? 'text-blue-600'
    : props.type === 'integer'
    ? 'text-sky-600'
    : props.type === 'Time' || props.type === 'object'
    ? 'text-violet-600'
    : 'text-emerald-600'
  return <span className={`text-xs ${color}`}>{props.type}</span>
}
