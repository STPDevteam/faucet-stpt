import { Alert, Box, Container, Stack, Typography } from '@mui/material'
import logo from '../../assets/svg/logo.svg'
import Image from 'components/Image'
import Input from 'components/Input'
import { useActiveWeb3React } from 'hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import Button from 'components/Button/Button'
import { useGetProof } from 'hooks/useBackedDaoServer'
import { useIsClaimed } from 'hooks/useSTPTAirdrop'
import { useCallback, useMemo } from 'react'
import Loading from 'components/Loading'
import JSBI from 'jsbi'
import Collapse from 'components/Collapse'
import useModal from 'hooks/useModal'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import TransactionSubmittedModal from 'components/Modal/TransactionModals/TransactiontionSubmittedModal'
import { useClaimAirdropCallback } from 'hooks/useSTPTAirdropCallback'
import { useUserHasSubmittedClaim } from 'state/transactions/hooks'
import ActionButton from 'components/Button/ActionButton'

export default function Faucet() {
  const { account } = useActiveWeb3React()
  const walletModalToggle = useWalletModalToggle()
  const { result: accountProof } = useGetProof()
  const isClaimed = useIsClaimed(account || undefined)
  const { showModal, hideModal } = useModal()
  const claimAirdropCallback = useClaimAirdropCallback()
  const { claimSubmitted: isClaiming } = useUserHasSubmittedClaim(`${account}_claim_airdrop`)

  const isWhitelist = useMemo(() => {
    if (!accountProof) return undefined
    if (!accountProof.amount.greaterThan(JSBI.BigInt(0))) return false
    return true
  }, [accountProof])

  const onClaim = useCallback(() => {
    if (!isWhitelist || isClaimed || !accountProof || !account) return
    showModal(<TransacitonPendingModal />)
    claimAirdropCallback(accountProof.index, account, accountProof.amount.raw.toString(), accountProof.proof)
      .then(hash => {
        hideModal()
        showModal(<TransactionSubmittedModal hash={hash} />)
      })
      .catch((err: any) => {
        hideModal()
        showModal(
          <MessageBox type="error">
            {err?.data?.message || err?.error?.message || err?.message || 'unknown error'}
          </MessageBox>
        )
        console.error(err)
      })
  }, [isWhitelist, isClaimed, accountProof, account, showModal, claimAirdropCallback, hideModal])

  return (
    <Container maxWidth={'lg'}>
      <Box display={'flex'} justifyContent="center" mt={80}>
        <Stack spacing={24} width={460}>
          <Image src={logo} style={{ height: 30 }} />
          <Typography variant="h5" textAlign={'center'}>
            {accountProof?.amount.toSignificant(6)} STPT AIRDROP!
          </Typography>
          {account ? (
            <>
              <Input value={account} readOnly />
              {isWhitelist === undefined ? (
                <Loading />
              ) : isWhitelist ? (
                <Box display={'flex'} justifyContent="center">
                  <ActionButton
                    width="155px"
                    pending={isClaiming}
                    success={isClaimed}
                    disableAction={isClaimed || isClaiming ? true : false}
                    onAction={onClaim}
                    actionText="Claim"
                    pendingText={'Claiming'}
                    successText="Claimed"
                  ></ActionButton>
                </Box>
              ) : (
                <Alert color="error">Sorry, this address is not eligible for claim</Alert>
              )}
            </>
          ) : (
            <Box display={'flex'} justifyContent="center">
              <Button width="155px" onClick={walletModalToggle}>
                Connect
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
      <Box maxWidth={'100%'} pt={50} width="808px" margin={'auto'}>
        <Typography fontWeight={600} fontSize={20} style={{ textAlign: 'left' }}>
          FAQ
        </Typography>
        <Box mt={5}>
          <Collapse title={`What does 'Add a DAO' mean?`}>
            It means you are setting up the governance framework for your project here on Clique using a token that
            already exists.
          </Collapse>
          <Collapse title={`What does 'Create a token' mean?`}>
            It means you are creating a new governance token for your DAO right here on Clique. You will be able to
            reserve and distribute the token for your DAO members and community, which will facilitate governance of
            your DAO.
          </Collapse>
          <Collapse title={'What token can be used as governance token?'}>
            Currently we allow any publicly listed token on Ethereum to be used as governance token. We will continue to
            explore more token on most mainstream EVM compatible chains.
          </Collapse>
        </Box>
      </Box>
    </Container>
  )
}
