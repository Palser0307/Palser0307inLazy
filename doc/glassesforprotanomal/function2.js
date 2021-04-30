// HSV Object
// param:ImageData Object's Data
function HSV_Image(RGBImg){
	if(arguments.length == 1){
		if(RGBImg == undefined){
			console.log("param is NO DATA. ...?");
			return;
		}
		if(RGBImg.height !== undefined){
			this.height = RGBImg.height;
		}else{
			console.log("Obj HSV_Image: height is undefined");
			return;
		}
		if(RGBImg.width !== undefined){
			this.width = RGBImg.width;
		}else{
			console.log("Obj HSV_Image: width is undefined");
			return;
		}
		if(RGBImg.data !== undefined){
			if(RGBImg.data.length !== undefined){
				if(RGBImg.data.length == 4 * RGBImg.height * RGBImg.width){
					this.data = new Array(4 * RGBImg.height * RGBImg.width);
					for(let i = 0; i < RGBImg.data.length; i += 4){
						let r = RGBImg.data[i+0] / 255;
						let g = RGBImg.data[i+1] / 255;
						let b = RGBImg.data[i+2] / 255;
						let a = RGBImg.data[i+3];
						let max = Math.max(r, g, b);
						let min = Math.min(r, g, b);
						let diff = max - min;
						let h = 0, s = 0;
						switch( min ){
							case max:
								h = 0;break;
							case r:
								h = (60 * ((b - g) / diff)) + 180;break;
							case g:
								h = (60 * ((r - b) / diff)) + 300;break;
							case b:
								h = (60 * ((g - r) / diff)) + 60;break;
						}
						if(max != 0){
							s = diff / max;
						}
						let v = max;
						if(h != 360){
							this.data[i + 0] = h;
						}else{
							this.data[i + 0] = 0;
						}
						this.data[i + 1] = s;
						this.data[i + 2] = v;
						this.data[i + 3] = a;
					}
				}else{
					console.log("Obj HSV_Image: data.length is not enough.");
					return;
				}
			}else{
				console.log("Obj HSV_Image: data.length is undefined");
				return;
			}
		}else{
			console.log("Obj HSV_Image: data is undefined");
			return;
		}
	}else{
		if(arguments.length == 2){
			this.height = arguments[0];
			this.width = arguments[1];
			this.data = new Array(arguments[0] * arguments[1] * 4);
		}
	}
	// ここまでは，安全対策をしている
	this.toRGB = function(){
		let RGBdata = new Array(this.data.length);
		for(let i = 0; i < this.data.length; i += 4){
			let h = this.data[i] / 60;
			let s = this.data[i + 1];
			let v = this.data[i + 2];
			RGBdata[i + 3] = this.data[i + 3];
			
			if(s == 0){
				RGBdata[i] = v * 255;
				RGBdata[i + 1] = v * 255;
				RGBdata[i + 2] = v * 255;
			}
			let rad = parseInt(h);
			let f = h - rad;
			let v1 = Math.round(v * (1 - s) * 255);
			let v2 = Math.round(v * (1 - s * f) * 255);
			let v3 = Math.round(v * (1 - s * (1 - f)) * 255);
			v = Math.round(v * 255);
			switch(rad){
				case 0:
				case 6:
					RGBdata[i + 0] = v;
					RGBdata[i + 1] = v3;
					RGBdata[i + 2] = v1;
					break;
				case 1:
					RGBdata[i + 0] = v2;
					RGBdata[i + 1] = v;
					RGBdata[i + 2] = v1;
					break;
				case 2:
					RGBdata[i + 0] = v1;
					RGBdata[i + 1] = v;
					RGBdata[i + 2] = v3;
					break;
				case 3:
					RGBdata[i + 0] = v1;
					RGBdata[i + 1] = v2;
					RGBdata[i + 2] = v;
					break;
				case 4:
					RGBdata[i + 0] = v3;
					RGBdata[i + 1] = v1;
					RGBdata[i + 2] = v;
					break;
				case 5:
					RGBdata[i + 0] = v;
					RGBdata[i + 1] = v1;
					RGBdata[i + 2] = v2;
					break;
			}
		}
		return RGBdata.slice(0);
	}
}