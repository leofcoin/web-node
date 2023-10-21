import {createContext} from '@lit-labs/context';
import {BlockMessage} from '@leofcoin/messages'


declare type Block = BlockMessage['decoded']


export type { Block }

export const blockContext = createContext<Block>('block');
