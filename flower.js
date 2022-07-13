/****************************************************************************/
/***  ###### ##      ####  ##   # ###### #####,  ****************************/
/***  ##___  ##     ##`  # ## , # ##___  ##  .#  ****************************/
/***  ##^^^  ##     ##, .# ##_#_# ##^^^  ####*   ****************************/
/***  ##     ######  ####  `##`#` ###### ##  ^#  ****************************/
/****************************************************************************
 *
 *	Flower of life animated banner.
 *
 *	This module adds programmable melting transition animations.
 *	Supports one instance of the animated banner as of this version,
 *	also supports only one rule image.
 *
 *	Handle should be empty block element with id="flower"
 *
 *	Flower of Life Banner, by Motekye.
 *	https://github.com/Motekye/Flower/
*/


FLOWER = {


	/*
	 *	Banner configuration...
	*/
	frames: 15,     // total frames to compile
	rate: 60,       // ms between each frame
	img64: [],      // each base64 image
	rule64: null,   // base64 rule image
	id: 'flower',	// id of container element
	imgscr: '',		// script url for base64 images
	
	imgalt: 'Still image for animated banner',
	canalt: 'Canvas layer for animated banner',

	onload: function(){ },
	ready: function(){ },
	
	
	/*
	 *	Banner environment...
	*/
	busy: true,     // busy performing animation?
	width: 0,       // width of banner
	height: 0,      // height of banner
	handle: null,   // container #flower element
	img: null,      // static image when not animating
	can: [],        // stack of canvases
	ctx: [],        // stack of contexts
	imgdata: [],    // each image's imageData
	ruledata: null, // rule's integer array
	rw: 0,          // width of rule
	rh: 0,          // height of rule
	wkimg: null,    // working <img> element
	wkcan: null,    // working <canvas> element
	wkctx: null,    // working context2d
	i: 0,           // currently selected image
	f: 0,           // current frame


	/*
	 *	Configure the animated banner.
	*/
	config: function(o){
		if(o.id){ FLOWER.id = o.id; }
		if(o.src){ FLOWER.imgscr = o.src; }
		if(o.fr){ FLOWER.frames = o.fr; }
		if(o.frames){ FLOWER.frames = o.frames; }
		if(o.ms){ FLOWER.rate = o.ms; }
		if(o.rate){ FLOWER.rate = o.rate; }
		if(o.img64){ FLOWER.img64 = o.img64; }
		if(o.rule64){ FLOWER.rule64 = o.rule64; }
		if(o.imgalt){ FLOWER.imgalt = o.imgalt; }
		if(o.canalt){ FLOWER.canalt = o.canalt; }
		if(o.onload){ FLOWER.onload = o.onload; }
		if(o.ready){ FLOWER.ready = o.ready; }
	},


	/*
	 *	Create set of links to trigger animation.
	*/
	links: function(p){
		var i, l, a, u = document.createElement('ul');
		for(i=0; i<FLOWER.img64.length; i++){
			l = document.createElement('li');
			u.appendChild(l);
			a = document.createElement('a');
			a.onclick = Function('FLOWER.to('+i+');');
			l.appendChild(a);
		}
		return u;
	},


	/*
	 *	Execute on page load to setup the environment.
	*/
	loadfn: (addEventListener("load", function(){
		var s = document.createElement('script');
		s.setAttribute('src',FLOWER.imgscr);
		s.setAttribute('onload','FLOWER.prep();');
		document.head.appendChild(s);
	})),
	
	
	/*
	 *	Build the flower banner layers and working images,
	 *	begin to process the base64 images one at a time.
	*/
	prep: function(){
		FLOWER.handle = document.getElementById(FLOWER.id);
		FLOWER.width = FLOWER.handle.clientWidth;
		FLOWER.height = FLOWER.handle.clientHeight;
		FLOWER.handle.style.overflow = 'hidden';
		
		// working image:
		FLOWER.wkimg = document.createElement('img');
		FLOWER.wkimg.style.position = 'fixed';
		FLOWER.wkimg.style.bottom = '110%';
		document.body.appendChild(FLOWER.wkimg);
		
		// working canvas and context:
		FLOWER.wkcan = document.createElement('canvas');
		FLOWER.wkcan.style.position = 'fixed';
		FLOWER.wkimg.style.bottom = '110%';
		FLOWER.wkctx = FLOWER.wkcan.getContext('2d');
		document.body.appendChild(FLOWER.wkcan);
		
		// static image:
		FLOWER.img = document.createElement('img');
		FLOWER.img.style.width = '100%';
		FLOWER.img.style.height = '100%';
		FLOWER.img.style.display = 'block';
		FLOWER.img.setAttribute('alt',FLOWER.imgalt);
		FLOWER.img.setAttribute('aria-hidden','true');
		FLOWER.handle.appendChild(FLOWER.img);
		
		// create canvases for animation:
		for(var i=0;i<FLOWER.frames;i++){
			FLOWER.can[i] = document.createElement('canvas');
			FLOWER.can[i].width = FLOWER.width;
			FLOWER.can[i].height = FLOWER.height;
			FLOWER.can[i].style.width = '100%';
			FLOWER.can[i].style.height = '100%';
			FLOWER.can[i].style.display = 'block';
			FLOWER.can[i].style.position = 'relative';
			FLOWER.can[i].style.top = '-'+(i+1)+'00%';
			FLOWER.can[i].innerHTML = FLOWER.canalt;
			FLOWER.can[i].setAttribute('aria-hidden','true');
			FLOWER.ctx[i] = FLOWER.can[i].getContext('2d');
			FLOWER.handle.appendChild(FLOWER.can[i]);
		}
		
		// using first image:
		FLOWER.img.src = FLOWER.img64[0];
		
		// begin to process rule...
		FLOWER.wkimg.src = FLOWER.rule64;
		FLOWER.wkimg.setAttribute('onload','FLOWER.procRule();');
	},
	
	
	/*
	 *	Process rule image to imageData.
	 *	Creates 2d array size of image data holding
	 *	integers of which frame each pixel should draw to.
	*/
	procRule: function(){
		var w = FLOWER.wkimg.width, 
			h = FLOWER.wkimg.height,
			d, x, y, i = 0, f = 768 / FLOWER.frames;
	
		FLOWER.rw = w;
		FLOWER.rh = h;
		FLOWER.wkcan.width = w;
		FLOWER.wkcan.height = h;
		FLOWER.wkctx.drawImage(FLOWER.wkimg, 0, 0, w, h);
		d = FLOWER.wkctx.getImageData(0, 0, w, h);
		
		FLOWER.ruledata = [];
		for(y=0;y<h;y++){ FLOWER.ruledata[y] = [];
		for(x=0;x<w;x++){
			FLOWER.ruledata[y][x] = Math.floor
				((d.data[i] + d.data[i+1] + d.data[i+2]) / f);
			i+=4;
		} }
		
		// process images...
		FLOWER.wkimg.src = FLOWER.img64[0];
		FLOWER.wkimg.setAttribute('onload','FLOWER.procImg();');
	},
	
	
	/*
	 *	Collect the imageData of each image.
	*/
	procImg: function(){
		var w = FLOWER.width,
			h = FLOWER.height;

		FLOWER.wkcan.width = w;
		FLOWER.wkcan.height = h;
		FLOWER.wkctx.drawImage(FLOWER.wkimg, 0, 0, w, h);
		FLOWER.imgdata[FLOWER.i] = FLOWER.wkctx.getImageData(0, 0, w, h);
		FLOWER.i++;
		
		if(FLOWER.i<FLOWER.img64.length){
			FLOWER.wkimg.src = FLOWER.img64[FLOWER.i];
			FLOWER.wkimg.setAttribute('onload','FLOWER.procImg();');
			
		// done collecting images:
		} else {
			FLOWER.wkimg.remove();
			FLOWER.wkcan.remove();
			FLOWER.i = 0;
			FLOWER.build();
			FLOWER.onload();
		}
	
	},
	
	
	/*
	 *	Build the layers behind the static image to
	 *	prepare for triggering the animation.
	*/
	build: function(){
		var w = FLOWER.width, 
			h = FLOWER.height,
			s = FLOWER.imgdata[FLOWER.i],
			i, x, y, f, d = [];

		// get imageData for each layer:
		for(i=0;i<FLOWER.frames;i++){
		    d[i] = FLOWER.ctx[i].getImageData(0, 0, w, h);
		}
		
		// traverse source image and distribute to layers:
		for(y=0,i=0;y<h;y++){
		for(x=0;x<w;x++,i+=4){
			f = FLOWER.ruledata[y % FLOWER.rh][x % FLOWER.rw];
			d[f].data[i] = s.data[i];
			d[f].data[i+1] = s.data[i+1];
			d[f].data[i+2] = s.data[i+2];
			d[f].data[i+3] = '255'; // always opaque for now
		} }
		
		// save imageData back to layers:
		for(i=0;i<FLOWER.frames;i++){
			FLOWER.ctx[i].putImageData(d[i], 0, 0); 
		    FLOWER.can[i].style.opacity = '0';
		}
		
		// ready...
		FLOWER.busy = false;
		FLOWER.ready();
	},


	/*
	 *	Fire the animation, revealing an image of choice.
	*/
	to: function(w){
		var i;
	
		if(FLOWER.busy){ return false; }
		FLOWER.busy = true;
	
		// first show all the layers:
		for(i=0;i<FLOWER.frames;i++){
			FLOWER.can[i].style.opacity = '1';
		}
		
		// load new image on the bottom:
		FLOWER.img.src = FLOWER.img64[w];
	
		// hide all the layers on top in sequence:
		FLOWER.f = 0;
		for(i=0;i<FLOWER.frames;i++){
			setTimeout(function(){
				FLOWER.can[FLOWER.f].style.opacity = '0';
				FLOWER.f++;
			}, FLOWER.rate*i);
		}
		
		// all done, build next...
		FLOWER.i = w;
		setTimeout(FLOWER.build, FLOWER.rate*i);
	
	}

};
