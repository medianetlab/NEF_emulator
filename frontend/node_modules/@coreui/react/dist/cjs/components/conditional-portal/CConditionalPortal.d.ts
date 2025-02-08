import { FC, ReactNode } from 'react';
export interface CConditionalPortalProps {
    /**
     * @ignore
     */
    children: ReactNode;
    /**
     * An HTML element or function that returns a single element, with `document.body` as the default.
     *
     * @since v4.11.0
     */
    container?: Element | (() => Element | null) | null;
    /**
     * Render some children into a different part of the DOM
     */
    portal: boolean | any;
}
export declare const CConditionalPortal: FC<CConditionalPortalProps>;
