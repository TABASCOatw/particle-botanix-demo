import React, { useState, useEffect } from 'react';
import { useETHProvider, useBTCProvider, useConnectModal } from '@particle-network/btc-connectkit';
import { chains } from '@particle-network/chains';
import { ethers } from 'ethers';
import { notification } from 'antd';
import './App.css';

// Frontend component only -- ignore
import NetworkIndicator from './networkIndicator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { copyToClipboard, truncateAddress } from './utils';
// --

const App = () => {
  const { provider, account, chainId } = useETHProvider();
  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts, sendBitcoin, getNetwork } = useBTCProvider();

  const [balanceEVM, setBalanceEVM] = useState(null);
  const [balanceBTC, setBalanceBTC] = useState(null);

  const customProvider = new ethers.providers.Web3Provider(provider, "any");

  useEffect(() => {
    if (accounts.length > 0) {
      (async () => {
        const balanceResponse = await customProvider.getBalance(account);
        setBalanceEVM(ethers.utils.formatEther(balanceResponse));

        const networkSuffix = (await getNetwork() === 'livenet') ? 'main' : 'test3';
        fetch(`https://api.blockcypher.com/v1/btc/${networkSuffix}/addrs/${accounts[0]}/balance`)
          .then(response => response.json())
          .then(data => setBalanceBTC(data.balance / 1e8));
      })();
    }
  }, [accounts, account]);

  const handleLogin = () => {
    openConnectModal();
  };

  const executeTxEvm = async () => {
    const signer = customProvider.getSigner();

    const tx = {
      to: "0x000000000000000000000000000000000000dEaD",
      value: ethers.utils.parseEther('0.01'),
      data: "0x"
    };

    const txResponse = await signer.sendTransaction(tx);
    const txReceipt = await txResponse.wait();

    notification.success({
      message: "Transaction Successful",
      description: (
        <div>
          Transaction Hash: <a href={`${chains.getEVMChainInfoById(chainId).blockExplorerUrl}tx/${txReceipt.transactionHash}`} target="_blank" rel="noopener noreferrer">{txReceipt.transactionHash}</a>
        </div>
      )
    });
  };

  const executeTxBtc = async () => {
    const hash = await sendBitcoin(accounts[0], 1);

    notification.success({
      message: 'Transaction Successful',
      description: (
        <div>
          Transaction Hash: <a href={`https://live.blockcypher.com/btc-testnet/tx/${hash}`} target="_blank" rel="noopener noreferrer">{hash}</a>
        </div>
      )
    });
  };


  return (
    <div className="App">
      <div className="logo-section">
        <img src="https://i.imgur.com/EerK7MS.png" alt="Logo 1" className="logo logo-big" />

        <img src="https://i.imgur.com/GnoBZ0G.png" alt="Logo 2" className="logo logo-big-b2" />
      </div>
      {!account ? (
      <button className="sign-button" onClick={handleLogin}>
        <img src="https://i.imgur.com/aTxNcXk.png" alt="Bitcoin Logo" className="bitcoin-logo" />
        Connect
      </button>
      ) : (
        <div className="profile-card">
          <NetworkIndicator />
          <div className="address-balance-container">
            <span className="balance">{balanceEVM} BTC</span>
            <div className="address-copy-container">
              <span className="address">{truncateAddress(account)}</span>
              <FontAwesomeIcon icon={faCopy} className="copy-icon" onClick={() => copyToClipboard(account)} />
            </div>
          </div>
          <div className="address-balance-container">
            <span className="balance">{balanceBTC} BTC</span>
            <div className="address-copy-container">
              <span className="address">{truncateAddress(accounts[0])}</span>
              <FontAwesomeIcon icon={faCopy} className="copy-icon" onClick={() => copyToClipboard(accounts[0])} />
            </div>
          </div>
          <button className="sign-message-button" onClick={executeTxEvm}>Execute EVM Transaction</button>
          <button className="sign-message-button button-btc" onClick={executeTxBtc}>Execute BTC Transaction</button>
          <button className="disconnect-button" onClick={() => {disconnect();}}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default App;
