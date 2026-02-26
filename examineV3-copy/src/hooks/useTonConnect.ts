import { useState, useCallback, useEffect } from 'react';
import { TonConnectUI } from '@tonconnect/ui';

export type TonStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface TonState {
  status: TonStatus;
  address: string;
  balance: string;
  walletName: string;
  error: string;
}

// Singleton TonConnectUI instance
let tonConnectInstance: TonConnectUI | null = null;

function getTonConnect(): TonConnectUI {
  if (!tonConnectInstance) {
    tonConnectInstance = new TonConnectUI({
      manifestUrl: 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json',
    });
  }
  return tonConnectInstance;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleWalletConnected(wallet: any, setState: (fn: (s: TonState) => TonState) => void) {
  const rawAddress = wallet?.account?.address ?? '';
  const shortAddr = rawAddress.length > 10
    ? rawAddress.slice(0, 6) + '...' + rawAddress.slice(-4)
    : rawAddress;
  setState(() => ({
    status: 'connected' as TonStatus,
    address: shortAddr,
    balance: '0.00',
    walletName: wallet?.device?.appName || 'TON Wallet',
    error: '',
  }));
}

export function useTonConnect() {
  const [state, setState] = useState<TonState>({
    status: 'idle',
    address: '',
    balance: '',
    walletName: '',
    error: '',
  });

  useEffect(() => {
    let tc: TonConnectUI;
    try {
      tc = getTonConnect();
      if (tc.wallet) handleWalletConnected(tc.wallet, setState);
      const unsubscribe = tc.onStatusChange((wallet) => {
        if (wallet) {
          handleWalletConnected(wallet, setState);
        } else {
          setState(() => ({ status: 'idle', address: '', balance: '', walletName: '', error: '' }));
        }
      });
      return () => unsubscribe();
    } catch (_) {
      return () => {};
    }
  }, []);

  const connect = useCallback(async () => {
    setState(s => ({ ...s, status: 'connecting', error: '' }));
    try {
      const tc = getTonConnect();
      await tc.openModal();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setState(s => ({ ...s, status: 'error', error: error.message || 'Connection failed' }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const tc = getTonConnect();
      await tc.disconnect();
    } catch (_) { /* ignore */ }
    setState(() => ({ status: 'idle', address: '', balance: '', walletName: '', error: '' }));
  }, []);

  const sendTon = useCallback(async (toAddress: string, amountTon: number): Promise<boolean> => {
    if (state.status !== 'connected') return false;
    try {
      const tc = getTonConnect();
      const nanotons = Math.floor(amountTon * 1e9).toString();
      await tc.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: toAddress, amount: nanotons }],
      });
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      setState(s => ({ ...s, error: error.message || 'Transaction failed' }));
      return false;
    }
  }, [state.status]);

  return { ...state, connect, disconnect, sendTon };
}
