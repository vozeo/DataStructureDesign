export class EdgeBase {
    node: NodeBase | undefined
    next: EdgeBase | undefined

    constructor(node: NodeBase, next: EdgeBase) {
        this.node = node
        this.next = next
    }
}

export class Graph {
    head = new Array<EdgeBase> ()
    nodes = new Array<NodeBase> ()

    initGraph(graphStr: String) {
        this.head = new Array<EdgeBase> ()
        this.nodes = new Array<NodeBase> ()
        for (let i = 0; i < graphStr.length; i += 1) {
            this.nodes.push(new NodeBase(i + 1))
        }
    }

    addArc(u: NodeBase, v: NodeBase) {
        this.head[u.id] = new EdgeBase(v, this.head[u.id])
    }

    addEdge(u: NodeBase, v: NodeBase) {
        this.addArc(u, v)
        this.addArc(v, u)
    }

    importGraph(graphArray: Array<String>) {
        this.initGraph(graphArray[0])
        for (let i = 0; i < graphArray.length; i += 1) {
            for (let j = i + 1; j < graphArray[i].length; j += 1) {
                if (graphArray[i][j] === '1') {
                    this.addEdge(this.nodes[i], this.nodes[j])
                }
            }
        }
    }
}

export class NodeBase {
    id: number = 0

    constructor(id: number = 0) {
        this.id = id
    }
}
