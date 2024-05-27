"use client";
import Image from "next/image"
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit";
import AoConnect from "@/functions/AoConnect.js"

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

const Home = () => {
    const [selectedValue, setSelectedValue] = useState({});
    const [selectOptions, setSelectOptions] = useState([]);
    const [newProcessName, setNewProcessName] = useState('');
    const [connected, setConnected] = useState(false);
    const [sending, setSending] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [msgTotal, setMsgTotal] = useState(0);


    const activeAddress = useActiveAddress();
    const SPAWN_NEW_LABEL = "Spawn New"

    useEffect(() => {
        queryAllProcesses(activeAddress);
    }, [activeAddress]);
    useEffect(() => {
        AoConnect.AoGetPageRecordByApi(selectedValue.id).then(msgList => {
            console.info(msgList)
            setTableData(msgList.edges)
        })
    }, [selectedValue]);

    const queryAllProcesses = (address) => {
        if (address) {
            AoConnect.AoQueryProcesses(address).then(processInfoList => {
                setSelectOptions(processInfoList)
            })
        }
    }

    const connectProcess = () => {
        if (window.arweaveWallet && selectedValue && selectedValue !== SPAWN_NEW_LABEL) {
            setConnected(true)
            resetConnectSuccessOutput(selectedValue.Name, selectedValue.id)
            // AoConnect.AoSendMsgReturnResult(window.arweaveWallet, selectedValue.id, "#Inbox", [{
            //     name: 'SDK',
            //     value: 'aoconnect'
            // }, {name: 'Action', value: 'Eval'}]).then(r => {
            //     let { Messages, Spawns, Output, Error } = r;
            //     if (Output.data.output) {
            //         setMsgTotal(Output.data.output)
            //     }
            // })
        }
    };

    const spawnProcess = () => {
        if (window.arweaveWallet && selectedValue && selectedValue === SPAWN_NEW_LABEL && newProcessName) {
            const tags = [
                { name: "App-Name", value: "aos" },
                { name: "aos-Version", value: "1.10.30" },
                { name: "Name", value: newProcessName },
            ];
            AoConnect.AoCreateProcess(window.arweaveWallet, AoConnect.DEFAULT_MODULE, AoConnect.DEFAULT_SCHEDULER, tags).then(processId => {
                setSelectOptions([...selectOptions, {"id": processId,"Name": newProcessName}])
                console.info([...selectOptions, {"id": processId,"Name": newProcessName}])
                setSelectedValue({"id": processId,"Name": newProcessName})
                queryAllProcesses(activeAddress)
                setConnected(true)
                resetConnectSuccessOutput(newProcessName, processId)
            });
        }
    };

    const sendMsg = (input, inputData) => {
        setSending(true)
        const BaseTags = [{name: 'SDK', value: 'aoconnect'}, {name: 'Action', value: 'Eval'}];
        AoConnect.AoSendMsgReturnResult(window.arweaveWallet, selectedValue.id, inputData, BaseTags).then(r => {
            let { Messages, Spawns, Output, Error } = r;
            if (Output.data.output) {
                const newOutput = { id: output.length, command: input, response: Output.data.output };
                setOutput([...output, newOutput]);
            } else {
                const newOutput = { id: output.length, command: input, response: "undefined" };
                setOutput([...output, newOutput]);
            }
        }).finally(()=>{
            setSending(false)
        }).catch((e)=>{
            const newOutput = { id: output.length, command: input, response: e.message };
            setOutput([...output, newOutput]);
            setSending(false)
        })
    }


    const [input, setInput] = useState('');
    const [output, setOutput] = useState([{ id: 1, command: null, response: `Please connect first` }]);
    const [history, setHistory] = useState([]); // 存储命令历史
    const [historyIndex, setHistoryIndex] = useState(-1); // 命令历史索引
    const terminalRef = useRef(null);
    const inputRef = useRef(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalInput, setModalInput] = useState('');

    useEffect(() => {
        // 当输出内容变化时，自动滚动到输入框所在位置
        const terminal = terminalRef.current;
        terminal.scrollTop = terminal.scrollHeight - terminal.clientHeight / 2;
    }, [output]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleDivClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const resetNotConnectOutput = () => {
        const newOutput = { id: output.length, command: null, response: `Please connect first` };
        setOutput([newOutput]);
    }

    const resetConnectSuccessOutput = (processName, processId) => {
        const newOutput = { id: output.length, command: null, response: `${processName} ${processId} connected` };
        setOutput([newOutput]);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim() !== '') {
                if (input.startsWith('.load') && !input.startsWith('.load-blueprint')) {
                    setModalVisible(true);
                } else if (input.startsWith('.load-blueprint chat')) {
                    fetch("https://raw.githubusercontent.com/permaweb/aos/main/blueprints/chat.lua").then((response)=>{
                        response.text().then((inputData)=>{
                            console.info(inputData)
                            sendMsg(input, inputData)
                            setHistory([input, ...history]);
                            setHistoryIndex(-1);
                            setInput('');
                        })
                    })
                } else if (input.startsWith('.load-blueprint token')) {
                    fetch("https://raw.githubusercontent.com/permaweb/aos/main/blueprints/token.lua").then((response)=>{
                        response.text().then((inputData)=>{
                            console.info(inputData)
                            sendMsg(input, inputData)
                            setHistory([input, ...history]);
                            setHistoryIndex(-1);
                            setInput('');
                        })
                    })
                } else {
                    sendMsg(input, input)
                    setHistory([input, ...history]);
                    setHistoryIndex(-1);
                    setInput('');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0 && historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setInput(history[newIndex]);
                setHistoryIndex(newIndex);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setInput(history[newIndex]);
                setHistoryIndex(newIndex);
            } else {
                setInput('');
                setHistoryIndex(-1);
            }
        }
    };

    const handleModalInputChange = (event) => {
        setModalInput(event.target.value);
    };

    const handleModalSubmit = () => {
        setModalVisible(false);
        sendMsg(input, modalInput)
        setHistory([input, ...history]);
        setHistoryIndex(-1);
        setInput('');
    };

    const handleModalClose = () => {
        setModalVisible(false);
    };

    const ansiToHtml = (text) => {
        // 定义 ANSI 颜色到 HTML 颜色的映射
        const colorMap = {
            '0': '#000000', // black
            '30': '#000000', // black
            '31': '#ff0000', // red
            '32': '#00ff00', // green
            '33': '#ffff00', // yellow
            '34': '#0000ff', // blue
            '35': '#ff00ff', // magenta
            '36': '#00ffff', // cyan
            '37': '#ffffff', // white
        };

        // 使用正则表达式匹配 ANSI 颜色代码并替换为相应的 HTML 颜色标签
        return text.replace(/\033\[(\d+)m(.*?)\033\[0m/g, (match, colorCode, content) => {
            const color = colorMap[colorCode] || '#ffffff'; // 默认为白色
            return `<span style="color: ${color};">${content}</span>`;
        })
            // 将制表符替换为四个空格
            .replace(/\t/g, '    ')
            // 将换行符替换为 HTML 的换行标签
            .replace(/\n/g, '<br/>');
    }
    return (
        <>
        <div className="container mx-auto mt-10">
            <div className="flex flex-row-reverse">
                <ConnectButton
                    showBalance={true}
                />
            </div>

            <div className="flex flex-wrap">
                <div className="w-1/3 p-2">
                    <Label htmlFor="terms" className="text-base font-semibold">Process Name</Label>
                    <Select onValueChange={(value) => setSelectedValue(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Process" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={SPAWN_NEW_LABEL} >Spawn New</SelectItem>
                                {selectOptions.map((option) => (
                                    <SelectItem key={option.id} value={option}>
                                        {option.Name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                {selectedValue === SPAWN_NEW_LABEL ? [
                    <div className="w-1/3 p-2">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label className="text-base font-semibold">New Process Name</Label>
                            <Input id="newProcessName" placeholder="Input New Process Name" value={newProcessName} onChange={(event)=>{setNewProcessName(event.target.value);}}/>
                        </div>
                    </div>,
                    <div className="w-1/3 p-2 flex items-center justify-center">
                        <Button className="mt-2.5" onClick={spawnProcess}>Spawn Process</Button>
                    </div>
                ]:[
                    <div className="w-1/3 p-2">
                        <div className="flex flex-col w-full max-w-sm justify-center gap-1.5">
                            <Label className="text-base font-semibold">Select Process Id:</Label>
                            <Label id="newProcessName">{selectedValue?.id}</Label>
                        </div>
                    </div>,
                    <div className="w-1/3 p-2 flex items-center justify-center">
                        <Button className="mt-2.5" onClick={connectProcess}>Connect Process</Button>
                    </div>
                ]}

            </div>

            <div className="text-white sm:h-[80vh] md:h-[80vh] lg:h-[80vh] xl:h-[80vh] w-full p-6 bg-gray-800">
                <div
                    onClick={handleDivClick}
                    ref={terminalRef}
                    className="overflow-y-auto h-full p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900"
                    style={{ maxHeight: 'calc(100vh - 4rem)' }}
                >
                    {output.map(({ id, command, response }) => (
                        <div key={id} className="">
                            {
                                command ? (
                                    <div><span className="text-green-500">aos&gt;</span> {command}</div>
                                ) : null
                            }

                            <div dangerouslySetInnerHTML={{ __html: ansiToHtml(response) }}></div>
                        </div>
                    ))}
                    {
                        connected?(
                            sending?(
                                <span className="text-green-500">...</span>
                            ):(<div className="flex">
                                <span className="text-green-500">aos&gt;</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    className="bg-transparent border-none shadow-none focus:outline-none focus:ring-0 p-0 text-white ml-2"
                                    placeholder="Type a command..."
                                    autoFocus
                                />
                            </div>

                            )
                        ):(null)
                    }
                </div>
            </div>
            {modalVisible && createPortal(
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg overflow-hidden shadow-lg lg:w-1/2 xl:w-1/2 w-full relative">
                        <button
                            onClick={handleModalClose}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lua Code Editor</h2>
                        <textarea
                            value={modalInput}
                            onChange={handleModalInputChange}
                            className="bg-gray-100 border-2 border-gray-300 p-4 w-full h-48 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 mb-4"
                            placeholder="Enter code load into process..."
                        ></textarea>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Code Clipboard (Enter expression and press "Load" to load your process.)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <button
                                    onClick={() => setModalInput('')}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-300 focus:outline-none"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleModalSubmit}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                                >
                                    Load
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}


            {/*<Table>*/}
            {/*    <TableCaption>Msg Box</TableCaption>*/}
            {/*    <TableHeader>*/}
            {/*        <TableRow>*/}
            {/*            /!*<TableHead className="w-[100px]">Index</TableHead>*!/*/}
            {/*            <TableHead>Output</TableHead>*/}
            {/*            /!*<TableHead>Messages</TableHead>*!/*/}
            {/*            /!*<TableHead className="text-right">Spawns</TableHead>*!/*/}
            {/*        </TableRow>*/}
            {/*    </TableHeader>*/}
            {/*    <TableBody>*/}
            {/*        {tableData.map((invoice) => (*/}
            {/*            <TableRow key={removeAnsiCodes(invoice.node.Output.data.toString())}>*/}
            {/*                /!*<TableCell className="font-medium">{invoice.node}</TableCell>*!/*/}
            {/*                <TableCell>{removeAnsiCodes(invoice.node.Output.data.toString())}</TableCell>*/}
            {/*                /!*<TableCell>{invoice.node.Messages}</TableCell>*!/*/}
            {/*                /!*<TableCell className="text-right">{invoice.node.Spawns}</TableCell>*!/*/}
            {/*            </TableRow>*/}
            {/*        ))}*/}
            {/*    </TableBody>*/}
            {/*    <TableFooter>*/}
            {/*        <TableRow>*/}
            {/*            <TableCell colSpan={3}>Message Total</TableCell>*/}
            {/*            <TableCell className="text-right">{msgTotal}</TableCell>*/}
            {/*        </TableRow>*/}
            {/*    </TableFooter>*/}
            {/*</Table>*/}
            {/*<div className="basis-1/2">最新消息</div>*/}

        </div>
        </>
    )
}
export default Home;