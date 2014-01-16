'use strict';

pandora.ui.previewDialog = function() {

    var $image,
        $list = pandora.$ui.list,
        item = Ox.last($list.options('selected')),
        posterRatio = pandora.user.ui.showSitePosters
            ? pandora.site.posters.ratio
            : ($list.value(item, 'posterRatio') || pandora.site.posters.ratio),
        size = getSize(posterRatio),
        that = Ox.Dialog({
                closeButton: true,
                content: Ox.Element(),
                fixedRatio: true,
                focus: false,
								//wafaa
                //height: size.height,
                maximizeButton: true,
                title: Ox._('Loading...')
								//wafaa commented
                //width: size.width
            })
            .bindEvent({
                resize: function(data) {
                    // FIXME: why doesn't that.options('content') work here?
                    // (currently the only reason $image is in the outer scope)
                    $image.css({
                        width: data.width,
                        //wafaa
												//height: data.height
                    });
                },
                pandora_find: function() {
                    that.close();
                },
                pandora_item: function() {
                    that.close();
                },
                pandora_page: function() {
                    that.close();
                },
                pandora_section: function() {
                    that.close();
                },
                pandora_showsiteposters: function() {
                    that.update();
                }
            });

    function getSize(posterRatio) {
        var windowWidth = window.innerWidth * 0.8,
            windowHeight = window.innerHeight * 0.8,
            windowRatio = windowWidth / windowHeight;
        return {
            width: Math.round(posterRatio > windowRatio ? windowWidth : windowHeight * posterRatio),
            height: Math.round(posterRatio < windowRatio ? windowHeight : windowWidth / posterRatio)
        };
    }

    that.update = function() {
        pandora.requests.preview && pandora.api.cancel(pandora.requests.preview);
        pandora.requests.preview = pandora.api.find({
            keys: ['director', 'id', 'modified', 'posterRatio', 'title', 'year'],
            query: {
                conditions: [{
                    key: 'id',
                    operator: '==',
                    value: Ox.last($list.options('selected'))
                }],
                operator: '&'
            }
        }, function(result) {
            var item = result.data.items[0],
                posterRatio = pandora.user.ui.showSitePosters
                    ? pandora.site.posters.ratio
                    : item.posterRatio,
                size = getSize(posterRatio),
                title = item.title + (
                    item.director ? ' (' + item.director.join(', ') + ')' : ''
                ) + (
                    item.year ? ' ' + item.year : ''
                );
            $image = $('<img>')
                //wafaa
                //.attr({src: '/' + item.id + '/' + (
										//pandora.user.ui.showSitePosters ? 'siteposter' : 'poster'
                    //pandora.user.ui.showSitePosters ? 'siteposter' : 'icon'
                //) + '128.jpg?' + item.modified})
                .attr({src: '/' + item.id + '/480p.png'})
								//wafaa
                //.css({/*width: size.width + 'px',*/ height: size.height + 'px'});
                //.css({height: '480px'});
            $('<img>')
                .load(function() {
                    $image.attr({src: $(this).attr('src')});
                })
								//wafaa
                //.attr({src: '/' + item.id + '/' + (
                    //pandora.user.ui.showSitePosters ? 'siteposter' : 'poster'
                    //pandora.user.ui.showSitePosters ? 'siteposter' : 'icon'
                //) + '1024.jpg?' + item.modified});
                .attr({src: '/' + item.id + '/480p.png'});

            that.options({
                    content: $image,
                    title: title,
                })
								//wafaa
                //.setSize(size.width, size.height);
                //.setSize('auto', '480px');
                //.setSize('auto', '480px');

        });
        return that;
    }

    return that.update();

};

