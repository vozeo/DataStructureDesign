import {
    InfoCircleOutlined,
} from '@ant-design/icons'
import {Button, Modal, Space, Table, Input} from 'antd'
import React from 'react'
import {Node, Edge, Line, Graph} from '../../data-structure/Base'
import {MacroDefines} from '../../MacroDefines'
import './AppMain.css'
import TextArea from "antd/es/input/TextArea";
import type {ColumnsType} from 'antd/es/table';
import {GraphCanvas} from "../../components/GraphCanvas"
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
}

export default class AppMain extends React.Component<any, AppState> {
    private graph = new Graph()
    private lines = new Array<Line>()
    private readonly graphRef: React.RefObject<GraphCanvas>

    constructor(props: any) {
        super(props)
        this.graphRef = React.createRef()
        Modal.info({
            title: 'Graph',
            okText: 'Sure',
            closable: true,
            maskClosable: true,
            centered: true,
            content: <div>
                Author: 2053302<br/>
                First, tap input or random to get some data.<br/>
                Then, tap BFS or DFS to show the queue or stack.<br/>
            </div>,
            icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>
        })
    }

    private InputError() {
        Modal.info({
            title: 'Input Error',
            okText: 'OK',
            closable: true,
            maskClosable: true,
            centered: true,
            content: <div>
                Your input data has error, please input correct data!
            </div>,
            icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
        })
    }

    private loadDefaultData() {
        this.graph = new Graph()
        let nodes: Array<InputNode> = JSON.parse(StationData)
        nodes.forEach(node => {
            this.graph.addNode(node.name, node.lon, node.lat)
        })
        console.log(this.graph.nodes)
        this.lines = new Array<Line>()
        let lines: Array<InputLine> = JSON.parse(LineData)
        lines.forEach(line => {
            this.lines.push(new Line(line.name, line.stations))
        })
        console.log(this.lines)
        this.graph.updateGraph(this.lines)
    }

    private addStation(data: string) {
        try {
            let inputNodes: Array<InputNode> = JSON.parse(data)
            inputNodes.forEach(node => {
                if (!this.graph.NameToId.has(node.name)) {
                    this.graph.addNode(node.name, node.lon, node.lat)
                }
            })
        } catch (e) {
            this.InputError()
        }
    }

    private deleteStation(data: string) {
        try {
            let inputNodes: Array<string> = JSON.parse(data)
            inputNodes.forEach(name => {
                this.graph.deleteNode(name)
            })
        } catch (e) {
            this.InputError()
        }
    }

    private addLine(data: string) {
        try {
            let inputLines: Array<InputLine> = JSON.parse(data)
            inputLines.forEach(line => {
                line.stations.forEach(station => {
                    if (!this.graph.NameToId.has(station)) {
                        throw new Error('The station has not be inputted!')
                    }
                })
                this.lines.push(new Line(line.name, line.stations))
            })
        } catch (e) {
            this.InputError()
        }
    }

    private deleteLine(data: string) {
        try {
            let inputLines: Array<string> = JSON.parse(data)
            inputLines.forEach(name => {
                for (let i = 0; i < this.lines.length; ++i) {
                    if (this.lines[i].name === name) {
                        this.lines.splice(i, 1)
                        break
                    }
                }
            })
        } catch (e) {
            this.InputError()
        }
    }

    private bfsVisit = new Map<number, number>()
    private queue = new Array<NodeBfsState>()

    private async bfs(start: string, end: string) {
        let startNode: Node = this.graph.nodes[0]
        for (let node of this.graph.nodes) {
            if (node.name === start) {
                startNode = node
                break
            }
        }
        this.queue.push({
            node: startNode,
            line: Array<Node>(startNode),
        })
        this.bfsVisit.set(startNode.id, 1)
        while (this.queue.length > 0) {
            let now = this.queue[0]
            if (now.node.name === end) {
                return this.queue[0].line
            }
            this.queue.shift()
            for (let e: Edge = this.graph.head[now.node.id - 1]; e && e.next && e.node.id !== now.node.id; e = e.next) {
                if (this.bfsVisit.get(e.node.id) !== 1) {
                    let nowLine = now.line
                    nowLine.push(e.node)
                    this.queue.push({
                        node: e.node,
                        line: nowLine
                    })
                    this.bfsVisit.set(e.node.id, 1)
                }
            }
        }
        return new Array<Node>()
    }

    override render(): React.ReactNode {
        return <div className='pageContainer'>
            <div id='title'>Metro - 2053302</div>
            <Button
                id='randomBtn'
                onClick={() => {
                    this.loadDefaultData()
                    this.graphRef.current?.showGraph(this.graph, 'Graph')
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
                                            <TextArea showCount onChange={onChange}/>
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
                            <Table dataSource={this.graph.nodes} columns={StationColumns}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                        onOk: () => {
                            this.graph.updateGraph(this.lines)
                            this.graphRef.current?.showGraph(this.graph, 'Graph')
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
                                            <TextArea showCount onChange={onChange} placeholder={'Add Station'}/>
                                        </div>,
                                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                                        onOk: () => {
                                            this.addLine(inputData)
                                        }
                                    })
                                }}
                            >
                                Add Line
                            </Button>
                            <Button
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
                                            <TextArea showCount onChange={onChange}/>
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
                            <Table dataSource={this.lines} columns={LineColumns} expandable={{
                                expandedRowRender: line => <p style={{margin: 0}}>{line.nodeListJson}</p>,
                            }}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                        onOk: () => {
                            this.graph.updateGraph(this.lines)
                            this.graphRef.current?.showGraph(this.graph, 'Graph')
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
                    let ansLine = this.bfs('', '')
                }}
                type='primary'
                shape='round'
            >
                Find Way
            </Button>

            <GraphCanvas style={{
                borderRadius: '12px',
                background: '#eef7f2af',
                width: '98%',
                height: '90%',
                boxShadow: '0px 4px 10px #0005'
            }} ref={this.graphRef}/>


        </div>
    }
}
