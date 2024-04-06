import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center bg-black text-white p-4 px-4">
        <div className="uppercase text-2xl font-bold">
            Patent
        </div>
        <div className="flex justify-center gap-4 items-center">
            <ul className="flex gap-4 uppercase items-center">
                <li>Home</li>
                <li>Mint NFT</li>
                <li>Lease</li>
                <li>About</li>
            </ul>
        <WalletSelector />
        </div>
    </div>
  )
}
export default Navbar;