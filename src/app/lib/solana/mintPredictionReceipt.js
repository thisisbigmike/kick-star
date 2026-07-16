import { mintCompressedNft } from './mintClient';

/**
 * Mints a compressed NFT receipt for a locked tap-to-predict choice
 * (PRD §6.3 — prediction resolution/receipt is on-chain).
 *
 * @param {ReturnType<import('@solana/wallet-adapter-react').useWallet>} walletAdapter
 * @param {{ matchId: string, choice: string }} prediction
 * @returns {Promise<import('./mintClient').MintResult>}
 */
export async function mintPredictionReceipt(walletAdapter, prediction) {
  return mintCompressedNft(walletAdapter, {
    name: 'Kickstar Prediction Receipt',
    symbol: 'KPRD',
    uri: `https://kickstar.app/predictions/${prediction.matchId}/${prediction.choice}.json`,
  });
}
