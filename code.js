// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 500 });

let timer = undefined;
var textNodes;
let unusedText = []

//Check for highlight style
var styles = figma.getLocalPaintStyles()
var style;

for (let i = 0; i < styles.length; i++) {
    if (styles[i].name === "Plugin/Highlight") {
        style = styles[i];
        break;
    } else if (i === (styles.length - 1)) {
        createStyle();
    }
}

//If highlight style does not exist, create it
function createStyle() {
    style = figma.createPaintStyle() 
    var solidPaint = {
        type: "SOLID",
        color: {"r": 0.89, "g": 0.61, "b": 0.05},
        opacity: 1
    };
    style.name = "Plugin/Highlight"
    style.paints = [solidPaint]
}


figma.ui.onmessage = msg => {
    //When sheet is synced and copy is selected
    if (msg.type === 'selected-copy') {
        unusedText = []
        console.log('msg received, data is', msg.data);
        textNodes = figma.currentPage.findAllWithCriteria({
            types: ['TEXT']
        })
        for (let i = 0; i < msg.data.length; i++) {
            if (msg.data[i] !== "") {
                //need to account for paragraphs
                searchFor(msg.data[i]);
            }
        }
        console.log('done with searches, unused text is', unusedText)
    }
    //When user clicks "remove highlights" button
    if (msg.type === 'remove-highlights') {
        console.log('rcvd msg', textNodes)

        textNodes = figma.currentPage.findAllWithCriteria({
            types: ['TEXT']
        })
        removeHighlights();
    }

    if (msg.type === 'edit-highlight-colour') {

    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
};

function removeHighlights() {
    console.log('text nodes', textNodes);
    for (let i = 0; i < textNodes.length; i++) {
        console.log('style id is', style.id, 'el stroke style id is', textNodes[i].strokeStyleId, 'they are', style.id === textNodes[i].strokeStyleId)
        console.log(textNodes[5].strokes)

        if (textNodes[i].strokeStyleId === style.id) {
            textNodes[i].strokeStyleId = '';

            let strokes = JSON.parse(JSON.stringify(textNodes[i].strokes));
            console.log('strokes log', strokes)
            strokes = [];
            textNodes[i].strokes = strokes;
            console.log('removed strokestyleid, el is:', textNodes[i])
        }
    }
}


function searchFor(query) {
    console.log('searching for', query);
    for (let i = 0; i < textNodes.length; i++) {
        if (query === textNodes[i].characters) {
            addHighlight(textNodes[i]);
        }
        if (i === (textNodes.length - 1)) {
            unusedText.push(query);
        }
    }
}

function addHighlight (item) {
    item.strokeStyleId = style.id
    item.strokeWeight = 1;
}

//  figma.closePlugin();
