This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


export NODE_TLS_REJECT_UNAUTHORIZED=0
yarn dev

## deploy next.js on Arweave using Bundlr Network
npm install -g @bundlr-network/client

# Save your wallet keys

# Install Bundlr

npm install -g @bundlr-network/client

# Fund Bundlr with 0.01 AR
bundlr fund 10000000000 -h https://node1.bundlr.network -w wallet-keys.json -c arweave

# Ask your Bundlr balance
bundlr balance wallet-address -h https://node1.bundlr.network -c arweave

# Deploy
bundlr upload-dir ./out -c arweave -h https://node1.bundlr.network -w wallet-keys.json --index-file index.html

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn Info
√ What is your project named? ... ao-web-connect
√ Would you like to use TypeScript? ... No
√ Would you like to use ESLint? ... No
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like to use `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to customize the default import alias (@/*)? ... No

Installing dependencies:
- react
- react-dom
- next

Installing devDependencies:
- postcss
- tailwindcss

