// @flow
/*eslint-disable no-new*/
/** Bootstrap for functionality common to all trail pages: article, live blogs, podcasts, videos, etc. */
import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import contains from 'lodash/collections/contains';
import { catchErrorsWithContext } from 'lib/robust';
import proximityLoader from 'lib/proximity-loader';
import commentAdverts from 'commercial/modules/comment-adverts';
import DiscussionLoader from 'common/modules/discussion/loader';
import identityApi from 'common/modules/identity/api';
import Onward from 'common/modules/onward/onward-content';
import Popular from 'common/modules/onward/popular';
import Related from 'common/modules/onward/related';
import TonalComponent from 'common/modules/onward/tonal';
import shareCount from 'common/modules/social/share-count';

function insertOrProximity(selector, insert) {
    if (window.location.hash) {
        insert();
    } else {
        var el = qwery(selector)[0];

        if (el) {
            proximityLoader.add(el, 1500, insert);
        }
    }
}

function initPopular() {
    if (!config.page.isFront) {
        insertOrProximity('.js-popular-trails', function() {
            new Popular().init();
        });
    }
}

function initRelated() {
    if (!(config.page.seriesId || config.page.blogIds)) {
        insertOrProximity('.js-related', function() {
            var opts = {
                excludeTags: [],
            };

            // exclude ad features from non-ad feature content
            if (config.page.sponsorshipType !== 'paid-content') {
                opts.excludeTags.push('tone/advertisement-features');
            }
            // don't want to show professional network content on videos or interactives
            if (
                'contentType' in config.page &&
                contains(
                    ['video', 'interactive'],
                    config.page.contentType.toLowerCase()
                )
            ) {
                opts.excludeTags.push(
                    'guardian-professional/guardian-professional'
                );
            }
            new Related(opts).renderRelatedComponent();
        });
    }
}

function initOnwardContent() {
    insertOrProximity('.js-onward', function() {
        if (
            (config.page.seriesId || config.page.blogIds) &&
            config.page.showRelatedContent
        ) {
            new Onward(qwery('.js-onward'));
        } else if (config.page.tones !== '') {
            $('.js-onward').each(function(c) {
                new TonalComponent.TonalComponent().fetch(c, 'html');
            });
        }
    });
}

function initDiscussion() {
    if (config.switches.discussion && config.page.commentable) {
        var el = qwery('.discussion')[0];
        if (el) {
            new DiscussionLoader().attachTo(el);
        }
    }
}

function repositionComments() {
    if (!identityApi.isUserLoggedIn()) {
        var $comments = $('.js-comments');
        fastdom.write(function() {
            $comments.appendTo(qwery('.js-repositioned-comments'));
            if (window.location.hash === '#comments') {
                var top = $comments.offset().top;
                $(document.body).scrollTop(top);
            }
        });
    }
}

export default function() {
    catchErrorsWithContext([
        ['c-discussion', initDiscussion],
        ['c-comments', repositionComments],
        ['c-shares', shareCount.loadShareCounts],
        ['c-popular', initPopular],
        ['c-related', initRelated],
        ['c-onward', initOnwardContent],
        ['c-comment-adverts', commentAdverts],
    ]);
}
