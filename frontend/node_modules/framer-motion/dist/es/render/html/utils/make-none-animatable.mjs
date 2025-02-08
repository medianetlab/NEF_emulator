import { getAnimatableNone } from '../../dom/value-types/animatable-none.mjs';

/**
 * If we encounter keyframes like "none" or "0" and we also have keyframes like
 * "#fff" or "200px 200px" we want to find a keyframe to serve as a template for
 * the "none" keyframes. In this case "#fff" or "200px 200px" - then these get turned into
 * zero equivalents, i.e. "#fff0" or "0px 0px".
 */
function makeNoneKeyframesAnimatable(unresolvedKeyframes, noneKeyframeIndexes, name) {
    let i = 0;
    let animatableTemplate = undefined;
    while (i < unresolvedKeyframes.length && !animatableTemplate) {
        if (typeof unresolvedKeyframes[i] === "string" &&
            unresolvedKeyframes[i] !== "none" &&
            unresolvedKeyframes[i] !== "0") {
            animatableTemplate = unresolvedKeyframes[i];
        }
        i++;
    }
    if (animatableTemplate && name) {
        for (const noneIndex of noneKeyframeIndexes) {
            unresolvedKeyframes[noneIndex] = getAnimatableNone(name, animatableTemplate);
        }
    }
}

export { makeNoneKeyframesAnimatable };
