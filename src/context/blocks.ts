import {createContext} from '@lit-labs/context';
import type { Block } from './block.js';

declare type Blocks = Block[]

export type { Block, Blocks }

export const blocksContext = createContext<Blocks>('blocks');
