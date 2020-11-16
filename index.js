
let stripHtml = require('string-strip-html');

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

let pagesToRender = json.mxfile?.diagram?.filter?.(x => x.name.includes("mermaid"))
if (!pagesToRender) pagesToRender = [json.mxfile.diagram];
pagesToRender.map(page => {
    let root = page.mxGraphModel.root.mxCell;
    createMermaidFile(root, page.name + ".md");
})

function st(msg) {
    return stripHtml(msg).result
}

function createMermaidFile(root, outPath) {
    let edges = root.filter(entry => entry.edge && entry.source && entry.target);
    let nodes = root.filter(entry => entry.vertex && !entry.style.includes("text;") && stripHtml(entry.value).result != '' && !entry.value.includes(`<div align="right">_</div>`));
    let groups = root.filter(entry => entry.style == "group");

    let textNodes = root.filter(entry => entry.style?.includes("text;") && entry.value.includes("group:"))
    let nodeMap = {};
    let nodeGroup = {}
    nodes.map(entry => {
        nodeGroup[entry.id] = entry.parent
        nodeMap[entry.id] = entry.value;
    });

    let nodeGroups = _.groupBy(nodes, x => x.parent)
    let nodeGroupGraph = _.toPairs(nodeGroups).map(nodeGroup => {
        let groupParent = nodeGroup[0]
        let groupNodes = nodeGroup[1]

        let graph = groupNodes.map(node => {
            return `   ${node.id}[${st(node.value)}]`;
        }).join("\n");

        let groupName = "Exec Unit"
        textNodes.filter(x => x.parent == nodeGroup[0]).map(foundGroupName => {
            groupName = st(foundGroupName.value)
        })

        return `
        subgraph ${nodeGroup[0]} [${groupName}]
        ${graph}
        end
        `
        

    }).join("\n")

    
    let relationships = edges.map(edge => {
        return `   ${edge.source} --> ${edge.target}`;
    }).join("\n")



    let graph = `
\`\`\`mermaid
graph TD;
${relationships}
    ${nodeGroupGraph};
\`\`\`
`;
    fs.writeFileSync(outPath, graph, 'utf-8');
}
