import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePrivy } from '@privy-io/react-auth';
import { useSignAndSendTransaction, useWallets } from '@privy-io/react-auth/solana';
import { tokenService, giftService, tiplinkService, heliusService, feeService, priceService, usernameService } from '../services/api';
import { Token, TokenBalance, ResolveRecipientResponse } from '../types';
import Spinner from '../components/Spinner';
import { Gift, ChevronLeft, AlertTriangle, Mail, QrCode, Copy, ArrowUpRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import GlassCard from '../components/UI/GlassCard';
import GlowButton from '../components/UI/GlowButton';
import InputField from '../components/UI/InputField';
import Stepper from '../components/UI/Stepper';
import GiftPreview from '../components/UI/GiftPreview';
import TokenPicker from '../components/UI/TokenPicker';
import AssetSelector from '../components/UI/AssetSelector';
import QuickAmountChips from '../components/UI/QuickAmountChips';
import SuggestedAmounts from '../components/UI/SuggestedAmounts';
import BalanceResolutionPanel from '../components/UI/BalanceResolutionPanel';
import ReviewStep from '../components/UI/ReviewStep';
import GreetingCardModal from '../components/UI/GreetingCardModal';
import PageHeader from '../components/UI/PageHeader';
import { useToast } from '../components/UI/ToastContainer';
import { ArrowLeftIcon } from '../components/icons';
import { OnrampCreditPopup } from '../components/OnrampCreditPopup';
import { useTheme } from '../context/ThemeContext';
import { CARD_UPSELL_PRICE } from '../lib/cardTemplates';
import { triggerConfetti } from '../lib/confetti';
import QRCode from 'qrcode';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { connection } from '../services/solana';
import bs58 from 'bs58';

const CardUpsellSection = React.lazy(() =>
    import('../components/CardUpsellSection').then((module) => ({
        default: module.CardUpsellSection,
    }))
);

const GiftPage: React.FC = () => {
    const { user, refreshUser, isLoading: authLoading } = useAuth();
    const { ready, authenticated, user: privyUser } = usePrivy();
    const { signAndSendTransaction } = useSignAndSendTransaction();
    const { theme } = useTheme();
    const { wallets, ready: walletsReady } = useWallets();
    const navigate = useNavigate();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [isLoadingTokens, setIsLoadingTokens] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [userBalance, setUserBalance] = useState<number>(0);
    const [walletBalances, setWalletBalances] = useState<TokenBalance[]>([]);
    const [walletReady, setWalletReady] = useState(false);
    const [feeWalletAddress, setFeeWalletAddress] = useState<string | null>(null);
    const [feePercentage, setFeePercentage] = useState<number>(0.001); // Default 0.1%
    const showFormSkeleton = authLoading || isLoadingTokens || !walletReady || !user?.wallet_address;
    
    const [recipientInput, setRecipientInput] = useState('');
    const [resolvedRecipient, setResolvedRecipient] = useState<ResolveRecipientResponse | null>(null);
    const [resolvingRecipient, setResolvingRecipient] = useState(false);
    const [recipientError, setRecipientError] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const trimmedRecipient = recipientInput.trim();
    const isUsernameRecipient = trimmedRecipient.startsWith('@');
    const resolvedRecipientEmail = isUsernameRecipient
        ? (resolvedRecipient?.email ?? '')
        : trimmedRecipient.toLowerCase();
    const recipientDisplayLabel = isUsernameRecipient
        ? (resolvedRecipient?.username ?? trimmedRecipient)
        : trimmedRecipient;
    
    // USD/Token conversion state
    const [amountMode, setAmountMode] = useState<'token' | 'usd'>('usd'); // Default to USD
    const [tokenPrice, setTokenPrice] = useState<number | null>(null);
    const [priceLastUpdated, setPriceLastUpdated] = useState<number | null>(null);
    const [usdAmount, setUsdAmount] = useState<string>('');
    const [tokenAmount, setTokenAmount] = useState<string>('');
    const [priceLoading, setPriceLoading] = useState(false);
    const [priceError, setPriceError] = useState<string | null>(null);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    
    // Card upsell state
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [recipientName, setRecipientName] = useState<string>('');
    
    // Onramp credit state
    const [onrampCredit, setOnrampCredit] = useState<any | null>(null);
    const [showCreditPopup, setShowCreditPopup] = useState(false);
    
    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmDetails, setConfirmDetails] = useState<{
        recipientLabel: string;
        recipientEmail: string;
        amount: number;
        fee: number;
        total: number;
        token: string;
        tokenName: string;
        usdValue: number | null;
        usdFee: number | null;
        usdTotal: number | null;
        remainingBalance: number;
        remainingBalanceUsd: number | null;
        message: string;
        cardFee: number;
        cardFeeUsd: number | null;
        hasCard: boolean;
    } | null>(null);
    
    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [giftDetails, setGiftDetails] = useState<{
        claim_url: string;
        amount: string;
        token: string;
        usdValue: number | null;
        recipient: string;
        signature: string;
        qrCode: string;
    } | null>(null);

    // Step navigation state
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [showGreetingCardModal, setShowGreetingCardModal] = useState(false);
    const [quickAmountSelected, setQuickAmountSelected] = useState<string | null>(null);
    const [suggestedAmountSelected, setSuggestedAmountSelected] = useState<number | null>(null);
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);
    const { showToast } = useToast();
    const location = useLocation();
    const stepRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    
    // Compute default token from tokens array
    const defaultToken = useMemo(() => {
        return tokens.find(t => t.symbol === 'USDC') 
            || tokens.find(t => t.symbol === 'SOL') 
            || tokens[0] 
            || null;
    }, [tokens]);

    // Monitor wallets array for changes
    useEffect(() => {
        if (walletsReady && wallets.length > 0) {
            const solanaWallet = wallets.find(w => {
                const isSolanaAddress = w.address && !w.address.startsWith('0x');
                return isSolanaAddress;
            });
            if (solanaWallet) {
                setWalletReady(true);
                console.log('✅ Wallet ready:', solanaWallet.address);
            }
        } else if (privyUser?.wallet && privyUser.wallet.chainType === 'solana') {
            // Wallet exists in privyUser even if useWallets is empty
            setWalletReady(true);
            console.log('✅ Wallet ready from privyUser:', privyUser.wallet.address);
        }
    }, [wallets, walletsReady, privyUser]);

    useEffect(() => {
        if (!user?.wallet_address) {
            setIsLoadingTokens(false);
            return;
        }

        let cancelled = false;
        let idleHandle: number | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const fetchTokensAndBalances = async () => {
            if (cancelled) return;
            setIsLoadingTokens(true);
            try {
                const balances = await heliusService.getTokenBalances(user.wallet_address!);
                setWalletBalances(balances);
                
                const nonZeroTokens = balances
                    .filter(b => b.balance > 0)
                    .sort((a, b) => a.symbol.localeCompare(b.symbol))
                    .map(b => ({
                        mint: b.address,
                        symbol: b.symbol,
                        name: b.name,
                        decimals: b.decimals,
                        isNative: b.symbol === 'SOL',
                    }));
                
                setTokens(nonZeroTokens);
                
                if (nonZeroTokens.length > 0) {
                    // Prefer USDC, then SOL, then first available
                    const defaultToken = nonZeroTokens.find(t => t.symbol === 'USDC') 
                        || nonZeroTokens.find(t => t.symbol === 'SOL') 
                        || nonZeroTokens[0];
                    setSelectedToken(defaultToken);
                    
                    const tokenBalance = balances.find(b => b.symbol === defaultToken.symbol);
                    setUserBalance(tokenBalance?.balance || 0);
                }
                
                console.log(`💰 Found ${nonZeroTokens.length} token(s) with non-zero balance`);
                
                // Validate balance after refresh if amount is entered
                if (tokenAmount && !isNaN(parseFloat(tokenAmount))) {
                    const numValue = parseFloat(tokenAmount);
                    if (numValue > 0) {
                        validateBalance(numValue).catch(console.error);
                    }
                }
            } catch (e) {
                setError('Failed to fetch tokens and balances.');
                console.error(e);
            } finally {
                if (!cancelled) {
                    setIsLoadingTokens(false);
                }
            }
        };

        const scheduleFetch = () => {
            if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
                idleHandle = (window as any).requestIdleCallback(() => {
                    if (!cancelled) {
                        fetchTokensAndBalances();
                    }
                }, { timeout: 1200 });
            } else {
                timeoutId = setTimeout(() => {
                    if (!cancelled) {
                        fetchTokensAndBalances();
                    }
                }, 80);
            }
        };

        scheduleFetch();

        return () => {
            cancelled = true;
            if (idleHandle !== null && typeof (window as any).cancelIdleCallback === 'function') {
                (window as any).cancelIdleCallback(idleHandle);
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [user]);
    
    // Price fetching function
    const fetchTokenPrice = async (mintAddress: string) => {
        setPriceLoading(true);
        setPriceError(null);
        
        try {
            const response = await priceService.getTokenPrice(mintAddress);
            
            if (response.price) {
                setTokenPrice(response.price);
                setPriceLastUpdated(Date.now());
                console.log(`💰 Token price fetched: $${response.price} (source: ${response.source})`);
            } else {
                throw new Error('Price unavailable');
            }
        } catch (error) {
            console.error('Failed to fetch token price:', error);
            setPriceError('Unable to fetch current price');
            setAmountMode('token'); // Force token mode if price fails
            setTokenPrice(null);
        } finally {
            setPriceLoading(false);
        }
    };
    
    // Update balance when token is selected
    useEffect(() => {
        if (selectedToken && walletBalances.length > 0) {
            const tokenBalance = walletBalances.find(b => b.symbol === selectedToken.symbol);
            setUserBalance(tokenBalance?.balance || 0);
            
            // Validate balance when token changes if amount is entered
            if (tokenAmount && !isNaN(parseFloat(tokenAmount))) {
                const numValue = parseFloat(tokenAmount);
                if (numValue > 0) {
                    validateBalance(numValue).catch(console.error);
                }
            }
            console.log(`💰 Balance for ${selectedToken.symbol}:`, tokenBalance?.balance || 0);
        }
        
        // Fetch price when token is selected
        if (selectedToken?.mint) {
            fetchTokenPrice(selectedToken.mint);
        }
    }, [selectedToken, walletBalances]);

    useEffect(() => {
        const fetchFeeConfig = async () => {
            try {
                const config = await feeService.getFeeConfig();
                setFeeWalletAddress(config.fee_wallet_address);
                setFeePercentage(config.fee_percentage);
                console.log('💼 Fee config loaded:', {
                    fee_wallet: config.fee_wallet_address,
                    fee_percentage: config.fee_percentage * 100 + '%'
                });
            } catch (e) {
                console.error('Failed to fetch fee config:', e);
            }
        };
        fetchFeeConfig();
    }, []);

    useEffect(() => {
        if (!isUsernameRecipient) {
            setResolvedRecipient(null);
            setRecipientError(null);
            setResolvingRecipient(false);
            return;
        }

        if (trimmedRecipient.length < 4) {
            setResolvedRecipient(null);
            setRecipientError('Username must be at least 4 characters.');
            return;
        }

        setResolvingRecipient(true);
        setRecipientError(null);

        const timeoutId = setTimeout(async () => {
            try {
                const result = await usernameService.resolveRecipient(trimmedRecipient);
                setResolvedRecipient(result);
                setRecipientError(null);
            } catch (err: any) {
                console.error('❌ Error resolving recipient username:', err);
                if (err?.response?.status === 404) {
                    setRecipientError('Username not found.');
                } else {
                    setRecipientError('Unable to resolve username.');
                }
                setResolvedRecipient(null);
            } finally {
                setResolvingRecipient(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [isUsernameRecipient, trimmedRecipient]);

    // Extract recipient name for card personalization
    useEffect(() => {
        if (isUsernameRecipient && resolvedRecipient) {
            // Try to get name from resolved recipient (if available)
            const name = resolvedRecipient.username?.replace('@', '') || resolvedRecipient.email.split('@')[0];
            setRecipientName(name);
        } else if (!isUsernameRecipient && trimmedRecipient.includes('@')) {
            // Extract name from email (part before @)
            const name = trimmedRecipient.split('@')[0];
            setRecipientName(name);
        } else {
            setRecipientName('');
        }
    }, [isUsernameRecipient, resolvedRecipient, trimmedRecipient]);

    // Check for active onramp credit when component mounts
    useEffect(() => {
        const checkOnrampCredit = async () => {
            if (!user?.privy_did) return;

            try {
                const response = await fetch(
                    `/api/users/${user.privy_did}/onramp-credit`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch credit status');
                }

                const data = await response.json();

                // Only show popup if credit is active
                if (data.isActive && data.creditsRemaining > 0) {
                    setOnrampCredit(data);
                    setShowCreditPopup(true);
                    
                    console.log('✨ User has active onramp credit:', data);
                }

            } catch (err) {
                console.error('Error checking onramp credit:', err);
                // Don't block the UI if credit check fails
            }
        };

        checkOnrampCredit();
    }, [user?.privy_did]);

    // Helper function to parse simulation errors into user-friendly messages
    const parseSimulationError = (err: any): string => {
        if (!err) return 'Transaction simulation failed. Please check your balance and try again.';
        
        // Handle different error formats
        let errStr = '';
        if (typeof err === 'string') {
            errStr = err;
        } else if (err.toString) {
            errStr = err.toString();
        } else {
            errStr = JSON.stringify(err);
        }
        
        // Also check for nested error objects
        const errObj = typeof err === 'object' ? err : null;
        const errCode = errObj?.InstructionError?.[1]?.Custom || errObj?.Err || errObj?.code;
        
        console.log('🔍 Parsing simulation error:', { errStr, errObj, errCode });
        
        // Check error code first (most reliable)
        if (errCode !== undefined) {
            // Solana error codes: https://github.com/solana-labs/solana/blob/master/sdk/src/transaction/error.rs
            if (errCode === 1 || errStr.includes('InsufficientFunds')) {
                return 'Not enough SOL in your wallet to pay for transaction fees. Please add more SOL to your wallet.';
            }
            if (errCode === 2 || errStr.includes('InsufficientLamports')) {
                return 'Not enough SOL in your wallet. Please add more SOL to cover transaction fees.';
            }
        }
        
        // Common Solana error patterns (case-insensitive)
        const lowerErrStr = errStr.toLowerCase();
        
        if (lowerErrStr.includes('insufficient funds') || lowerErrStr.includes('insufficientfunds')) {
            return 'Not enough SOL in your wallet to pay for transaction fees. Please add more SOL to your wallet.';
        }
        if (lowerErrStr.includes('insufficient lamports') || lowerErrStr.includes('insufficientlamports')) {
            return 'Not enough SOL in your wallet. Please add more SOL to cover transaction fees.';
        }
        if (lowerErrStr.includes('insufficient token') || lowerErrStr.includes('insufficienttoken')) {
            return 'Not enough tokens in your wallet. Please check your balance and try again.';
        }
        if (lowerErrStr.includes('tokenaccountnotfound') || lowerErrStr.includes('token account not found')) {
            return 'Token account not found. Please ensure you have the token in your wallet.';
        }
        if (lowerErrStr.includes('accountnotfound') || lowerErrStr.includes('account not found')) {
            return 'Account not found. Please refresh and try again.';
        }
        if (lowerErrStr.includes('blockhashnotfound') || lowerErrStr.includes('blockhash not found')) {
            return 'Transaction expired. Please try again.';
        }
        if (lowerErrStr.includes('already in use') || lowerErrStr.includes('alreadyinuse')) {
            return 'Transaction is already being processed. Please wait a moment and try again.';
        }
        if (lowerErrStr.includes('custom program error') || lowerErrStr.includes('programerror')) {
            return 'Transaction failed. Please check your balance and try again.';
        }
        if (lowerErrStr.includes('invalid account') || lowerErrStr.includes('invalidaccount')) {
            return 'Invalid account. Please refresh and try again.';
        }
        if (lowerErrStr.includes('owner mismatch') || lowerErrStr.includes('ownermismatch')) {
            return 'Account ownership mismatch. Please refresh and try again.';
        }
        
        return 'Transaction simulation failed. Please check your balance and try again.';
    };

    // Helper function to parse transaction errors into user-friendly messages
    const parseTransactionError = (error: any): string => {
        if (!error) return 'Transaction failed. Please check your balance and try again.';
        
        const errorMessage = error?.message || error?.toString() || JSON.stringify(error);
        const lowerErrorMessage = errorMessage.toLowerCase();
        console.log('🔍 Parsing transaction error:', { errorMessage, error });
        
        // Check for common error patterns (case-insensitive)
        if (lowerErrorMessage.includes('insufficient funds') || lowerErrorMessage.includes('insufficientfunds')) {
            return 'Not enough SOL in your wallet to pay for transaction fees. Please add more SOL to your wallet.';
        }
        if (lowerErrorMessage.includes('insufficient lamports') || lowerErrorMessage.includes('insufficientlamports')) {
            return 'Not enough SOL in your wallet. Please add more SOL to cover transaction fees.';
        }
        if (lowerErrorMessage.includes('insufficient token') || lowerErrorMessage.includes('insufficienttoken')) {
            return 'Not enough tokens in your wallet. Please check your balance and try again.';
        }
        if (lowerErrorMessage.includes('simulation failed') || lowerErrorMessage.includes('transaction simulation failed')) {
            return 'Transaction failed. Please check that you have enough SOL for fees and enough tokens for the gift.';
        }
        if (lowerErrorMessage.includes('user rejected') || lowerErrorMessage.includes('userrejected') || lowerErrorMessage.includes('cancelled')) {
            return 'Transaction was cancelled. Please try again when ready.';
        }
        if (lowerErrorMessage.includes('blockhashnotfound') || lowerErrorMessage.includes('blockhash not found')) {
            return 'Transaction expired. Please try again.';
        }
        if (lowerErrorMessage.includes('network') || lowerErrorMessage.includes('connection')) {
            return 'Network error. Please check your connection and try again.';
        }
        if (lowerErrorMessage.includes('timeout') || lowerErrorMessage.includes('timed out')) {
            return 'Transaction timed out. Please try again.';
        }
        if (lowerErrorMessage.includes('signature') && lowerErrorMessage.includes('invalid')) {
            return 'Transaction signature invalid. Please try again.';
        }
        if (lowerErrorMessage.includes('rate limit') || lowerErrorMessage.includes('ratelimit')) {
            return 'Too many requests. Please wait a moment and try again.';
        }
        
        // Default user-friendly message
        return 'Transaction failed. Please check your balance and try again.';
    };

    // Helper function to get SOL balance (with fallback to direct connection fetch)
    const getSolBalance = async (): Promise<number> => {
        // First try to get from walletBalances
        const solFromBalances = walletBalances.find(b => b.symbol === 'SOL')?.balance;
        if (solFromBalances !== undefined && solFromBalances >= 0) {
            console.log(`💰 SOL balance from walletBalances: ${solFromBalances.toFixed(6)} SOL`);
            return solFromBalances;
        }
        
        // Fallback: fetch directly from connection
        if (user?.wallet_address) {
            try {
                const solBalanceLamports = await connection.getBalance(new PublicKey(user.wallet_address));
                const solBalance = solBalanceLamports / LAMPORTS_PER_SOL;
                console.log(`💰 Fetched SOL balance directly: ${solBalance.toFixed(6)} SOL`);
                return solBalance;
            } catch (error) {
                console.error('Error fetching SOL balance:', error);
                return 0;
            }
        }
        
        return 0;
    };

    // Real-time balance validation function
    const validateBalance = async (amountValue: number) => {
        if (!selectedToken || !tokenPrice || amountValue <= 0) {
            setBalanceError(null);
            return;
        }

        try {
            const FLAT_SERVICE_FEE_USD = 1.00;
            const CARD_FEE_USD = selectedCard ? 1.00 : 0;
            const totalFeesUSD = FLAT_SERVICE_FEE_USD + CARD_FEE_USD;
            
            // Calculate fees in token
            const serviceFeeAmount = tokenPrice > 0 ? FLAT_SERVICE_FEE_USD / tokenPrice : 0;
            const cardFeeAmount = selectedCard && tokenPrice > 0 ? CARD_FEE_USD / tokenPrice : 0;
            const totalFeeAmount = serviceFeeAmount + cardFeeAmount;
            const totalAmount = amountValue + totalFeeAmount;

            if (selectedToken.isNative) {
                // For native SOL, fees are in SOL
                if (totalAmount > userBalance) {
                    setBalanceError(`Insufficient balance. You need ${totalAmount.toFixed(4)} SOL (${amountValue.toFixed(4)} SOL gift + ${totalFeeAmount.toFixed(4)} SOL fees). You have ${userBalance.toFixed(4)} SOL available. Add ${(totalAmount - userBalance).toFixed(4)} SOL to continue.`);
                    return;
                }
                setBalanceError(null);
            } else {
                // For SPL tokens, try token first, then SOL fallback
                if (totalAmount > userBalance) {
                    // Not enough token balance - check SOL fallback
                    const tokenBalanceForGift = userBalance - amountValue;
                    if (tokenBalanceForGift < 0) {
                        // Not even enough for gift
                        setBalanceError(`Insufficient ${selectedToken.symbol} balance. You need ${amountValue.toFixed(4)} ${selectedToken.symbol} for the gift. You have ${userBalance.toFixed(4)} ${selectedToken.symbol} available. Add ${(amountValue - userBalance).toFixed(4)} ${selectedToken.symbol} to continue.`);
                        return;
                    }
                    
                    // Calculate fees split
                    const feesInToken = Math.max(0, tokenBalanceForGift);
                    const feesInSOLAmount = totalFeeAmount - feesInToken;
                    
                    // Get SOL balance and price
                    const solBalance = await getSolBalance();
                    const solPrice = await priceService.getTokenPrice('So11111111111111111111111111111111111111112');
                    const feesInSOL = solPrice && solPrice > 0 ? feesInSOLAmount / solPrice : 0;
                    
                    if (solBalance < feesInSOL) {
                        // Not enough in either
                        setBalanceError(`Insufficient balance. You need ${amountValue.toFixed(4)} ${selectedToken.symbol} for the gift and $${totalFeesUSD.toFixed(2)} in fees. You have ${userBalance.toFixed(4)} ${selectedToken.symbol} and ${solBalance.toFixed(6)} SOL available, but need ${feesInToken.toFixed(4)} ${selectedToken.symbol} + ${feesInSOL.toFixed(6)} SOL for fees.`);
                        return;
                    }
                    
                    // Can use SOL fallback
                    setBalanceError(null);
                } else {
                    // Enough in token
                    setBalanceError(null);
                }
            }
        } catch (error) {
            console.error('Error validating balance:', error);
            // Don't set error on validation failure, just log it
        }
    };

    // Mode switch handler
    const handleModeSwitch = (newMode: 'token' | 'usd') => {
        if (!tokenPrice && newMode === 'usd') {
            setPriceError('Price unavailable - cannot switch to USD mode');
            return;
        }
        
        if (newMode === 'usd' && tokenAmount) {
            // Convert current token amount to USD
            const usd = (parseFloat(tokenAmount) * tokenPrice!).toFixed(2);
            setUsdAmount(usd);
        } else if (newMode === 'token' && usdAmount) {
            // Convert current USD amount to tokens
            const tokens = (parseFloat(usdAmount) / tokenPrice!).toFixed(6);
            setTokenAmount(tokens);
            setAmount(tokens); // Update main amount state
        }
        
        setAmountMode(newMode);
    };

    const handleSendGift = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            setError("Please log in first");
            return;
        }

        if (!ready || !authenticated) {
            setError("Please wait for authentication to complete.");
            return;
        }

        if (!user.wallet_address) {
            setError("Wallet address not found. Please refresh the page.");
            return;
        }

        if (!walletReady && !privyUser?.wallet) {
            setError("Wallet is not ready yet. Please wait a moment and try again.");
            return;
        }

        if (!selectedToken || !trimmedRecipient) {
            setError("Please fill in all required fields.");
            return;
        }

        if (isUsernameRecipient) {
            if (resolvingRecipient) {
                setError("Resolving username, please wait a moment.");
                return;
            }
            if (!resolvedRecipientEmail) {
                setError(recipientError || "Unable to resolve username.");
                return;
            }
        } else if (!trimmedRecipient.includes('@')) {
            setError("Please enter a valid email address.");
            return;
        }

        const recipientEmailValue = resolvedRecipientEmail;
        if (!recipientEmailValue) {
            setError("Recipient could not be determined. Please try again.");
            return;
        }

        const recipientLabel = recipientDisplayLabel || recipientEmailValue;

        // Calculate final amount based on mode
        const numericAmount = amountMode === 'usd' && tokenPrice
            ? parseFloat(usdAmount) / tokenPrice
            : parseFloat(amount || tokenAmount);
            
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
        
        // Calculate flat $1 service fee (convert to token amount)
        const FLAT_SERVICE_FEE_USD = 1.00;
        const serviceFeeAmount = tokenPrice && tokenPrice > 0 
            ? FLAT_SERVICE_FEE_USD / tokenPrice 
            : 0;
        
        if (!tokenPrice || tokenPrice <= 0) {
            setError('Unable to fetch token price. Please try again.');
            return;
        }
        
        // Calculate card fee ($1 if selected)
        const hasCard = !!selectedCard;
        const CARD_FEE_USD = 1.00;
        const cardFeeInTokens = hasCard && tokenPrice && tokenPrice > 0
            ? CARD_FEE_USD / tokenPrice
            : 0;
        
        // Total fees (service + card)
        const totalFeeAmount = serviceFeeAmount + cardFeeInTokens;
        const totalAmount = numericAmount + totalFeeAmount;
        
        // Check user balance (including fees)
        // First try to collect fees in the token being transferred
        let feesToCollectInToken = totalFeeAmount;
        let feesToCollectInSOL = 0;
        
        if (selectedToken.isNative) {
            // For native SOL, fees are also collected in SOL
            // Check if user has enough SOL for gift + fees
            if (totalAmount > userBalance) {
                setError(`Insufficient balance. You need ${totalAmount.toFixed(4)} ${selectedToken.symbol} (${numericAmount.toFixed(4)} ${selectedToken.symbol} gift + ${totalFeeAmount.toFixed(4)} ${selectedToken.symbol} fees). You have ${userBalance.toFixed(4)} ${selectedToken.symbol} available.`);
                return;
            }
            // For native SOL, fees are collected in SOL (already set above)
            feesToCollectInToken = totalFeeAmount;
            feesToCollectInSOL = 0;
        } else {
            // For SPL tokens, try to collect fees in token first, then fallback to SOL
            // Check if user has enough token balance for gift + fees
            if (totalAmount > userBalance) {
                // Not enough token balance - check if we can collect fees in SOL as fallback
                const tokenBalanceForGift = userBalance - numericAmount;
                if (tokenBalanceForGift < 0) {
                    // Not even enough for the gift itself
                    setError(`Insufficient ${selectedToken.symbol} balance. You need ${numericAmount.toFixed(4)} ${selectedToken.symbol} for the gift. You have ${userBalance.toFixed(4)} ${selectedToken.symbol} available.`);
                    return;
                }
                
                // Calculate how much fee we can collect in token, rest in SOL
                feesToCollectInToken = Math.max(0, tokenBalanceForGift);
                feesToCollectInSOL = totalFeeAmount - feesToCollectInToken;
                
                // Get SOL balance and price to check if we can collect fees there
                const solBalance = await getSolBalance();
                const solPrice = await priceService.getTokenPrice('So11111111111111111111111111111111111111112');
                const feesInSOL = solPrice && solPrice > 0 ? feesToCollectInSOL / solPrice : 0;
                
                if (solBalance < feesInSOL) {
                    // Not enough in either token or SOL
                    setError(`Insufficient balance. You need ${numericAmount.toFixed(4)} ${selectedToken.symbol} for the gift and $${totalFeeAmount.toFixed(2)} in fees. You have ${userBalance.toFixed(4)} ${selectedToken.symbol} and ${solBalance.toFixed(6)} SOL available, but need ${feesToCollectInToken.toFixed(4)} ${selectedToken.symbol} + ${feesInSOL.toFixed(6)} SOL for fees.`);
                    return;
                }
                
                // We can collect fees in SOL - proceed
                console.log(`✅ Will collect fees: ${feesToCollectInToken.toFixed(4)} ${selectedToken.symbol} + ${feesInSOL.toFixed(6)} SOL`);
            } else {
                // Enough token balance for gift + fees
                feesToCollectInToken = totalFeeAmount;
                feesToCollectInSOL = 0;
            }
            
            // Still need SOL for network fees (transaction fees, not service fees)
            const solBalance = await getSolBalance();
            const BASE_FEE = 0.000005;
            const RENT_PER_ATA = 0.00203928;
            const estimatedRequiredSol = (BASE_FEE + RENT_PER_ATA) * 1.05; // Reduced buffer
            
            if (solBalance < estimatedRequiredSol) {
                setError(`Insufficient SOL for network transaction fees. You need approximately ${estimatedRequiredSol.toFixed(6)} SOL to pay for network fees and rent. You have ${solBalance.toFixed(6)} SOL available. Please add more SOL to your wallet.`);
                return;
            }
        }

        // Calculate USD values
        const usdValue = tokenPrice ? numericAmount * tokenPrice : null;
        const usdServiceFee = FLAT_SERVICE_FEE_USD;
        const usdCardFee = hasCard ? CARD_FEE_USD : 0;
        const usdTotalFees = usdServiceFee + usdCardFee;
        const usdTotal = tokenPrice ? (numericAmount * tokenPrice) + usdTotalFees : null;
        
        // Calculate remaining balance after transaction
        const remainingBalance = userBalance - numericAmount - feesToCollectInToken;
        const remainingBalanceUsd = tokenPrice ? remainingBalance * tokenPrice : null;
        
        // Show confirmation modal first
        setConfirmDetails({
            recipientLabel,
            recipientEmail: recipientEmailValue,
            amount: numericAmount,
            fee: serviceFeeAmount, // Service fee in tokens
            total: numericAmount + feesToCollectInToken, // Gift + fees collected in token
            token: selectedToken.symbol,
            tokenName: selectedToken.name,
            usdValue,
            usdFee: usdServiceFee, // $1 service fee
            usdTotal,
            remainingBalance,
            remainingBalanceUsd,
            message: message || '',
            cardFee: cardFeeInTokens, // Card fee in tokens
            cardFeeUsd: hasCard ? usdCardFee : null, // $1 card fee
            hasCard,
        });
        setShowConfirmModal(true);
        return;
    };

    const handleConfirmSend = async () => {
        if (!confirmDetails) return;
        
        setIsSending(true);
        setError(null);
        setSuccessMessage(null);
        // Keep modal open to show loading overlay during transaction processing

        const numericAmount = confirmDetails.amount;
        const recipientEmail = confirmDetails.recipientEmail;
        const recipientLabel = confirmDetails.recipientLabel;
        const message = confirmDetails.message;
        const tokenSymbol = confirmDetails.token;
        
        // Find the token from tokens array (must be done first)
        const currentToken = tokens.find(t => t.symbol === tokenSymbol) || selectedToken;
        if (!currentToken) {
            setError('Token not found. Please refresh the page.');
            setIsSending(false);
            return;
        }
        
        // Recalculate fees (same as in handleSendGift)
        const FLAT_SERVICE_FEE_USD = 1.00;
        const CARD_FEE_USD = confirmDetails.hasCard ? 1.00 : 0;
        const serviceFeeAmount = tokenPrice && tokenPrice > 0 ? FLAT_SERVICE_FEE_USD / tokenPrice : 0;
        const cardFeeAmount = confirmDetails.hasCard && tokenPrice && tokenPrice > 0 ? CARD_FEE_USD / tokenPrice : 0;
        const totalFeeAmount = serviceFeeAmount + cardFeeAmount;
        
        // Determine fee collection: token first, SOL fallback
        let feesToCollectInToken = totalFeeAmount;
        let feesToCollectInSOL = 0;
        
        if (currentToken.isNative) {
            // For native SOL, fees are in SOL
            feesToCollectInToken = totalFeeAmount;
            feesToCollectInSOL = 0;
        } else {
            // For SPL tokens, try token first, then SOL fallback
            if (userBalance < numericAmount + totalFeeAmount) {
                // Not enough token balance - check SOL fallback
                const tokenBalanceForGift = userBalance - numericAmount;
                if (tokenBalanceForGift < 0) {
                    // Not even enough for gift
                    throw new Error(`Insufficient ${currentToken.symbol} balance. You need ${numericAmount.toFixed(4)} ${currentToken.symbol} for the gift. You have ${userBalance.toFixed(4)} ${currentToken.symbol} available.`);
                }
                
                // Calculate fees split
                feesToCollectInToken = Math.max(0, tokenBalanceForGift);
                feesToCollectInSOL = totalFeeAmount - feesToCollectInToken;
                
                // Get SOL balance and price to verify we can collect fees there
                const solBalance = await getSolBalance();
                const solPrice = await priceService.getTokenPrice('So11111111111111111111111111111111111111112');
                const feesInSOL = solPrice && solPrice > 0 ? feesToCollectInSOL / solPrice : 0;
                
                if (solBalance < feesInSOL) {
                    // Not enough in either
                    throw new Error(`Insufficient balance. You need ${numericAmount.toFixed(4)} ${currentToken.symbol} for the gift and $${(FLAT_SERVICE_FEE_USD + CARD_FEE_USD).toFixed(2)} in fees. You have ${userBalance.toFixed(4)} ${currentToken.symbol} and ${solBalance.toFixed(6)} SOL available, but need ${feesToCollectInToken.toFixed(4)} ${currentToken.symbol} + ${feesInSOL.toFixed(6)} SOL for fees.`);
                }
                
                console.log(`✅ Will collect fees: ${feesToCollectInToken.toFixed(4)} ${currentToken.symbol} + ${feesInSOL.toFixed(6)} SOL`);
            } else {
                // Enough token balance for gift + fees
                feesToCollectInToken = totalFeeAmount;
                feesToCollectInSOL = 0;
            }
        }

        try {
            console.log('🎁 Step 1: Creating TipLink...');
            
            // Step 1: Create TipLink on backend
            const { tiplink_url, tiplink_public_key } = await tiplinkService.create();
            console.log('✅ TipLink created:', tiplink_public_key);
            
            // Step 2: Fund TipLink from user's Privy wallet
            console.log('💸 Step 2: Funding TipLink from your wallet...');
            
            // Check if wallets are ready
            if (!walletsReady) {
                throw new Error('Wallets are not ready yet. Please wait a moment and try again.');
            }

            // Find embedded Privy wallet by name (reliable method)
            const embeddedWallet = wallets.find(
                (w) => w.standardWallet?.name === 'Privy'
            );

            if (!embeddedWallet) {
                console.error('❌ No Privy embedded wallet found');
                console.error('Available wallets:', wallets.map(w => ({
                    address: w.address,
                    name: w.standardWallet?.name
                })));
                throw new Error(
                    `No Privy embedded wallet found. Available: ${wallets.map(w => w.standardWallet?.name || 'unknown').join(', ')}`
                );
            }

            console.log('✅ Found embedded Privy wallet:', embeddedWallet.address);

            // For SPL tokens, verify SOL balance with accurate fee estimation
            if (!currentToken.isNative && currentToken.mint !== 'So11111111111111111111111111111111111111112') {
                // Get actual SOL balance
                const solBalance = await getSolBalance();
                
                // Estimate required SOL based on actual transaction
                const BASE_FEE = 0.000005; // Base transaction fee (~5,000 lamports)
                const RENT_PER_ATA = 0.00203928; // Rent exemption for token account (~2,039,280 lamports)
                let estimatedRequiredSol = BASE_FEE;
                
                const splToken = await import('@solana/spl-token');
                const { getAssociatedTokenAddress, getAccount, TOKEN_PROGRAM_ID } = splToken;
                const senderPubkey = new PublicKey(embeddedWallet.address);
                const tipLinkPubkey = new PublicKey(tiplink_public_key);
                const mintPubkey = new PublicKey(currentToken.mint);
                
                // Check TipLink ATA
                const tipLinkATA = await getAssociatedTokenAddress(
                    mintPubkey,
                    tipLinkPubkey,
                    true,
                    TOKEN_PROGRAM_ID
                );
                try {
                    await getAccount(connection, tipLinkATA);
                    console.log('✅ TipLink ATA already exists');
                } catch (error: any) {
                    if (error.name === 'TokenAccountNotFoundError') {
                        estimatedRequiredSol += RENT_PER_ATA;
                        console.log('📝 TipLink ATA needs to be created (+0.00203928 SOL)');
                    } else {
                        throw error;
                    }
                }
                
                // Check fee wallet ATA (if fee wallet is configured)
                if (feeWalletAddress) {
                    const feeWalletPubkey = new PublicKey(feeWalletAddress);
                    const feeWalletATA = await getAssociatedTokenAddress(
                        mintPubkey,
                        feeWalletPubkey,
                        true,
                        TOKEN_PROGRAM_ID
                    );
                    try {
                        await getAccount(connection, feeWalletATA);
                        console.log('✅ Fee wallet ATA already exists');
                    } catch (error: any) {
                        if (error.name === 'TokenAccountNotFoundError') {
                            estimatedRequiredSol += RENT_PER_ATA;
                            console.log('📝 Fee wallet ATA needs to be created (+0.00203928 SOL)');
                        } else {
                            throw error;
                        }
                    }
                }
                
                // Add 5% buffer for safety (reduced from 10% to be less strict)
                estimatedRequiredSol *= 1.05;
                
                console.log('🔍 SOL Balance Check (Accurate):', {
                    solBalance: solBalance.toFixed(6),
                    estimatedRequired: estimatedRequiredSol.toFixed(6),
                    hasEnough: solBalance >= estimatedRequiredSol,
                    difference: (solBalance - estimatedRequiredSol).toFixed(6)
                });
                
                if (solBalance < estimatedRequiredSol) {
                    // Round up to 4 decimal places for user-friendly message
                    const requiredRounded = Math.ceil(estimatedRequiredSol * 10000) / 10000;
                    throw new Error(`Insufficient SOL for transaction fees. You need approximately ${requiredRounded.toFixed(4)} SOL to pay for transaction fees and rent. You have ${solBalance.toFixed(4)} SOL available. Please add more SOL to your wallet.`);
                }
            }

            // Step 3: Build transaction using @solana/web3.js (compatible with @solana/kit@3.0.0)
            console.log('📝 Step 3: Building transaction...');
            
            const isNative = currentToken.isNative || currentToken.mint === 'So11111111111111111111111111111111111111112';
            
            // Create transaction
            const transaction = new Transaction();
            
            // Add memo instruction to show total amount (for Privy modal display)
            const totalAmount = numericAmount + feesToCollectInToken; // Gift + fees collected in token
            // Calculate USD value for memo if price is available
            const memoUsdValue = tokenPrice ? numericAmount * tokenPrice : null;
            const memoText = memoUsdValue !== null
                ? `Gift: $${memoUsdValue.toFixed(3)} USD (${numericAmount.toFixed(6)} ${currentToken.symbol}) to ${recipientLabel}${cardFeeAmount > 0 ? ' + Card' : ''}`
                : `Gift: ${numericAmount.toFixed(6)} ${currentToken.symbol} to ${recipientLabel}${cardFeeAmount > 0 ? ' + Card' : ''}`;
            const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
            transaction.add({
                keys: [{ pubkey: new PublicKey(embeddedWallet.address), isSigner: true, isWritable: false }],
                programId: MEMO_PROGRAM_ID,
                data: Buffer.from(memoText, 'utf-8'),
            });
            
            const senderPubkey = new PublicKey(embeddedWallet.address);
            const tipLinkPubkey = new PublicKey(tiplink_public_key);
            
            if (isNative) {
                // Native SOL transfer
                // Round lamports to integers to avoid floating-point precision errors
                const giftAmountLamports = Math.round(numericAmount * LAMPORTS_PER_SOL);
                const serviceFeeLamports = Math.round(serviceFeeAmount * LAMPORTS_PER_SOL);
                const cardFeeLamports = Math.round(cardFeeAmount * LAMPORTS_PER_SOL);
                const totalFeeLamports = serviceFeeLamports + cardFeeLamports;
                
                console.log(`💰 Transaction breakdown (SOL):`);
                console.log(`  Gift amount: ${numericAmount} ${currentToken.symbol} (${giftAmountLamports} lamports)`);
                console.log(`  Service fee: $1.00 = ${serviceFeeAmount.toFixed(6)} ${currentToken.symbol} (${serviceFeeLamports} lamports)`);
                if (cardFeeAmount > 0) {
                    console.log(`  Card fee: $1.00 = ${cardFeeAmount.toFixed(6)} ${currentToken.symbol} (${cardFeeLamports} lamports)`);
                }
                console.log(`  Total fees: ${totalFeeAmount.toFixed(6)} ${currentToken.symbol} (${totalFeeLamports} lamports)`);
                console.log(`  Total: ${numericAmount + totalFeeAmount} ${currentToken.symbol} (${giftAmountLamports + totalFeeLamports} lamports)`);
                
                // Add gift amount transfer to TipLink
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: senderPubkey,
                        toPubkey: tipLinkPubkey,
                        lamports: giftAmountLamports,
                    })
                );
                
                // Add fee transfer to fee wallet if configured (service fee + card fee)
                if (feeWalletAddress && totalFeeLamports > 0) {
                    console.log(`💼 Adding fee transfer to fee wallet: ${feeWalletAddress} (service + card fees)`);
                    transaction.add(
                        SystemProgram.transfer({
                            fromPubkey: senderPubkey,
                            toPubkey: new PublicKey(feeWalletAddress),
                            lamports: totalFeeLamports,
                        })
                    );
                } else if (totalFeeLamports > 0) {
                    console.warn('⚠️ Fee wallet not configured. Fee will not be collected.');
                }
            } else {
                // SPL Token transfer - dynamically import @solana/spl-token to ensure Buffer is available
                const splToken = await import('@solana/spl-token');
                const {
                    getAssociatedTokenAddress,
                    createTransferInstruction,
                    createAssociatedTokenAccountInstruction,
                    TOKEN_PROGRAM_ID,
                    getAccount
                } = splToken;
                
                const mintPubkey = new PublicKey(currentToken.mint);
                const decimals = currentToken.decimals || 9;
                
                // Convert amount to token's smallest unit (like lamports for SOL)
                const giftAmountRaw = Math.round(numericAmount * Math.pow(10, decimals));
                const serviceFeeRaw = Math.round(serviceFeeAmount * Math.pow(10, decimals));
                const cardFeeRaw = Math.round(cardFeeAmount * Math.pow(10, decimals));
                const totalFeesRaw = serviceFeeRaw + cardFeeRaw;
                const feesInTokenRaw = Math.round(feesToCollectInToken * Math.pow(10, decimals));
                
                console.log(`💰 Transaction breakdown (SPL Token):`);
                console.log(`  Gift amount: ${numericAmount} ${currentToken.symbol} (${giftAmountRaw} raw units)`);
                console.log(`  Service fee: $1.00 = ${serviceFeeAmount.toFixed(6)} ${currentToken.symbol} (${serviceFeeRaw} raw units)`);
                if (cardFeeAmount > 0) {
                    console.log(`  Card fee: $1.00 = ${cardFeeAmount.toFixed(6)} ${currentToken.symbol} (${cardFeeRaw} raw units)`);
                }
                console.log(`  Total fees: ${totalFeeAmount.toFixed(6)} ${currentToken.symbol} (${totalFeesRaw} raw units)`);
                console.log(`  Fees in token: ${feesToCollectInToken.toFixed(6)} ${currentToken.symbol} (${feesInTokenRaw} raw units)`);
                if (feesToCollectInSOL > 0) {
                    console.log(`  Fees in SOL (fallback): ${feesToCollectInSOL.toFixed(6)} ${currentToken.symbol}`);
                }
                console.log(`  Total: ${numericAmount + totalFeeAmount} ${currentToken.symbol} (${giftAmountRaw + totalFeesRaw} raw units)`);
                
                // Get associated token addresses (ATAs)
                const senderATA = await getAssociatedTokenAddress(
                    mintPubkey,
                    senderPubkey,
                    false, // allowOwnerOffCurve
                    TOKEN_PROGRAM_ID
                );
                
                const tipLinkATA = await getAssociatedTokenAddress(
                    mintPubkey,
                    tipLinkPubkey,
                    true, // allowOwnerOffCurve (TipLink might not have ATA yet)
                    TOKEN_PROGRAM_ID
                );
                
                // Check if sender ATA exists and has balance
                try {
                    const senderAccount = await getAccount(connection, senderATA);
                    console.log(`✅ Sender ATA exists: ${senderATA.toBase58()}, balance: ${senderAccount.amount.toString()}`);
                    
                    // Check if user has enough for gift + fees (or at least gift if fees will be collected in SOL)
                    const requiredInToken = giftAmountRaw + feesInTokenRaw;
                    if (senderAccount.amount < BigInt(requiredInToken)) {
                        const available = Number(senderAccount.amount) / Math.pow(10, decimals);
                        if (senderAccount.amount < BigInt(giftAmountRaw)) {
                            throw new Error(`Insufficient ${currentToken.symbol} balance. Required: ${numericAmount} ${currentToken.symbol} for gift. Available: ${available.toFixed(6)} ${currentToken.symbol}`);
                        }
                        // If we have enough for gift but not fees, fees will be collected in SOL
                        console.log(`⚠️ Not enough ${currentToken.symbol} for fees, will collect fees in SOL`);
                    }
                } catch (error: any) {
                    if (error.name === 'TokenAccountNotFoundError') {
                        throw new Error(`No ${currentToken.symbol} token account found. Please ensure you have ${currentToken.symbol} in your wallet.`);
                    }
                    throw error;
                }
                
                // Check if TipLink ATA exists, create if not
                try {
                    await getAccount(connection, tipLinkATA);
                    console.log(`✅ TipLink ATA exists: ${tipLinkATA.toBase58()}`);
                } catch (error: any) {
                    if (error.name === 'TokenAccountNotFoundError') {
                        console.log(`📝 Creating TipLink ATA: ${tipLinkATA.toBase58()}`);
                        transaction.add(
                            createAssociatedTokenAccountInstruction(
                                senderPubkey, // payer
                                tipLinkATA, // ata
                                tipLinkPubkey, // owner
                                mintPubkey, // mint
                                TOKEN_PROGRAM_ID
                            )
                        );
                    } else {
                        throw error;
                    }
                }
                
                // Add gift amount transfer to TipLink
                transaction.add(
                    createTransferInstruction(
                        senderATA, // source
                        tipLinkATA, // destination
                        senderPubkey, // owner
                        BigInt(giftAmountRaw), // amount
                        [], // multiSigners
                        TOKEN_PROGRAM_ID
                    )
                );
                
                // Add fee transfer to fee wallet if configured (service fee + card fee, collected in token)
                if (feeWalletAddress && feesToCollectInToken > 0) {
                    console.log(`💼 Adding fee transfer to fee wallet: ${feeWalletAddress} (service + card fees in ${currentToken.symbol})`);
                    const feeWalletPubkey = new PublicKey(feeWalletAddress);
                    const feeWalletATA = await getAssociatedTokenAddress(
                        mintPubkey,
                        feeWalletPubkey,
                        true, // allowOwnerOffCurve
                        TOKEN_PROGRAM_ID
                    );
                    
                    // Check if fee wallet ATA exists, create if not
                    try {
                        await getAccount(connection, feeWalletATA);
                        console.log(`✅ Fee wallet ATA exists: ${feeWalletATA.toBase58()}`);
                    } catch (error: any) {
                        if (error.name === 'TokenAccountNotFoundError') {
                            console.log(`📝 Creating fee wallet ATA: ${feeWalletATA.toBase58()}`);
                            transaction.add(
                                createAssociatedTokenAccountInstruction(
                                    senderPubkey, // payer
                                    feeWalletATA, // ata
                                    feeWalletPubkey, // owner
                                    mintPubkey, // mint
                                    TOKEN_PROGRAM_ID
                                )
                            );
                        } else {
                            throw error;
                        }
                    }
                    
                    transaction.add(
                        createTransferInstruction(
                            senderATA, // source
                            feeWalletATA, // destination
                            senderPubkey, // owner
                            BigInt(feesInTokenRaw), // amount (service + card fees)
                            [], // multiSigners
                            TOKEN_PROGRAM_ID
                        )
                    );
                } else if (feesToCollectInToken > 0) {
                    console.warn('⚠️ Fee wallet not configured. Fee will not be collected.');
                }
                
                // If fees need to be collected in SOL (fallback), add SOL transfer
                if (feesToCollectInSOL > 0 && feeWalletAddress) {
                    const solPrice = await priceService.getTokenPrice('So11111111111111111111111111111111111111112');
                    const feesInSOL = solPrice && solPrice > 0 ? feesToCollectInSOL / solPrice : 0;
                    const feesInSOLlamports = Math.round(feesInSOL * LAMPORTS_PER_SOL);
                    console.log(`💼 Adding SOL fee transfer to fee wallet: ${feeWalletAddress} (${feesInSOL.toFixed(6)} SOL for fees)`);
                    transaction.add(
                        SystemProgram.transfer({
                            fromPubkey: senderPubkey,
                            toPubkey: new PublicKey(feeWalletAddress),
                            lamports: feesInSOLlamports,
                        })
                    );
                }
            }

            // ✅ CRITICAL: Get fresh blockhash RIGHT BEFORE signing (prevents expiration)
            console.log('🔄 Getting fresh blockhash for transaction...');
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
            
            // Set transaction properties
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = new PublicKey(embeddedWallet.address);
            
            // ✅ Set last valid block height to prevent expiration
            if (lastValidBlockHeight) {
                transaction.lastValidBlockHeight = lastValidBlockHeight;
            }
            
            console.log(`✅ Transaction blockhash: ${blockhash.substring(0, 8)}... (valid until block ${lastValidBlockHeight})`);

            // Step 3.5: Simulate transaction to catch errors early (before serialization)
            console.log('🔍 Step 3.5: Simulating transaction to check for errors...');
            try {
                // For @solana/web3.js v1.98.4, simulateTransaction accepts Transaction object directly
                // No options needed - it will use defaults and handle blockhash automatically
                const simulation = await connection.simulateTransaction(transaction);
                
                if (simulation.value.err) {
                    const errorMessage = parseSimulationError(simulation.value.err);
                    console.error('❌ Transaction simulation failed:', simulation.value.err);
                    console.error('📋 Simulation logs:', simulation.value.logs);
                    if (simulation.value.logs) {
                        console.error('📋 Full simulation logs:', simulation.value.logs.join('\n'));
                    }
                    throw new Error(errorMessage);
                }
                
                console.log('✅ Transaction simulation passed:', {
                    fee: simulation.value.fee ? `${(simulation.value.fee / LAMPORTS_PER_SOL).toFixed(6)} SOL` : 'N/A',
                    unitsConsumed: simulation.value.unitsConsumed || 'N/A',
                });
            } catch (simError: any) {
                console.error('❌ Transaction simulation error:', simError);
                
                // If it's an API error (Invalid arguments), log warning but don't block transaction
                // The transaction will still be validated when sent to the network
                // Gas fees will be paid in SOL automatically by Solana network
                if (simError.message?.includes('Invalid arguments') || simError.message?.includes('simulateTransaction')) {
                    console.warn('⚠️ Simulation API error - proceeding without simulation. Transaction will be validated on send.');
                    console.warn('💡 Gas fees will be automatically deducted from SOL balance when transaction is sent.');
                    // Don't throw - allow transaction to proceed
                } else if (simError.message && !simError.message.includes('simulation') && !simError.message.includes('Transaction simulation')) {
                    // If it's a real simulation error (like insufficient funds), throw it
                    throw simError;
                } else {
                    // Otherwise, parse and throw
                    const errorMessage = parseTransactionError(simError);
                    throw new Error(errorMessage);
                }
            }

            // Serialize transaction to Uint8Array (required by Privy's signAndSendTransaction)
            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false,
            });

            console.log('✅ Transaction built and serialized successfully');

            // Step 4: Sign and send transaction using Privy's Solana hook
            console.log('📝 Step 4: Signing and sending transaction...');
            
            let signatureString: string;
            let result: any;

            try {
                // ✅ Send transaction immediately after building (prevents blockhash expiration)
                result = await signAndSendTransaction({
                    transaction: serializedTransaction,
                    wallet: embeddedWallet,
                    chain: 'solana:mainnet',
                });
                
                // Normal success path
                const signature = result.signature as string | Uint8Array;
                
                if (typeof signature === 'string') {
                    if (signature.includes('/') || signature.includes('+') || signature.includes('=')) {
                        const signatureBytes = Buffer.from(signature, 'base64');
                        signatureString = bs58.encode(signatureBytes);
                    } else {
                        signatureString = signature;
                    }
                } else if (signature instanceof Uint8Array) {
                    signatureString = bs58.encode(signature);
                } else {
                    throw new Error(`Unknown signature format: ${typeof signature}`);
                }
                
                console.log('✅ Transaction sent (success path):', signatureString);
                
            } catch (error: any) {
                // Log detailed error information for debugging
                console.error('❌ Transaction failed:', error);
                console.error('📋 Error details:', {
                    message: error?.message,
                    code: error?.code,
                    name: error?.name,
                    stack: error?.stack,
                    data: error?.data,
                    transaction: error?.transaction,
                });
                
                // Check if error contains a signature (unlikely if transaction failed)
                if (error?.signature) {
                    console.log('⚠️ Found signature in error object, checking if transaction succeeded...');
                    const sig = error.signature;
                    
                    if (typeof sig === 'string') {
                        signatureString = sig.includes('/') || sig.includes('+') || sig.includes('=')
                            ? bs58.encode(Buffer.from(sig, 'base64'))
                            : sig;
                    } else if (sig instanceof Uint8Array) {
                        signatureString = bs58.encode(sig);
                    } else {
                        throw new Error('Could not extract signature from error');
                    }
                    
                    // Verify transaction actually succeeded
                    try {
                        const tx = await connection.getTransaction(signatureString, {
                            commitment: 'confirmed',
                        });
                        
                        if (tx && tx.meta?.err === null) {
                            console.log('✅ Transaction actually succeeded despite error!');
                            // Continue with success flow
                        } else {
                            const onChainError = parseSimulationError(tx?.meta?.err);
                            throw new Error(onChainError);
                        }
                    } catch (verifyError: any) {
                        const errorMessage = parseTransactionError(verifyError);
                        throw new Error(errorMessage);
                    }
                } else {
                    // Transaction definitely failed - parse error for user-friendly message
                    const errorMessage = parseTransactionError(error);
                    throw new Error(errorMessage);
                }
            }

            console.log('✅ Transaction signature:', signatureString);
            console.log('⏳ Waiting for confirmation...');

            // Wait for confirmation - this will verify the transaction actually succeeded
            try {
                const confirmation = await connection.confirmTransaction(signatureString, 'confirmed');
                console.log('✅ Transaction confirmed!', confirmation);
            } catch (confirmError: any) {
                // If confirmation fails, check if transaction exists on-chain
                console.log('⚠️ Confirmation failed, checking if transaction exists on-chain...');
                const tx = await connection.getTransaction(signatureString, {
                    commitment: 'confirmed',
                });
                
                if (tx && tx.meta?.err === null) {
                    console.log('✅ Transaction found on-chain and succeeded!');
                } else if (tx) {
                    throw new Error(`Transaction failed on-chain: ${tx.meta?.err}`);
                } else {
                    throw new Error('Transaction not found on-chain. Please check your wallet and try again.');
                }
            }

            // Step 3: Create gift record on backend
            console.log('🎁 Step 3: Creating gift record...');
            
            const createResponse = await giftService.createGift({
                recipient_email: recipientEmail,
                token_mint: currentToken.mint,
                amount: numericAmount,
                message: message,
                sender_did: user.privy_did,
                tiplink_url,
                tiplink_public_key,
                funding_signature: signatureString,
                token_symbol: currentToken.symbol,
                token_decimals: currentToken.decimals,
                card_type: selectedCard || null,
                card_recipient_name: recipientName || null,
                card_price_usd: selectedCard ? CARD_UPSELL_PRICE : undefined,
            });

            const { claim_url, gift_id } = createResponse;
            console.log('✅ Gift created! Gift ID:', gift_id);
            console.log('📋 Claim URL from API:', claim_url);

            // Construct the correct claim URL
            // The API should return '/claim?token=...' format
            let finalClaimUrl: string;

            // Check if claim_url is already a full URL
            if (claim_url && claim_url.startsWith('http')) {
                // If it's already a full URL, check if it's the correct format
                if (claim_url.includes('/claim?token=')) {
                    // It's already a full claim URL, use it as-is
                    finalClaimUrl = claim_url;
                } else if (claim_url.includes('tiplink.io')) {
                    // It's a TipLink URL (wrong format from API) - this is a server bug
                    console.error('❌ API returned TipLink URL instead of claim URL. This is a server bug.');
                    console.error('   TipLink URL:', claim_url);
                    console.error('   Gift ID:', gift_id);
                    // Use TipLink URL as-is to avoid double URL issue
                    // Note: This is incorrect - the server should return the claim URL
                    finalClaimUrl = claim_url;
                } else {
                    // It's a full URL but not in expected format
                    console.warn('⚠️ Unexpected URL format from API:', claim_url);
                    finalClaimUrl = claim_url;
                }
            } else {
                // It's a relative path (expected format: '/claim?token=...')
                // Construct full URL
                finalClaimUrl = `${window.location.origin}${claim_url}`;
            }

            // Generate QR code for the claim URL
            const qrCodeDataUrl = await QRCode.toDataURL(finalClaimUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#0c4a6e',
                    light: '#ffffff'
                }
            });

            // Use USD value from confirmDetails if available, otherwise calculate from tokenPrice
            const giftUsdValue = confirmDetails?.usdValue !== null && confirmDetails?.usdValue !== undefined
                ? confirmDetails.usdValue
                : (tokenPrice ? numericAmount * tokenPrice : null);
            
            // Close confirmation modal
            setShowConfirmModal(false);
            setConfirmDetails(null);
            
            // Trigger confetti
            triggerConfetti();
            
            // Show success toast
            showToast({
                type: 'success',
                message: 'Gift link created successfully!',
                actionLabel: 'Copy',
                onAction: () => copyToClipboard(finalClaimUrl),
                duration: 10000,
            });
            
            // Set gift details and show success modal
            setGiftDetails({
                claim_url: finalClaimUrl,
                amount: numericAmount.toString(),
                token: currentToken.symbol,
                usdValue: giftUsdValue,
                recipient: recipientLabel,
                signature: signatureString,
                qrCode: qrCodeDataUrl
            });
            setShowSuccessModal(true);
            
            // Update user balance
            await refreshUser();
            
            // Clear form and reset steps
            setRecipientInput('');
            setResolvedRecipient(null);
            setRecipientError(null);
            setResolvingRecipient(false);
            setAmount('');
            setTokenAmount('');
            setUsdAmount('');
            setMessage('');
            setAmountMode('usd');
            setSelectedCard(null);
            setRecipientName('');
            setCurrentStep(1);
            setCompletedSteps([]);
            setQuickAmountSelected(null);
            
        } catch (err: any) {
            console.error('❌ Error sending gift:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to send gift. Please try again.';
            showToast({
                type: 'error',
                message: errorMessage,
                duration: 8000,
            });
            setError(errorMessage);
            // Close confirmation modal on error
            setShowConfirmModal(false);
            setConfirmDetails(null);
        } finally {
            setIsSending(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast({
                type: 'success',
                message: 'Link copied to clipboard!',
            });
        } catch (err) {
            showToast({
                type: 'error',
                message: 'Failed to copy link',
            });
        }
    };

    // Handle pre-filled state from QuickSendCard
    useEffect(() => {
        const state = location.state as any;
        if (state?.recipient) {
            setRecipientInput(state.recipient);
        }
        if (state?.amount) {
            setUsdAmount(state.amount);
            setQuickAmountSelected(state.amount);
            setAmountMode('usd');
        }
        if (state?.tokenMint && tokens.length > 0) {
            const token = tokens.find(t => t.mint === state.tokenMint);
            if (token) {
                setSelectedToken(token);
            }
        }
    }, [location.state, tokens]);

    // Step navigation functions
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return Boolean(trimmedRecipient && (!isUsernameRecipient || resolvedRecipientEmail));
            case 2:
                const numAmount = amountMode === 'usd' && tokenPrice
                    ? parseFloat(usdAmount) / tokenPrice
                    : parseFloat(amount || tokenAmount);
                return Boolean(selectedToken && numAmount > 0 && !balanceError);
            case 3:
                return true; // Optional step
            case 4:
                return validateStep(1) && validateStep(2);
            default:
                return false;
        }
    };

    const goToStep = (step: number) => {
        if (step < currentStep || completedSteps.includes(step)) {
            setCurrentStep(step as 1 | 2 | 3 | 4);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (validateStep(currentStep)) {
            setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
            setCurrentStep(step as 1 | 2 | 3 | 4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 4) {
                setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
                setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Step 4: Submit
                handleReviewSubmit();
            }
        }
    };

    const handleReviewSubmit = () => {
        // Prepare confirmation details and show review
        const numericAmount = amountMode === 'usd' && tokenPrice
            ? parseFloat(usdAmount) / tokenPrice
            : parseFloat(amount || tokenAmount);
        
        if (isNaN(numericAmount) || numericAmount <= 0) {
            showToast({
                type: 'error',
                message: 'Please enter a valid amount',
            });
            return;
        }

        const FLAT_SERVICE_FEE_USD = 1.00;
        const serviceFeeAmount = tokenPrice && tokenPrice > 0 
            ? FLAT_SERVICE_FEE_USD / tokenPrice 
            : 0;
        
        const hasCard = !!selectedCard;
        const CARD_FEE_USD = 1.00;
        const cardFeeInTokens = hasCard && tokenPrice && tokenPrice > 0
            ? CARD_FEE_USD / tokenPrice
            : 0;
        
        const totalFeeAmount = serviceFeeAmount + cardFeeInTokens;
        const totalAmount = numericAmount + totalFeeAmount;
        const remainingBalance = userBalance - totalAmount;

        setConfirmDetails({
            recipientLabel: recipientDisplayLabel || resolvedRecipientEmail,
            recipientEmail: resolvedRecipientEmail,
            amount: numericAmount,
            fee: serviceFeeAmount,
            total: totalAmount,
            token: selectedToken?.symbol || 'SOL',
            tokenName: selectedToken?.name || 'Solana',
            usdValue: tokenPrice ? numericAmount * tokenPrice : null,
            usdFee: tokenPrice ? serviceFeeAmount * tokenPrice : null,
            usdTotal: tokenPrice ? totalAmount * tokenPrice : null,
            remainingBalance,
            remainingBalanceUsd: tokenPrice ? remainingBalance * tokenPrice : null,
            message,
            cardFee: cardFeeInTokens,
            cardFeeUsd: tokenPrice ? cardFeeInTokens * tokenPrice : null,
            hasCard,
        });
        setShowConfirmModal(true);
    };

    // Handle quick amount selection
    const handleQuickAmountSelect = (amount: string | null) => {
        setQuickAmountSelected(amount);
        setSuggestedAmountSelected(null); // Clear suggested amount when using quick chips
        if (amount && amount !== 'custom') {
            setUsdAmount(amount);
            if (tokenPrice && tokenPrice > 0) {
                const tokens = (parseFloat(amount) / tokenPrice).toFixed(6);
                setTokenAmount(tokens);
                setAmount(tokens);
            }
        } else if (amount === 'custom') {
            setUsdAmount('');
            setTokenAmount('');
            setAmount('');
        }
    };

    // Handle suggested amount selection
    const handleSuggestedAmountSelect = (amount: number) => {
        setSuggestedAmountSelected(amount);
        setQuickAmountSelected(null); // Clear quick chips when using suggested
        setUsdAmount(amount.toString());
        if (tokenPrice && tokenPrice > 0) {
            const tokens = (amount / tokenPrice).toFixed(6);
            setTokenAmount(tokens);
            setAmount(tokens);
        }
    };

    // Handle Max button
    const handleMaxAmount = () => {
        if (!selectedToken || !tokenPrice || tokenPrice <= 0) return;
        
        // Calculate max amount (balance - fees)
        const FLAT_SERVICE_FEE_USD = 1.00;
        const serviceFeeAmount = FLAT_SERVICE_FEE_USD / tokenPrice;
        const hasCard = !!selectedCard;
        const CARD_FEE_USD = 1.00;
        const cardFeeInTokens = hasCard ? CARD_FEE_USD / tokenPrice : 0;
        const totalFeeAmount = serviceFeeAmount + cardFeeInTokens;
        
        const maxAmount = Math.max(0, userBalance - totalFeeAmount);
        const maxUsd = maxAmount * tokenPrice;
        
        setTokenAmount(maxAmount.toFixed(6));
        setUsdAmount(maxUsd.toFixed(2));
        setAmount(maxAmount.toFixed(6));
        setAmountMode('token');
    };

    // Calculate preview values
    const previewAmount = useMemo(() => {
        if (amountMode === 'usd' && tokenPrice && usdAmount) {
            return parseFloat(usdAmount) / tokenPrice;
        }
        return parseFloat(amount || tokenAmount) || 0;
    }, [amountMode, tokenPrice, usdAmount, amount, tokenAmount]);

    const previewUsdValue = useMemo(() => {
        if (tokenPrice && previewAmount > 0) {
            return previewAmount * tokenPrice;
        }
        return null;
    }, [tokenPrice, previewAmount]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }).format(value);
    };

    // Get theme-aware colors
    const getColors = () => {
        if (theme === 'christmas') {
            return {
                primary: '#EB6A46',
                glow: 'rgba(235, 106, 70, 0.3)',
            };
        }
        if (theme === 'newyear') {
            return {
                primary: '#FCD34D',
                glow: 'rgba(252, 211, 77, 0.3)',
            };
        }
        return {
            primary: '#06B6D4',
            glow: 'rgba(6, 182, 212, 0.3)',
        };
    };

    const colors = getColors();

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 animate-fade-in-up pb-24">
            {/* Lightweight Confirmation Modal */}
            {showConfirmModal && confirmDetails && (
                <div className="fixed inset-0 bg-[#0B1120]/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <GlassCard className="max-w-md w-full animate-scale-in relative">
                        {/* Loading Overlay */}
                        {isSending && (
                            <div className="absolute inset-0 bg-[#0B1120]/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10">
                                <Spinner size="8" color="border-[#06B6D4]" />
                                <p className="text-white font-medium mt-4 text-lg">Processing Transaction...</p>
                                <p className="text-[#94A3B8] text-sm mt-2">Please wait while we sign and send your gift</p>
                            </div>
                        )}
                        
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Confirm Gift</h2>
                            <p className="text-[#94A3B8] text-sm">
                                Confirm sending {confirmDetails.usdTotal !== null ? formatCurrency(confirmDetails.usdTotal) : `$${confirmDetails.total.toFixed(2)}`} gift?
                            </p>
                        </div>
                        
                        {/* Simple Summary */}
                        <div className="bg-[#0F172A]/30 rounded-lg p-4 mb-6 border border-white/5 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">To:</span>
                                <span className="text-white font-medium">{confirmDetails.recipientLabel}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">Amount:</span>
                                <span className="text-white font-medium">
                                    {confirmDetails.usdValue !== null ? formatCurrency(confirmDetails.usdValue) : `${confirmDetails.amount.toFixed(4)} ${confirmDetails.token}`}
                                </span>
                            </div>
                            {confirmDetails.usdTotal && (
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-base font-bold text-white">Total:</span>
                                    <span className="text-lg font-bold" style={{ color: colors.primary }}>
                                        {formatCurrency(confirmDetails.usdTotal)}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <GlowButton
                                variant="secondary"
                                fullWidth
                                onClick={() => {
                                    if (!isSending) {
                                        setShowConfirmModal(false);
                                        setConfirmDetails(null);
                                    }
                                }}
                                disabled={isSending}
                            >
                                Cancel
                            </GlowButton>
                            <GlowButton
                                variant="cyan"
                                fullWidth
                                onClick={handleConfirmSend}
                                disabled={isSending}
                            >
                                {isSending ? 'Creating...' : 'Confirm & Send'}
                            </GlowButton>
                        </div>
                    </GlassCard>
                </div>
            )}
            
            {/* Success Modal */}
            {showSuccessModal && giftDetails && (
                <div className="fixed inset-0 bg-[#0B1120]/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <GlassCard className="max-w-lg w-full animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#064E3B]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#10B981]/20">
                                <Check size={32} className="text-[#10B981]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Gift Sent!</h2>
                            <p className="text-[#94A3B8] mb-8">Your gift has been sent successfully</p>
                        </div>

                        {/* Gift Details */}
                        <div className="bg-[#0F172A]/30 rounded-lg p-4 mb-6 border border-white/5">
                            <p className="text-3xl font-bold text-white text-center mb-2">
                                {giftDetails.usdValue !== null ? (
                                    `$${giftDetails.usdValue.toFixed(3)}`
                                ) : (
                                    `${parseFloat(giftDetails.amount).toFixed(3)} ${giftDetails.token}`
                                )}
                            </p>
                            {giftDetails.usdValue !== null && (
                                <p className="text-[#94A3B8] text-sm text-center">{parseFloat(giftDetails.amount).toFixed(3)} {giftDetails.token}</p>
                            )}
                            <p className="text-[#94A3B8] text-sm text-center mt-2">To: {giftDetails.recipient}</p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-4 rounded-2xl inline-block mx-auto mb-6">
                            <img src={giftDetails.qrCode} alt="Gift QR Code" className="w-48 h-48" />
                        </div>

                        {/* Gift Link */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Gift Link</label>
                            <div className="bg-[#0F172A] p-4 rounded-xl flex items-center justify-between border border-white/10">
                                <span className="text-[#FCD34D] text-sm truncate mr-4 font-mono">{giftDetails.claim_url}</span>
                                <GlowButton
                                    variant="secondary"
                                    className="!py-2 !px-4 !text-xs flex-shrink-0"
                                    onClick={() => copyToClipboard(giftDetails.claim_url)}
                                    icon={Copy}
                                >
                                Copy Link
                                </GlowButton>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <GlowButton
                                variant="cyan"
                                fullWidth
                                icon={Mail}
                                onClick={() => {
                                    const subject = encodeURIComponent('You received a crypto gift!');
                                    const body = encodeURIComponent(`You've received a gift! Claim it here: ${giftDetails.claim_url}`);
                                    window.open(`mailto:?subject=${subject}&body=${body}`);
                                }}
                            >
                                Send via Email
                            </GlowButton>
                            <a
                                href={`https://solscan.io/tx/${giftDetails.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <GlowButton
                                    variant="secondary"
                                    fullWidth
                                    icon={ArrowUpRight}
                                >
                                    View Transaction
                                </GlowButton>
                            </a>
                            <GlowButton
                                variant="primary"
                                fullWidth
                            onClick={() => {
                                setShowSuccessModal(false);
                                setGiftDetails(null);
                                    navigate('/');
                            }}
                        >
                            Done
                            </GlowButton>
                    </div>
                    </GlassCard>
                </div>
            )}

            {/* Show popup if user has active credit */}
            {showCreditPopup && onrampCredit && (
                <OnrampCreditPopup
                    credit={onrampCredit}
                    onClose={() => setShowCreditPopup(false)}
                />
            )}

            {/* Greeting Card Modal */}
            <GreetingCardModal
                isOpen={showGreetingCardModal}
                onClose={() => setShowGreetingCardModal(false)}
                selectedCard={selectedCard}
                onSelect={(cardId) => {
                    setSelectedCard(cardId || null);
                    setShowGreetingCardModal(false);
                }}
                recipientName={recipientName}
            />

            {/* Back Button */}
            <PageHeader
                title="Send a Gift"
                subtitle="Create a gift link your recipient can claim in minutes"
                breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Send Gift' }]}
            />
            
            {/* Main Content: 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form Steps */}
                <div className="lg:col-span-8 space-y-6">
                {showFormSkeleton ? (
                        <GlassCard>
                    <div className="p-8">
                    <GiftFormSkeleton />
                    </div>
                        </GlassCard>
                ) : (
                    <>
                            {/* Stepper */}
                            <Stepper
                                currentStep={currentStep}
                                completedSteps={completedSteps}
                                onStepClick={goToStep}
                            />

                            {/* Step Content */}
                            <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        ref={(el) => {
                                            if (el) stepRefs.current[currentStep] = el;
                                        }}
                                        aria-live="polite"
                                        aria-atomic="true"
                                    >
                                    <GlassCard>
                                        {/* Step 1: Who is it for? */}
                                        {currentStep === 1 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="space-y-6"
                                                aria-labelledby="step-1-title"
                                            >
                                                <div>
                                                    <h2 id="step-1-title" className="text-2xl font-bold text-white mb-2">Who are you gifting?</h2>
                                                    <p className="text-sm text-[#94A3B8]">We'll send a secure claim link. No wallet address needed. They claim using email/phone via Privy.</p>
                                                </div>

                                                <InputField
                                                    label="Recipient (email or phone)"
                                                    placeholder="recipient@example.com"
                                                    value={recipientInput}
                                                    onChange={(e) => setRecipientInput(e.target.value)}
                                                    required
                                                    icon={Mail}
                                                    error={recipientError || undefined}
                                                />

                                                <AnimatePresence mode="wait">
                                                    {isUsernameRecipient ? (
                                                        <>
                                                            {resolvingRecipient && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -5 }}
                                                                    className="flex items-center gap-2 text-sm"
                                                                >
                                                                    <motion.div
                                                                        className="w-4 h-4 border-2 border-[#06B6D4] border-t-transparent rounded-full"
                                                                        animate={{ rotate: 360 }}
                                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                                    />
                                                                    <span className="text-[#94A3B8]">Resolving username...</span>
                                                                </motion.div>
                                                            )}
                                                            {!resolvingRecipient && resolvedRecipient && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                                    className="flex items-center gap-2 text-sm"
                                                                >
                                                                    <motion.div
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                                                        className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center"
                                                                    >
                                                                        <Check size={14} className="text-white" />
                                                                    </motion.div>
                                                                    <span className="text-[#10B981] font-medium">
                                                                        Username linked to {resolvedRecipient.email}
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        trimmedRecipient && (
                                                            <motion.p
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="text-sm text-[#94A3B8]"
                                                            >
                                                                Gift will be sent to {trimmedRecipient}
                                                            </motion.p>
                                                        )
                                                    )}
                                                </AnimatePresence>

                                                <GlowButton
                                                    variant="cyan"
                                                    fullWidth
                                                    onClick={handleNextStep}
                                                    disabled={!validateStep(1)}
                                                >
                                                    Continue
                                                </GlowButton>
                                            </motion.div>
                                        )}

                                        {/* Step 2: What are you sending? */}
                                        {currentStep === 2 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="space-y-6"
                                                aria-labelledby="step-2-title"
                                            >
                                                <div>
                                                    <h2 id="step-2-title" className="text-2xl font-bold text-white mb-2">What are you sending?</h2>
                                                    <p className="text-sm text-[#94A3B8]">Enter the gift amount</p>
                        </div>

                                                {/* Asset Selector (collapsed by default) */}
                                                {tokens.length > 0 && (
                                                    <AssetSelector
                                                        tokens={tokens}
                                                        selectedToken={selectedToken}
                                                        onSelect={(token) => {
                                                            setSelectedToken(token);
                                                            setAmount('');
                                                            setTokenAmount('');
                                                            setUsdAmount('');
                                                            setQuickAmountSelected(null);
                                                        }}
                                                        balances={walletBalances}
                                                        defaultToken={defaultToken}
                                                    />
                                                )}

                                                {/* Amount Input - USD First */}
                                                {selectedToken && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1">
                                                                Gift Amount
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={handleMaxAmount}
                                                                className="text-xs text-[#06B6D4] hover:text-[#0891B2] font-medium"
                                                            >
                                                                Max
                                                            </button>
                                                        </div>

                                                        {/* USD Input (Primary) */}
                                                        <InputField
                                                            type="number"
                                                            value={usdAmount}
                                                            onChange={async (e) => {
                                                                const value = e.target.value;
                                                                setUsdAmount(value);
                                                                if (tokenPrice) {
                                                                    const calculatedTokenAmount = (parseFloat(value) / tokenPrice).toString();
                                                                    setTokenAmount(calculatedTokenAmount);
                                                                    setAmount(calculatedTokenAmount);
                                                                    const numValue = parseFloat(calculatedTokenAmount);
                                                                    if (!isNaN(numValue) && numValue > 0) {
                                                                        await validateBalance(numValue);
                                                                    }
                                                                }
                                                                setBalanceError(null);
                                                            }}
                                                            required
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            rightElement={<span className="text-[#94A3B8]">$</span>}
                                                            error={balanceError || undefined}
                                                        />

                                                        {/* Crypto Conversion (Secondary, small) */}
                                                        {tokenPrice && usdAmount && !isNaN(parseFloat(usdAmount)) && parseFloat(usdAmount) > 0 && (
                                                            <div className="mt-2 text-sm text-[#94A3B8]">
                                                                <span>≈ {(parseFloat(usdAmount) / tokenPrice).toFixed(4)} {selectedToken?.symbol}</span>
                                                            </div>
                                                        )}

                                                        {/* Advanced Toggle (Hidden by default, show as link) */}
                                                        <div className="mt-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newMode = amountMode === 'usd' ? 'token' : 'usd';
                                                                    handleModeSwitch(newMode);
                                                                }}
                                                                className="text-xs text-[#64748B] hover:text-[#94A3B8] underline"
                                                            >
                                                                {amountMode === 'usd' ? 'Enter token amount instead' : 'Enter USD amount instead'}
                                                            </button>
                                                        </div>

                                                        {/* Token Amount Input (Only shown when in token mode) */}
                                                        {amountMode === 'token' && (
                                                            <div className="mt-4">
                                                                <InputField
                                                                    type="number"
                                                                    value={tokenAmount}
                                                                    onChange={async (e) => {
                                                                        const value = e.target.value;
                                                                        setTokenAmount(value);
                                                                        setAmount(value);
                                                                        setBalanceError(null);
                                                                        const numValue = parseFloat(value);
                                                                        if (!isNaN(numValue) && numValue > 0) {
                                                                            await validateBalance(numValue);
                                                                        }
                                                                    }}
                                                                    required
                                                                    min="0"
                                                                    step="0.000001"
                                                                    placeholder="0.00"
                                                                    rightElement={<span className="text-[#94A3B8]">{selectedToken?.symbol}</span>}
                                                                    error={balanceError || undefined}
                                                                />
                                                                {tokenPrice && tokenAmount && !isNaN(parseFloat(tokenAmount)) && (
                                                                    <div className="mt-2 text-sm text-[#94A3B8]">
                                                                        <span>≈ ${(parseFloat(tokenAmount) * tokenPrice).toFixed(2)} USD</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Balance Resolution Panel */}
                                                        {balanceError && (
                                                            <div className="mt-4">
                                                                <BalanceResolutionPanel
                                                                    balanceError={balanceError}
                                                                    currentBalance={userBalance}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Suggested Holiday Amounts */}
                                                {selectedToken && tokenPrice && tokenPrice > 0 && (
                                                    <SuggestedAmounts
                                                        onAmountSelect={handleSuggestedAmountSelect}
                                                        selectedAmount={suggestedAmountSelected}
                                                        tokenPrice={tokenPrice}
                                                        tokenSymbol={selectedToken?.symbol}
                                                    />
                                                )}

                                                {/* Quick Amount Chips */}
                                                {selectedToken && tokenPrice && tokenPrice > 0 && (
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1 mb-3 block">
                                                            Or choose an amount
                                                        </label>
                                                        <QuickAmountChips
                                                            onAmountSelect={handleQuickAmountSelect}
                                                            selectedAmount={quickAmountSelected}
                                                            tokenPrice={tokenPrice}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex gap-3">
                                                    <GlowButton
                                                        variant="secondary"
                                                        fullWidth
                                                        onClick={() => goToStep(1)}
                                                    >
                                                        Back
                                                    </GlowButton>
                                                    <GlowButton
                                                        variant="cyan"
                                                        fullWidth
                                                        onClick={handleNextStep}
                                                        disabled={!validateStep(2)}
                                                    >
                                                        Continue
                                                    </GlowButton>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 3: Make it personal */}
                                        {currentStep === 3 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="space-y-6"
                                                aria-labelledby="step-3-title"
                                            >
                                                <div>
                                                    <h2 id="step-3-title" className="text-2xl font-bold text-white mb-2">Make it personal</h2>
                                                    <p className="text-sm text-[#94A3B8]">Add a greeting card and message to make your gift extra special</p>
                                                </div>

                                                {/* Greeting Card Section */}
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1 mb-3 block">
                                                        Greeting Card
                                                    </label>
                                                    <Suspense fallback={<div className="h-24 rounded-xl bg-[#1E293B]/40 animate-pulse" />}>
                                                        <CardUpsellSection
                                                            recipientName={recipientName}
                                                            selectedCard={selectedCard}
                                                            onCardSelect={setSelectedCard}
                                                            onOpenModal={() => setShowGreetingCardModal(true)}
                                                        />
                                                    </Suspense>
                                                </div>

                                                {/* Message Box */}
                                                <div>
                                                    <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] ml-1 mb-2 block">
                                                        Add a note (optional)
                                                    </label>
                                                    <div className="space-y-3">
                                                        {/* Example Prompts */}
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Happy holidays 🎁', 'Thanks for always being there.', 'Thinking of you!'].map((prompt, index) => (
                                                                <motion.button
                                                                    key={prompt}
                                                                    type="button"
                                                                    onClick={() => setMessage(prompt)}
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: index * 0.1 }}
                                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="px-3 py-1.5 rounded-lg text-xs bg-[#0F172A]/50 text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border border-white/10 transition-all"
                                                                >
                                                                    {prompt}
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                        <motion.div
                                                            className="relative"
                                                            whileFocus={{ scale: 1.01 }}
                                                        >
                                                            <textarea
                                                                id="message"
                                                                value={message}
                                                                onChange={(e) => setMessage(e.target.value)}
                                                                placeholder="Write a personal message..."
                                                                rows={4}
                                                                maxLength={500}
                                                                className="w-full bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-[#475569] outline-none focus:border-[#BE123C] focus:ring-4 focus:ring-[#BE123C]/10 focus:bg-[#0F172A] transition-all resize-none"
                                                                style={{
                                                                    borderColor: message.length > 450 ? '#EF4444' : undefined,
                                                                    ringColor: message.length > 450 ? 'rgba(239, 68, 68, 0.1)' : undefined,
                                                                }}
                                                            />
                                                        </motion.div>
                                                        <motion.div
                                                            className="flex justify-between text-xs"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                        >
                                                            <span className="text-[#64748B]">Character count</span>
                                                            <motion.span
                                                                className={`font-medium ${
                                                                    message.length > 450
                                                                        ? 'text-[#EF4444]'
                                                                        : message.length > 400
                                                                        ? 'text-[#FCD34D]'
                                                                        : 'text-[#94A3B8]'
                                                                }`}
                                                                animate={message.length > 450 ? {
                                                                    scale: [1, 1.1, 1],
                                                                } : {}}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                {message.length} / 500
                                                            </motion.span>
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <GlowButton
                                                        variant="secondary"
                                                        fullWidth
                                                        onClick={() => goToStep(2)}
                                                    >
                                                        Back
                                                    </GlowButton>
                                                    <GlowButton
                                                        variant="cyan"
                                                        fullWidth
                                                        onClick={handleNextStep}
                                                    >
                                                        Continue
                                                    </GlowButton>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 4: Review & Send */}
                                        {currentStep === 4 && (
                                            !confirmDetails ? (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-white mb-2">Review Your Gift</h2>
                                                        <p className="text-sm text-[#94A3B8]">Preparing your gift summary...</p>
                                                    </div>
                                                    <GlowButton
                                                        variant="cyan"
                                                        fullWidth
                                                        onClick={handleReviewSubmit}
                                                        disabled={!validateStep(1) || !validateStep(2)}
                                                    >
                                                        Review Gift
                                                    </GlowButton>
                                                </div>
                                            ) : (
                                            <ReviewStep
                                                recipientLabel={confirmDetails.recipientLabel}
                                                recipientEmail={confirmDetails.recipientEmail}
                                                amount={confirmDetails.amount}
                                                tokenSymbol={confirmDetails.token}
                                                tokenName={confirmDetails.tokenName}
                                                usdValue={confirmDetails.usdValue}
                                                message={confirmDetails.message}
                                                selectedCard={selectedCard || null}
                                                serviceFee={confirmDetails.fee}
                                                cardFee={confirmDetails.cardFee}
                                                total={confirmDetails.total}
                                                usdServiceFee={confirmDetails.usdFee}
                                                usdCardFee={confirmDetails.cardFeeUsd}
                                                usdTotal={confirmDetails.usdTotal}
                                                remainingBalance={confirmDetails.remainingBalance}
                                                remainingBalanceUsd={confirmDetails.remainingBalanceUsd}
                                                onEditStep={goToStep}
                                                onSubmit={handleReviewSubmit}
                                                isSubmitting={isSending}
                                                disabled={!!balanceError}
                                            />
                                            )
                                        )}
                                    </GlassCard>
                                    </motion.div>
                                </AnimatePresence>
                        </>
                    )}
                </div>

                {/* Right Column: Gift Preview */}
                <div className="lg:col-span-4">
                    {/* Mobile: Collapsible Preview */}
                    <div className="lg:hidden mb-6">
                        <button
                            type="button"
                            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                            className="w-full p-4 rounded-xl border border-white/10 bg-[#1E293B]/60 flex items-center justify-between"
                        >
                            <span className="text-white font-medium">Preview Gift</span>
                            {showPreviewMobile ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    <div className="hidden lg:block">
                        <GiftPreview
                            recipient={recipientDisplayLabel || recipientInput}
                            amount={previewAmount.toString()}
                            tokenSymbol={selectedToken?.symbol || 'SOL'}
                            usdValue={previewUsdValue}
                            selectedCard={selectedCard}
                            message={message}
                            tokenPrice={tokenPrice}
                            currentStep={currentStep}
                        />
                    </div>
                    {showPreviewMobile && (
                        <div className="lg:hidden">
                            <GiftPreview
                                recipient={recipientDisplayLabel || recipientInput}
                                amount={previewAmount.toString()}
                                tokenSymbol={selectedToken?.symbol || 'SOL'}
                                usdValue={previewUsdValue}
                                selectedCard={selectedCard}
                                message={message}
                                tokenPrice={tokenPrice}
                                currentStep={currentStep}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GiftFormSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-xl bg-[#1E293B]/40 border border-white/10" />
        {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 rounded-xl bg-[#1E293B]/40 border border-white/10" />
        ))}
        <div className="h-12 rounded-xl bg-[#1E293B]/40 border border-white/10" />
    </div>
);

const CardUpsellFallback: React.FC = () => (
    <div className="h-48 rounded-2xl border border-white/10 bg-[#1E293B]/40 animate-pulse" />
);

export default GiftPage;
