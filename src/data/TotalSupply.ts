import { BigNumber } from '@ethersproject/bignumber'
import { useTokenContract } from '../hooks/useContract'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { TokenAmount } from '../constants/token/fractions'
import { Token } from '../constants/token'

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(token?: Token): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const totalSupply: BigNumber = useSingleCallResult(contract, 'totalSupply', [], NEVER_RELOAD, token?.chainId)
    ?.result?.[0]

  return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined
}
