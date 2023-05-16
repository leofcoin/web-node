import {createContext} from '@lit-labs/context';
import {TransactionMessage} from '@leofcoin/messages'
declare type transactionHash = base58String

declare type Block = {
  index: number
  hahs: transactionHash
  previousHash: transactionHash
  transactions: typeof TransactionMessage[]
}

declare type Blocks = Block[]

export type { Block, Blocks }

export const blocksContext = createContext<Blocks>('blocks');
