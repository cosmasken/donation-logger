/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RSK_TESTNET_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
