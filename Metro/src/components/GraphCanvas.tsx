import React, {CSSProperties} from 'react'
import * as echarts from 'echarts'
import {Edge, Graph} from '../data-structure/Base'
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

        let xMin = 180, yMin = 90
        let xLen = 0, yLen = 0

        graph.nodes.forEach(node => {
            if (node.lon < xMin) {
                xMin = node.lon
            }
            if (node.lon > xLen) {
                xLen = node.lon
            }
            if (node.lat < yMin) {
                yMin = node.lat
            }
            if (node.lat > yLen) {
                yLen = node.lat
            }
        })
        xLen -= xMin
        yLen -= yMin
        console.log(xMin, yMin, xLen, yLen)

        graph.nodes.forEach(node => {
            data.push({
                name: node.name,
                x: (node.lon - xMin) / xLen * this.chart.getWidth() * 1.2,
                y: (1 - (node.lat - yMin) / yLen) * this.chart.getHeight() * 1.2,
            })
        })
        console.log(data)

        for (let i = 0; i < graph.head.length; i += 1) {
            for (let e: Edge = graph.head[i]; e && e.next && e.node.id !== i + 1; e = e.next) {
                links.push({
                    source: graph.nodes[i].name,
                    target: e.node.name
                })
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
                symbolSize: 5,
                focus: 'adjacency',
                roam: true,
                data: data,
                label: {
                    show: true,
                    position: 'right'
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
