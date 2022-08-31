import React, {CSSProperties} from 'react'
import * as echarts from 'echarts'
import {NodeBase} from '../data-structure/NodeBase'
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

    showGraph(nodes: Array<NodeBase>, title: String) {
        this.setState({
            visibility: 'visible'
        })

        let data = new Array<FreeKeyObject>()
        let links = new Array<FreeKeyObject>()

        nodes.forEach(node => {
            data.push({
                name: node.id,
                value: node.id,
                id: node.id,
                draggable: true,
            })
        })

        for (let i = 0; i < nodes.length - 1; i += 1) {
            links.push({
                source: nodes[i].id,
                target: nodes[i + 1].id
            })
        }

        this.chart.clear()
        this.chart.setOption({

            title: {
                text: title,
            },

            legend: {
                x: 'center',
                show: 'true',
            },

            series: [{
                type: 'graph',
                layout: 'force',
                symbolSize: 45,
                focusNodeAdjacency: true,
                roam: true,
                force: {
                    repulsion: 1400
                },
                data: data,
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c}'
                },
                links: links,
                lineStyle: {
                    opacity: 0.9,
                    width: 1,
                    curveness: 0
                },
            }]
        })
    }
}
