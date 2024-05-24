import {Home} from "@/pages/home";
import { ArweaveWalletKit } from "arweave-wallet-kit";

export default function App() {
  return (
      <ArweaveWalletKit
          config={{
              permissions: ["ACCESS_ADDRESS","SIGN_TRANSACTION"],
              ensurePermissions: true,
          }}
      >
          <Home >

          </Home>
      </ArweaveWalletKit>
  );
}
