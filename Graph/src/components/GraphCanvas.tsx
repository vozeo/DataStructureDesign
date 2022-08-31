import React, {CSSProperties} from 'react'
import * as echarts from 'echarts'
import {EdgeBase, Graph} from '../data-structure/NodeBase'
import {FreeKeyObject} from '../data-structure/FreeKeyObject'

export interface RelationChartProps {
    style?: CSSProperties
}

export class GraphCanvas extends React.Component<RelationChartProps> {
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

        graph.nodes.forEach(node => {
            data.push({
                name: node.id.toString(),
                draggable: true,
            })
        })

        console.log(graph.head)
        for (let i = 0; i < graph.head.length; i += 1) {
            for (let e: EdgeBase = graph.head[i]; e && e.next && e.node.id !== i + 1; e = e.next) {
                links.push({
                    source: (i + 1).toString(),
                    target: e.node.id.toString()
                })
            }
        }
        console.log(data, links)

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
                    repulsion: 100,
                    edgeLength: 100
                },
                data: data,
                label: {
                    show: true,
                },
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
