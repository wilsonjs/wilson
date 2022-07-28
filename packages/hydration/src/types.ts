/// <reference types="vite/client" />

import { ComponentType } from 'preact'

export type AsyncComponent = () => Promise<ComponentType>
export type Id = string
export type Props = Record<string, unknown>
export type Slots = Record<string, string>
