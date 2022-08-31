import React, {CSSProperties} from 'react'
import * as echarts from 'echarts'
import {EdgeBase, Graph, NodeBase} from '../data-structure/NodeBase'
import {FreeKeyObject} from '../data-structure/FreeKeyObject'

export interface RelationChartProps {
    style?: CSSProperties
}

export class AdjacencyList extends React.Component<RelationChartProps> {
    private readonly selfRef: React.RefObject<HTMLDivElement>
    private chart!: echarts.ECharts

    constructor(props: any) {
        super(props)
        this.selfRef = React.createRef()
        this.showGraph = this.showGraph.bind(this)
    }

    override render() {
        return <div
            ref={this.selfRef}
            style={this.props.style}
        />
    }

    override componentDidMount() {
        this.chart = echarts.init(this.selfRef.current!)
    }

    showGraph(graph: Graph, title: String) {
        this.setState({
            visibility: 'visible'
        })

        let data = new Array<FreeKeyObject>()
        let links = new Array<FreeKeyObject>()

        for (let i = 0; i <= graph.head.length; i += 1) {
            data.push({
                name: 'head' + i.toString(),
                draggable: true,
            })
        }

        for (let i = 0; i < graph.head.length; i += 1) {
            links.push({
                source: 'head' + i.toString(),
                target: 'head' + (i + 1).toString()
            })
        }

        for (let i = 0; i < graph.head.length; i += 1) {
            let lstName = 'head' + (i + 1).toString()
            for (let e: EdgeBase = graph.head[i]; e && e.next && e.node.id !== i + 1; e = e.next) {
                let nowName = (i + 1).toString() + '->' + e.node.id.toString()
                data.push({
                    name: nowName,
                    draggable: true,
                })
                links.push({
                    source: lstName,
                    target: nowName
                })
                lstName = nowName
            }
        }

        this.chart.clear()
        this.chart.setOption({
            title: {
                text: title,
            },
            series: [{
                type: 'graph',
                layout: 'force',
                symbolSize: 50,
                focus: 'adjacency',
                roam: true,
                force: {
                    repulsion: 1400,
                    edgeLength: 10
                },
                data: data,
                label: {
                    show: true,
                },
                edgeSymbol: ['', 'arrow'],
                edgeSymbolSize: [0, 10],
                links: links,
                lineStyle: {
                    opacity: 0.9,
                    width: 2,
                    curveness: 0
                },
            }]
        })
    }
}
