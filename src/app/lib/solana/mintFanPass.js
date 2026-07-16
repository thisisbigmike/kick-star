import { mintCompressedNft } from './mintClient';

/**
 * Mints the Fan Pass cNFT at onboarding (PRD §6.1 — "Minted as a
 * Solana compressed NFT at onboarding"). Metadata is static for the
 * hackathon build; the URI would point at a JSON file describing
 * the visual badge/trophy display.
 *
 * @param {ReturnType<import('@solana/wallet-adapter-react').useWallet>} walletAdapter
 * @param {string} clubId
 * @returns {Promise<import('./mintClient').MintResult>}
 */
export async function mintFanPass(walletAdapter, clubId) {
  return mintCompressedNft(walletAdapter, {
    name: 'Kickstar Fan Pass',
    symbol: 'KFAN',
    uri: `https://kickstar.app/fan-pass/${clubId}.json`,
  });
}
