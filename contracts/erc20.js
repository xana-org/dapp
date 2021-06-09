import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import abi from './erc20.abi.json';
import { isTransactionMined } from "../lib/helper";

export async function getBalance(coinAddress, address, signer) {
  try {
    const erc20 = new ethers.Contract(coinAddress, abi, signer);
    const balance = await erc20.balanceOf(address);
    return balance.toString();
  } catch (e) {
    return "0";
  }
}

export async function getDecimals(coinAddress, signer) {
  try {
    const erc20 = new ethers.Contract(coinAddress, abi, signer);
    const decimals = await erc20.decimals();
    return decimals.toString();
  } catch (e) {
    return "0";
  }
}

export async function getTotalSupply(coinAddress, signer) {
  try {
    const erc20 = new ethers.Contract(coinAddress, abi, signer);
    const total = await erc20.totalSupply();
    return total.toString();    
  } catch (e) {
    return "0";
  }
}

export async function getTokenSymbol(coinAddress, signer) {
  const erc20 = new ethers.Contract(coinAddress, abi, signer);
  const symbol = erc20.symbol();
  return symbol;
}

export async function isTokenApproved(coinAddress, owner, contract, amount, signer) {
    const erc20 = new ethers.Contract(coinAddress, abi, signer);
    const allowance = (await erc20.allowance(owner, contract)) || 0;
    const x = new BigNumber(allowance);
    const y = new BigNumber(amount);
    return x.isGreaterThanOrEqualTo(y);
}

export async function approveToken(coinAddress, contract, amount, signer) {
    const erc20 = new ethers.Contract(coinAddress, abi, signer);
    const { hash } = await erc20.approve(contract, amount);
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
}

export async function getCoinInfo(coinAddress, signer) {
  try {
    const erc20 = new ethers.Contract(coinAddress, abi, signer);
    if (!erc20) {
      return null;
    }
  
    const name = await erc20.name();
    const symbol = await erc20.symbol();
    const decimals = await erc20.decimals();
  
    return {
      name,
      symbol,
      address: coinAddress,
      decimals,
    };
  } catch (e) {
    return null;
  }
}