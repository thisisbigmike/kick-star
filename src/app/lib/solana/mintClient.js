/**
 * Real Solana devnet compressed-NFT (cNFT) minting via Metaplex
 * Bubblegum, using the connected wallet-adapter signer.
 *
 * Prerequisite: NEXT_PUBLIC_MERKLE_TREE_ADDRESS must be set (see
 * scripts/setup-merkle-tree.js — a one-time devnet setup step that
 * requires a funded devnet wallet and cannot be automated here).
 *
 * Every mint call returns a typed result; on failure it falls back
 * to a clearly-labeled 'fallback-recorded' state rather than
 * presenting a fabricated success (PRD §10 sanctions this fallback
 * explicitly for devnet flakiness — the label is what makes it
 * honest, not a fake tx hash).
 *
 * @typedef {{ status: 'minted', signature: string, explorerUrl: string } | { status: 'fallback-recorded', reason: string } | { status: 'not-configured' }} MintResult
 */

const DEVNET_RPC = 'https://api.devnet.solana.com';

function explorerUrl(signature) {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

/**
 * Mints a single compressed NFT to `leafOwner` with the given
 * metadata, using `walletAdapter` (from @solana/wallet-adapter-react's
 * useWallet()) as the fee payer / tree-delegate signer.
 *
 * @param {{ publicKey: import('@solana/web3.js').PublicKey, signTransaction: Function, sendTransaction: Function }} walletAdapter
 * @param {{ name: string, symbol: string, uri: string }} metadata
 * @returns {Promise<MintResult>}
 */
export async function mintCompressedNft(walletAdapter, metadata) {
  const merkleTreeAddress = process.env.NEXT_PUBLIC_MERKLE_TREE_ADDRESS;
  if (!merkleTreeAddress) {
    return { status: 'not-configured' };
  }
  if (!walletAdapter?.publicKey) {
    return { status: 'fallback-recorded', reason: 'wallet-not-connected' };
  }

  try {
    const { createUmi } = await import('@metaplex-foundation/umi-bundle-defaults');
    const { mplBubblegum, mintV1 } = await import('@metaplex-foundation/mpl-bubblegum');
    const { publicKey: umiPublicKey, none } = await import('@metaplex-foundation/umi');
    const { walletAdapterIdentity } = await import('@metaplex-foundation/umi-signer-wallet-adapters');

    const umi = createUmi(DEVNET_RPC).use(mplBubblegum());
    umi.use(walletAdapterIdentity(walletAdapter));

    const builder = mintV1(umi, {
      leafOwner: umiPublicKey(walletAdapter.publicKey.toBase58()),
      merkleTree: umiPublicKey(merkleTreeAddress),
      metadata: {
        name: metadata.name,
        symbol: metadata.symbol || 'KICKSTAR',
        uri: metadata.uri,
        sellerFeeBasisPoints: 0,
        collection: none(),
        creators: [],
      },
    });

    const { signature } = await builder.sendAndConfirm(umi);
    const sigString = Buffer.from(signature).toString('base64');
    return { status: 'minted', signature: sigString, explorerUrl: explorerUrl(sigString) };
  } catch (err) {
    console.error('cNFT mint failed, falling back to recorded state', err);
    return { status: 'fallback-recorded', reason: 'mint-error' };
  }
}
