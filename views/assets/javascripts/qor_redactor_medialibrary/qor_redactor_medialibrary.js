// Add media library button for redactor editor
// By Jason weng @theplant

$.Redactor.prototype.medialibrary = function() {
    return {
        reUrlYoutube: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig,
        reUrlVimeo: /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/,
        reVideo: /\.mp4$|\.m4p$|\.m4v$|\.m4v$|\.mov$|\.mpeg$|\.webm$|\.avi$|\.ogg$|\.ogv$/,
        init: function () {
            var button = this.button.add('medialibrary', 'MediaLibrary');
            this.button.addCallback(button, this.medialibrary.addMedialibrary);
            this.button.setIcon(button, '<i class="material-icons">photo_library</i>');
        },

        addMedialibrary: function () {
            var $element = this.$element,
                data = {'selectModal': 'mediabox'},
                mediaboxUrl = $element.data().redactorSettings.medialibraryUrl,
                BottomSheets;

            this.medialibrary.BottomSheets = BottomSheets = $('body').data('qor.bottomsheets');
            data.url = mediaboxUrl;
            BottomSheets.open(data, this.medialibrary.handleMediaLibrary);
        },

        handleMediaLibrary: function () {
            var $bottomsheets = $('.qor-bottomsheets'),
                options = {
                    onSelect: this.medialibrary.selectResults,  // render selected item after click item lists
                    onSubmit: this.medialibrary.submitResults   // render new items after new item form submitted
                };

                $bottomsheets.qorSelectCore(options).addClass('qor-bottomsheets__mediabox');
        },

        selectResults: function (data) {
            this.medialibrary.handleResults(data);
        },

        submitResults: function (data) {
            this.medialibrary.handleResults(data, true);
        },

        handleResults: function (data, isNew) {
            if (isNew) {
                if (data.SelectedType == 'video' || JSON.parse(data.MediaOption).URL.match(this.medialibrary.reVideo)) {
                    this.medialibrary.insertVideoCode(data, true);
                } else {
                    this.medialibrary.insertImages(data, true);
                }
            } else {
                if (data.isExternalVideo || data.isUploadedVideo) {
                    this.medialibrary.insertVideoCode(data);
                } else {
                    this.medialibrary.insertImages(data);
                }
            }

            this.medialibrary.BottomSheets.hide();
        },

        insertVideoCode: function (data, isNew) {
            this.opts.videoContainerClass = (typeof this.opts.videoContainerClass === 'undefined') ? 'qor-video-container' : this.opts.videoContainerClass;

            var htmlCode, videoLink, mediaOption, $html,
                current,
                tags = 'p, div, ol, ul, li, span',
                isVideo = data.SelectedType == 'video',
                iframeStart = '<div class="' + this.opts.videoContainerClass + '"><iframe style="width: 100%; height: 300px;" src="',
                iframeEnd = '" frameborder="0" allowfullscreen></iframe></div>';

            if (isNew) {
                mediaOption = JSON.parse(data.MediaOption);

                if (isVideo) {
                    videoLink = mediaOption.Video;
                    if (videoLink.match(this.medialibrary.reUrlYoutube)) {
                        htmlCode = videoLink.replace(this.medialibrary.reUrlYoutube, iframeStart + '//www.youtube.com/embed/$1' + iframeEnd);
                    }
                } else if (mediaOption.URL.match(this.medialibrary.reVideo)) {
                    htmlCode = '<video width="100%" height="300px" controls class="' + this.opts.videoContainerClass + '"><source src="' + mediaOption.URL + '"></video>'
                }

            } else {
                htmlCode = data.File || data.$clickElement.find('.qor-table--video').html();
                $(htmlCode).addClass(this.opts.videoContainerClass);
                htmlCode = $(htmlCode)[0].outerHTML;
            }

            $html = $(htmlCode);

            // console.log($(this.insert.nodeToPoint(e, this.marker.get())).next());
            // $(this.insert.nodeToPoint(e, this.marker.get())).next().after($html);
            this.buffer.set();
            this.air.collapsed();
            this.insert.raw(htmlCode);
            // this.caret.after($html);


            //
            // current = this.selection.current();
            // console.log($(current).closest(tags, this.core.editor()[0]))
            // $($(current).closest(tags, this.core.editor()[0])).addClass("aaa").after(htmlCode);
            // $(current).parent().after(htmlCode);

            // console.log($(current).parent())


            // this.code.sync();
            // this.selection.restore();
        },

        insertImages: function (data, isNew) {
            var json = {}, src;

            src = isNew ? JSON.parse(data.MediaOption).URL : ($(data.Image || data.File).prop('src') || data.$clickElement.find('p[data-heading] img').prop('src'));
            src = src.replace(/image\..+\./, 'image.');

            json.url = src;
            json.fromMedialibrary = true;

            this.buffer.set();
            // insert: function(json, direct, e)
            this.image.insert(json, false);
        }


    };
};