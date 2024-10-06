import { useState } from 'react'
import { PropertyTree } from './PropertyTree'
import { PropertyType } from './PropertyType'
import type { ResourceDefinition } from '@lib/kube'
import { twMerge } from 'tailwind-merge'

type Props = {
  name: string
  type: string
  description: string
  definition?: ResourceDefinition
  level: number
}

export function PropertyRow(props: Props) {
  const [showDescription, setShowDescription] = useState(false)
  const toggleShowDescription = () => setShowDescription((x) => !x)

  // Top level objects should start expanded, expect for metadata
  const [showChildren, setShowChildren] = useState(
    props.level === 0 && props.type !== 'ObjectMeta'
  )
  const toggleShowChildren = () => setShowChildren((x) => !x)

  const hasDescription = !!props.description
  const hasChildren = Object.keys(props.definition?.properties || {}).length > 0

  return (
    <li key={props.name} className="text-sm font-semibold">
      <button
        onClick={toggleShowDescription}
        className={twMerge(
          'inline-block cursor-default rounded-lg px-1',
          hasDescription ? 'cursor-pointer hover:bg-accent' : ''
        )}
      >
        {props.name}
      </button>

      <button
        onClick={toggleShowChildren}
        className={twMerge(
          'inline-block cursor-default rounded-lg px-1',
          hasChildren ? 'cursor-pointer hover:bg-accent' : ''
        )}
      >
        <PropertyType type={props.type} hasChildren={hasChildren} />
      </button>

      {showDescription && hasDescription && (
        <pre className="ml-1 mb-2 max-w-4xl whitespace-pre-line text-xs font-normal">
          {props.description}
        </pre>
      )}

      {showChildren && hasChildren && props.definition && (
        <PropertyTree definition={props.definition} level={props.level + 1} />
      )}
    </li>
  )
}
