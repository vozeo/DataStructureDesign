import {
    InfoCircleOutlined,
} from '@ant-design/icons'
import {Button, Modal, Table, Input} from 'antd'
import React from 'react'
import {Node, Edge, Line, Graph} from '../../data-structure/Base'
import {MacroDefines} from '../../MacroDefines'
import './AppMain.css'
import TextArea from "antd/es/input/TextArea";
import type {ColumnsType} from 'antd/es/table';
import {GraphCanvas} from "../../components/GraphCanvas"
import {Deque} from "../../components/Deque"
import {LineData, StationData} from "../../data/Data";

type AppState = {
    nodeSelected: Node | null,
    relationDrawerVisible: boolean,
    recommendFriendDrawerVisible: boolean
}

const StationColumns: ColumnsType<Node> = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Lon',
        dataIndex: 'lon',
        key: 'lon',
    },
    {
        title: 'Lat',
        dataIndex: 'lat',
        key: 'lat',
    },
]

const LineColumns: ColumnsType<Line> = [
    {
        title: 'Line Name',
        dataIndex: 'name',
        key: 'name',
    },
    Table.EXPAND_COLUMN
]

interface InputNode {
    name: string
    lon: number
    lat: number
}

interface InputLine {
    name: string
    stations: Array<string>
}

interface NodeBfsState {
    node: Node
    line: Array<Node>
    transfer: Array<string>
}

export default class AppMain extends React.Component<any, AppState> {
    private graph = new Graph()
    private lines = new Array<Line>()
    private readonly graphRef: React.RefObject<GraphCanvas>
    private readonly bfsRef: React.RefObject<Deque>

    constructor(props: any) {
        super(props)
        this.graphRef = React.createRef()
        this.bfsRef = React.createRef()
        Modal.info({
            title: 'Graph',
            okText: 'Sure',
            closable: true,
            maskClosable: true,
            centered: true,
            content: <div>
                Author: 2053302<br/>
                Tap Default Lines to load default data.<br/>
                Tap Station Manage to view, add and delete stations.<br/>
                Tap Line Manage to view, add and delete lines.<br/>
                Tap Find Way to find the way from start station to finish station.<br/>
            </div>,
            icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>
        })
    }

    private InputError(text: string) {
        Modal.info({
            title: 'Input Error',
            okText: 'OK',
            closable: true,
            maskClosable: true,
            centered: true,
            content: <div>
                {text}
            </div>,
            icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
        })
    }

    // load the default data of the metro
    private loadDefaultData() {
        this.graph = new Graph()
        let nodes: Array<InputNode> = JSON.parse(StationData) // prase the data of the station 
        nodes.forEach(node => {
            this.graph.addNode(node.name, node.lon, node.lat)
        })
        this.lines = new Array<Line>()
        let lines: Array<InputLine> = JSON.parse(LineData) // parse the data of the line
        lines.forEach(line => {
            this.lines.push(new Line(line.name, line.stations))
        })
        this.graph.updateGraph(this.lines) // update the graph
    }

    // add the stations from the input data
    private addStation(data: string) {
        try {
            let inputNodes: Array<InputNode> = JSON.parse(data) // parse the input data
            inputNodes.forEach(node => {
                if (!this.graph.NameToId.has(node.name)) { // if the station has not in the graph
                    this.graph.addNode(node.name, node.lon, node.lat)
                }
            })
        } catch (e) {
            this.InputError('Add station data has error, please input correct data!')
        }
    }

    // delete the stations from the input data
    private deleteStation(data: string) {
        try {
            let inputNodes: Array<string> = JSON.parse(data) // parse the input data
            inputNodes.forEach(name => {
                this.graph.deleteNode(name) // delete the station
            })
        } catch (e) {
            this.InputError('Delete station data has error, please input correct data!')
        }
    }

    // add the lines from the input data
    private addLine(data: string) {
        try {
            let inputLines: Array<InputLine> = JSON.parse(data) // parse the input data
            inputLines.forEach(line => {
                line.stations.forEach(station => {
                    if (!this.graph.NameToId.has(station)) { // if the station has not in the graph
                        throw new Error('The station has not be inputted!')
                    }
                })
                this.lines.push(new Line(line.name, line.stations)) // add the line
            })
        } catch (e) {
            this.InputError('Add line data has error, please input correct data!')
        }
    }

