// @flow
import bonzo from 'bonzo';
import qwery from 'qwery';
import videojs from 'videojs';
import $ from 'lib/$';
import config from 'lib/config';
import deferToAnalytics from 'lib/defer-to-analytics';
import template from 'lodash/utilities/template';
import Component from 'common/modules/component';
import events from 'common/modules/video/events';
import fullscreener from 'common/modules/media/videojs-plugins/fullscreener';
import { inlineSvg } from 'common/views/svgs';
import loadingTmpl from 'raw-loader!common/views/ui/loading.html';
import titlebarTmpl from 'raw-loader!common/views/media/titlebar.html';
import debounce from 'lodash/functions/debounce';
import videojsOptions from 'common/modules/video/videojs-options';

function initLoadingSpinner(player) {
    player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
}

function createVideoPlayer(el, options) {
    var player = videojs(el, options);

    return player;
}

function addTitleBar() {
    var data = {
        webTitle: config.page.webTitle,
        pageId: config.page.pageId,
        icon: inlineSvg('marque36icon'),
    };
    $('.vjs-control-bar').after(template(titlebarTmpl, data));
}

function initEndSlate(player) {
    var endSlate = new Component(),
        endState = 'vjs-has-ended';

    endSlate.endpoint = $('.js-gu-media--enhance')
        .first()
        .attr('data-end-slate');

    endSlate.fetch(player.el(), 'html').then(function() {
        $('.end-slate-container .fc-item__action').each(function(e) {
            e.href += '?CMP=embed_endslate';
        });
    });

    player.on('ended', function() {
        bonzo(player.el()).addClass(endState);
    });

    player.on('playing', function() {
        bonzo(player.el()).removeClass(endState);
    });
}

function initPlayer() {
    videojs.plugin('fullscreener', fullscreener);

    bonzo(qwery('.js-gu-media--enhance')).each(function(el) {
        var player,
            mouseMoveIdle,
            $el = bonzo(el).addClass('vjs'),
            mediaId = $el.attr('data-media-id'),
            canonicalUrl = $el.attr('data-canonical-url'),
            gaEventLabel = canonicalUrl,
            mediaType = el.tagName.toLowerCase();

        bonzo(el).addClass('vjs');

        player = createVideoPlayer(
            el,
            videojsOptions({
                controls: true,
                autoplay:
                    !!window.location.hash &&
                        window.location.hash === '#autoplay',
                preload: 'metadata', // preload='none' & autoplay breaks ad loading on chrome35
                plugins: {
                    embed: {
                        embeddable:
                            config.switches.externalVideoEmbeds &&
                                config.page.embeddable,
                        location:
                            config.page.externalEmbedHost +
                                '/embed/video/' +
                                config.page.pageId,
                    },
                },
            })
        );

        //Location of this is important
        events.handleInitialMediaError(player);

        player.ready(function() {
            var vol;

            initLoadingSpinner(player);
            addTitleBar();
            initEndSlate(player);

            events.bindGlobalEvents(player);

            // unglitching the volume on first load
            vol = player.volume();
            if (vol) {
                player.volume(0);
                player.volume(vol);
            }

            player.fullscreener();

            if (config.switches.thirdPartyEmbedTracking) {
                deferToAnalytics(function() {
                    events.initOphanTracking(player, mediaId);
                    events.bindContentEvents(player);
                });
            }

            events.addContentEvents(player, mediaId, mediaType);
            events.bindContentEvents(player);
            events.bindGoogleAnalyticsEvents(player, gaEventLabel);
        });

        mouseMoveIdle = debounce(function() {
            player.removeClass('vjs-mousemoved');
        }, 500);

        // built in vjs-user-active is buggy so using custom implementation
        player.on('mousemove', function() {
            player.addClass('vjs-mousemoved');
            mouseMoveIdle();
        });
    });
}

export default {
    init: initPlayer,
};
