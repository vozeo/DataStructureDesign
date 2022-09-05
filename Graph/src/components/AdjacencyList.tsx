import React, {CSSProperties} from 'react'
import * as echarts from 'echarts'
import {Edge, Graph} from '../data-structure/Base'
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
        let xSeg = this.chart.getWidth() / graph.nodes.length * 2
        let ySeg = this.chart.getHeight() / graph.nodes.length

        for (let i = 0; i <= graph.head.length; i += 1) {
            data.push({
                name: 'head' + i.toString(),
                x: 0,
                y: i * ySeg
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
            let cnt = 0
            for (let e: Edge = graph.head[i]; e && e.next && e.node.id !== i + 1; e = e.next) {
                let nowName = (i + 1).toString() + '->' + e.node.id.toString()
                data.push({
                    name: nowName,
                    draggable: true,
                    x: (++cnt) * xSeg,
                    y: (i + 1) * ySeg,
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
                layout: 'none',
                symbolSize: 50,
                focus: 'adjacency',
                roam: true,
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
