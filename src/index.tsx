import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import 'inter-ui'
import { StrictMode } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material'
import ReactDOM from 'react-dom'
import theme from 'theme/index'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import Blocklist from './components/essential/Blocklist'
import { NetworkContextName } from './constants'
import App from './pages/App'
import store from './state'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import ApplicationUpdater from './state/application/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import getLibrary from './utils/getLibrary'
import { createBrowserHistory } from 'history'
const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

const browserHistory = createBrowserHistory()

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Blocklist>
          <Provider store={store}>
            <Updaters />
            <StyledEngineProvider injectFirst>
              <MuiThemeProvider theme={theme}>
                <CssBaseline />
                <Router history={browserHistory}>
                  <App />
                </Router>
              </MuiThemeProvider>
            </StyledEngineProvider>
          </Provider>
        </Blocklist>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById('root')
)

serviceWorkerRegistration.unregister()
