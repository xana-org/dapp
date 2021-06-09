import { useEffect }            from "react";
import { useRouter }            from "next/router";
import { Flex }                 from "@chakra-ui/core";
import useDidMount              from "../../hooks/useDidMount";
import { scrollToPosition }     from "../../lib/scroll";
import Panel                    from "../Panel";
import { useWallet }            from "use-wallet";

const Layout = ({ children }) => {
    const didMount = useDidMount();
    const router = useRouter();
    const { asPath } = router;

    const wallet = useWallet();
    /**
     * Scroll to top on each route change using `asPath` (resolved path),
     * not `pathname` (may be a dynamic route).
     */
    useEffect(() => {
      if (didMount) {
        scrollToPosition();
      }
    }, [asPath]);
  
    useEffect(() => {
      const status = window.localStorage.getItem("ZORA2");
      if (window.ethereum && status === "auto")
        wallet.connect("injected");
    }, []);

    useEffect(() => {
      const status = window.localStorage.getItem("ZORA2");
      if (window.ethereum && wallet && !wallet.ethereum && status === "auto") {
        wallet.connect("injected");
      }
    }, [wallet]);
  
    return (
        <Flex 
          w="100%"
          h="100vh"
          overflow="auto"
          flexDirection="column"
          bg="#000%"
          color="#fff"
        >
          <Flex flexDirection="row" h="100vh" overflowY="auto">
            <Panel/>
            <Flex h="100vh" overflowY="auto" w="100%">
              {children}              
            </Flex>
          </Flex>
        </Flex>
    );
  };
  
  export default Layout;