export class Node {
    id: number = 0

    constructor(id: number = 0) {
        this.id = id
    }
}

export class Edge {
    node: Node
    next: Edge | null

    constructor(node: Node, next: Edge | null) {
        this.node = node
        this.next = next
    }
}

export class Graph {
    head = new Array<Edge> ()
    nodes = new Array<Node> ()

    initGraph(graphStr: String) {
        this.nodes = new Array<Node> ()
        for (let i = 0; i < graphStr.length; i += 1) {
            this.nodes.push(new Node(i + 1))
        }
        this.head = new Array<Edge> ()
        for (let i = 0; i < graphStr.length; i += 1) {
            this.head.push(new Edge(this.nodes[i], null))
        }
    }

    addArc(x: number, y: number) {
        this.head[x] = new Edge(this.nodes[y], this.head[x])
    }

    importGraph(graphArray: Array<String>) {
        this.initGraph(graphArray[0])
        for (let i = 0; i < graphArray.length; i += 1) {
            for (let j = i + 1; j < graphArray[i].length; j += 1) {
                if (graphArray[i][j] === '1') {
                    this.addArc(i, j)
                    this.addArc(j, i)
                }
            }
        }
    }
}
