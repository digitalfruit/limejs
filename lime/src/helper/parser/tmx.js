goog.provide('lime.parser.TMX');
goog.require('goog.dom');
goog.require('goog.dom.xml');
goog.require('goog.style');
goog.require('lime.userAgent');
goog.require('lime.fill.Frame');
goog.require('goog.crypt.base64');
goog.require('goog.string');

// Based on MelonJS implementation.

lime.parser.TMX = function (file) {
    function loadXMLDoc(dname) {
        var xhttp, xmlDoc, parser;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        if (xhttp.overrideMimeType) xhttp.overrideMimeType('text/xml');
        xhttp.open("GET", dname, false);
        xhttp.send();
        if (xhttp.responseXML == null) {

            /* TODO 1 : Check if can be better */
            if (window.DOMParser) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(xhttp.responseText, "text/xml");
            } else // Internet Explorer
            {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xhttp.responseText);
            }
            return xmlDoc;

        }
        return xhttp.responseXML;
    }

    function _parseProperties(obj, xmlNode) {
        if (obj.properties == undefined) {
            obj.properties = new Array();
        }
        for (var pi = 0; pi < xmlNode.length; pi++) {
            var ins = new Object();
            ins.name = xmlNode[pi].attributes.getNamedItem("name").nodeValue;
            ins.value = xmlNode[pi].attributes.getNamedItem("value").nodeValue;
            obj.properties.push(ins);
        }
        return true;
    }

    function decodeBase64AsArray(input, bytes) {
        bytes = bytes || 1;

        var input = goog.string.collapseWhitespace(input);

        var dec = goog.crypt.base64.decodeString(input),
            ar = [],
            i, j, len;

        for (i = 0, len = dec.length / bytes; i < len; i++) {
            ar[i] = 0;
            for (j = bytes - 1; j >= 0; --j) {
                ar[i] += dec.charCodeAt((i * bytes) + j) << (j << 3);
            }
        }
        return ar;
    };

    function _getLayerData(layer) {
        var encoding = null;
        if (layer.getElementsByTagName('data')[0].attributes.getNamedItem("encoding")) {
            var encoding = layer.getElementsByTagName('data')[0].attributes.getNamedItem("encoding").nodeValue;
        }
        var compression = null;
        if (layer.getElementsByTagName('data')[0].attributes.getNamedItem("compression")) {
            var compression = layer.getElementsByTagName('data')[0].attributes.getNamedItem("compression").nodeValue;
        }
        var retdatas = new Array();

        switch (compression) {
        case null:
            {
                switch (encoding) {
                case null:
                    {
                        var datas = layer.getElementsByTagName('tile');
                        for (j = 0; j < datas.length; j++) {
                            gid = parseInt(datas[j].attributes.getNamedItem("gid").nodeValue);
                            retdatas.push(gid);
                        }
                        return retdatas;
                        break;
                    }

                case 'base64':
                    {
                        var content = '';
                        for (var x = 0, len = layer.getElementsByTagName('data')[0].childNodes.length; x < len; x++) {
                            content += layer.getElementsByTagName('data')[0].childNodes[x].nodeValue;
                        }
                        retdatas = decodeBase64AsArray(content, 4);
                        return retdatas;
                        break;
                    }

                default:
                    throw "limejs: " + encoding + " encoded TMX Tile Map not supported!";
                    break;
                }
            }

        default:
            throw "limejs: " + compression + " compressed TMX Tile Map not supported!";
            break;
        }

        return retdatas;
    }

    this.getTile = function (gid) {
        var ret = this.tiles[gid - 1];
        return ret;

    }

    var mapdirectory = file.substring(0, file.lastIndexOf("/") + 1);

    var doc = loadXMLDoc(file);
    var map = doc.getElementsByTagName("map")[0];
    this.filename = file;
    this.orientation = map.attributes.getNamedItem("orientation").nodeValue;
    this.version = parseFloat(map.attributes.getNamedItem("version").nodeValue);
    this.width = parseInt(map.attributes.getNamedItem("width").nodeValue);
    this.height = parseInt(map.attributes.getNamedItem("height").nodeValue);
    this.tilewidth = parseInt(map.attributes.getNamedItem("tilewidth").nodeValue);
    this.tileheight = parseInt(map.attributes.getNamedItem("tileheight").nodeValue);
    this.properties = new Array();
    if (map.getElementsByTagName('properties').length) {
        var mapproperties = map.getElementsByTagName('properties')[0].getElementsByTagName('property');
        _parseProperties(this, mapproperties);
    }


    var tilesets = map.getElementsByTagName('tileset');
    this.tilesets = new Array();
    this.tiles = new Array();
    for (var i = 0; i < tilesets.length; i++) {
        var instileset = new Object();
        instileset.firstgid = parseInt(tilesets[i].attributes.getNamedItem("firstgid").nodeValue);
        instileset.name = tilesets[i].attributes.getNamedItem("name").nodeValue;

        if (tilesets[i].attributes.getNamedItem("spacing")) {
            instileset.spacing = parseInt(tilesets[i].attributes.getNamedItem("spacing").nodeValue);
        } else {
            instileset.spacing = 0;
        }

        if (tilesets[i].attributes.getNamedItem("margin")) {
            instileset.margin = parseInt(tilesets[i].attributes.getNamedItem("margin").nodeValue);
        } else {
            instileset.margin = 0;
        }

        instileset.tilewidth = parseInt(tilesets[i].attributes.getNamedItem("tilewidth").nodeValue);
        instileset.tileheight = parseInt(tilesets[i].attributes.getNamedItem("tileheight").nodeValue);
        instileset.image = new Object();
        instileset.image.source = mapdirectory + tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("source").nodeValue;
        instileset.image.width = parseInt(tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("width").nodeValue);
        instileset.image.height = parseInt(tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("height").nodeValue);

        //instileset.image.transparencycolor = tilesets[i].getElementsByTagName('image')[0].attributes.getNamedItem("trans").nodeValue;
        //instileset.image.image = new lime.fill.Image(instileset.image.source);
        tilewidthcount = parseInt(instileset.image.width / instileset.tilewidth);
        tileheightcount = parseInt(instileset.image.height / instileset.tileheight);

        /* tiles */
        for (var y = 0; y < tileheightcount; y++) {
            for (var x = 0; x < tilewidthcount; x++) {
                var instile = new Object();
                instile.properties = new Array();
                instile.tileset = instileset;
                instile.width = instileset.tilewidth;
                instile.height = instileset.tileheight;

                instile.x = x;
                instile.y = y;
                instile.px = x * instile.width + instileset.spacing + (x * instileset.margin);
                instile.py = y * instile.height + instileset.spacing + (y * instileset.margin);
                instile.gid = parseInt(instileset.firstgid + (x + (y * tilewidthcount)));
                instile.frame = new lime.fill.Frame(instileset.image.source, instile.px, instile.py, instile.width, instile.height);
                this.tiles.push(instile);
            }
        }

        /* tiles properties */
        var tiles = tilesets[i].getElementsByTagName('tile');
        for (var id = 0; id < tiles.length; id++) {
            var tileid = parseInt(tiles[id].attributes.getNamedItem("id").nodeValue);
            var tileproperties = tiles[id].getElementsByTagName('property');

            _parseProperties(this.tiles[instileset.firstgid + tileid - 1], tileproperties);
        }
        this.tilesets.push(instileset);
    }

    var layers = map.getElementsByTagName('layer');
    this.layers = new Array();
    for (i = 0; i < layers.length; i++) {
        var inslayer = new Object();
        inslayer.properties = new Array();
        inslayer.name = layers[i].attributes.getNamedItem("name").nodeValue;
        inslayer.width = parseInt(layers[i].attributes.getNamedItem("width").nodeValue);
        inslayer.height = parseInt(layers[i].attributes.getNamedItem("height").nodeValue);

        var layerproperties = layers[i].getElementsByTagName('property');
        _parseProperties(inslayer, layerproperties);
        inslayer.tiles = new Array();

        var datas = _getLayerData(layers[i]);
        for (var j = 0; j < datas.length; j++) {
            var gid = parseInt(datas[j]);
            if (gid != 0) {
                var inslayertile = new Object();
                inslayertile.tile = this.getTile(gid);
                inslayertile.x = parseInt(j % inslayer.width);

                inslayertile.y = parseInt(j / inslayer.width);

                if (this.orientation === "isometric") {
                    inslayertile.px = (inslayertile.x - inslayertile.y) * inslayertile.tile.width * .5;
                    inslayertile.py = (inslayertile.y + inslayertile.x) * inslayertile.tile.height * .25;
                } else if (this.orientation === "orthogonal") {
                    inslayertile.px = inslayertile.x * inslayertile.tile.width;
                    inslayertile.py = inslayertile.y * inslayertile.tile.height;
                } else {
                    throw "limejs: " + this.orientation + " type TMX Tile Map not supported !";
                }

                inslayer.tiles.push(inslayertile);
            }
        }
        this.layers.push(inslayer);
    }

    var objects = map.getElementsByTagName('object');
    this.objects = new Array();
    for (i = 0; i < objects.length; i++) {
        var insobject = new Object();
        insobject.properties = new Array();
        insobject.name = objects[i].attributes.getNamedItem("name").nodeValue;
        // if gid
        if (objects[i].attributes.getNamedItem("gid")) {
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
        var objectproperties = objects[i].getElementsByTagName('property');
        _parseProperties(insobject, objectproperties);
        this.objects.push(insobject);
    }
}