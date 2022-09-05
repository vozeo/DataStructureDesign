// Node class
export class Node {
    id: number = 0 // the id of the node
    name: string = '' // the name of the node
    lon: number = 0.0 // longitude
    lat: number = 0.0 // latitude

    constructor(id: number = 0, name: string = '', lon: number = 0.0, lat: number = 0.0) {
        this.id = id
        this.name = name
        this.lon = lon
        this.lat = lat
    }
}

// Line class
export class Line {
    name: string = '' // The name of the line
    nodeNames = new Array<string>() // The nodes of the line
    nodeListJson = '' // The json of the node list

    constructor(name: string = '', nodeNames: Array<string> = new Array<string>()) {
        this.name = name
        this.nodeNames = nodeNames
        this.nodeListJson = JSON.stringify(nodeNames)
    }
}

// Edge class
export class Edge {
    node: Node // the node that the edge points to
    next: Edge | null // the next edge
    lineName: string = '' // the name of the line
    color: number = 0 // the color of the line

    constructor(node: Node, next: Edge | null, line = '', color = 0) {
        this.node = node
        this.next = next
        this.lineName = line
        this.color = color
    }
}

// Graph class
export class Graph {
    idCnt = -1 // the count of the nodes
    head = new Array<Edge>() // the head of the nodes
    nodes = new Array<Node>() // the nodes of the graph
    NameToId = new Map<string, number>() // the map from the name of the node to the id of the node

    // add a node
    addNode(name: string, lon: number, lat: number) {
        this.nodes.push(new Node(++this.idCnt, name, lon, lat))
        this.head.push(new Edge(this.nodes[this.nodes.length - 1], null))
        this.NameToId.set(name, this.idCnt)
    }

    // delete a node
    deleteNode(name: string) {
        this.NameToId.delete(name) // delete the name from the map
        for (let i = 0; i < this.nodes.length; ++i) {
            if (this.nodes[i].name === name) {
                this.head = new Array<Edge>(new Edge(this.nodes[i], null)) // delete the head of the node
                this.nodes[i].id = -1
                return
            }
        }
    }

    // init the head of the graph
    initHead() {
        this.head = new Array<Edge>()
        this.nodes.forEach(node => {
            this.head.push(new Edge(node, null))
        })
    }

    // add an arc
    addArc(x: number, y: number, line: string, color: number) {
        this.head[x] = new Edge(this.nodes[y], this.head[x], line, color)
    }

    // add an edge
    addEdge(u: string, v: string, line: string, color: number) {
        let uId = this.NameToId.get(u)
        let vId = this.NameToId.get(v)
        if (uId === undefined || vId === undefined) { // if the node is not in the graph
            return
        }
        this.addArc(uId, vId, line, color)
        this.addArc(vId, uId, line, color)
    }

    // update the graph
    updateGraph(lines: Array<Line>) {
        this.initHead()
        lines.forEach(line => {
            let col = Math.floor(Math.random() * 0xffffff) // generate a random color
            for (let i = 0; i < line.nodeNames.length - 1; ++i) {
                this.addEdge(line.nodeNames[i], line.nodeNames[i + 1], line.name, col)
            }
        })
    }
}