    // delete the lines from the input data
    private deleteLine(data: string) {
        try {
            let inputLines: Array<string> = JSON.parse(data) // parse the input data
            inputLines.forEach(name => {
                for (let i = 0; i < this.lines.length; ++i) {
                    if (this.lines[i].name === name) { // if the line has in the graph
                        this.lines.splice(i, 1) // delete the line
                        break
                    }
                }
            })
        } catch (e) {
            this.InputError('Delete line data has error, please input correct data!')
        }
    }

    private bfsVisit = new Map<number, number>()
    private queue = new Array<NodeBfsState>()

    // find the way from start station to finish station
    private bfs(start: string, end: string) {
        this.bfsVisit = new Map<number, number>() // clear the bfs visit
        let startNode: Node = new Node(-1, '', 0.0, 0.0)
        for (let node of this.graph.nodes) { // find start node
            if (node.name === start) {
                startNode = node
                break
            }
        }
        if (startNode.id === -1 || !this.graph.NameToId.has(end)) { // start node not found or end node not found
            this.InputError('Input station is not found, please input correct data!')
            return null
        }
        this.queue.push({
            node: startNode,
            line: Array<Node>(startNode),
            transfer: Array<string>(startNode.name)
        })
        this.bfsVisit.set(startNode.id, 1) // set the start node as visited
        while (this.queue.length > 0) {
            let now = this.queue[0]
            if (now.node.name === end) { // if the end node is found
                return now
            }
            this.queue.shift()
            for (let e: Edge = this.graph.head[now.node.id]; e && e.next && e.node.id !== now.node.id; e = e.next) {
                if (this.bfsVisit.get(e.node.id) !== 1) { // if the node has not been visited
                    let nowLine = now.line.slice()
                    nowLine.push(e.node)
                    let nowTransfer = now.transfer.slice() // copy the transfer array
                    if (nowTransfer.length <= 1 || nowTransfer[nowTransfer.length - 2] !== e.lineName) { // if the current edge is not same as the last edge
                        nowTransfer.push(e.lineName)
                        nowTransfer.push(e.node.name)
                    } else {
                        nowTransfer.pop()
                        nowTransfer.push(e.node.name)
                    }
                    this.queue.push({
                        node: e.node,
                        line: nowLine,
                        transfer: nowTransfer
                    })
                    this.bfsVisit.set(e.node.id, 1) // set the node as visited
                }
            }
        }
        return null
    }

