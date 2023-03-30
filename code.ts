// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {width: 400, height: 500});
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
let timer = undefined;

figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangles') {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  console.log()
  if (msg.type === 'selected-copy') {
    console.log('msg received, data is', msg.data);
    for (let i = 0; i < msg.data.length; i++) {
      if (msg.data[i] === "") {
          continue;
      } else {
          console.log('searching', )
          searchFor(msg.data[i])
      }
    }
  }
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  
};


function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child)
    }
  }
}

function searchFor(query) {
  query = query.toLowerCase()
  let walker = walkTree(figma.currentPage)

  function processOnce() {
    let results = [];
    let count = 0;
    let done = true;
    let res
    while (!(res = walker.next()).done) {
      let node = res.value
      if (node.type === 'TEXT') {
        let characters = node.characters.toLowerCase()
        if (characters.includes(query)) {
          results.push(node.id);
          console.log('node strokes is', node.strokes)
        }
      }
      if (++count === 1000) {
        done = false
        timer = setTimeout(processOnce, 20)
        break
      }
    }
    console.log('results', results)
    figma.ui.postMessage({ query, results, done })
  }

  processOnce()
}


//  figma.closePlugin();