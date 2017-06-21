// @flow
import $ from 'lib/$';
import Identity from 'common/modules/identity/forms';
import Formstack from 'common/modules/identity/formstack';
import FormstackIframe from 'common/modules/identity/formstack-iframe';
import FormstackEmbedIframe from 'common/modules/identity/formstack-iframe-embed';
import ValidationEmail from 'common/modules/identity/validation-email';
import AccountProfile from 'common/modules/identity/account-profile';
import PublicProfile from 'common/modules/identity/public-profile';
import EmailPreferences from 'common/modules/identity/email-preferences';
import DeleteAccount from 'common/modules/identity/delete-account';
import UserAvatars from 'common/modules/discussion/user-avatars';
import mediator from 'lib/mediator';
import Tabs from 'common/modules/ui/tabs';

var modules = {
    initFormstack: function() {
        mediator.on('page:identity:ready', function(config) {
            var attr = 'data-formstack-id';
            $('[' + attr + ']').each(function(el) {
                var id = el.getAttribute(attr),
                    isEmbed = el.className.match(/\bformstack-embed\b/);

                if (isEmbed) {
                    new FormstackEmbedIframe(el, id, config).init();
                } else {
                    new Formstack(el, id, config).init();
                }
            });

            // Load old js if necessary
            $('.js-formstack-iframe').each(function(el) {
                new FormstackIframe(el, config).init();
            });
        });
    },
    forgottenEmail: function() {
        mediator.on('page:identity:ready', function(config) {
            Identity.forgottenEmail(config);
        });
    },
    forgottenPassword: function() {
        mediator.on('page:identity:ready', function(config) {
            Identity.forgottenPassword(config);
        });
    },
    passwordToggle: function() {
        mediator.on('page:identity:ready', function(config) {
            Identity.passwordToggle(config);
        });
    },
    userAvatars: function() {
        mediator.on('page:identity:ready', function() {
            UserAvatars.init();
        });
    },
    validationEmail: function() {
        mediator.on('page:identity:ready', function() {
            ValidationEmail.init();
        });
    },

    tabs: function() {
        var tabs = new Tabs();
        mediator.on('page:identity:ready', function() {
            tabs.init();
        });
    },

    accountProfile: function() {
        var accountProfile = new AccountProfile();
        mediator.on('page:identity:ready', function() {
            accountProfile.init();
        });
    },

    emailPreferences: function() {
        mediator.on('page:identity:ready', function() {
            EmailPreferences.init();
        });
    },

    deleteAccount: function() {
        mediator.on('page:identity:ready', function() {
            DeleteAccount.init();
        });
    },
};

export function init(config) {
    modules.initFormstack();
    modules.forgottenEmail();
    modules.forgottenPassword();
    modules.passwordToggle();
    modules.userAvatars();
    modules.validationEmail();
    modules.tabs();
    modules.accountProfile();
    modules.emailPreferences();
    modules.deleteAccount();
    PublicProfile.init();

    mediator.emit('page:identity:ready', config);
}
