/**
 * One-time devnet setup: creates the compressed-NFT merkle tree that
 * Fan Pass / prediction-receipt minting writes into.
 *
 * Prerequisites (must be done before running this script — none of
 * this is automatable from here):
 *   1. A devnet keypair: `solana-keygen new -o ~/.config/solana/devnet.json`
 *   2. That keypair funded with devnet SOL:
 *      `solana airdrop 2 <pubkey> --url devnet`
 *      (the faucet is rate-limited; retry or use a web faucet if it fails)
 *
 * Usage:
 *   SOLANA_KEYPAIR_PATH=~/.config/solana/devnet.json node scripts/setup-merkle-tree.js
 *
 * On success, prints the merkle tree address — set it as
 * NEXT_PUBLIC_MERKLE_TREE_ADDRESS in .env.local.
 */
const fs = require('fs');
const path = require('path');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { mplBubblegum, createTree } = require('@metaplex-foundation/mpl-bubblegum');
const { generateSigner, keypairIdentity } = require('@metaplex-foundation/umi');
const { fromWeb3JsKeypair } = require('@metaplex-foundation/umi-web3js-adapters');
const { Keypair } = require('@solana/web3.js');

async function main() {
  const keypairPath = process.env.SOLANA_KEYPAIR_PATH;
  if (!keypairPath) {
    console.error('Set SOLANA_KEYPAIR_PATH to a funded devnet keypair JSON file first.');
    console.error('See the header comment in this script for setup steps.');
    process.exit(1);
  }

  const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve(keypairPath), 'utf8')));
  const web3Keypair = Keypair.fromSecretKey(secretKey);

  const umi = createUmi('https://api.devnet.solana.com').use(mplBubblegum());
  umi.use(keypairIdentity(fromWeb3JsKeypair(web3Keypair)));

  const merkleTree = generateSigner(umi);
  console.log('Creating merkle tree on devnet, signer:', merkleTree.publicKey.toString());

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: 14,
    maxBufferSize: 64,
  });
  await builder.sendAndConfirm(umi);

  console.log('\nMerkle tree created:', merkleTree.publicKey.toString());
  console.log('Add this to .env.local:');
  console.log(`NEXT_PUBLIC_MERKLE_TREE_ADDRESS=${merkleTree.publicKey.toString()}`);
}

main().catch((err) => {
  console.error('Merkle tree setup failed:', err);
  process.exit(1);
});
