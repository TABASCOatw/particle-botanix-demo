import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  ConnectProvider,
  OKXConnector,
  UnisatConnector,
  TokenPocketConnector,
  BybitConnector,
  BitgetConnector
} from '@particle-network/btc-connectkit';
import { BotanixTestnet } from '@particle-network/chains';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConnectProvider
      options={{
        projectId: process.env.REACT_APP_PROJECT_ID,
        clientKey: process.env.REACT_APP_CLIENT_KEY,
        appId: process.env.REACT_APP_APP_ID,
        aaOptions: {
          accountContracts: {
            BTC: [
              {
                chainIds: [BotanixTestnet.id],
                version: '2.0.0',
              }
            ]
          }
        },
        walletOptions: {
          visible: true
        }
      }}
      connectors={[new UnisatConnector(), new OKXConnector(), new TokenPocketConnector(), new BybitConnector(), new BitgetConnector()]}
    >
      <App />
    </ConnectProvider>
  </React.StrictMode>
)