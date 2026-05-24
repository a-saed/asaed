'use client'

import { useMemo } from 'react'
import * as runtime from 'react/jsx-runtime'

interface MDXContentProps {
  code: string
}

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => useMDXComponent(code), [code])
  return <Component />
}
