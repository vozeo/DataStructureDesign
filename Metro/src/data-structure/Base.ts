export class Node {
    id: number = 0
    name: string = ''
    lon: number = 0.0 // longitude
    lat: number = 0.0 // latitude

    constructor(id: number = 0, name: string = '', lon: number = 0.0, lat: number = 0.0) {
        this.id = id
        this.name = name
        this.lon = lon
        this.lat = lat
    }
}

export class Line {
    name: string = ''
    nodeNames = new Array<string>()
    nodeListJson = ''

    constructor(name: string = '', nodeNames: Array<string> = new Array<string>()) {
        this.name = name
        this.nodeNames = nodeNames
        this.nodeListJson = JSON.stringify(nodeNames)
    }
}

export class Edge {
    node: Node
    next: Edge | null
    lineName: string = ''
    color: number = 0

    constructor(node: Node, next: Edge | null, line = '', color = 0) {
        this.node = node
        this.next = next
        this.lineName = line
        this.color = color
    }
}

export class Graph {
    idCnt = -1
    head = new Array<Edge>()
    nodes = new Array<Node>()
    NameToId = new Map<string, number>()

    addNode(name: string, lon: number, lat: number) {
        this.nodes.push(new Node(++this.idCnt, name, lon, lat))
        this.head.push(new Edge(this.nodes[this.nodes.length - 1], null))
        this.NameToId.set(name, this.idCnt)
    }

    deleteNode(name: string) {
        this.NameToId.delete(name)
        for (let i = 0; i < this.nodes.length; ++i) {
            if (this.nodes[i].name === name) {
                this.head = new Array<Edge>(new Edge(this.nodes[i], null))
                this.nodes[i].id = -1
                return
            }
        }
    }

    initHead() {
        this.head = new Array<Edge>()
        this.nodes.forEach(node => {
            this.head.push(new Edge(node, null))
        })
    }

    addArc(x: number, y: number, line: string, color: number) {
        this.head[x] = new Edge(this.nodes[y], this.head[x], line, color)
    }

    addEdge(u: string, v: string, line: string, color: number) {
        let uId = this.NameToId.get(u)
        let vId = this.NameToId.get(v)
        if (uId === undefined || vId === undefined) {
            return
        }
        this.addArc(uId, vId, line, color)
        this.addArc(vId, uId, line, color)
    }

    updateGraph(lines: Array<Line>) {
        this.initHead()
        lines.forEach(line => {
            let col = Math.floor(Math.random() * 0xffffff)
            for (let i = 0; i < line.nodeNames.length - 1; ++i) {
                this.addEdge(line.nodeNames[i], line.nodeNames[i + 1], line.name, col)
            }
        })
    }
}
