import { STPTToken } from '../constants'
import { ChainId } from 'constants/chain'
import { TokenAmount } from 'constants/token'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useHomeListPaginationCallback } from 'state/pagination/hooks'
import { useActiveWeb3React } from '.'
import {
  getDaoAdmins,
  getDaoInfo,
  getHomeDaoList,
  getMyJoinedDao,
  getProof,
  getTokenList,
  switchJoinDao
} from '../utils/fetch/server'

export function useMyJoinedDao() {
  const { account } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<
    {
      chainId: ChainId
      daoName: string
      daoAddress: string
    }[]
  >([])

  useEffect(() => {
    ;(async () => {
      if (!account) {
        setResult([])
        return
      }
      setLoading(true)
      try {
        const res = await getMyJoinedDao(account)
        setLoading(false)
        const data = res.data.data
        if (!data) {
          setResult([])
          return
        }

        const list = data.map((item: any) => ({
          chainId: item.chainId,
          daoName: item.daoName,
          daoAddress: item.daoAddress
        }))
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useMyJoinedDao', error)
      }
    })()
  }, [account])

  return {
    loading: loading,
    result
  }
}

export interface HomeListProp {
  daoName: string
  daoLogo: string
  daoAddress: string
  chainId: ChainId
  proposals: number
  activeProposals: number
  soonProposals: number
  members: number
  joinSwitch: boolean
}

export function useHomeDaoList() {
  const {
    data: { keyword, category, currentPage },
    setKeyword,
    setCategory,
    setCurrentPage
  } = useHomeListPaginationCallback()

  const [firstLoadData, setFirstLoadData] = useState(true)
  const { account } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(false)
  const [total, setTotal] = useState<number>(0)
  const pageSize = 8
  const [result, setResult] = useState<HomeListProp[]>([])
  const [timeRefresh, setTimeRefresh] = useState(-1)
  const toTimeRefresh = () => setTimeout(() => setTimeRefresh(Math.random()), 15000)

  useEffect(() => {
    if (firstLoadData) {
      setFirstLoadData(false)
      return
    }
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await getHomeDaoList(
          {
            account: account || '',
            category,
            keyword
          },
          (currentPage - 1) * pageSize,
          pageSize
        )
        setLoading(false)
        const data = res.data.data as any
        if (!data) {
          setResult([])
          setTotal(0)
          return
        }
        setTotal(data.total)
        const list: HomeListProp[] = data.list.map((item: any) => ({
          daoName: item.daoName,
          daoLogo: item.daoLogo,
          daoAddress: item.daoAddress,
          chainId: item.chainId,
          proposals: item.totalProposals,
          activeProposals: item.activeProposals,
          soonProposals: item.soonProposals,
          members: item.members,
          joinSwitch: item.joinSwitch
        }))
        setResult(list)
      } catch (error) {
        setResult([])
        setTotal(0)
        setLoading(false)
        console.error('useHomeDao', error)
      }
    })()
  }, [account, category, currentPage, keyword])

  useEffect(() => {
    ;(async () => {
      if (timeRefresh === -1) {
        toTimeRefresh()
        return
      }
      try {
        const res = await getHomeDaoList(
          {
            account: account || '',
            category,
            keyword
          },
          (currentPage - 1) * pageSize,
          pageSize
        )
        const data = res.data.data as any
        if (!data) {
          return
        }
        setTotal(data.total)
        const list: HomeListProp[] = data.list.map((item: any) => ({
          daoName: item.daoName,
          daoLogo: item.daoLogo,
          daoAddress: item.daoAddress,
          chainId: item.chainId,
          proposals: item.totalProposals,
          activeProposals: item.activeProposals,
          soonProposals: item.soonProposals,
          members: item.members,
          joinSwitch: item.joinSwitch
        }))
        setResult(list)
        toTimeRefresh()
      } catch (error) {
        toTimeRefresh()
        console.error('useHomeDao', error)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRefresh])

  return {
    loading: loading,
    page: {
      setCurrentPage,
      currentPage,
      total,
      totalPage: Math.ceil(total / pageSize),
      pageSize
    },
    search: {
      keyword,
      setKeyword,
      category,
      setCategory
    },
    result
  }
}

export function useMemberJoinDao(defaultJoined: boolean, defaultMembers: number) {
  const [isJoined, setIsJoined] = useState(defaultJoined)
  const [curMembers, setCurMembers] = useState(defaultMembers)
  const [loading, setLoading] = useState(false)
  const { account } = useActiveWeb3React()

  useEffect(() => {
    setIsJoined(defaultJoined)
  }, [defaultJoined])

  useEffect(() => {
    setCurMembers(defaultMembers)
  }, [defaultMembers])

  const switchJoin = useCallback(
    async (join: boolean, chainId: ChainId, daoAddress: string, signature: string) => {
      if (!account || !signature) {
        return
      }
      setLoading(true)
      try {
        await switchJoinDao(account, chainId, daoAddress, join, signature)
        setIsJoined(join)
        setCurMembers(join ? curMembers + 1 : curMembers - 1)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    },
    [account, curMembers]
  )

  return {
    loading,
    isJoined,
    curMembers,
    switchJoin
  }
}

export function useBackedDaoInfo(daoAddress: string, chainId: ChainId) {
  const { account } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<{
    joinSwitch: boolean
    members: number
  }>()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await getDaoInfo(account || undefined, daoAddress, chainId)
        setLoading(false)
        const data = res.data.data

        setResult({
          joinSwitch: data.joinSwitch,
          members: data.members
        })
      } catch (error) {
        setResult(undefined)
        setLoading(false)
        console.error('useBackedDaoInfo', error)
      }
    })()
  }, [account, chainId, daoAddress])

  return {
    loading,
    result
  }
}

