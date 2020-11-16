
// On diagrams.net, select the page, File -> Export -> 
// Save the content into input.xml
// Only rectangles with text, arrows and a large group container rectangles allowed

// Run the REPL, see the output

// Now you can preview it on https://mermaid-js.github.io/mermaid-live-editor/
// Use result on Github, and visualize it automatically using these extensions (Firefox/Chrome)
// Per the extension web site: Simply put Mermaid code into ```mermaid. See Mermaid official website for more information about the Mermaid syntax.

var parser = require('xml2json');
let fs = require("fs")


let xml = fs.readFileSync("./input.xml", 'utf-8');
let _ = require('lodash')
var json = JSON.parse(parser.toJson(xml));

let root = json.mxfile.diagram.mxGraphModel.root.mxCell

let edges = root.filter(entry => entry.edge)
let nodes = root.filter(entry => entry.vertex)
let groups = root.filter(entry => entry.style == "group")
let nodeMap = {}
root.map(entry => {
    nodeMap[entry.id] = entry.value
})

let groupedEdges = _.groupBy(edges, edge => edge.parent);
let subGraphs = _.toPairs(groupedEdges).map(group => {
    let parentName = group[0]
    let groupEdges = group[1]
    let graph = groupEdges.map(edge => {
        return `   ${edge.source}[${nodeMap[edge.source]}] --> ${edge.target}[${nodeMap[edge.target]}];`
    }).join("\n")
    subGraph = 
    `
    subgraph ${parentName} [Exec Unit]
        ${graph}
    end
    `

    return subGraph

    console
}).join("\n")



let graph = 'graph TD;\n' + subGraphs;



console.log(graph)

