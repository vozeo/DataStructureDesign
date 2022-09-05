// Node class
export class Node {
    id: number = 0 // Id of the node

    constructor(id: number = 0) {
        this.id = id
    }
}

// Edge class
export class Edge {
    node: Node // The node that the edge points to
    next: Edge | null // Next edge

    constructor(node: Node, next: Edge | null) {
        this.node = node
        this.next = next
    }
}

// Graph class
export class Graph {
    head = new Array<Edge> () // The head of the nodes
    nodes = new Array<Node> () // The nodes of the graph

    // Init graph with the first line
    initGraph(graphStr: String) {
        this.nodes = new Array<Node> ()
        for (let i = 0; i < graphStr.length; i += 1) {
            this.nodes.push(new Node(i + 1)) // Add node
        }
        this.head = new Array<Edge> ()
        for (let i = 0; i < graphStr.length; i += 1) {
            this.head.push(new Edge(this.nodes[i], null)) // Add head of this node
        }
    }

    // Add an single arc from node i to node j
    addArc(x: number, y: number) {
        this.head[x] = new Edge(this.nodes[y], this.head[x]) // Add arc to head[x]
    }

    // Import graph from string array
    importGraph(graphArray: Array<String>) {
        this.initGraph(graphArray[0]) // Init graph with first line
        for (let i = 0; i < graphArray.length; i += 1) {
            if (graphArray[i].length !== graphArray.length) { // Check if the graph is valid
                return -1
            }
            for (let j = i + 1; j < graphArray[i].length; j += 1) {
                if (/^[\d]+$/.test(graphArray[i][j])) { // Check if the node is valid
                    if (Number(graphArray[i][j]) > 0) { // Check if the node is connected
                        this.addArc(i, j) 
                        this.addArc(j, i)
                    }
                } else {
                    return -1
                }
            }
        }
        return 0
    }
}