    override render(): React.ReactNode {
        return <div className='pageContainer'>
            <div id='title'>Metro - 2053302</div>
            <Button
                id='randomBtn'
                onClick={() => {
                    this.loadDefaultData()
                    this.graphRef.current?.showGraph(this.graph, 'Graph', this.lines)
                }}
                type='primary'
                shape='round'
            >
                Default Lines
            </Button>
            <Button
                id='importBtn'
                onClick={() => {
                    Modal.info({
                        title: 'Station Manage',
                        okText: 'OK',
                        closable: true,
                        maskClosable: true,
                        centered: true,
                        content: <div>
                            <Button
                                id='addStationBtn'
                                onClick={() => {
                                    let inputData = ''
                                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                        inputData = e.target.value
                                    };
                                    Modal.info({
                                        title: 'Add Station',
                                        okText: 'OK',
                                        closable: true,
                                        maskClosable: true,
                                        centered: true,
                                        content: <div>
                                            <TextArea showCount onChange={onChange}
                                                      placeholder={'[{"name":"","lon":0.0,"lat":0.0}]'}/>
                                        </div>,
                                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                                        onOk: () => {
                                            this.addStation(inputData)
                                        }
                                    })
                                }}
                            >
                                Add Station
                            </Button>
                            <Button
                                id='deleteStationBtn'
                                onClick={() => {
                                    let inputData = ''
                                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                        inputData = e.target.value
                                    };
                                    Modal.info({
                                        title: 'Delete Station',
                                        okText: 'OK',
                                        closable: true,
                                        maskClosable: true,
                                        centered: true,
                                        content: <div>
                                            <TextArea showCount onChange={onChange} placeholder={'[""]'}/>
                                        </div>,
                                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                                        onOk: () => {
                                            this.deleteStation(inputData)
                                        }
                                    })
                                }}
                            >
                                Delete Station
                            </Button>
                            <Table dataSource={this.graph.nodes} columns={StationColumns} rowKey='name'/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                        onOk: () => {
                            this.graph.updateGraph(this.lines)
                            this.graphRef.current?.showGraph(this.graph, 'Graph', this.lines)
                        }
                    })
                }}
                type='primary'
                shape='round'
            >
                Station Manage
            </Button>
            <Button
                id='dfsBtn'
                onClick={() => {
                    Modal.info({
                        title: 'Line Manage',
                        okText: 'OK',
                        closable: true,
                        maskClosable: true,
                        centered: true,
                        content: <div>
                            <Button
                                id='addLineBtn'
                                onClick={() => {
                                    let inputData = ''
                                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                        inputData = e.target.value
                                    };
                                    Modal.info({
                                        title: 'Add Line',
                                        okText: 'OK',
                                        closable: true,
                                        maskClosable: true,
                                        centered: true,
                                        content: <div>
                                            <TextArea showCount onChange={onChange}
                                                      placeholder={'{"name":"","stations":[""]}'}/>
                                        </div>,
                                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                                        onOk: () => {
                                            this.addLine(inputData)
                                            console.log(this.lines[0])
                                        }
                                    })
                                }}
                            >
                                Add Line
                            </Button>
                            <Button
                                id='deleteLineBtn'
                                onClick={() => {
                                    let inputData = ''
                                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                        inputData = e.target.value
                                    };
                                    Modal.info({
                                        title: 'Delete Line',
                                        okText: 'OK',
                                        closable: true,
                                        maskClosable: true,
                                        centered: true,
                                        content: <div>
                                            <TextArea showCount onChange={onChange} placeholder={'[""]'}/>
                                        </div>,
                                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                                        onOk: () => {
                                            this.deleteLine(inputData)
                                        }
                                    })
                                }}
                            >
                                Delete Line
                            </Button>
                            <Table dataSource={this.lines} columns={LineColumns} rowKey='name' expandable={{
                                expandedRowRender: line => <p style={{margin: 0}}>{line.nodeListJson}</p>,
                            }}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                        onOk: () => {
                            this.graph.updateGraph(this.lines)
                            this.graphRef.current?.showGraph(this.graph, 'Graph', this.lines)
                        }
                    })
                }}
                type='primary'
                shape='round'
            >
                Line Manage
            </Button>
            <Button
                id='bfsBtn'
                onClick={() => {
                    let start: string, finish: string
                    const onChangeStart = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        start = e.target.value
                    }
                    const onChangeFinish = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        finish = e.target.value
                    }
                    Modal.info({
                        title: 'Find Way',
                        okText: 'OK',
                        closable: true,
                        maskClosable: true,
                        centered: true,
                        content: <div>
                            <Input showCount onChange={onChangeStart} placeholder={'Start'}/>
                            <br/><br/>
                            <Input showCount onChange={onChangeFinish} placeholder={'Finish'}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                        onOk: () => {
                            let way = this.bfs(start, finish)
                            if (way != null) {
                                this.graphRef.current?.showGraph(this.graph, 'Graph', this.lines, way.line)
                                this.bfsRef.current?.showGraph(way.transfer, 'Found Way')
                            }
                        }
                    })
                }}
                type='primary'
                shape='round'
            >
                Find Way
            </Button>

            <br/>
            <GraphCanvas style={{
                borderRadius: '12px',
                background: '#eef7f2af',
                width: '98%',
                height: '86%',
                boxShadow: '0px 4px 10px #0005',
            }} ref={this.graphRef}/>
            <Deque style={{
                borderRadius: '12px',
                background: '#eef7f2af',
                width: '98%',
                height: '7%',
                boxShadow: '0px 4px 10px #0005'
            }} ref={this.bfsRef}/>

        </div>
    }
}
