// This file defines TypeScript type declarations for the function plotter project.

declare module "function-plotter" {
    export type FunctionPlotterOptions = {
        expression: string; // The mathematical expression to plot
        xRange?: [number, number]; // Optional range for the x-axis
        yRange?: [number, number]; // Optional range for the y-axis
        resolution?: number; // Optional resolution for the plot
        canvasId: string; // The ID of the canvas element to draw on
    };

    export function plotFunction(options: FunctionPlotterOptions): void;
}