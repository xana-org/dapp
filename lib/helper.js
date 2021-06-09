import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import {
    WETH_ADDRESS,
    USDT_ADDRESS,
    WETH_USDT_ADDRESS,
} from "../utils/const";
import {
    getBalance,
    getDecimals,
} from "../contracts/erc20";

export const formatNumber = (x, decimals) => {
    const parts = x.toFixed(decimals + 1).split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts[0] + "." + parts[1]?.slice(0, decimals);
}

export const getBalanceDecimal  = async (addr, walletAddr, provider) => {
    let balance = await getBalance(addr, walletAddr, provider);
    balance = new BigNumber(balance);
    const dec = await getDecimals(addr, provider);
    let decimals = (new BigNumber(10)).exponentiatedBy(dec);
    balance = balance.dividedBy(decimals);
    return balance.toString();
}

export const getTokenPrice = async (token, pair, chainId, ePrice = "") => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wethBalance = await getBalanceDecimal(WETH_ADDRESS[chainId], pair, provider);
    const tokenBalance = await getBalanceDecimal(token, pair, provider);
    const wp = new BigNumber(wethBalance);
    const tp = new BigNumber(tokenBalance);
    let ethPrice;
    if (!ePrice)
        ethPrice = await getETHPrice(chainId)
    else
        ethPrice = ePrice;
    const price = wp.multipliedBy(ethPrice).dividedBy(tp);
    return price.toString();
}

export const getETHPrice = async (chainId) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wethBalance = await getBalanceDecimal(WETH_ADDRESS[chainId], WETH_USDT_ADDRESS[chainId], provider);
    const tokenBalance = await getBalanceDecimal(USDT_ADDRESS[chainId], WETH_USDT_ADDRESS[chainId], provider);
    const wp = new BigNumber(wethBalance);
    const tp = new BigNumber(tokenBalance);
    const price = tp.dividedBy(wp);
    return price.toString();

}

export const isTransactionMined = async (transactionHash) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const txReceipt = await provider.getTransactionReceipt(transactionHash);
    if (txReceipt && txReceipt.blockNumber) {
      return true;
    }
    return false;
}

export const getBigNumber = (source, decimals) => {
    const parts = source.split(".");
    if (parts[1] && parts[1].length) decimals -= parts[1].length;
    let zero = "0";
    if (decimals < 0) return parts[0] + parts[1].slice(0, decimals);
    return parts[0] + (parts[1]?parts[1]:"") + (zero.repeat(decimals));
}