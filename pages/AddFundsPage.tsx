import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, ArrowDownLeft, ChevronLeft, Copy, QrCode, Shield, Clock, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import GlassCard from '../components/UI/GlassCard';
import FrostedCard from '../components/UI/FrostedCard';
import { useTheme } from '../context/ThemeContext';
import GlowButton from '../components/UI/GlowButton';
import PageHeader from '../components/UI/PageHeader';
import { usePrivy } from '@privy-io/react-auth';
import { useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import { BanknotesIcon, ArrowDownTrayIcon, ArrowLeftIcon } from '../components/icons';
import { useToast } from '../components/UI/ToastContainer';
import { heliusService } from '../services/api';
import QRCode from 'qrcode';
import { setAuthToken } from '../services/api';

const AddFundsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { user: privyUser, getAccessToken } = usePrivy();
  const { fundWallet } = useFundWallet();
  const { wallets, ready: walletsReady } = useWallets();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [selectedOption, setSelectedOption] = useState<'bank' | 'wallet' | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoadingOnramp, setIsLoadingOnramp] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Get wallet address from multiple sources (fallback chain)
  const walletAddress = wallets?.[0]?.address || privyUser?.wallet?.address || user?.wallet_address;
  
  // Button should be enabled - Privy's fundWallet can work even without a wallet address initially
  // It will create/initialize the wallet during the funding flow
  const canFundWallet = !isLoadingOnramp;
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 AddFundsPage wallet status:', {
      hasWallets: Boolean(wallets && wallets.length > 0),
      walletsReady,
      walletFromWallets: wallets?.[0]?.address,
      walletFromPrivy: privyUser?.wallet?.address,
      walletFromUser: user?.wallet_address,
      finalWalletAddress: walletAddress,
      canFundWallet,
    });
  }, [wallets, walletsReady, privyUser?.wallet?.address, user?.wallet_address, walletAddress, canFundWallet]);

  // Fetch current balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.wallet_address) return;
      setIsLoadingBalance(true);
      try {
        const balances = await heliusService.getTokenBalances(user.wallet_address);
        const solBalance = balances.find(b => b.symbol === 'SOL');
        setCurrentBalance(solBalance?.balance || 0);
      } catch (err) {
        console.error('Error fetching balance:', err);
      } finally {
        setIsLoadingBalance(false);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [user?.wallet_address]);

  const handleCopy = async () => {
    if (user?.wallet_address) {
      try {
        await navigator.clipboard.writeText(user.wallet_address);
        showToast({
          type: 'success',
          message: 'Wallet address copied to clipboard!',
        });
      } catch (err) {
        showToast({
          type: 'error',
          message: 'Failed to copy address',
        });
      }
    }
  };

  // Generate QR code for wallet address when wallet option is selected
  useEffect(() => {
    const generateQRCode = async () => {
      if (selectedOption === 'wallet' && user?.wallet_address) {
        try {
          const qrCode = await QRCode.toDataURL(user.wallet_address, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setQrCodeDataUrl(qrCode);
        } catch (error) {
          console.error('Failed to generate QR code:', error);
          setQrCodeDataUrl(null);
        }
      } else {
        setQrCodeDataUrl(null);
      }
    };

    generateQRCode();
  }, [selectedOption, user?.wallet_address]);

  // OptionCard component
  interface OptionCardProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    desc: string;
    onClick: () => void;
    disabled?: boolean;
    recommended?: boolean;
    features?: string[];
    processingTime?: string;
  }

  // Get theme-aware colors
  const getColors = () => {
    if (theme === 'christmas') {
      return {
        primary: '#EB6A46',
        secondary: '#EF4444',
        glow: 'rgba(235, 106, 70, 0.3)',
      };
    }
    if (theme === 'newyear') {
      return {
        primary: '#FCD34D',
        secondary: '#F59E0B',
        glow: 'rgba(252, 211, 77, 0.3)',
      };
    }
    return {
      primary: '#06B6D4',
      secondary: '#0891B2',
      glow: 'rgba(6, 182, 212, 0.3)',
    };
  };

  const colors = getColors();

  const OptionCard: React.FC<OptionCardProps> = ({ 
    icon: Icon, 
    title, 
    desc, 
    onClick, 
    disabled = false,
    recommended = false,
    features = [],
    processingTime,
  }) => (
    <FrostedCard
      variant="holiday"
      hover={!disabled}
      className={`relative text-left h-full w-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onClick}
    >
      {/* Ribbon accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: theme === 'christmas'
            ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
            : theme === 'newyear'
            ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
            : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
        }}
      />

      {recommended && (
        <motion.div
          className="absolute top-4 right-4 px-3 py-1 text-white text-xs font-bold rounded-full z-10"
          style={{
            backgroundColor: colors.primary,
            boxShadow: `0 0 15px ${colors.glow}`,
          }}
          animate={!shouldReduceMotion ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Recommended
        </motion.div>
      )}
      
      <div className="relative z-10">
        <motion.div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 transition-transform border border-white/10 ${
            disabled ? '' : 'group-hover:scale-110'
          }`}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
          }}
          whileHover={!disabled && !shouldReduceMotion ? {
            scale: 1.1,
            boxShadow: `0 0 20px ${colors.glow}`,
          } : {}}
        >
          <Icon size={32} style={{ color: colors.primary }} />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-[#94A3B8] text-sm mb-4">{desc}</p>
        
        {processingTime && (
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
            <Clock size={14} />
            <span>{processingTime}</span>
          </div>
        )}
        
        {features.length > 0 && (
          <div className="space-y-2 mt-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 text-xs text-[#94A3B8]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CheckCircle size={14} className="text-[#10B981] flex-shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div
          className="mt-4 flex items-center gap-2 text-sm font-medium"
          style={{ color: colors.primary }}
          whileHover={!disabled && !shouldReduceMotion ? {
            x: 4,
          } : {}}
        >
          <span>Get started</span>
          <ArrowRight size={16} />
        </motion.div>
      </div>
    </FrostedCard>
  );

  const handleOnRamp = async () => {
    setIsLoadingOnramp(true);

    try {
      console.log('🚀 Opening Privy funding flow for user:', privyUser?.id);

      // Get current balance before funding (if wallet exists)
      const getCurrentBalance = async () => {
        try {
          const address = walletAddress || wallets?.[0]?.address || privyUser?.wallet?.address;
          if (!address) return 0;
          
          const response = await fetch(`/api/wallet/balances/${address}`);
          if (response.ok) {
            const balances = await response.json();
            const solBalance = balances.find((b: any) => b.symbol === 'SOL');
            return solBalance?.balance || 0;
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
        return 0;
      };

      const previousBalance = await getCurrentBalance();
      console.log(`   Previous balance: ${previousBalance} SOL`);

      // Use Privy's fundWallet - it can work even without a wallet address initially
      // It will create/initialize the wallet during the funding flow
      const addressToUse = walletAddress || wallets?.[0]?.address;
      await fundWallet(
        addressToUse ? { address: addressToUse } : {}
      );

      console.log('✅ Funding flow completed');

      // Wait a moment for transaction to settle, then check for balance increase
      setTimeout(async () => {
        try {
          // Refresh user data to get updated wallet address if it was created
          await refreshUser();
          
          const currentAddress = walletAddress || wallets?.[0]?.address || privyUser?.wallet?.address || user?.wallet_address;
          if (!currentAddress) {
            console.log('No wallet address available yet, skipping transaction detection');
            return;
          }

          const currentBalance = await getCurrentBalance();
          console.log(`   Current balance: ${currentBalance} SOL`);

          // Call backend to detect transaction and issue credit
          const token = await getAccessToken() || '';
          setAuthToken(token);
          const response = await fetch('/api/onramp/detect-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              walletAddress: currentAddress,
              previousBalance,
              currentBalance,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.transactionDetected && result.creditIssued) {
              console.log('✨ Credit issued!', result);
              showToast({
                type: 'success',
                message: 'Funds added successfully!',
              });
            }
          }
        } catch (error) {
          console.error('Error detecting transaction:', error);
        }
      }, 3000); // Wait 3 seconds for transaction to settle

    } catch (error) {
      console.error('❌ Error opening funding flow:', error);
    } finally {
      setIsLoadingOnramp(false);
    }
  };

  const renderContent = () => {
    if (!selectedOption) {
      return (
        <div className="space-y-8">
          {/* Current Balance Display */}
          <FrostedCard variant="holiday" className="relative overflow-hidden">
            {/* Ribbon accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1 z-10"
              style={{
                background: theme === 'christmas'
                  ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                  : theme === 'newyear'
                  ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                  : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
              }}
            />

            <div className="flex items-center justify-between relative z-10">
              <div>
                <motion.span
                  className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-2 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Sparkles size={14} style={{ color: colors.primary }} />
                  Current Balance
                </motion.span>
                {isLoadingBalance ? (
                  <div className="h-8 w-32 bg-[#1E293B]/40 rounded animate-pulse" />
                ) : (
                  <motion.h2
                    className="text-3xl font-bold text-white"
                    key={currentBalance}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      textShadow: `0 0 20px ${colors.glow}`,
                    }}
                  >
                    {currentBalance !== null ? currentBalance.toFixed(4) : '0.0000'} SOL
                  </motion.h2>
                )}
              </div>
              <GlowButton
                variant="secondary"
                onClick={async () => {
                  if (user?.wallet_address) {
                    setIsLoadingBalance(true);
                    try {
                      const balances = await heliusService.getTokenBalances(user.wallet_address);
                      const solBalance = balances.find(b => b.symbol === 'SOL');
                      setCurrentBalance(solBalance?.balance || 0);
                      showToast({
                        type: 'success',
                        message: 'Balance updated',
                      });
                    } catch (err) {
                      showToast({
                        type: 'error',
                        message: 'Failed to refresh balance',
                      });
                    } finally {
                      setIsLoadingBalance(false);
                    }
                  }
                }}
                disabled={isLoadingBalance}
              >
                Refresh
              </GlowButton>
            </div>
          </FrostedCard>

          {/* Option Cards */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Choose a funding method</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <OptionCard
                icon={Building}
                title="Transfer from Bank"
                desc="Purchase crypto instantly with your debit card. Fast and secure."
                onClick={handleOnRamp}
                recommended={true}
                processingTime="Instant"
                features={[
                  'Secure payment processing',
                  'Instant deposit',
                ]}
              />
              <OptionCard
                icon={ArrowDownLeft}
                title="Transfer from Wallet"
                desc="Send SOL or SPL tokens from any external Solana wallet."
                onClick={() => setSelectedOption('wallet')}
                processingTime="30 seconds - 2 minutes"
                features={[
                  'Send from any Solana wallet',
                  'Support for SOL and SPL tokens',
                  'Low network fees',
                ]}
              />
            </div>
          </div>
        </div>
      );
    }

    if (selectedOption === 'bank') {
      return (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-2 text-center text-white">🎁 FUND YOUR GIFTING APP - FASTEST WAY (DEBIT CARD)</h3>
          <div className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Step 1 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">1</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Sign Up on Coinbase (2 min)</h4>
                  <p className="text-[#94A3B8] mb-2">
                    Go to <a href="https://coinbase.com/signup" target="_blank" rel="noopener noreferrer" className="text-[#06B6D4] hover:text-[#0891B2] underline">coinbase.com/signup</a> → Click "Sign Up"
                  </p>
                  <ul className="list-disc list-inside text-[#64748B] space-y-1 ml-4">
                    <li>Email, password, name → Verify email</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">2</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Secure Your Account (2 min)</h4>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4">
                    <li>Enter phone number</li>
                    <li>Enter code from text message</li>
                    <li className="text-[#10B981]">✅ Account secured</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">3</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Verify Your Identity (10 min)</h4>
                  <p className="text-[#94A3B8] mb-2">Upload these 3 things:</p>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4 mb-2">
                    <li><strong>ID photo</strong> (front + back) - Driver's license, passport, or state ID</li>
                    <li><strong>Selfie</strong> - Just your face, good lighting</li>
                    <li><strong>Proof of address</strong> - Recent utility bill, bank statement, or lease (dated within 3 months)</li>
                  </ul>
                  <p className="text-[#64748B] text-sm italic">All must be clear photos/scans, not screenshots.</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">4</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Wait for Approval (5 min - 1 hour)</h4>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4">
                    <li>Coinbase reviews your docs</li>
                    <li>Check email for approval notification</li>
                    <li className="text-[#10B981]">✅ Ready to fund</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">5</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Add Debit Card (INSTANT) ⚡</h4>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4">
                    <li>Go to Settings → Payment Methods → Add</li>
                    <li>Select Debit Card</li>
                    <li>Enter card number, expiration, CVV</li>
                    <li>Address must match your bank records</li>
                    <li className="text-[#10B981]">✅ Card added & ready instantly</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">6</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Buy Solana (2 min)</h4>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4">
                    <li>Click "Buy / Sell" on dashboard</li>
                    <li>Search "Solana" or "SOL"</li>
                    <li>Enter amount ($25-50 to start)</li>
                    <li>Select your Debit Card as payment method</li>
                    <li>Click "Buy Solana" → Enter 2FA code</li>
                    <li className="text-[#10B981]">✅ SOL in your wallet instantly</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">7</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Get Your Gifting App Wallet Address (1 min)</h4>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4">
                    <li>Open Gifting App</li>
                    <li>Tap "Add Funds"</li>
                    <li>Select "Transfer from Wallet"</li>
                    <li>Tap the Copy icon</li>
                    <li className="text-[#10B981]">✅ Address copied</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 8 */}
            <div className="bg-[#1E293B]/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center font-bold text-white">8</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-white">Send SOL to Your App (2 min)</h4>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4 mb-3">
                    <li>In Coinbase, find your SOL balance</li>
                    <li>Click "Send" or "Withdraw"</li>
                    <li>Select Solana network (only option for SOL)</li>
                    <li>Paste the address you just copied</li>
                    <li>Enter amount (leave $1-2 for fees)</li>
                  </ul>
                  <div className="bg-[#0F172A]/50 border border-white/10 rounded-lg p-4 mb-3">
                    <p className="text-[#94A3B8] font-semibold mb-2">✅ Verify checklist:</p>
                    <ul className="space-y-1 text-[#94A3B8]">
                      <li>☑ Network = Solana</li>
                      <li>☑ Address matches the one you copied</li>
                      <li>☑ Amount is correct</li>
                    </ul>
                  </div>
                  <ul className="list-disc list-inside text-[#94A3B8] space-y-1 ml-4">
                    <li>Click "Send" → Enter 2FA code</li>
                    <li className="text-[#10B981]">✅ Done! SOL arrives in 30 seconds - 2 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <GlowButton variant="secondary" onClick={() => setSelectedOption(null)}>Back</GlowButton>
          </div>
        </div>
      );
    }
    
    if (selectedOption === 'wallet' && user) {
        return (
          <motion.div
            className="max-w-2xl mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FrostedCard variant="holiday" className="relative overflow-hidden">
              {/* Ribbon accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 z-10"
                style={{
                  background: theme === 'christmas'
                    ? 'linear-gradient(90deg, #EB6A46 0%, #EF4444 50%, #EB6A46 100%)'
                    : theme === 'newyear'
                    ? 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)'
                    : 'linear-gradient(90deg, #06B6D4 0%, #0891B2 50%, #06B6D4 100%)',
                }}
              />

              <div className="text-center mb-6 relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Sparkles size={24} style={{ color: colors.primary }} />
                  Transfer from Wallet
                </h2>
                <p className="text-sm text-[#94A3B8]">
                  Send SOL or SPL tokens from any external Solana wallet to this address
                </p>
              </div>

              {/* Security Warning */}
              <motion.div
                className="bg-[#7F1D1D]/20 border border-[#EF4444]/20 rounded-xl p-4 mb-6 flex items-start gap-3 relative z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Shield size={20} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#EF4444] font-bold text-sm mb-1">Important: Network Warning</p>
                  <p className="text-[#FCD34D] text-xs">
                    Only send tokens on the <strong>Solana network</strong>. Sending from other networks (Ethereum, BSC, etc.) will result in permanent loss of funds.
                  </p>
                </div>
              </motion.div>

              {/* Wallet Address */}
              <div className="space-y-3 mb-6 relative z-10">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Your Wallet Address
                </label>
                <motion.div
                  className="bg-[#0F172A] p-4 rounded-xl flex items-center justify-between border border-white/10"
                  whileHover={!shouldReduceMotion ? {
                    borderColor: colors.primary,
                    boxShadow: `0 0 20px ${colors.glow}`,
                  } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-[#FCD34D] text-sm truncate mr-4 font-mono">{user.wallet_address}</span>
                  <GlowButton 
                    variant="secondary" 
                    className="!py-2 !px-4 !text-xs flex-shrink-0" 
                    onClick={handleCopy} 
                    icon={Copy}
                  >
                    Copy
                  </GlowButton>
                </motion.div>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <motion.div
                  className="bg-white p-6 rounded-2xl inline-block mx-auto mb-6 relative z-10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-center mb-3">
                    <p className="text-xs text-[#64748B] font-medium">Scan to send</p>
                  </div>
                  <img src={qrCodeDataUrl} alt="Wallet Address QR Code" className="w-64 h-64" />
                </motion.div>
              )}

              {/* Info Box */}
              <motion.div
                className="bg-[#0F172A]/30 border border-white/10 rounded-xl p-4 space-y-2 relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Clock size={16} />
                  <span>Estimated arrival: 30 seconds - 2 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Shield size={16} />
                  <span>Minimum deposit: 0.01 SOL</span>
                </div>
              </motion.div>
            </FrostedCard>
          </motion.div>
        )
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fade-in-up">
      {!selectedOption && (
        <PageHeader
          title="Add Funds to Your Wallet"
          subtitle="Choose how you'd like to add crypto to your account"
          breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Add Funds' }]}
        />
      )}
      
      {selectedOption && (
        <button 
          onClick={() => setSelectedOption(null)} 
          className="flex items-center gap-2 text-[#94A3B8] hover:text-white mb-6 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      )}
      
      {renderContent()}
    </div>
  );
};

export default AddFundsPage;