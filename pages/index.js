import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import Dashboard from '../components/Dashboard';

// Import ABIs and deployment info
import FundTokenJSON from '../artifacts/contracts/FundToken.sol/FundToken.json';
import MutualFundJSON from '../artifacts/contracts/MutualFundDistribution.sol/MutualFundDistribution.json';
import deploymentInfo from '../deployment-info.json';

const FundTokenABI = FundTokenJSON.abi;
const MutualFundABI = MutualFundJSON.abi;

export default function Home() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          connectWallet();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      console.log("Connect attempt on Chain ID:", network.chainId.toString());

      if (network.chainId !== 31337n) {
        toast.error(`Wrong Network! MetaMask is on Chain ${network.chainId}. Please switch to Localhost (31337) and Reset Account.`);
        return;
      }

      const signer = await provider.getSigner();
      
      if (!deploymentInfo.fundToken || !deploymentInfo.mutualFund) {
        toast.error('Contracts not deployed! Please follow the deployment guide.');
        return;
      }

      const fundToken = new ethers.Contract(
        deploymentInfo.fundToken,
        FundTokenABI,
        signer
      );

      const mutualFund = new ethers.Contract(
        deploymentInfo.mutualFund,
        MutualFundABI,
        signer
      );

      setAccount(accounts[0]);
      setProvider(provider);
      setContracts({ fundToken, mutualFund });

      const owner = await mutualFund.owner();
      setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());

      const bal = await fundToken.balanceOf(accounts[0]);
      setBalance(ethers.formatEther(bal));

      toast.success('Nebula Secure Connection Established');
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect Nebula Wallet');
    }
  };

  const updateData = async () => {
    if (contracts && account) {
      try {
        const bal = await contracts.fundToken.balanceOf(account);
        setBalance(ethers.formatEther(bal));
      } catch (error) {
        console.warn('Sync delayed...');
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="nebula-glow top-0 -left-64"></div>
      <div className="nebula-glow bottom-0 -right-64" style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)' }}></div>
      
      <Toaster position="bottom-center" />
      
      <header className="glass-nav fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 accent-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-black text-2xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight font-heading">NEBULA <span className="text-purple-400">FINANCE</span></h1>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Protocol 1.0 SECURE</p>
                </div>
              </div>
            </div>

            {!account ? (
              <button
                onClick={connectWallet}
                className="accent-gradient text-white font-bold py-3 px-8 rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl shadow-purple-500/20 active:scale-95"
              >
                CONNECT NEBULA
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Vault Balance</p>
                  <p className="text-xl font-black text-white">{parseFloat(balance).toLocaleString()} <span className="text-purple-400">MFT</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold">ADDRESS</p>
                  <p className="text-sm font-mono text-cyan-400">{account.slice(0, 6)}...{account.slice(-4)}</p>
                </div>
                {isOwner && (
                  <div className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-2xl flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Core Admin</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {account && contracts ? (
          <Dashboard contracts={contracts} account={account} updateData={updateData} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-float">
            <div className="w-24 h-24 accent-gradient rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/30">
              <span className="text-5xl">🌌</span>
            </div>
            <h2 className="text-6xl font-black text-white mb-6 font-heading text-gradient leading-tight">
              Invest in the <br/> Decentralized Future.
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
              Experience the next generation of mutual fund distribution on Nebula. 
              Secure, transparent, and completely automated.
            </p>
            <button
              onClick={connectWallet}
              className="accent-gradient text-white font-black py-5 px-12 rounded-3xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/25 active:scale-95 text-lg"
            >
              LAUNCH INTERFACE
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2024 <span className="text-white font-bold">NEBULA Protocol</span>. Built for the Infinite Frontier.
          </p>
          <div className="flex gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Governance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}