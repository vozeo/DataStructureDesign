import React, {CSSProperties} from 'react'
import * as echarts from 'echarts'
import {Node, Graph, Line} from '../data-structure/Base'
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

    showGraph(graph: Graph, title: String, lines: Array<Line>, way: Array<Node> = new Array<Node>()) {
        this.setState({
            visibility: 'visible'
        })

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

        let series = []

        let stations = new Array<FreeKeyObject>()
        graph.nodes.forEach(node => {
            if (node.id !== -1) {
                stations.push({
                    name: node.name,
                    x: (node.lon - xMin) / xLen * this.chart.getWidth(),
                    y: (1 - (node.lat - yMin) / yLen) * this.chart.getHeight(),
                })
            }
        })
        series.push({
            name: 'Station',
            type: 'graph',
            layout: 'none',
            symbolSize: 2,
            focus: 'adjacency',
            roam: true,
            data: stations,
            label: {
                show: true,
                position: 'right'
            },
        })


        lines.forEach(line => {
            let links = new Array<FreeKeyObject>()
            let col = '#' + Math.floor(Math.random() * 0xffffff).toString(16)
            for (let i = 0; i < line.nodeNames.length - 1; ++i) {
                links.push({
                    source: line.nodeNames[i],
                    target: line.nodeNames[i + 1],
                })
            }
            series.push({
                name: line.name,
                type: 'graph',
                layout: 'none',
                symbolSize: 2,
                focus: 'adjacency',
                roam: true,
                data: stations,
                label: {
                    show: true,
                    position: 'right'
                },
                edgeSymbolSize: [0, 0],
                links: links,
                lineStyle: {
                    color: col,
                    opacity: 0.9,
                    width: 2,
                    curveness: 0
                },
            })
        })

        let links = new Array<FreeKeyObject>()
        for (let i = 0; i < way.length - 1; ++i) {
            links.push({
                source: way[i].name,
                target: way[i + 1].name,
            })
        }
        series.push({
            name: 'FoundWay',
            type: 'graph',
            layout: 'none',
            symbolSize: 2,
            focus: 'adjacency',
            roam: true,
            data: stations,
            label: {
                show: true,
                position: 'right'
            },
            edgeSymbolSize: [0, 0],
            links: links,
            lineStyle: {
                color: '#ff0000',
                opacity: 0.9,
                width: 5,
                curveness: 0
            },
        })

        this.chart.clear()
        this.chart.setOption({
            title: {
                text: title,
            },
            legend: {
                show: true,
                selectedMode: 'multiple',
            },
            series: series
        })
    }
}
