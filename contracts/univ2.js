import { ethers } from "ethers";
import abi from './univ2.abi.json';
import { isTransactionMined } from "../lib/helper";
import { UNISWAP_V2_ROUTER } from "../utils/const";

export async function buyTokenWithETH(ethAmount, tokenAmount, WETH_ADDR, TOKEN_ADDR, walletAddr, signer) {
    const contract = new ethers.Contract(UNISWAP_V2_ROUTER, abi, signer);
    const deadline = new Date();
    const timestamp = deadline.getTime() + 1000;
    console.log(ethAmount, tokenAmount, timestamp);
    try {
        const { hash } = await contract.swapExactETHForTokens(
            tokenAmount,
            [WETH_ADDR,TOKEN_ADDR],
            walletAddr,
            timestamp,
            { value: ethers.utils.parseEther(ethAmount)}
        );
        try {
            while (true) {
                let mined = await isTransactionMined(hash);
                if (mined) break;
            }
        } catch (e) {
            console.error(e);
            return "";
        }
        return hash;
    } catch (e) {
        console.log(e);
        return "";
    }
}

export async function getAmountsOut(tokenAmount, token1, token2, signer) {
    const contract = new ethers.Contract(UNISWAP_V2_ROUTER, abi, signer);
    const amounts = await contract.getAmountsOut(tokenAmount, [token1, token2]) ;
    return amounts;
}