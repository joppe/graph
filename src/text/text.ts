import * as geometry from '@apestaartje/geometry';

import { Style } from 'app/text/Style';

/**
 * Render text on a canvas
 */

export function text(str: string, point: geometry.point.Point, style: Style, context: CanvasRenderingContext2D): void {
    Object.keys(style).forEach((property: string): void => {
        context[property] = style[property];
    });

    context.fillText(str, point.x, point.y);
}
