import React, {CSSProperties} from 'react'
import * as echarts from 'echarts'
import {Node} from '../data-structure/Base'
import {FreeKeyObject} from '../data-structure/FreeKeyObject'

export interface RelationChartProps {
    style?: CSSProperties
}

export class Deque extends React.Component<RelationChartProps> {
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

    showGraph(nodes: Array<Node>, title: String) {
        this.setState({
            visibility: 'visible'
        })

        let data = new Array<FreeKeyObject>()
        let links = new Array<FreeKeyObject>()
        let xSeg = this.chart.getWidth() / nodes.length

        for (let i = 0; i < nodes.length; i += 1) {
            data.push({
                name: nodes[i].id.toString(),
                draggable: false,
                x: i * xSeg,
                y: this.chart.getHeight() / 2
            })
        }

        for (let i = 0; i < nodes.length - 1; i += 1) {
            links.push({
                source: nodes[i].id.toString(),
                target: nodes[i + 1].id.toString()
            })
        }

        this.chart.clear()
        if (nodes.length === 0) {
            return
        }
        this.chart.setOption({
            title: {
                text: title,
            },
            series: [{
                animation: false,
                type: 'graph',
                layout: 'none',
                symbolSize: 50,
                focus: 'adjacency',
                roam: true,
                data: data,
                label: {
                    show: true,
                },
                textStyle: {
                    fontSize: 20
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
