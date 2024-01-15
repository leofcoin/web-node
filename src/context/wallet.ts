import { createContext } from '@lit/context'
import type { base58String } from '@vandeurenglenn/base58'

export declare type AccountName = string

export declare type Address = base58String

export declare type externalAddress = Address

export declare type internalAddress = Address

export declare type Account = [AccountName, externalAddress, internalAddress]

export declare type Accounts = Account[]

export declare type Wallet = {
  identity: {
    multiWIF?: base58String
    walletId: base58String
  }
  accounts: Accounts
  selectedAccount: Address
  selectedAccountIndex: number
}

export const walletContext = createContext<Wallet>('wallet')