export function useBackedDaoAdmins(daoAddress: string, chainId: ChainId, appendAccounts?: string[]) {
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string[]>()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await getDaoAdmins(daoAddress, chainId)
        setLoading(false)
        const data = res.data.data

        setResult(data.map((item: any) => item.account))
      } catch (error) {
        setResult(undefined)
        setLoading(false)
        console.error('useBackedDaoAdmins', error)
      }
    })()
  }, [chainId, daoAddress])

  return useMemo(() => {
    if (!result) {
      return {
        loading,
        result
      }
    }
    const list = appendAccounts ? [...result, ...appendAccounts] : result
    return {
      loading,
      result: list
    }
  }, [appendAccounts, loading, result])
}

export function useTokenList(account: string, chainId: number | string) {
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [total, setTotal] = useState<number>(0)
  const pageSize = 10
  const [result, setResult] = useState<
    {
      chainId: ChainId
      tokenAddress: string
    }[]
  >([])

  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await getTokenList(chainId || '', account || '', (currentPage - 1) * pageSize, pageSize)
        setLoading(false)
        const data = res.data.data as any
        if (!data) {
          setResult([])
          setTotal(0)
          return
        }
        setTotal(data.total)
        const list: {
          chainId: ChainId
          tokenAddress: string
        }[] = data.list.map((item: any) => ({
          chainId: item.chainId,
          tokenAddress: item.tokenAddress
        }))
        setResult(list)
      } catch (error) {
        setResult([])
        setTotal(0)
        setLoading(false)
        console.error('useTokenList', error)
      }
    })()
  }, [account, chainId, currentPage])

  return useMemo(
    () => ({
      loading,
      page: {
        setCurrentPage,
        currentPage,
        total,
        totalPage: Math.ceil(total / pageSize),
        pageSize
      },
      result
    }),
    [currentPage, loading, total, result]
  )
}

export function useGetProof() {
  const { account } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<{
    index: number
    amount: TokenAmount
    proof: any
  }>()

  useEffect(() => {
    ;(async () => {
      if (!account) {
        setResult(undefined)
        return
      }
      setResult(undefined)
      setLoading(true)
      try {
        const res = await getProof(account)
        setLoading(false)
        const data = res.data.data
        if (!data) {
          setResult(undefined)
          return
        }

        setResult({
          index: data.index,
          amount: new TokenAmount(STPTToken, data.amount),
          proof: data.proof
        })
      } catch (error) {
        setResult(undefined)
        setLoading(false)
        console.error('useGetProof', error)
      }
    })()
  }, [account])

  return {
    loading: loading,
    result
  }
}
