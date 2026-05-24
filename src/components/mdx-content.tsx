'use client'

import { useMemo } from 'react'
import * as runtime from 'react/jsx-runtime'

interface MDXContentProps {
  code: string
}

function getMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => getMDXComponent(code), [code])
  return <Component />
}
