import { useEffect, useState }  from "react";
import Link                     from 'next/link';
import { useWallet }            from "use-wallet";
import { ethers }               from "ethers";
import {
    Flex,
    Link as CustomLink,
    Text,
    Box,
    Image,
    Icon,
    Menu,
    MenuItem,
    MenuList,
    MenuButton
} from "@chakra-ui/core";
import { useRouter }        from 'next/router';
import { RiDashboardLine }  from "react-icons/ri";
import { GiCheckeredFlag }  from "react-icons/gi";
import { IoCreateOutline }  from "react-icons/io5";
import { CgList }           from "react-icons/cg";
import { BiCaretDown }      from "react-icons/bi";
import Button               from '@material-ui/core/Button';
import ConnectModal         from "../ConnectionMdal";
import {
    shortenWalletAddress,
    isWalletConnected,
    getWalletAddress,
} from "../../lib/wallet";

const Panel = () => {
    const router = useRouter();
    const { route } = router;
    const wallet = useWallet();
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        if (!(window.ethereum && wallet && wallet.ethereum)) {
            setIsOpen(true);
        }
    }

    const cloesModal = () => {
        setIsOpen(false);
    }

    useEffect(() => {
        if (window.ethereum && wallet && wallet.ethereum) {
            setIsOpen(false);
        }
    }, [wallet]);

    const getMyWalletAddress = () => {
        const walletAddress = getWalletAddress(wallet);
        return shortenWalletAddress(walletAddress);
    }

    const viewOnEtherscan = async () => {
        const walletAddress = getWalletAddress(wallet);
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId === 1) {
            window.open("https://etherscan.io/address/" + walletAddress);
        } else {
            window.open("https://rinkeby.etherscan.io/address/" + walletAddress);
        }

    }

    const onDisconnect = () => {
        window.localStorage.setItem("ZORA2", "disable");
        wallet.reset();
    }

    const renderWalletConnection = () => {
        if (!isWalletConnected(wallet))
            return (
                <Flex flexDirection="row" m="2rem 0 0 0" p="0.5rem 1rem" borderRadius="20px" bg="#f2f3f4" onClick={openModal}
                    _hover={{bg: "#eee"}} transition="0.3s" cursor="pointer">
                    <Image src="/images/panel/eth.png" w={4}/>
                    <Text color="#000" m="auto" fontWeight="bold" color="#555">Connect</Text>
                </Flex>
            )
        return (
            <Menu>
                <MenuButton>
                    <Flex flexDirection="row" m="2rem 0 0 0" p="0.5rem" borderRadius="20px" bg="#f2f3f4"
                        _hover={{bg: "#eee"}} transition="0.3s" cursor="pointer">
                        <Image src="/images/panel/eth.png" w={4}/>
                        <Text fontSize="14px" m="auto 0.5rem" fontWeight="bold" color="#555">{getMyWalletAddress()}</Text>
                        <Icon as={BiCaretDown} color="#555" w={6} h={6}></Icon>
                    </Flex>
                </MenuButton>
                <MenuList>
                    <MenuItem onClick={viewOnEtherscan}>View on Etherscan</MenuItem>
                    <MenuItem onClick={onDisconnect}>Disconnect</MenuItem>
                </MenuList>
            </Menu>
        )
    }
    return (
        <Flex w="16rem" h="100vh" bg="#ffffff" p="2rem 2rem" flexDirection="column" borderRight="1px solid #e0e0e0" >
            <Flex flexDirection="row">
                <Text
                    fontSize="40px"
                    fontWeight="500"
                    bg="linear-gradient(to right, #3949AB , #8C9BEF)"
                    style={{
                        "WebkitBackgroundClip": "text",
                        "WebkitTextFillColor": "transparent"
                    }}
                >Zoracles</Text>
            </Flex>
            {renderWalletConnection()}
            <Link href="/dashboard">
                <CustomLink _active={{}} _focus={{}} mt="2rem">
                    <Flex flexDirection="row">
                        <Button color="primary"  style={{padding: "0.8rem 0.5rem", width: "100%"}}>
                            <Icon as={RiDashboardLine} color="#000" w={6} h={6} color={route==="/dashboard"?"#5664D2":"#748093"}></Icon>
                            <Text color="#000" fontWeight="600" m="auto 0 auto 0.5rem" mr="auto" color={route==="/dashboard"?"#5664D2":"#748093"}>Dashboard</Text>
                        </Button>
                    </Flex>
                </CustomLink>
            </Link>
            <Link href="/buy">
                <CustomLink _active={{}} _focus={{}}>
                    <Flex flexDirection="row">
                        <Button color="primary"  style={{padding: "0.8rem 0.5rem", width: "100%"}}>
                            <Image src="/images/panel/ZORA.png" w={6} h={6}/>
                            <Text color="#000" fontWeight="600" m="auto 0 auto 0.5rem" mr="auto" color={route==="/buy"?"#5664D2":"#748093"}>Buy ZORA</Text>
                        </Button>
                    </Flex>
                </CustomLink>
            </Link>
            {/* <CustomLink _active={{}} _focus={{}}>
                <Flex flexDirection="row">
                    <Button color="primary"  style={{padding: "0.8rem 0.5rem", width: "100%"}}>
                        <Icon as={GiCheckeredFlag} color="#000" w={6} h={6} color={route==="/pools"?"#5664D2":"#748093"}></Icon>
                        <Text color="#000" fontWeight="600" m="auto 0 auto 0.5rem" mr="auto" color={route==="/pools"?"#5664D2":"#748093"}>Get LP Tokens</Text>
                    </Button>
                </Flex>
            </CustomLink> */}
            <Box w="100%" h="1px" bg="#e0e0e0" m="0.5rem 0"></Box>
            <Text color="#000" fontSize="12px" textAlign="center" fontWeight="500" opacity="0.5" mb="0.5rem">NFTSwap</Text>
            <Link href="/nftswap/create">
                <CustomLink _active={{}} _focus={{}}>
                    <Flex flexDirection="row">
                        <Button color="primary"  style={{padding: "0.8rem 0.5rem", width: "100%"}}>
                            <Icon as={IoCreateOutline} color="#000" w={6} h={6}  color={route==="/nftswap/create"?"#5664D2":"#748093"}></Icon>
                            <Text color="#000" fontWeight="600" m="auto 0 auto 0.5rem" mr="auto"  color={route==="/nftswap/create"?"#5664D2":"#748093"}>Create Swap</Text>
                        </Button>
                    </Flex>
            </CustomLink>
            </Link>
            <Link href="/nftswap/list">
                <CustomLink _active={{}} _focus={{}}>
                    <Flex flexDirection="row">
                        <Button color="primary"  style={{padding: "0.8rem 0.5rem", width: "100%"}}>
                            <Icon as={CgList} color="#000" w={6} h={6} color={route==="/nftswap/list"?"#5664D2":"#748093"}></Icon>
                            <Text color="#748093" fontWeight="600" m="auto 0 auto 0.5rem" mr={route==="/nftswap/list"?"#5664D2":"#748093"} mr="auto">Swap List</Text>
                        </Button>
                    </Flex>
                </CustomLink>
            </Link>
            <Box w="100%" h="1px" bg="#e0e0e0" m="0.5rem 0"></Box>
            <ConnectModal isOpen={isOpen} onClose={cloesModal}/>
        </Flex>
    )
}

export default Panel;