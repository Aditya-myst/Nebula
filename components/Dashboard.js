import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function Dashboard({ contracts, account, updateData }) {
  const [userInfo, setUserInfo] = useState({
    shares: '0',
    pending: '0',
    lastClaim: 'Never'
  });
  const [contractStats, setContractStats] = useState({
    totalShares: '0',
    totalDistributed: '0',
    customerCount: '0',
    availableFunds: '0'
  });
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [distributionAmount, setDistributionAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [contracts, account]);

  const loadData = async () => {
    if (!contracts || !account) return;

    try {
      const info = await contracts.mutualFund.getCustomerInfo(account);
      const stats = await contracts.mutualFund.getContractStats();
      const bal = await contracts.fundToken.balanceOf(await contracts.mutualFund.getAddress());

      setUserInfo({
        shares: ethers.formatEther(info[0]),
        pending: ethers.formatEther(info[1]),
        lastClaim: info[2] === 0n ? 'Initial' : new Date(Number(info[2]) * 1000).toLocaleString()
      });

      setContractStats({
        totalShares: ethers.formatEther(stats[0]),
        totalDistributed: ethers.formatEther(stats[1]),
        customerCount: stats[2].toString(),
        availableFunds: ethers.formatEther(bal - stats[0])
      });
    } catch (error) {
      console.warn("Retrying sync...");
    }
  };

  const handlePurchase = async () => {
    if (!purchaseAmount || loading) return;
    setLoading(true);
    try {
      const amount = ethers.parseEther(purchaseAmount);
      
      const allowance = await contracts.fundToken.allowance(account, await contracts.mutualFund.getAddress());
      if (allowance < amount) {
        const approveTx = await contracts.fundToken.approve(await contracts.mutualFund.getAddress(), amount);
        await approveTx.wait();
      }

      const tx = await contracts.mutualFund.purchaseShares(amount);
      await tx.wait();
      toast.success('Nebula Shares Acquired');
      setPurchaseAmount('');
      updateData();
      loadData();
    } catch (error) {
      toast.error(error.reason || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || loading) return;
    setLoading(true);
    try {
      const amount = ethers.parseEther(depositAmount);
      const tx = await contracts.fundToken.transfer(await contracts.mutualFund.getAddress(), amount);
      await tx.wait();
      toast.success('Funds Injected to Vault');
      setDepositAmount('');
      loadData();
    } catch (error) {
      toast.error('Injection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!distributionAmount || loading) return;
    setLoading(true);
    try {
      const amount = ethers.parseEther(distributionAmount);
      const tx = await contracts.mutualFund.distributeFunds(amount);
      await tx.wait();
      toast.success('Protocol Yield Distributed');
      setDistributionAmount('');
      loadData();
    } catch (error) {
      toast.error(error.reason || 'Distribution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const tx = await contracts.mutualFund.claimRewards();
      await tx.wait();
      toast.success('Yield Harvested Successfully');
      updateData();
      loadData();
    } catch (error) {
      toast.error('Harvesting failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Global Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total TVL', val: contractStats.totalShares, unit: 'MFT', color: 'text-white' },
          { label: 'Yield Distributed', val: contractStats.totalDistributed, unit: 'MFT', color: 'text-cyan-400' },
          { label: 'Active Node Users', val: contractStats.customerCount, unit: 'Nodes', color: 'text-purple-400' },
          { label: 'Vault Surplus', val: contractStats.availableFunds, unit: 'MFT', color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl min-h-[120px] flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 truncate">{stat.label}</p>
            <p className={`text-xl sm:text-2xl font-black ${stat.color} font-heading break-all`}>
              {i === 2 ? stat.val : parseFloat(stat.val).toLocaleString()} <span className="text-[10px] opacity-50 font-normal">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Portfolio Card */}
        <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="text-9xl">💎</span>
          </div>
          
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 font-heading">
            <span className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center text-sm">👤</span>
            YOUR PORTFOLIO
          </h3>

          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-end p-6 bg-white/5 rounded-3xl border border-white/5">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">STAKED SHARES</p>
                <p className="text-4xl font-black text-white font-heading">{parseFloat(userInfo.shares).toLocaleString()} <span className="text-sm font-normal text-purple-400">MFT</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">PENDING YIELD</p>
                <p className="text-2xl font-black text-green-400 font-heading">+{parseFloat(userInfo.pending).toLocaleString()} <span className="text-xs">MFT</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 mb-1">LAST HARVEST</p>
                <p className="text-xs text-white font-medium">{userInfo.lastClaim}</p>
              </div>
              <button
                onClick={handleClaim}
                disabled={loading || userInfo.pending === '0.0'}
                className="accent-gradient rounded-2xl font-black text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale tracking-widest text-xs uppercase"
              >
                HARVEST YIELD
              </button>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="glass-card p-8 rounded-[2rem]">
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 font-heading">
            <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">⚛️</span>
            ACQUIRE SHARES
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">AMOUNT TO STAKE</label>
              <div className="relative">
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-2xl font-black text-white placeholder-white/10 focus:border-cyan-500/50 outline-none transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-cyan-400">MFT</span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !purchaseAmount}
              className="w-full py-5 rounded-2xl bg-white text-black font-black hover:bg-cyan-400 transition-all shadow-xl active:scale-95 tracking-widest text-sm uppercase flex items-center justify-center gap-3"
            >
              INVEST IN PROTOCOL {loading && <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>}
            </button>
            
            <p className="text-[10px] text-gray-500 text-center font-bold tracking-widest">
              STAKING INCURS 0% PROTOCOL FEES
            </p>
          </div>
        </div>
      </div>

      {/* Admin Operations */}
      <div className="glass-card p-8 rounded-[2rem] border-purple-500/20 bg-purple-500/5 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3 font-heading">
            <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-base">⚡</span>
            PROTOCOL GOVERNANCE
          </h3>
          <span className="text-[10px] font-black bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full uppercase tracking-tighter border border-purple-500/20">Authorized Terminal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-purple-500/30 transition-all">
            <h4 className="text-sm font-black text-purple-400 mb-4 tracking-widest uppercase flex items-center gap-2">
              <span>01.</span> VAULT INJECTION
            </h4>
            <div className="flex gap-3">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Deposit amount..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-all font-bold"
              />
              <button
                onClick={handleDeposit}
                disabled={loading}
                className="bg-purple-600 px-6 rounded-xl hover:bg-purple-500 font-black text-xs text-white uppercase tracking-widest transition-all glow-hover"
              >
                Infect
              </button>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-all">
            <h4 className="text-sm font-black text-cyan-400 mb-4 tracking-widest uppercase flex items-center gap-2">
              <span>02.</span> YIELD DISTRIBUTION
            </h4>
            <div className="flex gap-3">
              <input
                type="number"
                value={distributionAmount}
                onChange={(e) => setDistributionAmount(e.target.value)}
                placeholder="Distribute amount..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-all font-bold"
              />
              <button
                onClick={handleDistribute}
                disabled={loading}
                className="bg-cyan-600 px-6 rounded-xl hover:bg-cyan-500 font-black text-xs text-white uppercase tracking-widest transition-all glow-hover"
              >
                Sync
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}