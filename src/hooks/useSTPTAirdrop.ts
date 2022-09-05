import { useSTPTAirdropContract } from './useContract'
import { useSingleCallResult } from 'state/multicall/hooks'

export function useIsClaimed(account: string | undefined): boolean | undefined {
  const contract = useSTPTAirdropContract()
  return useSingleCallResult(account ? contract : null, 'isClaimed', [account || '']).result?.[0]
}
