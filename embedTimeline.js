'use strict';

pandora.ui.embedTimeline = function() {

    var that = Ox.Element(),
        ui = pandora.user.ui,
        defaults = {
            annotationsFont: ui.annotationsFont,
            annotationsRange: ui.annotationsRange,
            annotationsSort: ui.annotationsSort,
            paused: true,
            showAnnotations: false,
            showLayers: pandora.site.layers.map(function(layer) {
                return layer.id;
            }),
            timeline: ui.videoTimeline
        },
        options = getOptions(),
        removed = false,
        video,
        $title, $panel, $player, $annotations;

    pandora.api.get({id: ui.item, keys: [
        'duration', 'durations', 'layers', 'parts', 'posterFrame',
        'rightslevel', 'size', 'title', 'videoRatio'
    ]}, function(result) {
        if (removed) {
            return;
        }
        video = Ox.extend(result.data, pandora.getVideoOptions(result.data));

        if (options.title) {
            $title = Ox.Element()
                .css({position: 'absolute'})
                .append(
                    $('<div>')
                        .css({
                            marginTop: !options.title.match(/\\n/) ? '8px' : '2px',
                            textAlign: 'center'
                        })
                        .html(options.title.replace(/\\n/g, '<br>'))
                );
        } else {
            $title = Ox.Element();
        }
        var sizes = getSizes();
        $player = Ox.VideoTimelinePlayer({
                censored: video.censored,
                censoredIcon: pandora.site.cantPlay.icon,
                censoredTooltip: pandora.site.cantPlay.text,
                duration: video.duration,
                followPlayer: ui.followPlayer,
                getFrameURL: function(position) {
                    return '/' + ui.item + '/' + ui.videoResolution + 'p' + position + '.jpg';
                },
                getLargeTimelineURL: function(type, i) {
                    return '/' + ui.item + '/timeline' + type + '64p' + i + '.jpg';
                },
                height: sizes.innerHeight,
                muted: ui.videoMuted,
                paused: options.paused,
                position: options.position,
                resolution: Ox.min(pandora.site.video.resolutions),
                smallTimelineURL: '/' + ui.item + '/timeline16p.jpg',
                subtitles: video.subtitles,
                timeline: ui.videoTimeline,
                timelines: pandora.site.timelines,
                video: video.video,
                videoRatio: video.videoRatio,
                volume: ui.videoVolume,
                width: sizes.innerWidth
            })
            .bindEvent({
                playing: function(data) {
                    setPosition(data.position, true);
                },
                position: function(data) {
                    setPosition(data.position);
                },
            });

        if (options.showAnnotations) {
            video.annotations = video.annotations.filter(function(layer) {
                return Ox.contains(options.showLayers, layer.id);
            });
            if (options.playInToOut) {
                video.annotations.forEach(function(layer) {
                    var items = [];
                    layer.items.forEach(function(item) {
                        if ((
                            item['in'] >= options['in'] && item['in'] <= options.out
                        ) || (
                            item.out >= options['in'] && item.out <= options.out
                        )) {
                            items.push(item);
                        }
                    });
                    layer.items = items;
                });
            }
            $annotations = Ox.AnnotationPanel(Ox.extend({
                font: options.annotationsFont,
                layers: video.annotations,
                position: options.position,
                range: options.annotationsRange,
                showLayers: ui.showLayers,
                showUsers: true,
                sort: options.annotationsSort,
                width: window.innerWidth
            }, options['in'] ? {
                'in': options['in']
            } : {}, options.out ? {
                out: options.out
            } : {}))
            .bindEvent({
                select: selectAnnotation
            })
        } else {
            $annotations = Ox.Element();
        }

        $panel = Ox.SplitPanel({
            elements: [
                {element: $title, size: options.title ? 32 : 0},
                {element: $player},
                {element: $annotations, size: options.showAnnotations ? 256 : 0}
            ],
            orientation: 'vertical'
        });

        that.setElement($panel);

        Ox.$parent.postMessage('loaded');

    });

    function getOptions() {
        var options = {};
        if (ui._hash.query) {
            ui._hash.query.forEach(function(condition) {
                options[condition.key] = condition.value;
            });
        }
        options = Ox.extend(
            {item: ui.item},
            ui.videoPoints[ui.item] || {},
            defaults,
            options
        );
        if (!options.position) {
            options.position = options['in'] || 0;
        }
        if (!options['in'] && !options.out) {
            options.playInToOut = false;
        } else if (options['in'] && options['in'] == options.out) {
            options.invertHighlight = false;
            options.paused = true;
            options.playInToOut = false;
        }
        return options;
    }

    function getSizes() {
        var innerHeight,
            innerWidth,
            maxVideoHeight = window.innerHeight
                - (options.title ? 32 : 0)
                - (options.showTimeline ? 80 : 0)
                - (options.showAnnotations ? 128 : 0),
            videoHeight;
        if (options.matchRatio || options.showAnnotations) {
            videoHeight = Math.round(window.innerWidth / video.videoRatio);
            options.matchRatio = videoHeight <= maxVideoHeight;
            if (!options.matchRatio) {
                videoHeight = maxVideoHeight;
            }
        } else {
            videoHeight = window.innerHeight
                - (options.title ? 32 : 0)
                - (options.showTimeline ? 80 : 0);
        }
        innerHeight = videoHeight
            + (options.title ? 32 : 0)
            + (options.showTimeline ? 80 : 0);
        innerWidth = window.innerWidth;
        return {
            innerHeight: innerHeight,
            innerWidth: innerWidth,
            videoHeight: videoHeight
        };
    }

    function getTimelineHeight() {
        return window.innerHeight
            - (options.title ? 32 : 0)
            - (options.showAnnotations ? 256 : 0);
    }

    function selectAnnotation(data) {
        if (data.id) {
            setPosition(Math.max(data['in'], options['in'] || 0));
            $annotations.options({selected: ''});
        }
    }

    function setPosition(position, playing) {
        !playing && $player.options({position: position});
        options.showAnnotations && $annotations.options({position: position});
    }

    that.resizePanel = function() {
        var sizes = getSizes();
        $player.options({width: window.innerWidth, height: getTimelineHeight()});
        options.showAnnotations && $annotations.options({width: window.innerWidth});
        return that;
    };

    return that;

};
