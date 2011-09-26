goog.provide('lime.parser.TMX');
goog.require('goog.dom');
goog.require('goog.dom.xml');
goog.require('goog.style');
goog.require('lime.userAgent');
goog.require('lime.fill.Frame');

lime.parser.TMX = function (file) {
    function loadXMLDoc(dname) {
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
	
		if (xhttp.overrideMimeType)   xhttp.overrideMimeType('text/xml');
        xhttp.open("GET", dname, false);
        xhttp.send();
 		if (xhttp.responseXML == null) {
	
			/* TODO 1 : Check if can be better */
			if (window.DOMParser)
			  {
			  parser=new DOMParser();
			  xmlDoc=parser.parseFromString(xhttp.responseText,"text/xml");
			  }
			else // Internet Explorer
			  {
			  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			  xmlDoc.async="false";
			  xmlDoc.loadXML(xhttp.responseText);
			  }
			return xmlDoc;
			
		}
        return xhttp.responseXML;
    }

	function _parseProperties(obj, xmlNode)
	{
		if (obj.properties == undefined) {
			obj.properties = new Array();
		}
		for (pi = 0; pi < xmlNode.length; pi++)
		{
			ins = new Object();
			ins.name = xmlNode[pi].attributes.getNamedItem("name").nodeValue;
			ins.value = xmlNode[pi].attributes.getNamedItem("value").nodeValue;
			obj.properties.push(ins);
		}
		return true;
	}

	this.getTile = function(gid)
	{
		ret = this.tiles[gid - 1];
		return ret;
		
	}
	
	mapdirectory = file.substring(0, file.lastIndexOf("/") + 1);
	
    doc = loadXMLDoc(file);
	map = doc.getElementsByTagName("map")[0];
	this.filename = file;
	this.orientation = map.attributes.getNamedItem("orientation").nodeValue;
	this.version = parseFloat(map.attributes.getNamedItem("version").nodeValue);
	this.width = parseInt(map.attributes.getNamedItem("width").nodeValue);
	this.height = parseInt(map.attributes.getNamedItem("height").nodeValue);
	this.tilewidth = parseInt(map.attributes.getNamedItem("tilewidth").nodeValue);
	this.tileheight = parseInt(map.attributes.getNamedItem("tileheight").nodeValue);
	
	if (map.getElementsByTagName('properties').length) {
		mapproperties = map.getElementsByTagName('properties')[0].getElementsByTagName('property');
		_parseProperties(this, mapproperties);
	}
	

	tilesets = map.getElementsByTagName('tileset');
	this.tilesets = new Array();
	this.tiles = new Array();
	for (i = 0; i < tilesets.length; i++)
	{
		ins = new Object();
		ins.firstgid = parseInt(tilesets[i].attributes.getNamedItem("firstgid").nodeValue);
		ins.name = tilesets[i].attributes.getNamedItem("name").nodeValue;
		if (tilesets[i].attributes.getNamedItem("spacing")) {
			ins.spacing = parseInt(tilesets[i].attributes.getNamedItem("spacing").nodeValue);
		} else {
			ins.spacing = 0;
		}
		if (tilesets[i].attributes.getNamedItem("margin")) {
			ins.margin = parseInt(tilesets[i].attributes.getNamedItem("margin").nodeValue);
		} else {
			ins.margin = 0;
		}
		
		ins.tilewidth = parseInt(tilesets[i].attributes.getNamedItem("tilewidth").nodeValue);
		ins.tileheight = parseInt(tilesets[i].attributes.getNamedItem("tileheight").nodeValue);
		ins.image = new Object();
		ins.image.source = mapdirectory + tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("source").nodeValue;
		ins.image.width = parseInt(tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("width").nodeValue);
		ins.image.height = parseInt(tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("height").nodeValue);
		
		//ins.image.transparencycolor = tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("trans").nodeValue;
		//ins.image.image = new lime.fill.Image(ins.image.source);
		
		tilewidthcount = parseInt(ins.image.width / ins.tilewidth);
		tileheightcount = parseInt(ins.image.height / ins.tileheight);
		
		/* tiles */
		for (y = 0; y < tileheightcount; y++)
		{
			for (x = 0; x < tilewidthcount; x++)
			{
				instile = new Object();
				instile.tileset = ins;
				instile.width = ins.tilewidth;
				instile.height = ins.tileheight;
				
				instile.x = x;
				instile.y = y;
				instile.px = x * instile.width + ins.spacing + (x * ins.margin);
				instile.py = y * instile.height + ins.spacing +(y * ins.margin);
				instile.gid = parseInt(ins.firstgid + (x + (y * tilewidthcount)));
				instile.frame = new lime.fill.Frame(ins.image.source, instile.px, instile.py, instile.width, instile.height);
				this.tiles.push(instile);
			}
		}
		
		/* tiles properties */
		tiles = tilesets[i].getElementsByTagName('tile');
		for (id = 0; id < tiles.length; id++)
		{
			tileid = parseInt(tiles[id].attributes.getNamedItem("id").nodeValue);
			tileproperties = tiles[id].getElementsByTagName('property');
			
			_parseProperties(this.tiles[tileid - 1], tileproperties);
		}
		this.tilesets.push(ins);
	}
	
	layers = map.getElementsByTagName('layer');
	this.layers = new Array();
	for (i = 0; i < layers.length; i++)
	{
		inslayer = new Object();
		inslayer.name = layers[i].attributes.getNamedItem("name").nodeValue;
		inslayer.width = parseInt(layers[i].attributes.getNamedItem("width").nodeValue);
		inslayer.height = parseInt(layers[i].attributes.getNamedItem("height").nodeValue);
		
		layerproperties = layers[i].getElementsByTagName('property');
		_parseProperties(inslayer, layerproperties);
		inslayer.tiles = new Array();
		datas = layers[i].getElementsByTagName('tile');
		for (j = 0; j < datas.length; j++)
		{
			gid = parseInt(datas[j].attributes.getNamedItem("gid").nodeValue);
			if (gid != 0)
			{
				inslayertile = new Object();
				inslayertile.tile = this.getTile(gid);
				inslayertile.x = parseInt(j % inslayer.width);
				inslayertile.y = parseInt(j / inslayer.width);
				
				if (this.orientation === "isometric") {
				    inslayertile.px = (inslayertile.x - inslayertile.y) * inslayertile.tile.width * .5;
				    inslayertile.py = (inslayertile.y + inslayertile.x) * inslayertile.tile.height * .25;
			    }
			    else {
			        inslayertile.px = inslayertile.x * inslayertile.tile.width;
    		        inslayertile.py = inslayertile.y * inslayertile.tile.height;
			    }
				inslayer.tiles.push(inslayertile);
			}
		}
		this.layers.push(inslayer);
	}
	
	objects = map.getElementsByTagName('object');
	this.objects = new Array();
	for (i = 0; i < objects.length; i++)
	{
		insobject = new Object();
		insobject.name = objects[i].attributes.getNamedItem("name").nodeValue;
		// if gid
		if (objects[i].attributes.getNamedItem("gid"))
		{
			insobject.gid = parseInt(objects[i].attributes.getNamedItem("gid").nodeValue);
			insobject.tile = this.getTile(insobject.gid);
			insobject.width = insobject.tile.width;
			insobject.height = insobject.tile.height;
			insobject.hastile = true;
		} else {
		// else
			insobject.width = parseInt(objects[i].attributes.getNamedItem("width").nodeValue);
			insobject.height = parseInt(objects[i].attributes.getNamedItem("height").nodeValue);
			insobject.hastile = false;
		}
		insobject.x = parseInt(objects[i].attributes.getNamedItem("x").nodeValue);
		insobject.px = insobject.x;
		insobject.y = parseInt(objects[i].attributes.getNamedItem("y").nodeValue);
		insobject.py = insobject.y;
		objectproperties = objects[i].getElementsByTagName('property');
		_parseProperties(insobject, objectproperties);
		this.objects.push(insobject);
	}
}