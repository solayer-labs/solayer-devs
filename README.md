# Solayer Cookbook
## Onchain program examples for :anchor: Anchor :crab: Native Rust, [TS] TypeScript  and :snake: Python

This repo contains Solayer onchain programs (referred to as 'Smart Contracts' in other blockchains).

> [!NOTE]
> If you're new to Solayer, you don't need to create your own programs to perform basic things like making accounts, creating tokens, sending tokens, or minting NFTs. These common tasks are handled with existing programs, for example the System Program (for making account or transferring SOL) or the token program (for creating tokens and NFTs). See the [Solayer Developer page](https://solayer.org/developers) to learn more.

Each folder includes examples for one or more of the following:
- `anchor` - Written using [Anchor](https://www.anchor-lang.com/), the most popular framework for development, which uses Rust. Use `anchor build && anchor deploy` to build & deploy the program. Run `anchor run test` to test it.
- `native` - Written using native Rust crates and vanilla Rust. Use `cicd.sh` to build & deploy the program. Run `yarn run test` to test it.
- `poseidon` - Written using [Poseidon](https://turbin3.github.io/poseidon), which converts your TypeScript code to Anchor Rust.
- `seahorse` - Written using the [Seahorse framework](https://seahorse-lang.org/), which converts your Python code to Anchor Rust. Use `seahorse build && anchor deploy` to build & deploy the program. Run `anchor run test` to test it.


## Solayer Example Programs Reference

| Category | Program | Description | Native | Anchor | Seahorse |
|----------|---------|-------------|--------|--------|----------|
| **Basics** | Hello Solayer | Minimal program that logs a greeting | [Link](https://github.com/solayer-labs/solayer-devs/tree/main/hello-solayer) | wip | wip |
| | Account Data | Store and retrieve data using Solana accounts | wip | wip | |
| | Counter | Use a PDA to store global state, making a counter that increments when called | wip | wip | wip |
| | Favorites | Save and update per-user state on the blockchain, ensuring users can only update their own information | | wip | |
| | Checking Instruction Accounts | Check that the accounts provided in incoming instructions meet particular criteria | wip | wip | |
| | Closing Accounts | Close an account and get the Lamports back | wip | wip | |
| | Creating Accounts | Make new accounts on the blockchain | wip | wip | |
| | Cross Program Invocations | Invoke an instruction handler from one onchain program in another onchain program | wip | wip | |
| | PDA Rent-Payer | Use a PDA to pay the rent for the creation of a new account | wip | wip | |
| | Processing Instructions | Add parameters to an instruction handler and use them | wip | wip | |
| | Program Derived Addresses | Store and retrieve state in Solana | wip | wip | |
| | Realloc | Handle accounts that expand in size | wip | wip | |
| | Rent | Determine the necessary minimum rent by calculating an account's size | wip | wip | |
| | Repository Layout | Layout larger Solana onchain programs | wip | wip | |
| | Transfer SOL | Send SOL between two accounts | wip | wip | wip |
| **Tokens** | Token Operations | Create a Token Mint, Create a Token Account, Mint Tokens, Transfer Tokens | [Link](https://github.com/solayer-labs/solayer-devs/tree/main/solayer-token-deployment) | wip | |
| | NFT Minter | Mint an NFT from inside your own onchain program using custom metadata and token standards | [Link](https://github.com/solayer-labs/solayer-devs/tree/main/solayer-nft-template) | wip | |
| | SPL Token Minter | Mint a Token from inside your own onchain program using the Token program | wip | wip | |
| | Transfer Tokens | Transfer tokens between accounts | wip | wip | wip |
| | Escrow | Allow two users to swap digital assets with each other | | wip | |
| | PDA Mint Authority | Mint a Token from inside your own onchain program with a PDA as the mint authority | wip | wip | |
| | Token Swap (AMM) | Create liquidity pools to allow trading of new digital assets and automated market maker | | wip | |
| **Token Extensions** | Basics | Create token mints, mint tokens, and transfer tokens with Token Extensions | | wip | |
| | CPI Guard | Enable CPI guard to prevent certain token actions from occurring within CPI | | wip | |
| | Default Account State | Create new token accounts that are frozen by default | wip | wip | |
| | Group | Create tokens that belong to larger groups of tokens using the Group Pointer extension | | wip | |
| | Immutable Owner | Create tokens whose owning program cannot be changed | | wip | |
| | Interest Bearing | Create tokens that show an 'interest' calculation | | wip | |
| | Memo Transfer | Create tokens where transfers must have a memo describing the transaction attached | | wip | |
| | Metadata | Add on-chain metadata to the token mint | | wip | |
| | Mint Close Authority | Allow a designated account to close a Mint | wip | wip | |
| | Multiple Extensions | Use multiple Token Extensions at once | wip | | |
| | Non-Transferable | Create tokens that cannot be transferred | wip | wip | |
| | Permanent Delegate | Create tokens that remain under the control of an account, even when transferred elsewhere | | wip | |
| | Transfer Fee | Create tokens with an inbuilt transfer fee | wip | wip | |
| **Compression** | CNFT Burn | Burn compressed NFTs | | wip | |
| | CNFT Vault | Store Metaplex compressed NFTs inside a PDA | | wip | |
| | CUtils | Work with Metaplex compressed NFTs | | wip | |
| **Oracles** | Pyth | Use a data source for offchain data (called an Oracle) to perform activities onchain | | wip | wip |

## Legend
- **Link**: Click to access the program implementation
- **wip**: Work in progress - implementation coming soon
- Empty cells indicate the program is not planned for that language/framework

## Framework Information
- **Native**: Raw Solana program development using native Rust and Solana SDK
- **Anchor**: High-level framework for Solana development with built-in security features
- **Seahorse**: Python-based framework that compiles to Anchor (limited examples available)
