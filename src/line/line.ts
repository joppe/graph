import * as geometry from '@apestaartje/geometry';

import { LineStyle } from './LineStyle';

/**
 * Draw a line on a canvas
 */

export function line(start: geometry.point.Point, end: geometry.point.Point, style: LineStyle, context: CanvasRenderingContext2D): void {
    Object.keys(style)
        .forEach((property: string): void => {
            context[property] = style[property];
        });

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
}
