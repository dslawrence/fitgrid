/*!
 * fitgrid v0.6
 * http://github.com/dslawrence/fitgrid
 *
 * Copyright 2013, David Lawrence
 * Licenced under the MIT license:
 * http://opensource.org/licenses/mit-license.php
 *
 * Date: Saturday Feb 23 10:24:33 2013 -0700
 */

window.fitgrids=new Array();
window.fitgrid_run_needed=0;

(function($) {
	$.fn.fitgrid=function( options ) {
		var pane=this;

		pane.meta={};
		var m=pane.meta;

		pane.grid_active=false;

		m.gutter_percentage=.1;
		m.default_font=12;
		m.font_factor=28;

		m.base_width_units=12;
		m.width_units=m.base_width_units;

		m.base_height_units=10;
		m.height_units=m.base_height_units;

		//m.dimension_sets=new Array( 'm', '' );
		m.dimension_sets=new Array('m','');
		m.dimension_sets_auto=0; // default to automatically picking dimension sets
		m.vertical_center=1; // default to vertical centering
		m.show_gutter=1;     // default to showing gutter

		m.pre_calculations=function() { }
		m.post_calculations=function() { }
		m.pre_render=function() { }
		m.post_render=function() { }

		m.phone_enabled=true;
		m.tablet_enabled=true;
		m.big_enabled=true;
		m.show_grid_overlay=false;

		//m.minimum_height_ratio=.75;
		m.minimum_height_ratio=.8;
		m.maximum_height_ratio=1.14;

		pane.expressions={
			font: new RegExp('font([\\.\\d]+)'),
			size: new RegExp('([\\.\\d]+p*)x([p*\\.\\d]+p*)'),
			zoom: new RegExp('^zoom([\\.\\d]+)'),
			x_gutter: new RegExp('x_gutter(_*\\w*)'),
			y_gutter: new RegExp('y_gutter(_*\\w*)'),
			left_space: new RegExp('left_space_([\\.\\d]+)'),
			right_space: new RegExp('right_space_([\\.\\d]+)'),
			top_space: new RegExp('top_space_([\\.\\d]+)'),
			left_overflow: new RegExp('left_overflow(_*\\w*)'),
			right_overflow: new RegExp('right_overflow(_*\\w*)'),
			vertical_center: new RegExp('vertical_center(_*\\w*)'),
			visible: new RegExp('visible(_*\\w*)'),
			newline:new RegExp('newline(_*\\w*)')
		};

		if (options) {
			for (var i in m) {
				if (options[i] != undefined ) {
					m[i]=options[i];
				}
			}
		}

		pane.f={}; // pane factors

		if ($('.fitgrid_clone_space').length==0) {
			$('body').append('<div class="fitgrid_clone_space" style="width:98%;height:98%;position:absolute;top:0px;left:0px;"></div>');
		}
		var clone_div=$('.fitgrid_clone_space');

		pane.grid_off=function() {
			if (pane.grid_active) {
				$('#grid_show').remove();
				pane.grid_active=false;
			} 
		},

		pane.grid_on=function() {
			if (pane.grid_active) {
				$('#grid_show').remove();
			} 
			
			var inner='';
			var spot=1;
			for (var i=0;i<400;i++) {
				if (spot % m.width_units==0) {
					inner+='<div class="grid_block no_right_margin" style="border:1px solid red;float:left;">'+spot+'</div>';
					inner+="<br clear='all'/>";
					spot=0;
				} else {
					inner+='<div class="grid_block right_margin" style="border:1px solid red;float:left;">'+spot+'</div>';
				}
				spot++;
				
			}
		
			$('body').append('<div id="grid_show" style="position:absolute;z-index:9999;top:0;left:0;overflow:hidden;opacity:0.2;border:1px solid blue;">'+inner+'</div>');

			var offset=pane.offset();

			$('#grid_show').width(m.width);
			$('#grid_show').height(m.height); 
			$('#grid_show').offset(offset);

			$('.grid_block').css({
				width:m.block_width-2, // -2 to account for the border pixel
				height:m.block_height-2, // -2 to account for the border pixel
				'margin-right':m.block_gutter,
				'margin-bottom':m.block_gutter
			});
			$('.no_right_margin').css({
				'margin-right':0
			});

			pane.grid_active=true;
		}

		pane.run=function() {
			clone_div.show();

			// Make calculations
			m.width=pane.width();
			m.height=pane.height();

			m.set_id=''; // use regular settings by default--no first letter
			m.fallback_set_id=''; // don't fall back to anything


			m.dimension_sets=Array(''); // 980-1200 = normal
			m.size='normal';
			m.width_units=m.base_width_units;

			if (m.dimension_sets_auto) {
				if (m.phone_enabled && m.width<481) {
					m.dimension_sets=Array('', 'p'); // 480 and less = phones
					m.size='phone';
					m.width_units=Math.round(.5*m.base_width_units);
				} else if (m.tablet_enabled && m.width<768) {
					m.dimension_sets=Array('', 't'); // 980 and less = tablets
					m.size='tablet';
					m.width_units=Math.round(.70*m.base_width_units);
				} else if (m.big_enabled && m.width>1199) {
					m.dimension_sets=Array('', 'b'); // 1200+ = big
					m.size='big';
					m.width_units=Math.round(1.5*m.base_width_units);
				}
			}

			m.pre_calculations( pane );

			m.block_height=m.height/m.height_units;
			m.block_width=m.width/m.width_units;

			m.height_ratio=m.block_height/m.block_width;
			//console.log('height ratio');
			//console.log(m.height_ratio);

			if (m.minimum_height_ratio>0 && m.height_ratio<m.minimum_height_ratio) {
				m.block_height=m.block_width*m.minimum_height_ratio;
				m.height_ratio=m.height/m.width;
				//console.log(m.height_ratio);
			}
			if (m.maximum_height_ratio>0 && m.height_ratio>m.maximum_height_ratio) {
				m.block_height=m.block_width*m.maximum_height_ratio;
				m.height_ratio=m.height/m.width;
			}

			m.block_gutter=m.block_width*m.gutter_percentage;

			m.block_width=Math.round(m.block_width-m.block_gutter+m.block_gutter/m.width_units);

			// Make sure we aren't overflowing--if we are, decrease with of each block by 1
			var full_width=Math.floor(m.block_width*m.width_units+m.block_gutter*(m.width_units-1));
			if (full_width>pane.width()) {
				m.block_width=m.block_width-1;
			}

			m.block_height=Math.round(m.block_height-m.block_gutter+m.block_gutter/m.height_units);

			// calculate the right half before rounding gutter size
			m.block_right_half_gutter=Math.round(m.block_gutter/2);

			//console.log('block height');
			//console.log(m.block_height);

			//console.log('block width');
			//console.log(m.block_width);

			// round gutter size
			m.block_gutter=Math.floor(m.block_gutter);

			// make sure a joined gutter comes out even on the outside
			// by making the other gutter whatever is left
			m.block_left_half_gutter=m.block_gutter-m.block_right_half_gutter;

			m.default_font_setting=Math.round(m.default_font*m.block_height/m.font_factor);

			m.actual_width=m.block_width*m.width_units+m.block_gutter*(m.width_units-1);
			var difference=m.width-m.actual_width;
			m.pane_horizontal_border=Math.floor(difference/2);

			m.actual_height=m.block_height*m.height_units+m.block_gutter*(m.height_units-1);
			difference=m.height-m.actual_height;
			m.pane_vertical_border=Math.floor(difference/2);

			// add dots to the dimension sets
			m.dimension_set_finders=new Array();

			for (var set_number=0; set_number<m.dimension_sets.length; set_number++) {
				var set_finder=m.dimension_sets[set_number];
				if (set_finder !='') {
					set_finder+='.';
				}
				m.dimension_set_finders[set_number]=set_finder;
			}

			pane.meta.post_calculations( pane );
			pane.meta.pre_render( pane );

			// Outer border
			//centering_div.css({
			//	'padding-left' : m.pane_horizontal_border,
			//	'padding-top' : m.pane_vertical_border
			//});

			f=pane.f;

			// Reset factors

			var key_list={};

			for (var i in pane.expressions) {
				f[i]=Array();
				key_list[i]=1;
			}

			f['all']=Array();

			////////////////////////////
			// Find our parts
			////////////////////////////


			var scan=function(target, inherit) {
			//pane.find('.gpbox').each(function() {
			//var target=$(this);

				// The 'all' item stores all properties for each box
				var all_item={
					target: $(target)
				};

				if (target.className) {

					if (target.className.match(/fg/)) {

						// List all classes
						var classes=target.className.split(' ');

						// ****************
						// Maybe here see if there are any matching "set" elements--
						// so we can skip checking all css selectors, for, say .m
						// if we already know there is no .m present...

						var dot_classes=Array();

						for (var set_number=0; set_number<m.dimension_set_finders.length; set_number++) {

							// After the first gothrough, just use the "dot classes"--these are p., t., etc.
							if (set_number>0) {
								classes=dot_classes;
							}

							// Make a copy of the key list so we search for each item only once per set
							var key_list={};
							for (var i in pane.expressions) {
								key_list[i]=1;
							}

							// Go through them all
							for (var classnumber=0; classnumber<classes.length; classnumber++) {
								var part=classes[classnumber];

								if (part!='gpbox') {
									var first_letters=part.substring(0,2);
									var second_letter=part.substring(2,1);

									var set_id=m.dimension_set_finders[set_number];
									//console.log("---------------------------"); console.log("SET: "+set_id); console.log("FIRST: "+first_letters); console.log("SECOND: "+second_letter);

									// Is this the no-letter set and have we found a class with a dot?
									// (watch out for ones with a >0 value, those are dimensions)
									// If so, add it to the list for later, don't scan it now
									if (set_id=='' && second_letter=='.' && !(first_letters>0)) {
										dot_classes.push(classes[classnumber]);

									// Does the first letter match the definition set we want?
									} else if (set_id=='' || first_letters==set_id) {
										//console.log("MATCH");

										// Get the rest of the classname
										if (set_id!='') {
											part=part.substring(2,part.length);
										} 
										//console.log(part);

										// Does it match the terms we are looking for?
										for (var key in key_list) {
											var matches=part.match(pane.expressions[key]);

											// If so, store the target and meta data and put it in the list
											// of items to deal with on this key (size, show, etc)
											if (matches) {
												// Found this key in this class definition--don't search again
												//delete key_list[key];

												// Clear out the "whole string" match
												matches.shift();

												// Pair the target and the data we found
												var item={
													target: target,
													data: matches
												};

												// Watch out for those where no value defaults to
												// true rather than false

												//if ((key=='newline' || key=='vertical_center' || key=='right_overflow' || key=='left_overflow' || key=='x_gutter' || key=='y_gutter' || key=='hidden') && matches[0]!='_off') {
												if ((key!='font' && key!='size' && key!='zoom' && key!='left_space' && key!='right_space' && key!='top_space') && matches[0]!='_off') {
													matches[0]=1;
												}

												// Add them to the list of things to adjust for this setting
												f[key].push( item );

												if (matches.length>1) {

													// If sizes have a "p" they are a percentage of parent
													if (key=='size') {
														// check for relative sizes...
														for (var i=0;i<2;i++) {
															var submatches=matches[i].match(/([\\.\d]+)p/);
															if (submatches && submatches[1]) {
																if (inherit['size'][i]) {
																	matches[i]=Math.floor(inherit['size'][i]*submatches[1]);
																} else {
																	matches[i]=Math.floor(m.width_unit*submatches[1]);
																}
															}
														}
													}
													all_item[key]=matches;
												} else {
													all_item[key]=matches[0];
												}
												//console.log("SET '"+m.dimension_sets[set_number]+ "' defined "+key+" = "+all_item[key]);

												break;
											}
										}
									}
								}
							}
						}

						for (var i in inherit) {
							// only inherit font and size
							if (all_item[i] == undefined && (i=='font' || i=='size')) {
								all_item[i]=inherit[i];
							}
						}
						//console.log('item:');
						//console.log(all_item);
						f['all'].push(all_item);
						//console.log('');
					}
				}


				$(target).children('*').each(function() {
					scan(this,all_item);
				});
			}

			// Run the scan
			pane.children('*').each(function() {
				scan(this,{});
			});

			//////////////////////
			// Apply transformations
			//////////////////////

			// Make sure the rows have the right gutter size
			$('.gprow').css({ height: m.block_gutter });

			// Apply transformations using the 'all' list
			for (var i=0;i<f.all.length;i++) {
				var item=f.all[i];

				var css={};

				if (item.zoom) {
					item.size[0]=item.size[0]*item.zoom;
					item.size[1]=item.size[1]*item.zoom;
					item.font=item.font*item.zoom;
				}

				if ( item.visible !=undefined ) {
					if (item.visible=='_off') {
						item.target.hide();
					} else {
						item.target.show();
					}
				}

				if (item.size) {
					css.width=Math.floor(item.size[0] * pane.meta.block_width + (pane.meta.block_gutter*(item.size[0]-1)) );

					var x_border_size=item.target.css('border-left-width').replace(/px/,'')*1 + item.target.css('border-right-width').replace(/px/,'')*1;
					css.width=Math.floor(item.size[0] * pane.meta.block_width + (pane.meta.block_gutter*(item.size[0]-1)) - x_border_size);

					var y_border_size=item.target.css('border-top-width').replace(/px/,'')*1 + item.target.css('border-bottom-width').replace(/px/,'')*1;
					css.height=Math.floor(item.size[1] * pane.meta.block_height + ((item.size[1]-1)*pane.meta.block_gutter) - y_border_size );
				}

				if (item.right_overflow && item.right_overflow!='_off') {
					css.width=css.width+m.block_right_half_gutter;
				}

				if (item.left_overflow && item.left_overflow!='_off') {
					css.width=css.width+m.block_left_half_gutter;
				}

				if (item.font) {
					css['font-size'] = Math.round( item.font * m.block_height / m.font_factor );
				} else {
					css['font-size'] = m.default_font_setting;
				}

				if (item.newline==1) {
					css['clear']='both';
				}

				if ((m.show_gutter && item.x_gutter=='_off') || (item.right_overflow && item.right_overflow!='_off')) {
					css['margin-right']='0';
				} else if (m.show_gutter || item.x_gutter !='_off') {
					css['margin-right']=m.block_gutter;
				}

				if (item.top_space && item.top_space>0) {
					if (!(css['margin-top'])) { css['margin-top']=0; }
					css['margin-top']=css['margin-top']+pane.meta.block_height*item.top_space;
				}

				if (item.right_space && item.right_space>0) {
					if (!(css['margin-right'])) { css['margin-right']=0; }
					css['margin-right']=css['margin-right']+(pane.meta.block_width+m.block_gutter)*item.right_space;
				}
				if (item.left_space && item.left_space>0) {
					if (!(css['margin-left'])) { css['margin-left']=0; }
					css['margin-left']=css['margin-left']+(pane.meta.block_width+m.block_gutter)*item.left_space;
				}

				if ((m.show_gutter && item.y_gutter=='_off')) {
					css['margin-bottom']='0';
				} else if (m.show_gutter || item.y_gutter !='off') {
					css['margin-bottom']=m.block_gutter;
				}

				item.target.css( css );
			}

			// Apply vertical alignment over the 'all' list now that resizing is done
			for (var i=0;i<f.all.length;i++) {
				var item=f.all[i];

				// Only vertically align if it is not hidden
				if (item.visible==undefined || item.visible!='_off') {

					// Vertical center if this is our default and the item doesn't say
					// not to, or if the item says to do it.
					if ((m.vertical_center && item.vertical_center !='_off') || item.vertical_center !='_off') {
						var tag=item.target.get(0).nodeName;

						if (tag!='INPUT' && tag!='SELECT') {

							var original_html=item.target.html();

							if (!(original_html)) { original_html='9'; }

							var item_height=item.target.height();
							var item_width=item.target.width();

							clone_div.html(item.target.clone());

							clone_div.find(':first').html('<div class="the_aligner" style="position:relative;">'+original_html+'<div style="clear:both;"></div></div>');

							clone_div.show();
							var content_height=$('.the_aligner').height();

							clone_div.hide();

							var difference=Math.floor((item_height-content_height)/2);

							if (difference>0) {
								item.target.css({ 
									'padding-top': 	difference,
									'height':			 	item_height-difference
								});
							}
						}
					}
				}
			}
			pane.meta.post_render( pane );
			if (m.show_grid_overlay) {
				pane.grid_on();
			}
		}

		// clear out the temp clone div to make sure we have no collisions
		clone_div.html('');
		clone_div.hide();

		window.fitgrids.push(pane);

		pane.run();


		return pane;
	}
}) ( jQuery );

$(function() {
	setInterval(function() {
		if (window.fitgrid_run_needed) {
			run_all_fitgrids();
			window.fitgrid_run_needed=0;
		}
	},10);

	$(window).bind('orientationchange resize',function() {
		for (var i=0;i<window.fitgrids.length;i++) {
			window.fitgrids[i].hide();
		}
		window.fitgrid_run_needed=1;
	});

});

function run_all_fitgrids() {
	for (var i=0;i<window.fitgrids.length;i++) {
		window.fitgrids[i].show();
		window.fitgrids[i].run();
	}
}
