export class EdgeBase {
    node: NodeBase
    next: EdgeBase | null

    constructor(node: NodeBase, next: EdgeBase | null) {
        this.node = node
        this.next = next
    }
}

export class Graph {
    head = new Array<EdgeBase> ()
    nodes = new Array<NodeBase> ()

    initGraph(graphStr: String) {
        this.nodes = new Array<NodeBase> ()
        for (let i = 0; i < graphStr.length; i += 1) {
            this.nodes.push(new NodeBase(i + 1))
        }
        this.head = new Array<EdgeBase> ()
        for (let i = 0; i < graphStr.length; i += 1) {
            this.head.push(new EdgeBase(this.nodes[i], null))
        }
    }

    addArc(x: number, y: number) {
        this.head[x] = new EdgeBase(this.nodes[y], this.head[x])
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

export class NodeBase {
    id: number = 0

    constructor(id: number = 0) {
        this.id = id
    }
}
