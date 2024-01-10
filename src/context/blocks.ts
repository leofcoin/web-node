import { createContext } from '@lit/context'
import type { Block } from './block.js'

declare type Blocks = Block[]

export type { Block, Blocks }

export const blocksContext = createContext<Blocks>('blocks')
