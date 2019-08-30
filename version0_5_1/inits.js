var inited = false;
function destroyElement(element, anim = true){
	element=element.filter('.element').not('.static');//filter unkillable statics
	element.droppable( "destroy" );
	//element.effect(destroy_effects[Math.floor(Math.random()*destroy_effects.length)],{},1000, function(){element.remove();})
	if(anim) element.fadeOut(1000, function(){element.remove();});
	else element.remove();
	element.data("isDead", 1);
}
function gameInit() {
	if(!inited) {
		inited = true;
		destroyElement($('#board').children('.element'), false);
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
		if(element_count == 0) element_count = total.length;
		refreshStat();
		if(settings.debug == "true") console.log("Game Inited.");
		//so.. we are ready, lets go
		placeElements(react(inits, true),{top: $('#stack').offset().top+$('#stack').height()+200,
						left: $('body').width()/2-100}, true);
		updateCounters();
	}
}

gameInit();