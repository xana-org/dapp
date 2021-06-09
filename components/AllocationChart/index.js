import { useEffect, useState }  from "react";
import { useWallet } from "use-wallet";
import { Doughnut } from 'react-chartjs-2';
import {
  colors,
  useTheme
} from '@material-ui/core';
import {
    Box,
    Text,
    Flex,
    Spinner
} from "@chakra-ui/core";
import BigNumber        from "bignumber.js";

const AllocationChart = (props) => {
    const { assets, totalUSD } = props;
    const theme = useTheme();
    const wallet = useWallet();

    const colorArr = [
        colors.red[600],
        colors.indigo[500],
        colors.orange[600],
        colors.green[500],
        colors.purple[500]
    ];

    const [data, setData] = useState({
        datasets: [
            {
                data: assets.map(item => {
                    if (!totalUSD || !parseFloat(totalUSD)) return 0;
                    const total = new BigNumber(totalUSD);
                    const balance = new BigNumber(item.total);
                    const percent = balance.dividedBy(total);
                    return parseFloat(percent.toString()) * 100;
                }),
                backgroundColor: [
                    colors.red[600],
                    colors.indigo[500],
                    colors.orange[600],
                    colors.green[500],
                    colors.purple[500],
                ],
                borderWidth: 4,
                borderColor: colors.common.white,
                hoverBorderColor: colors.common.white,
            }
        ],
        labels: assets.map(item => item.symbol)
    }); 

    const options = {
        animation: true,
        cutoutPercentage: 80,
        layout: { padding: 0 },
        legend: {
            display: false
        },
        maintainAspectRatio: false,
        responsive: true,
        tooltips: {
            backgroundColor: theme.palette.background.paper,
            bodyFontColor: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
            enabled: true,
            footerFontColor: theme.palette.text.secondary,
            intersect: false,
            mode: 'index',
            titleFontColor: theme.palette.text.primary
        }
    };

    useEffect(() => {
        setData({
            datasets: [
            {
                data: assets.map(item => {
                    if (!totalUSD || !parseFloat(totalUSD)) return 0;
                    const total = new BigNumber(totalUSD);
                    const balance = new BigNumber(item.total);
                    const percent = balance.dividedBy(total);
                    return parseFloat(percent.toString()) * 100;
                }),
                backgroundColor: [
                    colors.red[600],
                    colors.indigo[500],
                    colors.orange[600],
                    colors.green[500],
                    colors.purple[500],
                ],
                borderWidth: 4,
                borderColor: colors.common.white,
                hoverBorderColor: colors.common.white,
            }
            ],
            labels: assets.map(item => item.symbol)
        });
    }, [props]);

    return (
        <Flex flexDirection="column" w="100%">
            <Box h="300px" mb="1rem">
            {parseFloat(totalUSD)?
                <Doughnut
                    data={data}
                    options={options}
                />:
                <Flex flexDirection="column" justifyContent="center" m="auto">
                    {wallet && wallet.ethereum && assets.length === 0 ? 
                        <Spinner m="auto"/>:
                        <Text m="auto" fontSize="20px">No Assets</Text>
                    }
                </Flex>
            }
            </Box>
            <Flex flexDirection="row" flexWrap="wrap" mt="1rem">
            {assets.map((item, index) =>  {
                const total = new BigNumber(totalUSD);
                const balance = new BigNumber(item.total);
                let percent = total.eq("0")?0:balance.dividedBy(total);
                if (percent !== 0)
                    percent = parseFloat(percent.toString()) * 100;
                return (
                    <Flex key={index} mr="1rem" >
                        <Text color="#000" fontSize={["12px", "14px", "14x", "16px"]}>{item.symbol}: </Text>
                        <Text color={colorArr[index]} fontSize={["12px", "14px", "14x", "16px"]} fontWeight="bold" ml="0.5rem">{percent.toFixed(2)}%</Text>
                    </Flex>
                );
            })}
            </Flex>
        </Flex>
    );
};

export default AllocationChart;
