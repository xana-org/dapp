import { useEffect, useState }  from "react";
import { useWallet }            from "use-wallet";
import { ethers }               from "ethers";
import BigNumber                from "bignumber.js";
import Axios                    from "axios";
import {
    Flex,
    Text,
    Box,
    Icon,
    Spinner,
    Image,
    useClipboard,
    useToast,
} from "@chakra-ui/core";
import Avatar               from '@material-ui/core/Avatar';
import AttachMoneyIcon      from '@material-ui/icons/AttachMoney';
import AssessmentIcon       from '@material-ui/icons/Assessment';
import PieChartIcon         from '@material-ui/icons/PieChart';
import { IoCopyOutline }    from "react-icons/io5";
import { RiRefreshLine }    from "react-icons/ri";
import AllocationChart      from "../../components/AllocationChart";
import {
    getETHPrice,
    getTokenPrice,
    formatNumber,
    getBalanceDecimal,
} from "../../lib/helper";
import {
    getWalletAddress, shortenWalletAddress
} from "../../lib/wallet";
import {
    ASSET_LIST,
} from "../../utils/const";

const Dashboard = () => {
    const toast = useToast()
    const wallet = useWallet();
    const [connected, setConnected] = useState(false);
    const [assets, setAssets] = useState([]);
    const [totalUSD, setTotalUSD] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [copyText, setCopyText] = useState("");
    const { hasCopied, onCopy } = useClipboard(copyText);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (wallet && wallet.ethereum && !connected) {
            setConnected(true);
            loadData();
        }
    }, [wallet]);

    const loadData = async () => {
        if (wallet && wallet.ethereum) {
            const tAssets = [];
            const provider = new ethers.providers.Web3Provider(wallet.ethereum);
            const walletAddr = await getWalletAddress(wallet);
            const network = await provider.getNetwork();
            let ethBal = await provider.getBalance(walletAddr);
            ethBal = ethers.utils.formatUnits(ethBal, "ether");
            const ethPrice = await getETHPrice(network.chainId);
            let sum = (new BigNumber(ethBal).multipliedBy(ethPrice)).toString();
            if (sum && parseFloat(sum))
                tAssets.push({
                    symbol: "ETH",
                    name: "Ether",
                    amount: ethBal,
                    price: ethPrice,
                    total: sum,
                    image: "WETH.png",
                });

            for (const token of ASSET_LIST[network.chainId]) {
                const tPrice = await getTokenPrice(token.address, token.pair, network.chainId, ethPrice);
                const tBalance = await getBalanceDecimal(token.address, walletAddr, provider);
                const total = (new BigNumber(tPrice).multipliedBy(tBalance)).toString();
                sum = (new BigNumber(sum).plus(total)).toString(); 
                if (total && parseFloat(total))
                    tAssets.push({
                        symbol: token.symbol,
                        name: token.name,
                        amount: tBalance,
                        price: tPrice,
                        total,
                        image: token.image
                    });
            }

            setAssets(tAssets);
            setTotalUSD(sum);
            setLoaded(true);
    
            try {
                const res = await Axios.get(`https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddr}&startblock=0&endblock=999999999&sort=asc&apikey=HNZTDSCXY5WG38ZH8JD74P5Q6Y8XK3AQZJ`);
                if (res && res.data) {
                    let transactions = res.data.result;
                    transactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
                    setTransactions(transactions);
                }
            } catch (e) {
                console.log("Fetching erorr", e)
            }


        }
    }

    const onCopyText = (text) => {
        setCopyText(text);
    }

    useEffect(() => {
        if (copyText) {
            onCopy();
            toast({
                title: "Copied",
                description: "",
                status: "success",
                duration: 4000,
                isClosable: true,
                variant: "top-accent"
            });
        }
    }, [copyText])

    return (
        <Flex flexDirection="column" p="3rem 5rem" w="100%" overflowY="auto" height="100vh">
            <Text fontSize="40px" fontWeight="700" color="#000" textAlign="center">Dashboard</Text>
            <Text fontSize="16px" fontWeight="400" color="#000" textAlign="center">View your transactions, analyze your portfolio, and much more </Text>
            <Flex flexDirection="row" justifyContent="space-between" w="100%" mt="2rem">
                <Flex flexDirection="column" w="30%">
                    <Flex w="100%" flexDirection="column" p="1rem 2rem" borderRadius="5px" boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.21)">
                        <Flex flexDirection="row" justifyContent="space-between">
                            <Flex flexDirection="column">
                                <Text fontSize="16px" fontWeight="600" color="#6b778c">USD Valuation</Text>
                                {totalUSD && parseFloat(totalUSD) ? 
                                    <Text fontSize="18px" fontWeight="600" color="#5664D2">$ {formatNumber(parseFloat(totalUSD), 3)}</Text>:
                                    connected?<Spinner color="#5664D2" m="0.2rem 0"/>:(null)
                                }
                            </Flex>
                            <Avatar style={{color: "#fff", backgroundColor: "#E91E63", width: "3.5rem", height: "3.5rem", margin: "auto 0"}}>
                                <AttachMoneyIcon style={{fontSize: "30px"}}/>
                            </Avatar>
                        </Flex>
                    </Flex>
                    <Flex w="100%" flexDirection="column" p="1rem 2rem" borderRadius="5px" boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.21)" mt="2rem" mb="auto">
                        <Flex flexDirection="row" justifyContent="space-between">
                            <Flex flexDirection="column">
                                <Text fontSize="16px" fontWeight="600" color="#6b778c" m="auto 0">Allocations</Text>
                            </Flex>
                            <Avatar style={{color: "#fff", backgroundColor: "#FB8B01", width: "3.5rem", height: "3.5rem"}}>
                                <PieChartIcon style={{fontSize: "30px"}}/>
                            </Avatar>
                        </Flex>
                        <Box w="100%" h="1px" bg="#e0e0e0" m="1rem 0"></Box>
                        <AllocationChart assets={assets} totalUSD={totalUSD}/>
                    </Flex>
                </Flex>
                <Flex flexDirection="column" w="68%">
                    <Flex flexDirection="column" w="100%" p="1rem 2rem" borderRadius="5px" boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.21)" mb="2rem">
                        <Flex flexDirection="row" justifyContent="space-between">
                            <Flex flexDirection="row" m="auto 0">
                                <Text fontSize="16px" fontWeight="600" color="#6b778c">Tokens</Text>
                                <Flex ml="0.5rem" cursor="pointer" _hover={{opacity: 0.6}} transition="0.2s">
                                    <Icon as={RiRefreshLine} color="#000" w={6} h={6} color="#6b778c"></Icon>
                                </Flex>
                            </Flex>
                            <Avatar style={{color: "#fff", backgroundColor: "#43A047", width: "3.5rem", height: "3.5rem"}}>
                                <AssessmentIcon style={{fontSize: "30px"}}/>
                            </Avatar>
                        </Flex>
                        <Box w="100%" h="2px" bg="#e0e0e0" m="1rem 0 0 0"></Box>
                        <Flex flexDirection="row" w="100%" p="0.5rem 0" borderBottom="1px solid #e0e0e0">
                            <Flex w="31%"><Text color="#000" ml="0.5rem" fontWeight="bold">Asset</Text></Flex>
                            <Flex w="23%"><Text color="#000" fontWeight="bold">Amount</Text></Flex>
                            <Flex w="23%"><Text color="#000" fontWeight="bold">Price</Text></Flex>
                            <Flex w="23%"><Text color="#000" fontWeight="bold">Total</Text></Flex>
                        </Flex>
                        {connected && assets.length === 0 && !loaded && <Spinner color="#5664D2" m="1rem auto"/>}
                        {connected && assets.length === 0 && loaded  && <Text color="#000" m="1rem auto">No balance</Text>}
                        {assets.map((item, index) => {
                            return (
                                <Flex flexDirection="row" w="100%" key={index} p="0.5rem 0" borderBottom="1px solid #e0e0e0">
                                    <Flex w="31%" flexDirection="row">
                                        <Image src={"/images/erc20/" + item.image} w="1.5rem" m="auto 0"/>
                                        <Text color="#000" m="auto 0.5rem">{item.symbol}</Text>
                                    </Flex>
                                    <Flex w="23%"><Text color="#000" ml="0.1rem">{formatNumber(parseFloat(item.amount), 3)}</Text></Flex>
                                    <Flex w="23%"><Text color="#000" ml="0.1rem">${formatNumber(parseFloat(item.price), 3)}</Text></Flex>
                                    <Flex w="23%"><Text color="#000" ml="0.1rem">${formatNumber(parseFloat(item.total), 3)}</Text></Flex>
                                </Flex>
                            )
                        })}
                    </Flex>
                    <Flex
                        flexDirection="column" w="100%" borderRadius="5px" boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.21)"
                        height="600px" overflowY="auto"
                    >
                        <Flex flexDirection="column" position="sticky" bg="#F4F6F8" top="0rem" p="1rem 2rem" >
                            <Text fontSize="16px" fontWeight="600" color="#6b778c">Transactions</Text>
                            <Flex flexDirection="row" w="100%" p="0.5rem 0" borderBottom="1px solid #e0e0e0">
                                <Flex w="30%"><Text color="#000" ml="0.5rem" fontWeight="bold">Hash</Text></Flex>
                                <Flex w="20%"><Text color="#000" fontWeight="bold">Date</Text></Flex>
                                <Flex w="30%"><Text color="#000" fontWeight="bold">To Address</Text></Flex>
                                <Flex w="20%"><Text color="#000" fontWeight="bold">Tokens</Text></Flex>
                            </Flex>
                        </Flex>
                        <Flex p="0rem 2rem" flexDirection="column">
                            {transactions.map((item, index) => {
                                let a = new Date(parseInt(item.timeStamp) * 1000);
                                let date = a.getDate();
                                let year = a.getFullYear();
                                let month = a.getMonth() + 1;
                                return (
                                    <Flex flexDirection="row" w="100%" key={index} p="0.5rem 0" borderBottom="1px solid #e0e0e0">
                                        <Flex w="30%" flexDirection="row">
                                            <Text color="#000" m="auto 0.5rem">{shortenWalletAddress(item.blockHash)}</Text>
                                            <Flex m="auto 0" cursor="pointer"
                                                onClick={() => onCopyText(item.blockHash)}
                                            >
                                                <Icon as={IoCopyOutline} color="#000" w={4} h={4} color="#6b778c"></Icon>
                                            </Flex>
                                        </Flex>
                                        <Flex w="20%">
                                            <Text color="#000" ml="0.1rem">
                                                {month + "/" + date + "/" + year}
                                            </Text>
                                        </Flex>
                                        <Flex w="30%" flexDirection="row">
                                            <Text color="#000" m="auto 0.5rem auto 0">{shortenWalletAddress(item.to)}</Text>
                                            <Flex m="auto 0" cursor="pointer"
                                                onClick={() => onCopyText(item.to)}
                                            >
                                                <Icon as={IoCopyOutline} color="#000" w={4} h={4} color="#6b778c"></Icon>
                                            </Flex>
                                        </Flex>
                                        <Flex w="20%"><Text color="#000" ml="0.1rem">{item.tokenSymbol}</Text></Flex>
                                    </Flex>
                                )
                            })}
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default Dashboard;