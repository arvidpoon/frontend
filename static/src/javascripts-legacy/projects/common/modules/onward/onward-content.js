import config from 'lib/config';
import mediator from 'lib/mediator';
import register from 'common/modules/analytics/register';
import Component from 'common/modules/component';
import union from 'lodash/arrays/union';

var getTag = function() {
    var seriesAndBlogTags = config.page.blogIds
        .split(',')
        .concat([config.page.seriesId]);
    return union(
        config.page.nonKeywordTagIds.split(','),
        seriesAndBlogTags
    ).shift();
};

function OnwardContent(context) {
    register.begin('series-content');
    this.context = context;
    this.endpoint =
        '/series/' +
        getTag() +
        '.json?shortUrl=' +
        encodeURIComponent(config.page.shortUrl);
    this.fetch(this.context, 'html');
}

Component.define(OnwardContent);

OnwardContent.prototype.ready = function() {
    register.end('series-content');
    mediator.emit('modules:onward:loaded');
    mediator.emit('page:new-content');
    mediator.emit('ui:images:upgradePictures');
};

OnwardContent.prototype.error = function() {
    register.error('series-content');
};

export default OnwardContent;
