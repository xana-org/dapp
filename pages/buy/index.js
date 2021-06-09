import { useEffect, useState }  from "react";
import { useWallet }            from "use-wallet";
import { ethers }               from "ethers";
import {
    Flex,
    Text,
    Image,
    Icon,
    NumberInput,
    NumberInputField,
    useToast,
} from "@chakra-ui/core";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { BiCaretDown }      from "react-icons/bi";
import {
    getTokenPrice,
    formatNumber,
    getBalanceDecimal,
    getETHPrice,
    getBigNumber
} from "../../lib/helper";
import {
  getWalletAddress
} from "../../lib/wallet";
import {
    ZORA_ADDRESS,
    USDT_ADDRESS,
    WETH_ADDRESS,
} from "../../utils/const";
import BigNumber from "bignumber.js";
import {
    buyTokenWithETH,
    getAmountsOut
} from "../../contracts/univ2";

const BuyZora = () => {
    const toast = useToast()
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);
    const wallet = useWallet();
    const [connected, setConnected] = useState(false);
    const [tokenType, setTokenType] = useState(0);
    const [balance, setBalance] = useState("0");
    const [minimumZora, setMinimumZora] = useState("0");

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!connected && wallet && wallet.ethereum) {
            setConnected(true);
            loadData();
        }
    }, [wallet]);

    const loadData = async () => {
        if (wallet && wallet.ethereum) {
            const provider = new ethers.providers.Web3Provider(wallet.ethereum);
            const network = await provider.getNetwork();
            const zora = ZORA_ADDRESS[network.chainId];
            const price = await getTokenPrice(zora.token, zora.pair, network.chainId);
            setPrice(price);
            updateMinimumZoraCount(amount);
            await updateBalance(tokenType);
        }
    }

    const updateBalance = async (type) => {
        if (wallet && wallet.ethereum) {
            const provider = new ethers.providers.Web3Provider(wallet.ethereum);
            const network = await provider.getNetwork();
            const walletAddr = await getWalletAddress(wallet);
            let newBal;
            if (type === 1) {
                const usdt = USDT_ADDRESS[network.chainId];
                const bal = await getBalanceDecimal(usdt, walletAddr, provider);
                newBal = bal;
                setBalance(bal);
            } else {
                const bal = await provider.getBalance(walletAddr);
                newBal = ethers.utils.formatUnits(bal, "ether");
                setBalance(newBal);
            }
            updateMinimumZoraCount(newBal);
        }
    }

    const updateTokenType = async (type) => {
        setTokenType(type);
        setAmount("0");
        await updateBalance(type);
    }

    const updateMinimumZoraCount = async (newBal) => {
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        if (!newBal || parseFloat(newBal) === 0 || !price || !parseFloat(price)) {
            setMinimumZora("0");
            return;
        }
        if (wallet && wallet.ethereum) {
            const provider = new ethers.providers.Web3Provider(wallet.ethereum);
            const network = await provider.getNetwork();
            const signer = await provider.getSigner();
            if (tokenType === 0) {
                const amounts = await getAmountsOut(
                    getBigNumber(newBal, 18),
                    WETH_ADDRESS[network.chainId],
                    ZORA_ADDRESS[network.chainId].token,
                    signer
                );
                let count = new BigNumber((amounts[1].toString()));
                count = count.dividedBy("1000000000");
                setMinimumZora(count.toString());
            } else {
                const amounts = await getAmountsOut(
                    getBigNumber(newBal, 18),
                    USDT_ADDRESS[network.chainId],
                    ZORA_ADDRESS[network.chainId].token,
                    signer
                );
                let count = new BigNumber((amounts[1].toString()));
                count = count.dividedBy("1000000000");
                setMinimumZora(count.toString());
            }
        }
    }

    const onChangeInput = (newVal) => {
        setAmount(newVal);
        updateMinimumZoraCount(newVal);
    }

    const updateAmount = (multi) => {
        let bal = new BigNumber(balance);
        bal = bal.multipliedBy(multi);
        setAmount(bal.toString());
        updateMinimumZoraCount(bal.toString());
    }

    const onBuyToken = async () => {
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const network = await provider.getNetwork();
        const signer = await provider.getSigner();
        const walletAddr = await getWalletAddress(wallet);
        let tokenAmount = new BigNumber(getBigNumber(minimumZora, 9)).multipliedBy(99).dividedBy(100);
        tokenAmount = ((tokenAmount.toString()).split("."))[0];
        try {
            const hash = await buyTokenWithETH(
                amount,
                tokenAmount,
                WETH_ADDRESS[network.chainId],
                ZORA_ADDRESS[network.chainId].token,
                walletAddr,
                signer
            );
            if (hash) {
                toast({
                    title: "Buy Zora",
                    description: "You bought Zora",
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                    variant: "top-accent"
                });
            }
        } catch (e) {
            toast({
                title: "Buy Zora",
                description: "Swap is reverted.",
                status: "error",
                duration: 4000,
                isClosable: true,
                variant: "top-accent"
            });
        }
    }

    return (
        <Flex flexDirection="column" m="3rem auto" w="100%" maxW="50rem">
            <Text fontSize="40px" fontWeight="700" color="#000" textAlign="center">Buy ZORA</Text>
            <Text fontSize="16px" fontWeight="400" color="#000" textAlign="center">Buy ZORA tokens with just one click!</Text>
            <Flex flexDirection="row" justifyContent="space-between" w="100%" mt="2rem">
                <Flex flexDirection="column" w="100%" p="1rem 2rem" borderRadius="5px" boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.21)">
                    <Image src="/images/panel/ZORA.png" w={16} h={16} m="0 auto"/>
                    <Text fontSize="16px" fontWeight="600" color="#000" textAlign="center" m="1rem 0">Buy ZORA token</Text>
                    <Flex flexDirection="column" width={["100%", "100%", "100%", "100%", "70%"]} m="1rem auto">
                        <Text color="#555">Enter your amount</Text>
                        <Flex flexDirection="row">
                            <NumberInput
                                bg="#eee" color="#333" borderRadius="10px" size="lg" defaultValue={amount} m="0.5rem 0" w="100%"
                                value={amount}
                                onChange={onChangeInput}
                            >
                                <NumberInputField color="#333" fontSize="14px" fontWeight="bold" border="none" placeholder="0.0" _placeholder={{color: "#888"}}>
                                </NumberInputField>
                            </NumberInput>
                            <Flex flexDirection="row" p="0.5rem">
                                <Image src="/images/panel/eth.png" w="1.2rem" h="2rem" m="auto"/>
                            </Flex>
                            {/* <Menu>
                                <MenuButton>
                                    <Flex flexDirection="row" p="0.5rem" cursor="pointer">
                                        {tokenType?
                                            <Image src="/images/panel/USDT.png" w="2rem" />:
                                            <Image src="/images/panel/eth.png" w="1.2rem" />
                                        }                                        
                                        <Text fontSize="14px" m="auto 0rem auto 0.5rem" color="#333" fontWeight="bold">
                                            {tokenType?"USDT":"ETH"}
                                        </Text>
                                        <Icon as={BiCaretDown} color="#555" w={6} h={6} m="auto 0"></Icon>
                                    </Flex>
                                </MenuButton>
                                <MenuList mt="-1rem">
                                    <MenuItem onClick={() => updateTokenType(0)}>ETH</MenuItem>
                                    <MenuItem onClick={() => updateTokenType(1)}>USDT</MenuItem>
                                </MenuList>
                            </Menu> */}
                        </Flex>
                        <Flex flexDirection="row">
                            <ButtonGroup size="small" variant="contained" color="primary">
                                <Button onClick={() => updateAmount("0.25")}>25%</Button>
                                <Button onClick={() => updateAmount("0.5")}>50%</Button>
                                <Button onClick={() => updateAmount("0.75")}>75%</Button>
                                <Button onClick={() => updateAmount("1")}>100%</Button>
                            </ButtonGroup>
                            <Flex>
                                <Text color="#333" m="auto 0.5rem">of {formatNumber(parseFloat(balance), 3)}</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Text color="#000" fontWeight="bold" fontSize="18px">Prices</Text>
                    <Flex flexDirection="row" m="1rem 0" justifyContent="space-between">
                        <Flex w="calc(50% - 0.5rem)" p="1rem" borderRadius="5px" bg="#5664D2" flexDirection="column">
                            <Text fontSize="14px">You get minimum of</Text>
                            <Text fontSize="16px" fontWeight="bold">~{formatNumber(parseFloat(minimumZora), 3)} ZORA</Text>
                        </Flex>
                        <Flex w="calc(50% - 0.5rem)" p="1rem" borderRadius="5px" bg="#5664D2" flexDirection="column">
                            <Text fontSize="14px">Price for 1 ZORA</Text>
                            <Text fontSize="16px" fontWeight="bold">~{formatNumber(parseFloat(price), 3)} USD</Text>
                        </Flex>
                    </Flex>
                    <Flex
                        p="0.5rem 1rem" borderRadius="5px" bg="#5664D2" flexDirection="column" m="0 auto"
                        cursor="pointer" _hover={{opacity: 0.9}} transition="0.3s" userSelect="none"
                        onClick={onBuyToken}
                    >
                        <Text fontSize="14px" m="0 auto">Buy Now</Text>
                    </Flex>
                </Flex>
                {/* <Flex flexDirection="column" w="48%" p="1rem 2rem" borderRadius="5px" boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.21)">
                    <Text fontSize="16px" fontWeight="600" color="#000" m="1rem 0">ZORA Price</Text>
                </Flex> */}
            </Flex>
        </Flex>
    )
}

export default BuyZora;