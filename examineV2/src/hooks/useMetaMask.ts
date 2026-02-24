import { useState, useCallback } from 'react';

export type MMStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface MetaMaskState {
  status: MMStatus;
  address: string;
  balance: string;
  chainId: string;
  error: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export function useMetaMask() {
  const [state, setState] = useState<MetaMaskState>({
    status: 'idle',
    address: '',
    balance: '',
    chainId: '',
    error: '',
  });

  const isAvailable = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      // On mobile, open MetaMask deep link
      window.open(`https://metamask.app.link/dapp/${window.location.host}`, '_blank');
      setState(s => ({ ...s, error: 'MetaMask not found. Opening MetaMask app...', status: 'error' }));
      return;
    }

    setState(s => ({ ...s, status: 'connecting', error: '' }));

    try {
      // Request account access — this opens MetaMask popup for user approval
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const address = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;

      // Get ETH balance
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }) as string;

      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = (balanceWei / 1e18).toFixed(4);

      setState({
        status: 'connected',
        address,
        balance: balanceEth,
        chainId,
        error: '',
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accs: unknown) => {
        const accounts = accs as string[];
        if (accounts.length === 0) {
          setState(s => ({ ...s, status: 'idle', address: '' }));
        } else {
          setState(s => ({ ...s, address: accounts[0] }));
        }
      });

      window.ethereum.on('chainChanged', (id: unknown) => {
        setState(s => ({ ...s, chainId: id as string }));
      });

    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setState(s => ({ ...s, status: 'idle', error: 'Connection rejected by user' }));
      } else {
        setState(s => ({ ...s, status: 'error', error: error.message || 'Connection failed' }));
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ status: 'idle', address: '', balance: '', chainId: '', error: '' });
  }, []);

  const sendTransaction = useCallback(async (toAddress: string, amountEth: number): Promise<string | null> => {
    if (!window.ethereum || state.status !== 'connected') return null;

    try {
      const amountHex = '0x' + Math.floor(amountEth * 1e18).toString(16);
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: state.address,
          to: toAddress,
          value: amountHex,
          gas: '0x5208',
        }],
      }) as string;
      return txHash;
    } catch (err: unknown) {
      const error = err as { message?: string };
      setState(s => ({ ...s, error: error.message || 'Transaction failed' }));
      return null;
    }
  }, [state.address, state.status]);

  return { ...state, isAvailable, connect, disconnect, sendTransaction };
}
