import { useWallet } from "use-wallet";
import {
    Flex,
    Box,
    Image,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    IconButton,
    Link
} from "@chakra-ui/core";
import {
    CloseIcon,
} from "@chakra-ui/icons";

const ConnectModal = (props) => {
    const wallet = useWallet();
    const handleConectClick = (connector) => {
        wallet.connect(connector);
        window.localStorage.setItem("ZORA2", "auto")
    }
    return (
        <Modal size="md" isOpen={props.isOpen} onClose={props.onClose}>
            <ModalOverlay/>
            <ModalContent borderRadius="10px">
                <IconButton
                    color="white"
                    icon={<CloseIcon/>}
                    position="absolute"
                    top="0.5rem"
                    right="0.5rem"
                    onClick={props.onClose}
                    bg="none"
                    _active={{}}
                    _focus={{}}
                    _hover={{}}
                />
                <Box p="1rem" bg="#5664D2" borderTopRadius="10px">
                    <Text color="#fff" fontSize="16px" fontWeight="bold" textAlign="center">Connect to your Wallet</Text>
                </Box>
                <Box
                    p="1rem"
                    bg="gray.300"
                    borderBottomRadius="10px"
                >
                    <Flex
                        flexDirection="row"
                        cursor="pointer"
                        onClick={() => handleConectClick("injected")}
                        p="0.5rem"
                        transition="0.3s"
                        _hover={{
                            bg: "#ccc",
                            transition: "0.3s"
                        }}
                        border="1px solid #9A5123"
                        borderRadius="10px"
                    >
                        <Image src="/images/panel/metamask.svg" w="3rem" m="auto 0"/>
                        <Flex flexDirection="column" m="auto 0 auto 2rem">
                            <Text fontSize="16px" fontWeight="bold">MetaMask</Text>
                            <Text fontSize="12px">Connect your Metamask Wallet.</Text>
                        </Flex>
                    </Flex>
                    <Text fontSize="14px" mt="1rem" color="#333">Please connect to ethereum mainnet to use this website!</Text>
                    <Flex flexDirection="row">
                        <Text fontSize="14px" fontWeight="600" color="#333" mr="0.5rem">New to Ethereum?</Text>
                        <Link target="blank" href="https://ethereum.org/en/wallets/">
                            <Text fontSize="14px" fontWeight="600" color="#9A5123">Learn more about wallets</Text>
                        </Link>
                    </Flex>
                </Box>
            </ModalContent>
        </Modal>
    )
}

export default ConnectModal;
