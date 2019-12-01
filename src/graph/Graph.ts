import * as array from '@apestaartje/array';
import * as dom from '@apestaartje/dom';
import * as geometry from '@apestaartje/geometry';
import * as number from '@apestaartje/number';

import { line } from '../line/line';
import { LineStyle } from '../line/LineStyle';
import { text } from '../text/text';
import { TextStyle } from '../text/TextStyle';

const OFFSET: number = 30;

const PLOT_LINE_COLOR: string = '#308c2c';

const GRID_LINE_COLOR: string = '#88abcf';

const AXIS_LINE_COLOR: string = '#ff0000';

const DEFAULT_LINE_STYLE: LineStyle = {
    strokeStyle: '#000000',
    lineWidth: 1
};

const DEFAULT_TEXT_STYLE: TextStyle = {
    font: '10pt Arial',
    fillStyle: '#000000',
    textAlign: 'right'
};

/**
 * Graph class
 */

export class Graph {
    private readonly _background: dom.element.Canvas;
    private readonly _foreground: dom.element.Canvas;
    private readonly _size: geometry.size.Size;
    private readonly _transform: geometry.transform.Transform;

    private _xRange: number.range.Range = {
        min: 0,
        max: 0
    };

    private _yRange: number.range.Range = {
        min: 0,
        max: 0
    };

    public set xRange(range: number.range.Range) {
        this._xRange = range;

        this.updateTransform();
    }

    public set yRange(range: number.range.Range) {
        this._yRange = range;

        this.updateTransform();
    }

    constructor(size: geometry.size.Size) {
        this._size = size;

        this._transform = new geometry.transform.Transform();
        this._background = new dom.element.Canvas(size);
        this._background.style.position = 'absolute';
        this._background.style.left = '0';
        this._background.style.top = '0';

        this._foreground = new dom.element.Canvas(size);
        this._foreground.style.position = 'absolute';
        this._foreground.style.left = '0';
        this._foreground.style.top = '0';

        this.xRange = {
            min: 0,
            max: this._size.width
        };
        this.yRange = {
            min: 0,
            max: this._size.height
        };
    }

    public render(element: HTMLElement): void {
        const wrapper: HTMLDivElement = document.createElement('div');

        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';
        wrapper.style.width = `${this._size.width}px`;
        wrapper.style.height = `${this._size.height}px`;

        this._background.appendTo(wrapper);
        this._foreground.appendTo(wrapper);

        element.appendChild(wrapper);
    }

    public plot(points: Iterable<geometry.point.Point>, lineStyle: Partial<LineStyle> = {}): Graph {
        let previous: geometry.point.Point;

        const styling: LineStyle = {
            ...DEFAULT_LINE_STYLE,
            strokeStyle: PLOT_LINE_COLOR,
            ...lineStyle
        };

        this._foreground.clear();

        for (const point of points) {
            if (previous !== undefined) {
                line(
                    this._transform.transformPoint(previous),
                    this._transform.transformPoint(point),
                    styling,
                    this._foreground.context
                );
            }

            previous = point;
        }

        return this;
    }

    public drawXLabels(step: number, textStyle: Partial<TextStyle> = {}): Graph {
        const styling: TextStyle = {
            ...DEFAULT_TEXT_STYLE,
            textAlign: 'center',
            ...textStyle
        };
        const y: number = number.range.inRange(0, this._yRange) ? 0 : this._yRange.min;

        for (const x of array.iterator.range(this._xRange.min, this._xRange.max, step)) {
            const position: geometry.point.Point = this._transform.transformPoint({x, y});

            text(
                String(x),
                { x: position.x, y: position.y + 15 },
                styling,
                this._background.context
            );
        }

        return this;
    }

    public drawYLabels(step: number, textStyle: Partial<TextStyle> = {}): Graph {
        const styling: TextStyle = {
            ...DEFAULT_TEXT_STYLE,
            ...textStyle
        };
        const x: number = number.range.inRange(0, this._xRange) ? 0 : this._xRange.min;

        for (const y of array.iterator.range(this._yRange.min, this._yRange.max, step)) {
            const point: geometry.point.Point = this._transform.transformPoint({x, y});

            text(
                String(y),
                { x: point.x - 5, y: point.y + 5 },
                styling,
                this._background.context
            );
        }

        return this;
    }

    public drawGrid(xStep: number, yStep: number, lineStyle: Partial<LineStyle> = {}): Graph {
        const styling: LineStyle = {
            ...DEFAULT_LINE_STYLE,
            strokeStyle: GRID_LINE_COLOR,
            ...lineStyle
        };

        for (const x of array.iterator.range(this._xRange.min, this._xRange.max, xStep)) {
            line(
                this._transform.transformPoint({ x, y: this._yRange.min }),
                this._transform.transformPoint({ x, y: this._yRange.max }),
                styling,
                this._background.context
            );
        }

        for (const y of array.iterator.range(this._yRange.min, this._yRange.max, yStep)) {
            line(
                this._transform.transformPoint({ x: this._xRange.min, y }),
                this._transform.transformPoint({ x: this._xRange.max, y }),
                styling,
                this._background.context
            );
        }

        return this;
    }

    public drawXAxis(lineStyle: Partial<LineStyle> = {}): Graph {
        const styling: LineStyle = {
            ...DEFAULT_LINE_STYLE,
            strokeStyle: AXIS_LINE_COLOR,
            lineWidth: 2,
            ...lineStyle
        };
        const y: number = number.range.inRange(0, this._yRange) ? 0 : this._yRange.min;

        line(
            this._transform.transformPoint({ x: this._xRange.min, y }),
            this._transform.transformPoint({ x: this._xRange.max, y }),
            styling,
            this._background.context
        );

        return this;
    }

    public drawYAxis(lineStyle: Partial<LineStyle> = {}): Graph {
        const styling: LineStyle = {
            ...DEFAULT_LINE_STYLE,
            strokeStyle: AXIS_LINE_COLOR,
            lineWidth: 2,
            ...lineStyle
        };
        const x: number = number.range.inRange(0, this._xRange) ? 0 : this._xRange.min;

        line(
            this._transform.transformPoint({ x, y: this._yRange.min }),
            this._transform.transformPoint({ x, y: this._yRange.max }),
            styling,
            this._background.context
        );

        return this;
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
