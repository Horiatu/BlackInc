if (!('trim' in String.prototype)) {
    String.prototype.trim= function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}

if (!Array.prototype.contains) {
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    };
}

if (!Array.prototype.find) {
	 Array.prototype.find = function(predicate) {
	    if (this === null) {
	      	throw new TypeError('Array.prototype.find called on null or undefined');
	    }
	    if (typeof predicate !== 'function') {
	      	throw new TypeError('predicate must be a function');
	    }
	    var list = Object(this);
	    var length = list.length >>> 0;
	    var thisArg = arguments[1];
	    var value;

	    for (var i = 0; i < length; i++) {
		    value = list[i];
		    if (predicate.call(thisArg, value, i, list)) {
		        return value;
		    }
	    }
	    return undefined;
	 };
}

if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}

if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}

if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}

if (!('forEachProp' in Object.prototype)) {
    Object.prototype.forEachProp = function(action, that /*opt*/) {
    	var i = 0;
		for (var name in this) {
			if (this.hasOwnProperty(name)) {
			  	action.call(that, name, this[name], i++, this);
			}
		}
	};
}

if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}

if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}

if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}

if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}

if (!('utcTime2Local' in String.prototype)) {
    String.prototype.utcTime2Local= function(tester) {
    	var pad2 = function(n) {
    		return ("00" + n).slice(-2);
    	};
	    var m = /(\d{1,2}):(\d{1,2}):(\d{1,2})\s+(AM|PM)/gi.exec(this);
		if (m === null) return null;

	    if(m[4] === 'PM') m[1] = pad2(Number(m[1])+12);

	    var d = new Date();
    	var date = d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())+'T'+m[1]+':'+m[2]+':'+m[3]+'Z';
    	//console.log(date);
        return new Date(date);
    };
}

if (!('isToday' in Date.prototype)) {
    Date.prototype.isToday= function(tester /*opt*/) {
    	var d = new Date();
    	return (this.getYear() == d.getYear()) && (this.getMonth() == d.getMonth()) && (this.getDate() == d.getDate());
    };
}

