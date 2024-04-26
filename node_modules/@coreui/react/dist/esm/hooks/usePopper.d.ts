import type { Instance, Options } from '@popperjs/core';
interface UsePopperOutput {
    popper: Instance | undefined;
    initPopper: (reference: HTMLElement, popper: HTMLElement, options: Partial<Options>) => void;
    destroyPopper: () => void;
}
export declare const usePopper: () => UsePopperOutput;
export {};
