# Graph

Simple class that can plot on a graph.

## Usage

```javascript
const graph = new Graph({
    height: 600,
    width: 600
});

graph
    .drawGrid(50, 50)
    .drawXAxis()
    .drawYAxis()
    .drawYLabels(50)
    .drawXLabels(100)
    .plot([
        {x: 0, y: 0},
        {x: 120, y: 30},
        {x: 320, y: 300}
    ]);

graph.render(document.querySelector('body'));
```
