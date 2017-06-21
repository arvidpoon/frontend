import fastdom from 'lib/fastdom-promise';
import { register } from 'commercial/modules/messenger';

register('type', function(specs, ret, iframe) {
    return setType(specs, iframe.closest('.js-ad-slot'));
});

export default setType;

function setType(type, adSlot) {
    return fastdom.write(function() {
        adSlot.classList.add('ad-slot--' + type);
    });
}
