import {
    InfoCircleOutlined,
} from '@ant-design/icons'
import {Button, Modal} from 'antd'
import React from 'react'
import {Node, Edge, Graph} from '../../data-structure/Base'
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
    private readonly bfsRef: React.RefObject<Deque>
    private readonly dfsRef: React.RefObject<Deque>
    private readonly graphRef: React.RefObject<GraphCanvas>
    private readonly adjacencyRef: React.RefObject<AdjacencyList>

    constructor(props: any) {
        super(props)
        this.bfsRef = React.createRef()
        this.dfsRef = React.createRef()
        this.graphRef = React.createRef()
        this.adjacencyRef = React.createRef()

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

    // Generate random graph
    private randomGraph() {
        this.graph = new Graph()
        let n = Math.random() * 11 + 10
        let data = new Array<String>() // Generate random graph data
        for (let i = 0; i < n; i += 1) {
            let str = ''
            for (let j = 0; j < n; j += 1) {
                str += (Math.random() * 3 > 1 ? '0' : '1')
            }
            data.push(str)
        }
        this.graph.importGraph(data) // Import graph data
    }

    private dfsVisit = new Map<number, number>()
    private bfsVisit = new Map<number, number>()
    private stack = new Array<Node>()

    private sleep(milliseconds: number) {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    private async drawDfsStack() {
        this.dfsRef.current?.showGraph([this.stack], 'DFS Stack')
        await this.sleep(TimeSeg)
    }

    private async drawBfsQueue() {
        this.bfsRef.current?.showGraph([this.queue], 'BFS Queue')
        await this.sleep(TimeSeg)
    }


    private dfsRes = new Array<Node>() // Show the result of DFS
    // Recursive Dfs
    private async dfs(now: number) {
        this.dfsVisit.set(now, 1)
        this.stack.push(this.graph.nodes[now - 1]) // Push the node into stack
        this.dfsRes.push(this.graph.nodes[now - 1])
        await this.drawDfsStack() // Draw the stack
        for (let e: Edge = this.graph.head[now - 1]; e && e.next && e.node.id !== now; e = e.next) {
            if (this.dfsVisit.get(e.node.id) !== 1) { // If the node is not visited
                await this.dfs(e.node.id)
            }
        }
        this.stack.pop() // Pop the node from stack
        await this.drawDfsStack()
    }

    // Non-recursive Dfs
    private async dfsNonRecursive(start: number) {
        this.dfsVisit.set(start, 1) // Set the start node as visited
        this.stack.push(this.graph.nodes[start - 1])
        this.dfsRes.push(this.graph.nodes[start - 1]) // Push the start node into result
        await this.drawDfsStack()
        while (this.stack.length > 0) {
            let now = this.stack.pop()?.id! // Get the front node of stack
            for (let e: Edge = this.graph.head[now - 1]; e && e.next && e.node.id !== now; e = e.next) { // Traverse the adjacency list
                if (this.dfsVisit.get(e.node.id) !== 1) { // If the node is not visited
                    this.stack.push(this.graph.nodes[now - 1])
                    this.dfsRes.push(this.graph.nodes[now - 1])
                }
            }
        }
        await this.drawDfsStack()
    }

    private queue = new Array<Node>()
    private bfsRes = new Array<Node>()

    // Bfs
    private async bfs(start: number) {
        this.queue.push(this.graph.nodes[start - 1]) // Push the start node into queue
        await this.drawBfsQueue()
        this.bfsVisit.set(start, 1)
        while (this.queue.length > 0) {
            let now = this.queue[0]
            this.queue.shift() // Pop the front node from queue
            await this.drawBfsQueue()
            this.bfsRes.push(now)
            for (let e: Edge = this.graph.head[now.id - 1]; e && e.next && e.node.id !== now.id; e = e.next) {
                if (this.bfsVisit.get(e.node.id) !== 1) { // If the node is not visited
                    this.queue.push(e.node)
                    this.bfsVisit.set(e.node.id, 1)
                    await this.drawBfsQueue() // Draw the queue
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
                        let res = this.graph.importGraph(importList)
                        if (res !== 0) {
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
                            return
                        }
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
                        let dfsShow = new Array<Array<Node>>()
                        for (let i = 1; i <= this.graph.nodes.length; i += 1) {
                            if (this.dfsVisit.get(i) !== 1) {
                                this.stack = new Array<Node>()
                                this.dfsRes = new Array<Node>()
                                await this.dfs(i)
                                dfsShow.push(this.dfsRes)
                            }
                        }
                        this.dfsRef.current?.showGraph(dfsShow, 'DFS Result')
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
                        let bfsShow = new Array<Array<Node>>()
                        for (let i = 1; i <= this.graph.nodes.length; i += 1) {
                            if (this.bfsVisit.get(i) !== 1) {
                                this.queue = new Array<Node>()
                                this.bfsRes = new Array<Node>()
                                await this.bfs(i)
                                bfsShow.push(this.bfsRes)
                            }
                        }
                        this.bfsRef.current?.showGraph(bfsShow, 'BFS Result')
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
