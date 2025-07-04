# Deploy Smart Contract on Solayer Devnet"
A complete step-by-step guide to deploy your first "Hello, Solayer!" contract on Solayer Devnet using the **latest stable** toolchain.

## Prerequisites

- **System**: macOS, Linux, or Windows with WSL

- **Basic terminal knowledge**: Running commands in terminal

---

## Step 1: Install Rust (if not already installed)

If you don't have Rust installed:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

Verify Rust installation:

```bash
rustc --version
```

---

## Step 2: Install Latest Solana CLI

Install the latest Solana CLI 3.0.0 from Anza:

```bash
curl -sSfL https://release.anza.xyz/edge/install | sh
```

Add Solana CLI to your PATH:

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Verify installation:

```bash
solana --version
```

You should see: `solana-cli 3.0.0 (src:21f770aa; feat:2900245688, client:Agave)`

---

## Step 3: Create Hello Solayer Project

Create a new Rust library project:

```bash
cargo init --lib hello
cd hello
```

Add the latest Solana program dependency:

```bash
cargo add solana-program
```

**Update Edition:** Modern cargo defaults to edition "2024". For Solana programs, we need to enable the `edition2024` feature.

Update your `Cargo.toml`:

```toml
cargo-features = ["edition2024"]

[package]
name = "hello"
version = "0.1.0"
edition = "2024"

[dependencies]
solana-program = "2.3.0"

[lib]
crate-type = ["cdylib", "lib"]
```

**Note:** This uses the latest edition 2024 with the required feature flag for Solana compatibility.

---

## Step 4: Write the Hello Solayer Program

Replace the contents of `src/lib.rs` with:

```rust
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult,
    pubkey::Pubkey, msg,
};

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello, Solayer!");
    Ok(())
}
```

---

## Step 5: Generate Keypairs

Navigate back to your project root:

```bash
cd ..
```

Generate a keypair for your program:

```bash
solana-keygen new -o program-keypair.json --no-bip39-passphrase
```

Generate a keypair for your wallet:

```bash
solana-keygen new -o wallet-keypair.json --no-bip39-passphrase
```

**Important:** Save the displayed seed phrases securely. You'll need them to recover your keypairs.

Get your program ID (you'll need this later):

```bash
solana address -k program-keypair.json
```

---

## Step 6: Configure Solayer Devnet

Set Solana CLI to use Solayer devnet:

```bash
solana config set --url https://devnet-rpc.solayer.org
```

Set your wallet as the default keypair:

```bash
solana config set -k ./wallet-keypair.json
```

Verify your configuration:

```bash
solana config get
```

You should see:
- RPC URL: `https://devnet-rpc.solayer.org`
- Keypair Path: `./wallet-keypair.json`

---

## Step 7: Fund Your Wallet

Check your current balance:

```bash
solana balance
```

Request test SOL from the Solayer devnet faucet:

```bash
solana airdrop 1
```

Wait a few seconds, then check if you need more funding:

```bash
solana balance
```

If you have less than 0.2 SOL, request more:

```bash
solana airdrop 1
```

**Note:** Solayer devnet has a limit of 1 SOL per airdrop request.

---

## Step 8: Build Your Program

Navigate to your hello directory and build the program:

```bash
cd hello
```

Clean any existing build files:

```bash
rm -rf target/ Cargo.lock
```

Build the Solana program:

```bash
cargo build-sbf --sbf-out-dir=../dist
```

Navigate back to project root:

```bash
cd ..
```

Verify the build output:

```bash
ls -la dist/
```

You should see `hello.so` in the dist directory.

---

## Step 9: Deploy to Solayer Devnet

Deploy your program to Solayer devnet:

```bash
solana program deploy \
  --use-rpc \
  --program-id ./program-keypair.json \
  --upgrade-authority ./wallet-keypair.json \
  ./dist/hello.so
```

**Success!** You should see output like:
```bash
Program Id: <YOUR_PROGRAM_ID>
```

---

## Step 10: Verify Deployment

Check your program is deployed:

```bash
solana program show <YOUR_PROGRAM_ID> --url https://devnet-rpc.solayer.org
```

Check your remaining balance:

```bash
solana balance
```

The deployment should have cost approximately 0.13 SOL.

---

## Congratulations! 🎉

You have successfully deployed your first Hello Solayer contract to Solayer Devnet!

---
