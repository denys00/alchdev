var inited = false;
function destroyElement(element, anim = true){
	element=element.filter('.element').not('.static');//filter unkillable statics
	element.droppable( "destroy" );
	//element.effect(destroy_effects[Math.floor(Math.random()*destroy_effects.length)],{},1000, function(){element.remove();})
	if(anim) element.fadeOut(1000, function(){element.remove();});
	else element.remove();
	element.data("isDead", 1);
}
$('body').selectable({
    cancel: '.element, .ui-dialog, #abyss, #info, #stack',
    distance: 2,
    filter: '.element:not(:animated):not(.group_block)',
    stop: onSelectStop,
});
function react(r, b = false) {
    var reagents = r.sort().join('+');
    var results = [];
    if (b || reactions[reagents]) {
        var resultsTemp = []
        if (b) resultsTemp = r;
        else
            for (var i in reactions[reagents]) {
                resultsTemp.push(reactions[reagents][i])
            }
        for (var i = 0; i < resultsTemp.length; i++) {
            if (name = parseConditions(resultsTemp[i])) {
                // BEGIN processing counters
                var counterParsed = resultsTemp[i].match(matchCounter)
                if (counterParsed && counterParsed[1] != undefined) {
                    var counter = {
                        "name": counterParsed[1],
                        "min": counterParsed[3],
                        "max": counterParsed[7],
                        "minResult": counterParsed[5],
                        "maxResult": counterParsed[9],
                        "value": counterParsed[10]
                    }
                    var data = counters[counter.name]
                    if (!data) {
                        data = {}
                        data.name = counter.name
                        data.value = 0
                        if (data.value < data.min) data.value = data.min
                        if (data.value > data.max) data.value = data.max
                        counters[counter.name] = data
                    }

                    if (counter.min !== undefined) data.min = counter.min
                    if (counter.max !== undefined) data.max = counter.max
                    if (counter.minResult !== undefined) data.minResult = counter.minResult
                    if (counter.maxResult !== undefined) data.maxResult = counter.maxResult

                    if (counter.value !== undefined) {
                        var e = $('#board .element:data(elementName,"' + data.name + '")')
                        switch (counter.value.toString().charAt(0)) {
                            case "+":
                                data.value += parseInt(counter.value.substr(1))
                                break;
                            case "-":
                                data.value -= parseInt(counter.value.substr(1))
                                break;
                            case "=":
                                data.value = parseInt(counter.value.substr(1))
                                break;
                        }
                        e.effect('pulsate', {
                            "times": 4
                        }, 250);
                    }

                    var elem = $('#board .element:data(elementName,"' + data.name + '")')[0];

                    if (!elem || !elem.classList.contains('group_block')) {
                        resultsTemp.push(data.name)
                    }

                    if (data.value < data.min) {
                        if (data.minResult !== undefined) {
                            if (data.minResult != '') {
                                var boundResults = data.minResult.split(",")
                                for (var k in boundResults) {
                                    resultsTemp.push(boundResults[k])
                                }
                            }
                            data.value = data.min
                        } else {
                            data.value += parseInt(counter.value.substr(1))
                            logReaction('Эта реакция невозможна, т.к. ' + data.name + ' не может быть меньше ' + data.min, reagents);
                            return 0
                        }

                    }

                    if (data.value > data.max) {
                        if (data.maxResult !== undefined) {
                            if (data.maxResult != '') {
                                var boundResults = data.maxResult.split(",")
                                for (var k in boundResults) {
                                    resultsTemp.push(boundResults[k])
                                }
                            }
                            data.value = data.max
                        } else {
                            data.value -= parseInt(counter.value.substr(1))
                            logReaction('Эта реакция невозможна, т.к. ' + data.name + ' не может быть больше ' + data.max, reagents);
                            return 0
                        }

                    }
                    // END processing counters
                } else if (name.charAt(0) == '-') { //name starts with at least one minus
                    name = name.substr(1);
                    if (name.charAt(0) == '-') { //second minus found - necessary element
                        name = name.substr(1);
                        if (name.charAt(0) == '-') { //third minus found - clear
                            if (name.length == 1) //clear all
                                $('#board .element').data('maybeKill', '1');
                            else { //clear identical elements
                                name = name.substr(1);
                                var classExists = false
                                var l
                                for (l in classes_strings)
                                    if (classes_strings[l] == name) {
                                        classExists = true
                                        break
                                    }

                                if (classExists)
                                    $('#board .element.' + l).not('.ui-selected').data('maybeKill', '1');
                                else
                                    $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').data('maybeKill', '1');
                            }
                        } else { //double minus - required element
                            var e = $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').not(':data(toKill,1)').not(':data(maybeKill,1)').first();
                            if (e.length == 0)
                                e = $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').not(':data(toKill,1)').first();
                            e.data('toKill', '1');
                            if (e.length == 0) { //fail reaction
                                logReaction('Для этой реакции необходимо, чтобы на поле присутствовал еще ' + name, reagents);
                                $('#board .element:data(toKill,1)').data('toKill', '0');
                                $('#board .element:data(maybeKill,1)').data('maybeKill', '0');
                                return 0;
                            }
                        }
                    } else if (name.charAt(0) == '?') {
                        name = name.substr(1);
                        if (!inArray(name, opened)) {
                            logReaction('Эта реакция будет работать если открыть ' + name, reagents);
                            return 0;
                        }
                    } else { //only one minus - unnecessary element
                        var e = $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').not(':data(toKill,1)').not(':data(maybeKill,1)').first();
                        e.data('maybeKill', '1');
                    }
                } else {
                    if (!classes[name] || !classes[name].match('group_block')) {
                        results.push(name);
                    } else {
                        addElement(name, {
                            x: 0,
                            y: 0
                        });
                    }
                    if (!inArray(name, r)) {
                        var reaction = reagents; //+' = '+reactions[reagents].join(', ');
                        update_recipes(name, reaction);
                    }
                }
            }
        }
        //start reaction

        destroyElement($('#board :data(toKill,1)'));
        destroyElement($('#board :data(maybeKill,1)'));
        if(!b) logReaction(results.join(', '), reagents);
        message(reagents, 'highlight');
        return results;
    } else {
        logReaction(false, reagents);
        message(reagents, 'highlight');
        return 0;
    }
}
function onDrop(event, ui) {
    var pos = $(this).offset();
    var result = react([ui.helper.data("elementName"), $(this).data("elementName")]);
    if (result != 0) {
        placeElements(result, pos);
        destroyElement(ui.helper);
        destroyElement($(this));
        refreshHint();

        var a = 0;
    } else {
        result = 'no reaction';
    }
    updateCounters();
}
function gameInit() {
	if(!inited) {
        inited = true;
        destroyElement($('#board').children('.element'), false);
        if(finals.length == 0) {
            $("#vote_stats").hide();
            $("#vote_result").hide();
            $("#abyss").droppable({drop: function(e, ui){q
                    destroyElement(ui.helper); 
                    refreshHint();	
                }});
            $("body").selectable({
                filter:'#board .element', 
                distance:2,
                stop: onSelectStop,
                cancel: '.ui-dialog, #stack, #info, #abyss, .element'
                });
            $('#stack-btn').hide();
            $("#help").dialog({ autoOpen: false, position:'right', open: renderHint });
            $("#element_hint").dialog({ autoOpen: false, width:320 });
            $("#payment_dialog").dialog({ autoOpen: false, width: 'auto' }).bind('dialogclose', function() {getHintCount();});
            $("#recipe_list").dialog({ autoOpen: false, position:'left'});
            $("#err_msg").dialog({ autoOpen: false});
            $("#info_msg").dialog({ autoOpen: false, width:500});
            $("#welcome_dialog").dialog({ autoOpen: ($.cookie('welcomed')?false:true), width:800  });
            $("#elementFilter").keyup(function(event) {
                filterStack($("#elementFilter").val());
            });
            $("#showHelp").click(function() {
                if ($('#help').dialog('isOpen')) $('#help').dialog('close');
                else $('#help').dialog('open');
                
                reachGoal('SHOW_HINTS');
            });
            
            applySettings(settings);
            toggleSort($('#order').val());
            
            sortKeys(reactions);
            var test1 = test();
            var total = test1.total;
            finals = test1.finals;
            wrongs = test1.wrongs;
            element_count = total.length;
            refreshStat();
        }
		
		if(settings.debug == "true") console.log("Game Inited.");
		//so.. we are ready, lets go
		placeElements(react(inits, true),{top: $('#stack').offset().top+$('#stack').height()+200,
						left: $('body').width()/2-100}, true);
		updateCounters();
	}
}

gameInit();