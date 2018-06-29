import * as arr from '@apestaartje/array';
import * as dom from '@apestaartje/dom';
import * as geometry from '@apestaartje/geometry';

import { line } from 'app/line/line';
import { Style as LineStyle } from 'app/line/Style';
import { Range } from 'app/range/Range';
import { Style as TextStyle } from 'app/text/Style';
import { text } from 'app/text/text';

/**
 * Graph class
 */

const OFFSET: number = 30;
const DEFAULT_LINE_STYLE: LineStyle = {
    strokeStyle: '#000000',
    lineWidth: 1
};
const DEFAULT_TEXT_STYLE: TextStyle = {
    font: '10pt Arial',
    fillStyle: '#000000',
    textAlign: 'left'
};

export class Graph {
    private _canvas: dom.element.Canvas;
    private _size: geometry.size.Size;
    private _transform: geometry.transform.Transform;

    private _xRange: Range = {
        min: 0,
        max: 0
    };
    private _yRange: Range = {
        min: 0,
        max: 0
    };

    public set xRange(range: Range) {
        this._xRange = range;

        this.updateTransform();
    }

    public set yRange(range: Range) {
        this._yRange = range;

        this.updateTransform();
    }

    constructor(size: geometry.size.Size) {
        this._size = size;

        this._transform = new geometry.transform.Transform();
        this._canvas = new dom.element.Canvas(this._size);

        this.xRange = {min: 0, max: this._size.width};
        this.yRange = {min: 0, max: this._size.height};
    }

    public render(element: HTMLElement): void {
        this._canvas.appendTo(element);
    }

    public plot(points: Iterable<geometry.point.Point>, lineStyle: Partial<LineStyle> = {}): Graph {
        let previous: geometry.point.Point;
        const styling: LineStyle = {
            lineWidth: 1,
            strokeStyle: '#308c2c',
            ...lineStyle
        };

        for (const point of points) {
            if (previous !== undefined) {
                this.drawLine(
                    previous,
                    point,
                    styling
                );
            }

            previous = point;
        }

        return this;
    }

    public drawXLabels(step: number, textStyle: Partial<TextStyle> = {}): Graph {
        const styling: TextStyle = {
            ...DEFAULT_TEXT_STYLE,
            ...textStyle
        };
        let y: number = 0;

        if (this._yRange.min > 0 || this._yRange.max < 0) {
            y = this._yRange.min;
        }

        for (const x of arr.iterator.range(this._xRange.min, this._xRange.max, step)) {
            const position: geometry.point.Point = this._transform.transformPoint({x, y});

            this.drawText(
                String(x),
                {x: position.x - 5, y: position.y + 15},
                styling
            );
        }

        return this;
    }

    public drawYLabels(step: number, textStyle: Partial<TextStyle> = {}): Graph {
        const styling: TextStyle = {
            ...DEFAULT_TEXT_STYLE,
            ...textStyle
        };
        let x: number = 0;

        if (this._xRange.min > 0 || this._xRange.max < 0) {
            x = this._xRange.min;
        }

        for (const y of arr.iterator.range(this._yRange.min, this._yRange.max, step)) {
            const point: geometry.point.Point = this._transform.transformPoint({x, y});

            this.drawText(
                String(y),
                {x: point.x - 30, y: point.y + 5},
                styling
            );
        }

        return this;
    }

    public drawGrid(xStep: number, yStep: number, lineStyle: Partial<LineStyle> = {}): Graph {
        const styling: LineStyle = {
            lineWidth: 1,
            strokeStyle: '#88abcf',
            ...lineStyle
        };

        for (const x of arr.iterator.range(this._xRange.min, this._xRange.max, xStep)) {
            this.drawLine(
                {x, y: this._yRange.min},
                {x, y: this._yRange.max},
                styling
            );
        }

        for (const y of arr.iterator.range(this._yRange.min, this._yRange.max, yStep)) {
            this.drawLine(
                {x: this._xRange.min, y},
                {x: this._xRange.max, y},
                styling
            );
        }

        return this;
    }

    public drawXAxis(lineStyle: Partial<LineStyle> = {}): Graph {
        const styling: LineStyle = {
            strokeStyle: '#FF0000',
            lineWidth: 2,
            ...lineStyle
        };
        let y: number = 0;

        if (this._yRange.min > 0 || this._yRange.max < 0) {
            y = this._yRange.min;
        }

        this.drawLine(
            {x: this._xRange.min, y},
            {x: this._xRange.max, y},
            styling
        );

        return this;
    }

    public drawYAxis(lineStyle: Partial<LineStyle> = {}): Graph {
        const styling: LineStyle = {
            strokeStyle: '#FF0000',
            lineWidth: 2,
            ...lineStyle
        };
        let x: number = 0;

        if (this._xRange.min > 0 || this._xRange.max < 0) {
            x = this._xRange.min;
        }

        this.drawLine(
            {x, y: this._yRange.min},
            {x, y: this._yRange.max},
            styling
        );

        return this;
    }

    private drawLine(start: geometry.point.Point, end: geometry.point.Point, style: Partial<LineStyle> = {}): void {
        const styling: LineStyle = {
            ...DEFAULT_LINE_STYLE,
            ...style
        };

        line(
            this._transform.transformPoint(start),
            this._transform.transformPoint(end),
            styling,
            this._canvas.context
        );
    }

    private drawText(str: string, point: geometry.point.Point, style: Partial<TextStyle>): void {
        const styling: TextStyle = {
            ...DEFAULT_TEXT_STYLE,
            ...style
        };

        text(
            str,
            point,
            styling,
            this._canvas.context
        );
    }

    private updateTransform(): void {
        this._transform.identity();

        // Flip the y-axis
        this._transform.scale(1, -1);

        // Set the origin to the bottom
        this._transform.translate(0, -this._size.height);

        // Apply the offset, x will go to the right and y will go up (because of the -1 scale)
        this._transform.translate(OFFSET, OFFSET);

        // Apply the scale
        this._transform.scale(
            (this._size.width - OFFSET * 2) / (this._xRange.max - this._xRange.min),
            (this._size.height - OFFSET * 2) / (this._yRange.max - this._yRange.min)
        );

        // Set the bottom left corner equal to the minimum values of axises, use negative y because of the -1 scale
        this._transform.translate(-this._xRange.min, -this._yRange.min);
    }
}
