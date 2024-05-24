"use client";
import Image from "next/image"
import { useState, useEffect  } from 'react';
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit";
import AoConnect from "../../functions/Aoconnect.js"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const removeAnsiCodes = (str) => {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
};

export function Home() {
    const [selectedValue, setSelectedValue] = useState('');
    const [selectOptions, setSelectOptions] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [msgTotal, setMsgTotal] = useState(0);

    const activeAddress = useActiveAddress();

    useEffect(() => {
        if (activeAddress) {
            AoConnect.AoQueryProcesses(activeAddress).then(processInfoList => {
                setSelectOptions(processInfoList)
            })
        }
    }, [activeAddress]);
    useEffect(() => {
        AoConnect.AoGetPageRecordByApi(selectedValue.id).then(msgList => {
            console.info(msgList)
            setTableData(msgList.edges)
        })

        AoConnect.AoGetPageRecordByApi(selectedValue.id).then(msgList => {
            console.info(msgList)
            setTableData(msgList.edges)
        })

        console.info("arweaveWallet", window.arweaveWallet)
        AoConnect.AoSendMsg(window.arweaveWallet, selectedValue.id, "#Inbox", [{
            name: 'SDK',
            value: 'aoconnect'
        }, {name: 'Action', value: 'Eval'}]).then(r => {
            let { Messages, Spawns, Output, Error } = r;
            console.log(Output.data.output);
        })
    }, [selectedValue]);


    return (
        <>
        <div className="container mx-auto mt-10">
            <div className="flex flex-row-reverse">
                <ConnectButton
                    showBalance={true}
                />
            </div>
            <div class="flex flex-row">
                <div className="basis">
                    <Label htmlFor="terms">Process Name</Label>
                    <Select onValueChange={(value) => setSelectedValue(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Process" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Spawn New">Spawn New</SelectItem>
                                {selectOptions.map((option) => (
                                    <SelectItem key={option.id} value={option}>
                                        {option.Name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {selectedValue === 'Spawn New' ? (
                        <div className="mt-5 grid w-full max-w-sm items-center gap-1.5">
                            <Label>New Process Name</Label>
                            <Input id="newProcessName" placeholder="Input New Process Name" />
                        </div>
                    ):(
                        <div className="mt-5 grid w-full max-w-sm items-center gap-1.5">
                            <Label className="text-base font-semibold">Select Process Id:</Label>
                            <Label id="newProcessName">{selectedValue.id}</Label>
                        </div>
                    )}
                    <Button className="mt-5">Connect Process</Button>
                </div>

                <Table>
                    <TableCaption>Msg Box</TableCaption>
                    <TableHeader>
                        <TableRow>
                            {/*<TableHead className="w-[100px]">Index</TableHead>*/}
                            <TableHead>Output</TableHead>
                            {/*<TableHead>Messages</TableHead>*/}
                            {/*<TableHead className="text-right">Spawns</TableHead>*/}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.map((invoice) => (
                            <TableRow key={removeAnsiCodes(invoice.node.Output.data.toString())}>
                                {/*<TableCell className="font-medium">{invoice.node}</TableCell>*/}
                                <TableCell>{removeAnsiCodes(invoice.node.Output.data.toString())}</TableCell>
                                {/*<TableCell>{invoice.node.Messages}</TableCell>*/}
                                {/*<TableCell className="text-right">{invoice.node.Spawns}</TableCell>*/}
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3}>Message Total</TableCell>
                            <TableCell className="text-right">{msgTotal}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                {/*<div className="basis-1/2">最新消息</div>*/}
            </div>
        </div>
        </>
    )
}
