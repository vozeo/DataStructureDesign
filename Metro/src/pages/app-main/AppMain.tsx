import {
    InfoCircleOutlined,
} from '@ant-design/icons'
import {Button, Modal} from 'antd'
import React from 'react'
import {Node, Edge, Line, Graph} from '../../data-structure/Base'
import {MacroDefines} from '../../MacroDefines'
import {Deque} from '../../components/Deque'
import './AppMain.css'
import TextArea from "antd/es/input/TextArea";
import {GraphCanvas} from "../../components/GraphCanvas"
import {AdjacencyList} from "../../components/AdjacencyList"

type AppState = {
    nodeSelected: Node | null,
    relationDrawerVisible: boolean,
    recommendFriendDrawerVisible: boolean
}

const TimeSeg = 300;

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

    private randomGraph() {
        this.graph = new Graph()
        let n = Math.random() * 11 + 10
        let data = new Array<String>()
        for (let i = 0; i < n; i += 1) {
            let str = ''
            for (let j = 0; j < n; j += 1) {
                str += (Math.random() * 3 > 1 ? '0' : '1')
            }
            data.push(str)
        }
        this.graph.importGraph(data)
    }

    private dfsVisit = new Map<number, number>()
    private bfsVisit = new Map<number, number>()
    private stack = new Array<Node>()

    private sleep(milliseconds: number) {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    private async drawDfsStack() {
        this.dfsRef.current?.showGraph(this.stack, 'DFS Stack')
        await this.sleep(TimeSeg)
    }

    private async drawBfsQueue() {
        this.bfsRef.current?.showGraph(this.queue, 'BFS Queue')
        await this.sleep(TimeSeg)
    }

    private async dfs(now: number) {
        this.dfsVisit.set(now, 1)
        this.stack.push(this.graph.nodes[now - 1])
        await this.drawDfsStack()
        for (let e: Edge = this.graph.head[now - 1]; e && e.next && e.node.id !== now; e = e.next) {
            if (this.dfsVisit.get(e.node.id) !== 1) {
                await this.dfs(e.node.id)
            }
        }
        this.stack.pop()
        await this.drawDfsStack()
    }

    private queue = new Array<Node>()

    private async bfs(start: number) {
        this.queue.push(this.graph.nodes[start - 1])
        await this.drawBfsQueue()
        this.bfsVisit.set(start, 1)
        while (this.queue.length > 0) {
            let now = this.queue[0]
            this.queue.shift()
            await this.drawBfsQueue()
            for (let e: Edge = this.graph.head[now.id - 1]; e && e.next && e.node.id !== now.id; e = e.next) {
                if (this.bfsVisit.get(e.node.id) !== 1) {
                    this.queue.push(e.node)
                    this.bfsVisit.set(e.node.id, 1)
                    await this.drawBfsQueue()
                }
            }
        }
    }

    override render(): React.ReactNode {
        return <div className='pageContainer'>
            <div id='title'>Graph - 2053302</div>
            <Button
                id='randomBtn'
                onClick={
                    () => {
                        this.randomGraph()
                        this.graphRef.current?.showGraph(this.graph, 'Graph')
                        this.adjacencyRef.current?.showGraph(this.graph, 'Adjacency')
                    }
                }
                type='primary'
                shape='round'
            >
                Random Graph
            </Button>
            <Button
                id='importBtn'
                onClick={() => {
                    let importList: String[]
                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        importList = e.target.value.split('\n')
                    }
                    const handleOk = () => {
                        this.graph.importGraph(importList)
                        this.graphRef.current?.showGraph(this.graph, 'Graph')
                        this.adjacencyRef.current?.showGraph(this.graph, 'Adjacency')
                    }
                    Modal.info({
                        title: 'Import Graph List',
                        okText: 'Sure',
                        closable: true,
                        maskClosable: true,
                        centered: true,
                        content: <div>
                            <TextArea showCount onChange={onChange}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                        onOk: handleOk
                    })
                }}
                type='primary'
                shape='round'
            >
                Input Graph
            </Button>
            <Button
                id='dfsBtn'
                onClick={
                    async () => {
                        this.dfsVisit.clear()
                        this.stack = new Array<Node>()
                        for (let i = 1; i <= this.graph.nodes.length; i += 1) {
                            if (this.dfsVisit.get(i) !== 1) {
                                await this.dfs(i)
                            }
                        }
                    }
                }
                type='primary'
                shape='round'
            >
                DFS
            </Button>
            <Button
                id='bfsBtn'
                onClick={
                    async () => {
                        this.bfsVisit.clear()
                        this.queue = new Array<Node>()
                        for (let i = 1; i <= this.graph.nodes.length; i += 1) {
                            if (this.bfsVisit.get(i) !== 1) {
                                await this.bfs(i)
                            }
                        }
                    }
                }
                type='primary'
                shape='round'
            >
                BFS
            </Button>


            <div className='columnContainer'>
                <div className='rowContainer'>
                    <GraphCanvas style={{
                        borderRadius: '12px',
                        background: '#eef7f2af',
                        width: '46%',
                        height: '80%',
                        boxShadow: '0px 4px 10px #0005'
                    }} ref={this.graphRef}/>

                    <AdjacencyList style={{
                        borderRadius: '12px',
                        background: '#eef7f2af',
                        width: '46%',
                        height: '80%',
                        boxShadow: '0px 4px 10px #0005'
                    }} ref={this.adjacencyRef}/>
                </div>
                <div className='columnContainer' style={{height: 250}}>
                    <Deque style={{
                        borderRadius: '12px',
                        background: '#eef7f2af',
                        width: '96.3%',
                        height: 70,
                        boxShadow: '0px 4px 10px #0005',
                    }} ref={this.dfsRef}/>
                    <Deque style={{
                        borderRadius: '12px',
                        background: '#eef7f2af',
                        width: '96.3%',
                        height: 70,
                        boxShadow: '0px 4px 10px #0005',
                    }} ref={this.bfsRef}/>
                </div>
            </div>
        </div>
    }
}
